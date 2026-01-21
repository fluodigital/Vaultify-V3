# Jetbay Connector

Env vars (placeholders, no secrets committed):
- `JETBAY_ENV=dev|prod`
- `JETBAY_BASE_URL_DEV=https://apidev.jet-bay.com`
- `JETBAY_BASE_URL_PROD=https://apiprod.jet-bay.com`
- `JETBAY_ACCESS_KEY=`
- `JETBAY_ACCESS_SECRET=`
- `JETBAY_LANG=en-us`

Signing:
- Content-SHA256 = lowercase hex of body ("" for GET).
- Canonical string: `{Access-Key}\n{Timestamp}\n{Nonce}\n{Content-SHA256}`
- Signature = Base64(HMAC-SHA256(secret, canonical)).
- Headers: `X-JetBay-Access-Key`, `X-JetBay-Timestamp` (ms), `X-JetBay-Nonce`, `X-JetBay-Content-SHA256`, `X-JetBay-Signature`, `Content-Type: application/json`, `Lang`.

Supported endpoints
- POST /jetbay/api/search/searchList (charter search)
- GET  /jetbay/api/data/v1/cityQuery?q=
- GET  /jetbay/api/data/countryQuery?q=
- GET  /jetbay/api/emptyLeg/v1/areas
- GET  /jetbay/api/emptyLeg/v1/queryPage
- POST /jetbay/api/lead/v1/submit/lead (charter inquiry)
- POST /jetbay/api/lead/v1/submitEmptyLegLead (empty-leg inquiry)

Booking stance
- Jetbay responses are treated as inquiries only. Vaultfy never marks them as booked/confirmed; Alfred should say “Inquiry submitted to Jetbay”.

Data storage (Firestore)
- Cache: `vendors/jetbay/cache/cities/{qHash}`, `vendors/jetbay/cache/countries/{qHash}` (24h TTL).
- Searches: `vendors/jetbay/charterSearches/{searchId}`, `vendors/jetbay/emptyLegSearches/{searchId}` with normalized listings/offers.
- Listings: `listings/{listingId}`; Offers: `offers/{offerId}`.
- Inquiries: `inquiries/{inquiryId}` with status submitted/failed and payloadRef.

Notes
- Auth errors codes 4001..4007 -> JetbayAuthError.
- No booking/payment/status endpoints provided in docs; only lead submission available.
