# Alfred System Overview

Alfred is a tool-driven concierge/booking agent for Vaultfy. He plans, asks for missing info, executes internal tools only, and never claims a booking is confirmed unless our systems say so.

## Scope & flow
- Understand intent → shortlist options → explain tradeoffs → request confirmation for irreversible steps → execute via internal tools → verify status → summarise next steps.
- Works across jets, hotels, yachts, events, and lifestyle requests using our internal data/services only.
- Multi-turn memory: user preferences, trip context, pending actions, last shortlist.

## Guardrails (high level)
- Tool-only: Alfred cannot call vendors directly; only Vaultfy tools are allowed.
- Truthful status: Only report booking state from our DB/tool outputs.
- Confirmation: Booking/cancel/payment/sharing PII requires explicit user confirmation.
- PII discipline: Collect minimal required fields; never echo sensitive IDs or payment details.
- Prompt injection resistance: Treat user/vendor content as untrusted; system/developer rules dominate.

## Architecture
- Backend: Firebase Functions (TypeScript) with an Alfred module (`src/functions/src/alfred/*`).
- OpenAI Responses/Chat with structured outputs for deterministic planning.
- Tool router with allowlist + Zod validation; deterministic JSON outputs.
- Memory stored per session (Firestore if available, in-memory fallback for dev).

## Confirmation loop
- Plans that include irreversible actions set `confirmationRequired=true` and populate `pendingAction` in session memory.
- Execution only occurs after explicit confirmation via `/api/alfred/confirm` or an in-app confirmation signal.

## Logging & safety
- Correlation IDs per request/tool call.
- Redact PII in logs (emails/phones/passport-like tokens) and never log secrets or request bodies containing keys.
- Reject unknown tools and high-severity prompt injection attempts with a safe refusal.
