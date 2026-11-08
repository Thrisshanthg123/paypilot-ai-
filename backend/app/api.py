from uuid import uuid4
from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.models import Transaction, WebhookEvent
from app.schemas import (
    CaptureOrderRequest,
    CreateOrderRequest,
    DashboardStats,
    PaymentActionResponse,
    RiskAnalyzeRequest,
    RiskAnalyzeResponse,
    RiskResult,
    TransactionInput,
    TransactionListResponse,
    TransactionResponse,
)
from app.services.paypal import PayPalService
from app.services.policy import decide
from app.services.risk import RiskService

router = APIRouter()


def _risk_fields(txn: Transaction, risk: RiskResult, decision: str) -> None:
    txn.risk_score = risk.score
    txn.risk_level = risk.level
    txn.recommendation = risk.recommendation
    txn.risk_explanation = risk.explanation
    txn.policy_decision = decision
    txn.payment_status = {
        "APPROVE": "RISK_APPROVED",
        "REVIEW": "REVIEW_REQUIRED",
        "BLOCK": "BLOCKED",
    }[decision]


def _same_transaction(txn: Transaction, body: TransactionInput) -> bool:
    return (
        txn.recipient_name == body.recipient_name
        and txn.recipient_upi == body.recipient_upi
        and txn.amount == body.amount
        and txn.currency == body.currency
        and txn.note == body.note
    )


def _money_matches(money: dict | None, txn: Transaction) -> bool:
    if not isinstance(money, dict):
        return False
    try:
        return (
            Decimal(str(money["value"])) == txn.amount
            and str(money["currency_code"]).upper() == txn.currency
        )
    except (KeyError, InvalidOperation, TypeError):
        return False


@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    body: TransactionInput,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
):
    key = idempotency_key or str(uuid4())
    if len(key) > 100:
        raise HTTPException(status_code=422, detail="Idempotency-Key must be at most 100 characters.")
    existing = db.scalar(select(Transaction).where(Transaction.idempotency_key == key))
    if existing:
        if not _same_transaction(existing, body):
            raise HTTPException(status_code=409, detail="Idempotency-Key was already used for a different transaction.")
        return existing

    risk = RiskService(settings).analyze(body)
    decision, _ = decide(risk)
    txn = Transaction(
        recipient_name=body.recipient_name,
        recipient_upi=body.recipient_upi,
        note=body.note,
        amount=body.amount,
        currency=body.currency,
        idempotency_key=key,
    )
    _risk_fields(txn, risk, decision)
    db.add(txn)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Concurrent retry with same key: return the winner's record if present.
        existing = db.scalar(select(Transaction).where(Transaction.idempotency_key == key))
        if existing:
            if _same_transaction(existing, body):
                return existing
            raise HTTPException(status_code=409, detail="Idempotency-Key was already used for a different transaction.")
        raise
    db.refresh(txn)
    return txn


@router.get("/transactions", response_model=TransactionListResponse)
def list_transactions(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    payment_status: str | None = Query(default=None, max_length=32),
    db: Session = Depends(get_db),
):
    query = select(Transaction)
    count_query = select(func.count()).select_from(Transaction)
    if payment_status:
        query = query.where(Transaction.payment_status == payment_status.upper())
        count_query = count_query.where(Transaction.payment_status == payment_status.upper())
    items = db.scalars(query.order_by(Transaction.created_at.desc()).limit(limit).offset(offset)).all()
    return {"items": items, "total": db.scalar(count_query) or 0, "limit": limit, "offset": offset}


@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: str, db: Session = Depends(get_db)):
    txn = db.get(Transaction, transaction_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    return txn


@router.post("/risk/analyze", response_model=RiskAnalyzeResponse)
def analyze_risk(body: RiskAnalyzeRequest, settings: Settings = Depends(get_settings)):
    risk = RiskService(settings).analyze(body)
    decision, message = decide(risk)
    return {"risk": risk, "policy_decision": decision, "policy_message": message}


@router.post("/payments/create-order", response_model=PaymentActionResponse)
def create_payment_order(
    body: CreateOrderRequest,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    txn = db.get(Transaction, body.transaction_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    if txn.policy_decision != "APPROVE":
        raise HTTPException(status_code=409, detail=f"Payment is not approved by policy ({txn.policy_decision}).")
    if txn.paypal_order_id:
        return {"transaction": txn, "paypal_status": "ORDER_CREATED", "approval_url": txn.paypal_approval_url}

    result = PayPalService(settings).create_order(
        transaction_id=txn.id,
        amount=txn.amount,
        currency=txn.currency,
        description=txn.note or f"Payment to {txn.recipient_name}",
    )
    order_id = result.get("id")
    if not order_id:
        raise HTTPException(status_code=502, detail="PayPal did not return an order ID.")
    txn.paypal_order_id = order_id
    txn.paypal_approval_url = next(
        (link.get("href") for link in result.get("links", []) if link.get("rel") in {"approve", "payer-action"}),
        None,
    )
    if not txn.paypal_approval_url:
        raise HTTPException(status_code=502, detail="PayPal did not return a buyer approval link.")
    txn.payment_status = "ORDER_CREATED"
    db.commit()
    db.refresh(txn)
    return {"transaction": txn, "paypal_status": result.get("status", "CREATED"), "approval_url": txn.paypal_approval_url}


@router.post("/payments/capture-order", response_model=PaymentActionResponse)
def capture_payment_order(
    body: CaptureOrderRequest,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
):
    txn = db.get(Transaction, body.transaction_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    if txn.policy_decision != "APPROVE":
        raise HTTPException(status_code=409, detail="Payment is not approved by server policy.")
    if not txn.paypal_order_id or txn.paypal_order_id != body.order_id:
        raise HTTPException(status_code=409, detail="PayPal order does not belong to this transaction.")
    if txn.payment_status == "COMPLETED":
        return {"transaction": txn, "paypal_status": "COMPLETED", "approval_url": None}

    request_id = idempotency_key or txn.capture_request_id or str(uuid4())
    if len(request_id) > 38:
        raise HTTPException(status_code=422, detail="Capture Idempotency-Key must be at most 38 characters.")
    if txn.capture_request_id and request_id != txn.capture_request_id:
        raise HTTPException(status_code=409, detail="Capture Idempotency-Key must match the original request.")
    txn.capture_request_id = request_id
    db.commit()
    result = PayPalService(settings).capture_order(order_id=txn.paypal_order_id, request_id=request_id)
    paypal_status = str(result.get("status", "UNKNOWN")).upper()
    if paypal_status == "COMPLETED":
        if result.get("id") != txn.paypal_order_id:
            raise HTTPException(status_code=502, detail="PayPal capture response did not match the stored order.")
        capture = None
        for unit in result.get("purchase_units", []):
            if unit.get("custom_id") != txn.id or not _money_matches(unit.get("amount"), txn):
                continue
            captures = unit.get("payments", {}).get("captures", [])
            capture = next((item for item in captures if str(item.get("status", "")).upper() == "COMPLETED"), None)
            if capture:
                break
        if not capture or not _money_matches(capture.get("amount"), txn):
            raise HTTPException(status_code=502, detail="PayPal order response did not confirm a completed capture.")
        txn.paypal_capture_id = capture.get("id")
        txn.payment_status = "COMPLETED"
    else:
        txn.payment_status = "CAPTURE_" + paypal_status[:24]
    db.commit()
    db.refresh(txn)
    return {"transaction": txn, "paypal_status": paypal_status, "approval_url": None}


@router.post("/payments/webhook")
def paypal_webhook(
    event: dict,
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    if not isinstance(event, dict) or not event.get("id") or not event.get("event_type"):
        raise HTTPException(status_code=422, detail="Webhook event is missing required fields.")
    headers = {key.lower(): value for key, value in request.headers.items()}
    if not PayPalService(settings).verify_webhook(headers=headers, event=event):
        raise HTTPException(status_code=400, detail="PayPal webhook signature verification failed.")

    event_id = str(event["id"])
    if db.scalar(select(WebhookEvent).where(WebhookEvent.paypal_event_id == event_id)):
        return {"received": True, "duplicate": True}

    event_type = str(event["event_type"])
    resource = event.get("resource") or {}
    related = (resource.get("supplementary_data") or {}).get("related_ids") or {}
    order_id = related.get("order_id") or resource.get("order_id")
    if order_id:
        txn = db.scalar(select(Transaction).where(Transaction.paypal_order_id == str(order_id)))
        if txn:
            if event_type == "PAYMENT.CAPTURE.COMPLETED":
                if _money_matches(resource.get("amount"), txn) and txn.payment_status not in {"REFUNDED", "REVERSED"}:
                    txn.payment_status = "COMPLETED"
                    txn.paypal_capture_id = resource.get("id") or txn.paypal_capture_id
                else:
                    if not _money_matches(resource.get("amount"), txn):
                        txn.payment_status = "PAYMENT_MISMATCH"
            elif event_type == "PAYMENT.CAPTURE.DENIED":
                if txn.payment_status not in {"COMPLETED", "REFUNDED", "REVERSED"}:
                    txn.payment_status = "FAILED"
            elif event_type == "PAYMENT.CAPTURE.REFUNDED":
                txn.payment_status = "REFUNDED"
            elif event_type == "PAYMENT.CAPTURE.REVERSED":
                if txn.payment_status != "REFUNDED":
                    txn.payment_status = "REVERSED"
    db.add(WebhookEvent(paypal_event_id=event_id, event_type=event_type))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        if db.scalar(select(WebhookEvent).where(WebhookEvent.paypal_event_id == event_id)):
            return {"received": True, "duplicate": True}
        raise
    return {"received": True, "duplicate": False}


@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    total = db.scalar(select(func.count()).select_from(Transaction)) or 0
    approved = db.scalar(select(func.count()).select_from(Transaction).where(Transaction.policy_decision == "APPROVE")) or 0
    review = db.scalar(select(func.count()).select_from(Transaction).where(Transaction.policy_decision == "REVIEW")) or 0
    blocked = db.scalar(select(func.count()).select_from(Transaction).where(Transaction.policy_decision == "BLOCK")) or 0
    completed = db.scalar(select(func.count()).select_from(Transaction).where(Transaction.payment_status == "COMPLETED")) or 0
    amount = db.scalar(select(func.coalesce(func.sum(Transaction.amount), 0)).where(Transaction.payment_status == "COMPLETED")) or 0
    return {
        "total_transactions": total,
        "approved_transactions": approved,
        "review_transactions": review,
        "blocked_transactions": blocked,
        "completed_payments": completed,
        "total_amount": amount,
    }

