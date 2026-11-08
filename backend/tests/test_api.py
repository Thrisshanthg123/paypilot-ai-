from decimal import Decimal

from app.schemas import RiskResult
from app.services.policy import decide


def test_payment_policy_mapping():
    assert decide(RiskResult(score=5, level="LOW", recommendation="anything", explanation="ok"))[0] == "APPROVE"
    assert decide(RiskResult(score=50, level="MEDIUM", recommendation="APPROVE", explanation="review"))[0] == "REVIEW"
    assert decide(RiskResult(score=95, level="HIGH", recommendation="APPROVE", explanation="block"))[0] == "BLOCK"


def test_health_and_mock_risk_fails_safe(client):
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["database"] == "connected"
    assert health.json()["ai_mode"] == "mock"

    response = client.post("/api/risk/analyze", json={
        "recipient_name": "Sample merchant",
        "amount": "12.00",
        "currency": "USD",
    })
    assert response.status_code == 200
    assert response.json()["risk"]["level"] == "MEDIUM"
    assert response.json()["policy_decision"] == "REVIEW"


def test_mock_ai_cannot_be_enabled_in_production():
    from pydantic import ValidationError
    from app.config import Settings

    try:
        Settings(app_env="production", ai_mode="mock")
    except ValidationError:
        return
    raise AssertionError("production configuration must reject the mock AI adapter")


def test_create_list_detail_and_stats(client):
    payload = {
        "recipient_name": "Sample merchant",
        "recipient_upi": "sample@example.test",
        "amount": "20.50",
        "currency": "usd",
        "note": "Test transaction",
    }
    created = client.post("/api/transactions", json=payload, headers={"Idempotency-Key": "test-create-1"})
    assert created.status_code == 201
    txn = created.json()
    assert txn["risk_level"] == "MEDIUM"
    assert txn["policy_decision"] == "REVIEW"
    assert txn["payment_status"] == "REVIEW_REQUIRED"

    replay = client.post("/api/transactions", json=payload, headers={"Idempotency-Key": "test-create-1"})
    assert replay.status_code == 201
    assert replay.json()["id"] == txn["id"]

    conflict = client.post("/api/transactions", json={**payload, "amount": "21.00"}, headers={"Idempotency-Key": "test-create-1"})
    assert conflict.status_code == 409

    listing = client.get("/api/transactions?limit=10&offset=0")
    assert listing.status_code == 200
    assert listing.json()["total"] == 1
    detail = client.get(f"/api/transactions/{txn['id']}")
    assert detail.status_code == 200
    assert detail.json()["amount"] == "20.50"
    assert client.get("/api/transactions/missing").status_code == 404

    stats = client.get("/api/dashboard/stats").json()
    assert stats["total_transactions"] == 1
    assert stats["review_transactions"] == 1
    assert Decimal(stats["total_amount"]) == Decimal("0")


def test_invalid_amount_rejected(client):
    response = client.post("/api/risk/analyze", json={"recipient_name": "X", "amount": "0", "currency": "USD"})
    assert response.status_code == 422
    unsupported_currency = client.post("/api/risk/analyze", json={
        "recipient_name": "UPI recipient", "amount": "100.00", "currency": "INR",
    })
    assert unsupported_currency.status_code == 422


def test_policy_prevents_paypal_order_for_review_transaction(client):
    txn = client.post("/api/transactions", json={"recipient_name": "Review me", "amount": "10.00"}).json()
    response = client.post("/api/payments/create-order", json={"transaction_id": txn["id"]})
    assert response.status_code == 409
    assert "REVIEW" in response.json()["detail"]


def test_missing_paypal_credentials_prevent_order(client, monkeypatch):
    from app.api import RiskService
    from app.schemas import RiskResult
    from app.services.paypal import PayPalService

    monkeypatch.setattr(RiskService, "analyze", lambda self, _body: RiskResult(
        score=2, level="LOW", recommendation="APPROVE", explanation="Test fixture.",
    ))
    txn = client.post("/api/transactions", json={"recipient_name": "Test", "amount": "10.00"}).json()
    result = client.post("/api/payments/create-order", json={"transaction_id": txn["id"]})
    assert result.status_code == 503
    assert "credentials" in result.json()["detail"]


def test_invalid_webhook_signature_is_rejected(client, monkeypatch):
    from app.services.paypal import PayPalService

    monkeypatch.setattr(PayPalService, "verify_webhook", lambda self, **kwargs: False)
    response = client.post("/api/payments/webhook", json={
        "id": "EVENT-INVALID",
        "event_type": "PAYMENT.CAPTURE.COMPLETED",
        "resource": {},
    })
    assert response.status_code == 400


def test_remote_ai_unavailable_fails_closed(settings):
    # The explicit mock remains safe and review-only; direct adapter with an
    # unset URL must report unavailable rather than generating a low-risk result.
    from app.services.risk import RiskService
    from app.schemas import TransactionInput
    from fastapi import HTTPException

    remote_settings = settings.model_copy(update={"ai_mode": "remote", "ai_engine_url": None})
    try:
        RiskService(remote_settings).analyze(TransactionInput(recipient_name="A", amount="1.00"))
    except HTTPException as exc:
        assert exc.status_code == 503
    else:
        raise AssertionError("risk service should fail closed when the AI URL is missing")


def test_mocked_paypal_order_capture_and_webhook(client, monkeypatch):
    from app.api import RiskService
    from app.services.paypal import PayPalService

    monkeypatch.setattr(RiskService, "analyze", lambda self, _body: RiskResult(
        score=4, level="LOW", recommendation="APPROVE", explanation="Test fixture from Member 3's API.",
    ))
    order_calls = []
    monkeypatch.setattr(PayPalService, "create_order", lambda self, **kwargs: (
        order_calls.append(kwargs) or {
            "id": "ORDER-TEST-1",
            "status": "CREATED",
            "links": [{"rel": "approve", "href": "https://sandbox.example/approve"}],
        }
    ))
    def capture_mock(self, **kwargs):
        return {
            "id": "ORDER-TEST-1",
            "status": "COMPLETED",
            "purchase_units": [{
                "custom_id": txn["id"],
                "amount": {"value": "9.99", "currency_code": "USD"},
                "payments": {"captures": [{
                    "id": "CAPTURE-TEST-1",
                    "status": "COMPLETED",
                    "amount": {"value": "9.99", "currency_code": "USD"},
                }]},
            }],
        }
    monkeypatch.setattr(PayPalService, "capture_order", capture_mock)

    txn = client.post("/api/transactions", json={"recipient_name": "Test payee", "amount": "9.99"}).json()
    assert txn["policy_decision"] == "APPROVE"
    created = client.post("/api/payments/create-order", json={"transaction_id": txn["id"]})
    assert created.status_code == 200
    assert created.json()["approval_url"] == "https://sandbox.example/approve"
    retry = client.post("/api/payments/create-order", json={"transaction_id": txn["id"]})
    assert retry.status_code == 200
    assert retry.json()["approval_url"] == "https://sandbox.example/approve"
    assert len(order_calls) == 1

    captured = client.post("/api/payments/capture-order", json={
        "transaction_id": txn["id"], "order_id": "ORDER-TEST-1",
    }, headers={"Idempotency-Key": "capture-test-1"})
    assert captured.status_code == 200
    assert captured.json()["transaction"]["payment_status"] == "COMPLETED"
    assert captured.json()["transaction"]["paypal_capture_id"] == "CAPTURE-TEST-1"

    # A repeated capture request returns the saved success without another call.
    def should_not_capture(*_args, **_kwargs):
        raise AssertionError("completed capture must be idempotent")
    monkeypatch.setattr(PayPalService, "capture_order", should_not_capture)
    repeated = client.post("/api/payments/capture-order", json={
        "transaction_id": txn["id"], "order_id": "ORDER-TEST-1",
    })
    assert repeated.status_code == 200
    assert repeated.json()["paypal_status"] == "COMPLETED"

    monkeypatch.setattr(PayPalService, "verify_webhook", lambda self, **kwargs: True)
    event = {
        "id": "EVENT-TEST-1",
        "event_type": "PAYMENT.CAPTURE.COMPLETED",
        "resource": {
            "id": "CAPTURE-TEST-1",
            "amount": {"value": "9.99", "currency_code": "USD"},
            "supplementary_data": {"related_ids": {"order_id": "ORDER-TEST-1"}},
        },
    }
    hook = client.post("/api/payments/webhook", json=event)
    assert hook.status_code == 200
    assert hook.json()["duplicate"] is False
    duplicate = client.post("/api/payments/webhook", json=event)
    assert duplicate.status_code == 200
    assert duplicate.json()["duplicate"] is True

    # Late negative events cannot downgrade a previously confirmed capture.
    late_denial = client.post("/api/payments/webhook", json={
        "id": "EVENT-LATE-DENIAL",
        "event_type": "PAYMENT.CAPTURE.DENIED",
        "resource": {
            "id": "CAPTURE-TEST-1",
            "supplementary_data": {"related_ids": {"order_id": "ORDER-TEST-1"}},
        },
    })
    assert late_denial.status_code == 200
    assert client.get(f"/api/transactions/{txn['id']}").json()["payment_status"] == "COMPLETED"


def test_ai_http_contract_with_mock_response(settings, monkeypatch):
    import httpx

    from app.schemas import TransactionInput
    from app.services.risk import RiskService

    seen = []

    def handler(request):
        seen.append(request)
        return httpx.Response(200, json={"risk": {
            "risk_score": 12,
            "risk_level": "low",
            "recommendation": "APPROVE",
            "reason": "Mock Member 3 response.",
        }})

    original_client = httpx.Client
    monkeypatch.setattr(
        "app.services.risk.httpx.Client",
        lambda **kwargs: original_client(transport=httpx.MockTransport(handler), **kwargs),
    )
    remote = settings.model_copy(update={
        "ai_mode": "remote",
        "ai_engine_url": "https://ai.example.test/analyze",
        "ai_engine_api_key": "test-key",
    })
    result = RiskService(remote).analyze(TransactionInput(
        recipient_name="Mock merchant", amount="8.25", currency="USD",
    ))
    assert result.level == "LOW"
    assert result.score == 12
    assert result.explanation == "Mock Member 3 response."
    assert len(seen) == 1
    assert seen[0].url.path == "/analyze"
    assert seen[0].headers["authorization"] == "Bearer test-key"


def test_paypal_oauth_order_capture_and_webhook_verify_with_mock_transport(monkeypatch):
    import httpx

    from app.config import Settings
    from app.services.paypal import PayPalService

    requests = []

    def handler(request):
        requests.append(request)
        if request.url.path == "/v1/oauth2/token":
            return httpx.Response(200, json={"access_token": "sandbox-token"})
        if request.url.path == "/v2/checkout/orders":
            return httpx.Response(201, json={"id": "ORDER-HTTP-MOCK", "status": "CREATED", "links": []})
        if request.url.path == "/v2/checkout/orders/ORDER-HTTP-MOCK/capture":
            return httpx.Response(200, json={"id": "ORDER-HTTP-MOCK", "status": "COMPLETED"})
        if request.url.path == "/v1/notifications/verify-webhook-signature":
            return httpx.Response(200, json={"verification_status": "SUCCESS"})
        return httpx.Response(404)

    original_client = httpx.Client
    monkeypatch.setattr(
        "app.services.paypal.httpx.Client",
        lambda **kwargs: original_client(transport=httpx.MockTransport(handler), **kwargs),
    )
    service = PayPalService(Settings(
        paypal_client_id="client-id",
        paypal_client_secret="client-secret",
        paypal_webhook_id="webhook-id",
    ))
    order = service.create_order(transaction_id="txn-1", amount=Decimal("12.50"), currency="USD", description="Test")
    assert order["id"] == "ORDER-HTTP-MOCK"
    captured = service.capture_order(order_id="ORDER-HTTP-MOCK", request_id="capture-txn-1")
    assert captured["status"] == "COMPLETED"
    verified = service.verify_webhook(
        headers={
            "paypal-auth-algo": "SHA256withRSA",
            "paypal-cert-url": "https://api-m.sandbox.paypal.com/cert",
            "paypal-transmission-id": "transmission-1",
            "paypal-transmission-sig": "signature",
            "paypal-transmission-time": "2026-11-08T00:00:00Z",
        },
        event={"id": "event-1", "event_type": "PAYMENT.CAPTURE.COMPLETED"},
    )
    assert verified is True
    order_request = next(request for request in requests if request.url.path == "/v2/checkout/orders")
    assert order_request.headers["authorization"] == "Bearer sandbox-token"
    assert order_request.headers["paypal-request-id"] == "txn-1"
    import json
    order_payload = json.loads(order_request.content)
    paypal_context = order_payload["payment_source"]["paypal"]["experience_context"]
    assert paypal_context["return_url"] == "http://localhost:5173/paypal/return"
    assert paypal_context["cancel_url"] == "http://localhost:5173/paypal/cancel"
    assert len([request for request in requests if request.url.path == "/v1/oauth2/token"]) == 3

