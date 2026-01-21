# Alfred Voice Plan (future)

Goal: add voice-first concierge using OpenAI Realtime API without changing current UI yet.

## Approach
- Use client mic capture -> stream to backend Realtime session.
- Backend mediates Realtime connection, enforcing the same guardrails (tool allowlist, confirmation gating, PII redaction).
- Keep model same family (gpt-4.1 or gpt-4o realtime) with concise system/developer prompts reused from text stack.

## Event flow
1) Start session with correlationId and user/session IDs.
2) Stream user audio → model, request partial transcripts.
3) Model produces structured tool calls; backend executes via existing tool router.
4) For irreversible actions, require explicit voice confirmation token (“Yes, proceed”) or UI confirm.
5) Stream assistant audio back; include short text captions for UI accessibility.

## Safety considerations
- Apply prompt injection detection on transcripts.
- Never stream secrets; filter tool outputs before sending to the model.
- Rate limit streams per user/IP; cap concurrent sessions.

## Rollout steps
- Add Realtime session manager module that reuses current policy/types/tool router.
- Add WebRTC/WebSocket gateway (Cloud Run or Functions with a managed WS layer).
- Keep UI unchanged until a dedicated voice UI lands.
