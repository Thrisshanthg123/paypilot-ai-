from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

PAYPAL_TWO_DECIMAL_CURRENCIES = {
    "AUD", "CAD", "CHF", "CZK", "DKK", "EUR", "GBP", "HKD", "ILS",
    "MXN", "NOK", "NZD", "PHP", "PLN", "SEK", "SGD", "THB", "USD",
}


class TransactionInput(BaseModel):
    recipient_name: str = Field(min_length=1, max_length=160)
    recipient_upi: str | None = Field(default=None, max_length=254)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    note: str | None = Field(default=None, max_length=500)

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        value = value.upper()
        if not value.isalpha():
            raise ValueError("currency must be a 3-letter code")
        if value not in PAYPAL_TWO_DECIMAL_CURRENCIES:
            raise ValueError("currency is not enabled for this PayPal integration; use a supported two-decimal PayPal currency")
        return value

    @field_validator("recipient_name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("recipient_name cannot be blank")
        return value


class RiskAnalyzeRequest(TransactionInput):
    transaction_id: str | None = None


class RiskResult(BaseModel):
    score: int = Field(ge=0, le=100)
    level: Literal["LOW", "MEDIUM", "HIGH"]
    recommendation: str = Field(min_length=1, max_length=32)
    explanation: str = Field(min_length=1, max_length=4000)


class RiskAnalyzeResponse(BaseModel):
    risk: RiskResult
    policy_decision: Literal["APPROVE", "REVIEW", "BLOCK"]
    policy_message: str


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    recipient_name: str
    recipient_upi: str | None
    note: str | None
    amount: Decimal
    currency: str
    risk_score: int | None
    risk_level: str | None
    recommendation: str | None
    risk_explanation: str | None
    policy_decision: str
    payment_status: str
    paypal_order_id: str | None
    paypal_approval_url: str | None
    paypal_capture_id: str | None
    created_at: datetime
    updated_at: datetime


class TransactionListResponse(BaseModel):
    items: list[TransactionResponse]
    total: int
    limit: int
    offset: int


class CreateOrderRequest(BaseModel):
    transaction_id: str


class CaptureOrderRequest(BaseModel):
    order_id: str = Field(min_length=1, max_length=64)
    transaction_id: str


class PaymentActionResponse(BaseModel):
    transaction: TransactionResponse
    paypal_status: str
    approval_url: str | None = None


class DashboardStats(BaseModel):
    total_transactions: int
    approved_transactions: int
    review_transactions: int
    blocked_transactions: int
    completed_payments: int
    total_amount: Decimal

