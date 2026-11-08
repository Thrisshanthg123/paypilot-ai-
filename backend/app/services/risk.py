from decimal import Decimal

import httpx
from fastapi import HTTPException

from app.config import Settings
from app.schemas import RiskResult, TransactionInput


class RiskService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def analyze(self, transaction: TransactionInput) -> RiskResult:
        if self.settings.ai_mode == "mock":
            # Explicit demo adapter only; it returns REVIEW so this mock cannot
            # authorize a payment or create a PayPal order.
            return RiskResult(
                score=50,
                level="MEDIUM",
                recommendation="REVIEW",
                explanation="Development mock response. Member 3's AI engine is not connected; payment remains on hold.",
            )

        url = self.settings.ai_engine_url
        if not url:
            raise HTTPException(status_code=503, detail="Risk analysis is unavailable: AI_ENGINE_URL is not configured.")

        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        if self.settings.ai_engine_api_key:
            headers["Authorization"] = f"Bearer {self.settings.ai_engine_api_key}"
        payload = {
            "recipient_name": transaction.recipient_name,
            "recipient_upi": transaction.recipient_upi,
            "amount": str(transaction.amount),
            "currency": transaction.currency,
            "note": transaction.note,
        }
        try:
            with httpx.Client(timeout=self.settings.ai_timeout_seconds) as client:
                response = client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
            # Supports either the documented flat response or {"risk": {...}}.
            if isinstance(data, dict) and isinstance(data.get("risk"), dict):
                data = data["risk"]
            if not isinstance(data, dict):
                raise ValueError("AI response must be an object")
            level = str(data.get("level", data.get("risk_level", ""))).upper()
            recommendation = data.get("recommendation", data.get("action", ""))
            explanation = data.get("explanation", data.get("reason", data.get("details", "")))
            score = data.get("score", data.get("risk_score"))
            return RiskResult(
                score=score,
                level=level,
                recommendation=recommendation,
                explanation=explanation,
            )
        except HTTPException:
            raise
        except (httpx.HTTPError, httpx.InvalidURL, ValueError, TypeError, KeyError) as exc:
            # No fallback to an approving result: failed AI checks fail closed.
            raise HTTPException(status_code=503, detail="Risk analysis service failed; payment cannot proceed.") from exc

