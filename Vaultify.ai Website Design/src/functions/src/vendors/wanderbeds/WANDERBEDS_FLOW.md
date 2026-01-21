# Wanderbeds API Integration Flow

This document describes the correct flow for integrating with the Wanderbeds API, based on their official documentation (Search.txt, Availability.txt, Book.txt, Booking Info.txt).

## Session Flow

### 1. Search (`POST /hotel/search`)

**Purpose**: Search for hotel availability and pricing.

**Request**:
```json
{
  "hotels": [2657],
  "checkin": "2026-02-02",
  "checkout": "2026-02-07",
  "rooms": [
    {
      "adt": 1,
      "chd": 0,
      "age": []
    }
  ],
  "nationality": "FR",
  "timout": "20"
}
```

**Important Notes**:
- Parameter is spelled `timout` (typo in vendor API), not `timeout`
- `rooms` array must ALWAYS include:
  - `adt` (int): Number of adults
  - `chd` (int): Number of children (even if 0)
  - `age` (int[]): Array of child ages (empty array `[]` when `chd=0`)
- `nationality`: ISO 2-letter country code (e.g., "FR", "GB", "US", "PH")

**Response**:
```json
{
  "token": "abc123...",
  "count": 1,
  "hotels": [...],
  "error": null
}
```

**Critical**: The `token` field in the response MUST be saved and used in subsequent requests.

### 2. Availability (`POST /hotel/avail`)

**Purpose**: Check availability for specific room offers and prepare them for booking.

**Request**:
- **Body**: `{ "rooms": ["offerid1", "offerid2"] }`
- **Header**: `Token: <token from search>`

**Important Notes**:
- Per Wanderbeds docs: "This request also prepares the rooms for booking, so rooms from your last availability request will be booked."
- Token goes in the **header**, not the body
- Header name is `Token` (not `Authorization` or `X-Token`)

**Response**:
```json
{
  "token": "xyz789...",
  "data": {
    "success": true,
    "products": [...],
    "summary": {...},
    "required": {...}
  }
}
```

**Critical**: Use the latest token returned (avail may return a new token).

### 3. Book (`POST /hotel/book`)

**Purpose**: Complete the booking with passenger information.

**Request**:
- **Body**: 
```json
{
  "client_reference": "unique-ref-123",
  "passengers": [
    {
      "type": "adt",
      "group": "1",
      "title": "Mr",
      "firstname": "John",
      "lastname": "Doe",
      "nationality": "FR",
      "birthdate": ""
    }
  ]
}
```
- **Header**: `Token: <token from search or avail>`

**Important Notes**:
- `client_reference`: Must be unique for each booking
- `passengers`: Must match search criteria (number and type)
- `type`: "adt" (adult), "chd" (child), "inf" (infant, age 1)
- `group`: Room index (string)
- Token goes in the **header**, not the body

**Response**:
```json
{
  "token": "...",
  "data": {
    "contact": {...},
    "passengers": [...],
    "products": [
      {
        "rooms": [
          {
            "booking": {
              "status": "C",
              "booking_reference": "WDBT347JTUO6",
              "reference": "WDBNLA1JEQQH",
              "client_reference": "unique-ref-123"
            }
          }
        ]
      }
    ]
  }
}
```

**Booking Status Codes**:
- `NO`: Not booked
- `RQ`: On request (pending)
- `C`: Confirmed
- `X`: Canceled
- `RJ`: Failed

### 4. Booking Info (`POST /hotel/bookinfo`) - Optional

**Purpose**: Check status and details of an existing booking.

**Request**:
- **Body**: `{ "client_reference": "..." }` OR `{ "booking_reference": "..." }`
- **Header**: `Token: <token>` (optional)

**Response**: Same structure as Book response.

### 5. Cancel (`POST /hotel/cancel`) - Optional

**Purpose**: Cancel a booking.

**Request**:
- **Body**: `{ "booking_reference": "...", "reference": "..." }` (reference is optional, for canceling single room)

**Response**: Same structure as Book response, with `status: "X"`.

## Error Handling

### "No results" (Error Code 100)

When Wanderbeds returns:
```json
{
  "error": {
    "code": 100,
    "message": "No results"
  },
  "count": 0,
  "hotels": []
}
```

**This is NOT an HTTP error**. The upstream API returns HTTP 200 with this JSON body.

**Our Implementation**:
- Backend returns HTTP 200 with `ok: true, data: { hotels: [], count: 0 }`
- Frontend shows user-friendly message: "No rooms available for the selected dates"
- Debug endpoint (`/debug/wanderbeds/search-raw`) always returns HTTP 200, even for "No results"

## Nationality Fallback (Debug Only)

When `WANDERBEDS_ENABLE_NATIONALITY_FALLBACK=true` is set, the search endpoint will automatically try fallback nationalities if the requested nationality returns "No results":

1. Try requested nationality
2. Try "GB"
3. Try "US"
4. Try "PH"

If a fallback succeeds, the response includes:
```json
{
  "meta": {
    "nationalityUsed": "PH",
    "fallbackTried": ["FR", "GB", "US", "PH"]
  }
}
```

**Note**: This is debug-only. Production UI should show a nationality selector and not silently change the user's selection.

## Implementation Notes

### Backend Endpoints

- `POST /wanderbeds/search` - Normalized rooms payload, returns token
- `POST /wanderbeds/avail` - Accepts token in body, sends to upstream as header
- `POST /wanderbeds/book` - Accepts token in body, sends to upstream as header
- `POST /wanderbeds/bookinfo` - Optional, for booking status
- `POST /wanderbeds/cancel` - Optional, for canceling bookings

### Frontend Client

- `searchWanderbedsHotels()` - Returns token in `data.token`
- `checkWanderbedsAvailability()` - Requires token from search
- `bookWanderbedsHotel()` - Requires token and passenger info

### Rooms Payload Normalization

The backend automatically normalizes rooms payload to ensure:
- `chd` is always present (0 if no children)
- `age` is always an array (empty `[]` if `chd=0`)
- `age.length === chd` when `chd > 0`

Frontend should send normalized format, but backend will fix it if needed.

## References

- `Search.txt` - Hotel search endpoint documentation
- `Availability.txt` - Availability check endpoint documentation
- `Book.txt` - Booking endpoint documentation
- `Booking Info.txt` - Booking status endpoint documentation
- `Cancel.txt` - Cancellation endpoint documentation
