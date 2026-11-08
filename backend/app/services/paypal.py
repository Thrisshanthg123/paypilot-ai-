from decimal import Decimal

import httpx
from fastapi import HTTPException

from app.config import Settings


class PayPalService:
    def __init__(self, settings: Settings):
        self.settings = settings

    @property
    def configured(self) -> bool:
        return bool(self.settings.paypal_client_id and self.settings.paypal_client_secret)

    def _credentials(self) -> tuple[str, str]:
        if not self.configured:
            raise HTTPException(status_code=503, detail="PayPal Sandbox credentials are not configured.")
        return self.settings.paypal_client_id or "", self.settings.paypal_client_secret or ""

    def _request(self, method: str, path: str, *, json=None, headers=None):
        client_id, secret = self._credentials()
        url = f"{self.settings.paypal_base_url.rstrip('/')}{path}"
        try:
            with httpx.Client(timeout=self.settings.paypal_timeout_seconds) as client:
                token_response = client.post(
                    f"{self.settings.paypal_base_url.rstrip('/')}/v1/oauth2/token",
                    auth=(client_id, secret),
                    data={"grant_type": "client_credentials"},
                    headers={"Accept": "application/json", "Accept-Language": "en_US"},
                )
                token_response.raise_for_status()
                access_token = token_response.json()["access_token"]
                request_headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
                if headers:
                    request_headers.update(headers)
                response = client.request(method, url, json=json, headers=request_headers)
                response.raise_for_status()
                return response.json() if response.content else {}
        except HTTPException:
            raise
        except (httpx.HTTPError, httpx.InvalidURL, ValueError, KeyError) as exc:
            # Avoid returning provider bodies, which can contain sensitive details.
            raise HTTPException(status_code=502, detail="PayPal Sandbox request failed.") from exc

    def create_order(self, *, transaction_id: str, amount: Decimal, currency: str, description: str) -> dict:
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "reference_id": transaction_id,
                "custom_id": transaction_id,
                "description": description[:127],
                "amount": {"currency_code": currency, "value": f"{amount:.2f}"},
            }],
            "payment_source": {"paypal": {"experience_context": {
                "user_action": "PAY_NOW",
                "return_url": self.settings.paypal_return_url,
                "cancel_url": self.settings.paypal_cancel_url,
            }}},
        }
        return self._request(
            "POST",
            "/v2/checkout/orders",
            json=payload,
            headers={"PayPal-Request-Id": transaction_id},
        )

    def capture_order(self, *, order_id: str, request_id: str) -> dict:
        return self._request(
            "POST",
            f"/v2/checkout/orders/{order_id}/capture",
            json={},
            headers={"PayPal-Request-Id": request_id},
        )

    def verify_webhook(self, *, headers: dict[str, str], event: dict) -> bool:
        if not self.settings.paypal_webhook_id:
            raise HTTPException(status_code=503, detail="PayPal webhook ID is not configured.")
        payload = {
            "auth_algo": headers.get("paypal-auth-algo"),
            "cert_url": headers.get("paypal-cert-url"),
            "transmission_id": headers.get("paypal-transmission-id"),
            "transmission_sig": headers.get("paypal-transmission-sig"),
            "transmission_time": headers.get("paypal-transmission-time"),
            "webhook_id": self.settings.paypal_webhook_id,
            "webhook_event": event,
        }
        if any(not payload.get(key) for key in (
            "auth_algo", "cert_url", "transmission_id", "transmission_sig", "transmission_time"
        )):
            return False
        result = self._request("POST", "/v1/notifications/verify-webhook-signature", json=payload)
        return result.get("verification_status") == "SUCCESS"

