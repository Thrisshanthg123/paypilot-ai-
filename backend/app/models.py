from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import DateTime, Index, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        UniqueConstraint("paypal_order_id", name="uq_transactions_paypal_order"),
        UniqueConstraint("paypal_capture_id", name="uq_transactions_paypal_capture"),
        Index("ix_transactions_created_at", "created_at"),
        Index("ix_transactions_payment_status", "payment_status"),
        Index("ix_transactions_policy_decision", "policy_decision"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    recipient_name: Mapped[str] = mapped_column(String(160), nullable=False)
    recipient_upi: Mapped[str | None] = mapped_column(String(254), nullable=True)
    note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    risk_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    risk_level: Mapped[str | None] = mapped_column(String(16), nullable=True)
    recommendation: Mapped[str | None] = mapped_column(String(16), nullable=True)
    risk_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    policy_decision: Mapped[str] = mapped_column(String(16), nullable=False, default="PENDING")
    payment_status: Mapped[str] = mapped_column(String(32), nullable=False, default="PENDING_RISK")
    paypal_order_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    paypal_approval_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    paypal_capture_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    idempotency_key: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    capture_request_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    paypal_event_id: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(128), nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

