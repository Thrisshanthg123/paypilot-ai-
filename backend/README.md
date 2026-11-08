# FraudShield AI Backend

FastAPI service for transaction persistence, Member 3's remote risk engine, server-side payment policy, and PayPal Developer Sandbox orders. This module lives beside the existing React application; it does not alter the frontend.

## Requirements and start

- Python 3.11 or newer
- PostgreSQL/Supabase for shared environments; SQLite is used by default for local development and tests
- PayPal Developer Sandbox REST app credentials for real sandbox order calls
- Member 3's risk API URL for live risk analysis

From the repository root:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --reload
```

Linux/macOS activation is `source .venv/bin/activate`. API docs are available at `http://localhost:8000/docs`.

Set `DATABASE_URL` in `backend/.env`. For Supabase/PostgreSQL use a SQLAlchemy psycopg URL, for example:

```text
postgresql+psycopg://USER:PASSWORD@HOST:5432/postgres?sslmode=require
```

The service creates its tables at startup for this hackathon module. For production, use managed migrations (for example Alembic) before deploying schema changes.

## Configuration

| Variable | Purpose |
|---|---|
| `APP_ENV` | Environment label returned by health check |
| `DATABASE_URL` | SQLAlchemy URL; SQLite default is `sqlite:///./fraudshield.db` |
| `CORS_ORIGINS` | Comma-separated frontend origins, default Vite localhost origins |
| `AI_MODE` | `remote` by default; `mock` is an explicit, review-only local demo adapter |
| `AI_ENGINE_URL` | Member 3's complete analysis endpoint URL |
| `AI_ENGINE_API_KEY` | Optional bearer token sent to Member 3's API |
| `AI_TIMEOUT_SECONDS` | AI API request timeout |
| `PAYPAL_BASE_URL` | Sandbox by default: `https://api-m.sandbox.paypal.com` |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Sandbox REST app credentials; keep server-side |
| `PAYPAL_WEBHOOK_ID` | Webhook ID from the PayPal Developer Dashboard |
| `PAYPAL_RETURN_URL` / `PAYPAL_CANCEL_URL` | Frontend URLs PayPal redirects to after approval or cancellation |
| `PAYPAL_TIMEOUT_SECONDS` | PayPal API request timeout |

The app never embeds credentials. Missing AI configuration returns HTTP 503 and cannot approve payments. `AI_MODE=mock` returns a MEDIUM/REVIEW fixture only and therefore cannot create a PayPal order. The app also rejects mock mode when `APP_ENV=production` or `prod`.

This hackathon module does not yet authenticate end users or enforce per-user transaction ownership. Add the team's identity/authentication layer and ownership checks before exposing it to untrusted clients or deploying it for real users.

## AI engine contract

Configure `AI_ENGINE_URL` to Member 3's full endpoint URL. The backend posts JSON with a bearer token when configured:

```json
{
  "recipient_name": "Sample merchant",
  "recipient_upi": "merchant@example.test",
  "amount": "12.50",
  "currency": "USD",
  "note": "Invoice 123"
}
```

Expected response (flat or wrapped in a `risk` object):

```json
{
  "score": 18,
  "level": "LOW",
  "recommendation": "APPROVE",
  "explanation": "Reason for the score"
}
```

Aliases accepted: `risk_score` for `score`, `risk_level` for `level`, `action` for `recommendation`, and `reason` or `details` for `explanation`. Risk level must be LOW, MEDIUM, or HIGH. The backend's fixed policy uses only the validated level; an AI recommendation cannot override it. Timeout, invalid response, or unavailable engine fails closed with HTTP 503.

## PayPal flow and safety behavior

1. Create a transaction. Backend calls the risk API and stores the result and policy decision.
2. Only LOW/APPROVE transactions can create a PayPal order. MEDIUM is REVIEW and HIGH is BLOCK; neither can create an order.
3. The frontend sends the returned PayPal approval link to the buyer. On return, it asks the backend to capture the exact order bound to that transaction.
4. Backend verifies PayPal's order/capture response before setting `COMPLETED`. Repeated create/capture calls use persisted transaction data and PayPal request IDs to reduce duplicate processing.
5. Webhooks are checked with PayPal's `verify-webhook-signature` API before event IDs are stored or transaction status is changed. Duplicate event IDs are acknowledged without reapplying the update.

Payment event transitions preserve terminal outcomes: a late denial cannot downgrade a completed capture, and later completion events cannot undo a refund or reversal. Capture amount and currency must match the stored transaction before it can be marked complete.

This implements PayPal Checkout orders, not Indian UPI settlement. INR is deliberately rejected by the current PayPal integration because PayPal's REST payment currency list does not include INR. The existing React mock uses rupees; the frontend must send a supported currency and amount (or perform an explicit, server-verified currency conversion) before using real PayPal orders. Do not label a PayPal Checkout order as a completed UPI transfer. Supported codes are limited to the integration's two-decimal subset; PayPal support and receiving-account eligibility vary by country. See [PayPal currency codes](https://developer.paypal.com/api/codes/currency/).

PayPal credentials are required for create/capture/webhook verification. The backend does not fabricate payment success: a successful status is recorded only after a PayPal `COMPLETED` order with a `COMPLETED` capture or a verified `PAYMENT.CAPTURE.COMPLETED` webhook.

## API

All transaction APIs are prefixed with `/api`; interactive schemas are at `/docs`.

### `GET /health`

Checks the database connection and reports whether PayPal credentials are configured. It does not call the AI or PayPal service.

### `POST /api/transactions`

Analyzes and persists a transaction. Send an `Idempotency-Key` header for safe client retries.

```json
{
  "recipient_name": "Sample merchant",
  "recipient_upi": "merchant@example.test",
  "amount": "12.50",
  "currency": "USD",
  "note": "Invoice 123"
}
```

Returns the transaction, including `risk_score`, `risk_level`, `recommendation`, `risk_explanation`, `policy_decision`, and `payment_status`. Initial statuses are `RISK_APPROVED`, `REVIEW_REQUIRED`, or `BLOCKED`.

### `POST /api/risk/analyze`

Accepts the same transaction body and returns `{ "risk": {...}, "policy_decision": "APPROVE|REVIEW|BLOCK", "policy_message": "..." }` without creating a database record.

### `GET /api/transactions` and `GET /api/transactions/{id}`

List supports `limit` (1–200), `offset`, and optional `payment_status`; detail returns one persisted record.

### `POST /api/payments/create-order`

```json
{ "transaction_id": "<transaction UUID>" }
```

Creates a PayPal `CAPTURE` intent order only when that transaction's server policy is APPROVE. Response includes `transaction`, `paypal_status`, and `approval_url`.

### `POST /api/payments/capture-order`

```json
{ "transaction_id": "<transaction UUID>", "order_id": "<PayPal order ID>" }
```

Accepts optional `Idempotency-Key`. The order must belong to the transaction. The response can report non-completed PayPal states; only confirmed capture is marked COMPLETED.

### `POST /api/payments/webhook`

Register this route with PayPal and configure its webhook ID in `PAYPAL_WEBHOOK_ID`. PayPal transmission headers are validated through PayPal's API before event processing.

### `GET /api/dashboard/stats`

Returns counts for total/approved/review/blocked/completed transactions and the sum of completed amounts.

## Frontend integration

The current React app computes risk and payment results locally in `src/components/UpiPaymentModal.jsx`; it does not call this API yet. The backend is ready for integration without modifying those files. Replace the local simulation with this sequence:

1. POST form fields to `/api/transactions` with a fresh idempotency key.
2. Show the returned risk result. Continue only if `policy_decision` is `APPROVE`; show review/block status otherwise.
3. POST `{ "transaction_id": "..." }` to `/api/payments/create-order` and redirect the buyer to `approval_url`.
4. After PayPal returns the approved order ID, POST it and the transaction ID to `/api/payments/capture-order`.
5. Refresh history from `GET /api/transactions`; do not optimistically label a payment successful.

The existing UI presents INR and a demo PIN. Neither should be sent to PayPal as proof of payment. This backend does not receive or validate a UPI PIN, and it cannot settle UPI payments.

## Tests

Run from `backend/`:

```powershell
python -m pytest -q
```

Tests use an in-memory SQLite database, a review-only AI mock, and mocked PayPal responses. They cover database CRUD, fixed policy enforcement, idempotent transaction/capture handling, webhook verification path and duplicate events. They do not make network requests to Member 3 or PayPal. A real Sandbox end-to-end run requires credentials, a publicly reachable webhook URL, and a configured AI service.

