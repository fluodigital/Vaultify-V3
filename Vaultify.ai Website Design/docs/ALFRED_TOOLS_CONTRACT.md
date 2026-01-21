# Alfred Tools Contract

Tools are internal-only and must be called via the server router. Each tool validates inputs with Zod and returns deterministic JSON. Unknown tool names are rejected.

## Tool list
- `search_listings({ vertical, query, filters, idempotencyKey? }) -> { results: ListingSummary[] }`
- `get_listing_details({ listingId }) -> { listing }`
- `get_offers({ listingId, constraints }) -> { offers: Offer[] }`
- `create_booking_draft({ listingId, offerId, travellers, notes, idempotencyKey? }) -> { bookingId, status }`
- `request_vendor_checkout({ bookingId, idempotencyKey? }) -> { checkoutUrl?, status }`
- `get_booking_status({ bookingId }) -> { status, summary }`
- `cancel_booking({ bookingId, reason, idempotencyKey? }) -> { status }`
- `save_user_preferences({ prefs }) -> { ok: true }`

## Execution rules
- Use only our data/services (Firestore or internal services). No direct vendor calls from the model.
- Idempotent where applicable (idempotencyKey respected).
- All handlers log `correlationId` and `bookingId` (if present) with PII redacted.
- Irreversible actions (create/cancel/payment) require confirmation gating in the plan and API layer.
- Tool outputs are filtered before being sent back into the model (no secrets/headers/internal URLs).

## Structured outputs
- Planning uses a strict JSON schema (AlfredPlan) to capture intent, missing info, recommended tool calls, and confirmation needs.
- Tool inputs/outputs are validated before execution and before sending to the model.

## Prompt safety
- Tool responses are treated as untrusted until validated. Fake or malformed outputs are rejected and surfaced as errors to the assistant.
