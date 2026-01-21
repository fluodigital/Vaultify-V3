# Wanderbeds API Contract

## Overview

Wanderbeds hotel booking API integration contract. All endpoints use Basic Authentication and return JSON responses.

## Base Configuration

- **Base URL**: `https://api.wanderbeds.com`
- **Auth Scheme**: Basic Authentication (username:password base64-encoded)
- **Default Headers**:
  - `Accept: application/json`
  - `Content-Type: application/json`
  - `Accept-Encoding: gzip,deflate`
- **Timeout Handling**: Payload field `timout` (note: typo in vendor API) accepts seconds; convert to milliseconds with sane cap (e.g., max 120 seconds = 120,000ms)

## Authentication

All requests require Basic Auth header:
```
Authorization: Basic <base64(username:password)>
```

Credentials must be stored in Firebase Functions environment variables:
- `WANDERBEDS_USER`
- `WANDERBEDS_PASS`

**CRITICAL**: Never expose credentials in browser/client code.

## Token Flow

1. **Search** (`POST /hotel/search`) returns a `token` in response
2. Subsequent calls (`/hotel/avail`, `/hotel/book`) must include this token in headers:
   ```
   Token: <token_from_search_response>
   ```
3. Token is session-specific and tied to the search request

## Core Booking Journey Endpoints

### 1. Search Hotels

**Endpoint**: `POST /hotel/search`

**Request Body**:
```json
{
  "hotels": [1479, 1642, 1646, 1650],
  "checkin": "2026-05-10",
  "checkout": "2026-05-12",
  "rooms": [
    {
      "adt": 2,
      "chd": 1,
      "age": [6]
    }
  ],
  "nationality": "AE",
  "timout": "20"
}
```

**Required Fields**:
- `hotels` (Array<Integer>): At least one hotel ID
- `checkin` (String): YYYY-MM-DD format
- `checkout` (String): YYYY-MM-DD format
- `rooms` (Array<Object>): Room specifications
  - `adt` (Integer): Number of adults
  - `chd` (Integer): Number of children
  - `age` (Array<Integer>): Ages of children
- `nationality` (String): 2-letter ISO country code (e.g., "AE")
- `timout` (String): Timeout in seconds (default "20")

**Response**:
```json
{
  "token": "...",
  "time": "2026-01-13T08:46:00+00:00",
  "server": "dev",
  "count": 1,
  "hotels": [
    {
      "hotelid": "1646",
      "hotelname": "...",
      "accommodation": "Hotel",
      "starrating": 4,
      "country": "PT",
      "cityid": "234600",
      "cityname": "Lisbon",
      "address": "...",
      "location": {
        "lat": "38.6413",
        "lon": "-9.23645"
      },
      "rooms": [
        {
          "offerid": "21dox8yrj",
          "roomindex": 1,
          "group": 4,
          "name": "...",
          "refundable": true,
          "package": false,
          "roomtype": { "code": "590", "name": "Deluxe Room" },
          "meal": { "code": "2", "name": "Bed & Breakfast" },
          "view": { "code": "28", "name": "Land View" },
          "price": {
            "baseprice": 219.68,
            "tax": 0,
            "margin": 0,
            "total": 219.68,
            "currency": "EUR"
          },
          "cancelpolicy": {
            "from": "2026-05-07 15:00:00",
            "amount": 219.68,
            "currency": "EUR"
          },
          "additionalfees": {
            "breakdown": [],
            "total": 0,
            "currency": "EUR"
          }
        }
      ],
      "remarks": []
    }
  ]
}
```

**Key Fields**:
- `token`: Must be used in subsequent `/hotel/avail` and `/hotel/book` requests
- `hotels[].rooms[].offerid`: Required for availability and booking
- `hotels[].rooms[].group`: Rooms from same group must be selected together

### 2. Check Availability

**Endpoint**: `POST /hotel/avail`

**Required Header**:
```
Token: <token_from_search_response>
```

**Request Body**:
```json
{
  "rooms": ["21dox8yrj"]
}
```

**Required Fields**:
- `rooms` (Array<String>): Array of offer IDs from search response

**Response**:
```json
{
  "token": "...",
  "time": "2026-01-13T08:48:09+00:00",
  "server": "dev",
  "data": {
    "success": true,
    "products": [
      {
        "hotelid": "1646",
        "hotelname": "...",
        "starrating": 4,
        "country": "PT",
        "cityname": "Lisbon",
        "address": "...",
        "location": { "lat": "38.6413", "lon": "-9.23645" },
        "rooms": [...],
        "remarks": []
      }
    ],
    "summary": {
      "currency": "EUR",
      "nettotal": 219.68,
      "tax": 0,
      "margin": 0,
      "total": 219.68,
      "paymentplan": { "2026-05-07": 219.68 },
      "taxinfo": []
    },
    "required": {
      "nationality": 1,
      "chdbirthdate": 1
    }
  }
}
```

**Notes**:
- This call also prepares rooms for booking (session state)
- Check `required` fields to determine what passenger data is needed for booking

### 3. Book Hotel

**Endpoint**: `POST /hotel/book`

**Required Header**:
```
Token: <token_from_search_response>
```

**Request Body**:
```json
{
  "client_reference": "d7U8NlyTrZ9Vx3V",
  "passengers": [
    {
      "type": "adt",
      "group": "1",
      "title": "Mr",
      "firstname": "John",
      "lastname": "Doe",
      "nationality": "AE",
      "birthdate": ""
    },
    {
      "type": "chd",
      "group": "1",
      "title": "Mrs",
      "firstname": "Child",
      "lastname": "Doe",
      "nationality": "AE",
      "birthdate": "2020-03-10"
    }
  ]
}
```

**Required Fields**:
- `client_reference` (String): Unique reference generated by client (used for lookup)
- `passengers` (Array<Object>): Passenger information
  - `type` (String): "adt" (adult), "chd" (child), "inf" (infant, age 1)
  - `group` (String): Room index (must match search criteria)
  - `title` (String): "Mr", "Mrs", "Ms"
  - `firstname` (String)
  - `lastname` (String)
  - `nationality` (String): 2-letter ISO code (must match search nationality)
  - `birthdate` (String): YYYY-MM-DD (required for children, optional for adults)

**Response**:
```json
{
  "token": "...",
  "time": "2026-01-13T08:49:14+00:00",
  "server": "dev",
  "data": {
    "contact": {
      "companyname": "Your Company",
      "firstname": "Example",
      "lastname": "Name",
      "email": "email@example.com",
      "phone": "971-1234567891234",
      "country": "AE",
      "state": "",
      "zip": "418428",
      "city": "Dubai",
      "address": ""
    },
    "passengers": [
      {
        "id": 312,
        "group": 1,
        "type": "adt",
        "title": "Mr",
        "firstname": "John",
        "lastname": "Doe",
        "nationality": "AE"
      }
    ],
    "products": [
      {
        "hotelid": "1646",
        "hotelname": "...",
        "rooms": [
          {
            "offerid": "21dox8yrj",
            "booking": {
              "status": "C",
              "booking_reference": "WDBT347JTUO6",
              "reference": "WDBNLA1JEQQH",
              "client_reference": "Snr5pnu8qHayuBo",
              "confirmation_number": ""
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

### 4. Get Booking Info

**Endpoint**: `POST /hotel/bookinfo`

**Required Header**:
```
Token: <token_from_search_response> (optional if booking reference is provided)
```

**Request Body**:
```json
{
  "booking_reference": "WDBT347JTUO6",
  "client_reference": "d7U8NlyTrZ9Vx3V"
}
```

**Response**: Similar to book response with full booking details

### 5. Cancel Booking

**Endpoint**: `POST /hotel/cancel`

**Request Body**:
```json
{
  "booking_reference": "WDBT347JTUO6",
  "reference": ""
}
```

**Required Fields**:
- `booking_reference` (String): Booking reference from book response
- `reference` (String, optional): Room reference to cancel specific room

**Response**:
```json
{
  "token": "...",
  "time": "2026-01-13T09:05:02+00:00",
  "server": "dev",
  "data": {
    "success": true,
    "contact": {...},
    "passengers": [...],
    "products": [
      {
        "rooms": [
          {
            "booking": {
              "status": "X",
              "booking_reference": "WDBT347JTUO6",
              "reference": "WDBNLA1JEQQH",
              "client_reference": "Snr5pnu8qHayuBo"
            }
          }
        ]
      }
    ]
  }
}
```

## Static Data Endpoints

### Countries

**Endpoint**: `GET /staticdata/countries`

**Response**:
```json
{
  "token": "...",
  "time": "...",
  "server": "...",
  "data": {
    "countries": [
      { "code": "AF", "name": "Afghanistan" },
      ...
    ]
  }
}
```

### Cities

**Endpoint**: `GET /staticdata/cities/{countryCode}/?items=100`

**Path Parameters**:
- `countryCode`: 2-letter ISO country code

**Query Parameters**:
- `items` (optional): Number of items per page (default: server limit)

**Response**:
```json
{
  "token": "...",
  "time": "...",
  "server": "...",
  "data": {
    "pager": {
      "totalcount": 100,
      "displaycount": 100,
      "pages": 1,
      "page": 1,
      "token": "..."
    },
    "cities": [
      {
        "code": "DXB",
        "name": "Dubai",
        "country": "AE",
        "state": "",
        "geo": { "lat": "25.2048", "lng": "55.2708" }
      }
    ]
  }
}
```

**Pagination**: Use `pager.token` in `Token` header for subsequent pages

### Hotel List

**Endpoint**: `GET /staticdata/hotellist`

**Response**: Array of hotel IDs and basic info (structure varies by response)

### Hotel Details

**Endpoint**: `POST /staticdata/hoteldetails`

**Request Body**:
```json
{
  "hotels": [1882]
}
```

**Response**:
```json
{
  "hotels": [
    {
      "hotel": {
        "hotelid": "1882",
        "giata": "26635",
        "name": "Pestana Palace Lisboa - Hotel & National Monument"
      },
      "city": {
        "id": "234600",
        "code": "",
        "name": "Lisbon"
      },
      "country": "PT",
      "location": { "lat": "38.7034", "lon": "-9.1868" },
      "starrating": 5,
      "accommodation": "Hotel",
      "address": "...",
      "phone": "...",
      "email": "",
      "web": "",
      "language": "en",
      "areadetails": "",
      "description": "...",
      "facilities": [...],
      "images": [
        {
          "width": "0",
          "height": "0",
          "url": "https://wanderbeds.com/apps/booking/img.php?type=hotel&data=..."
        }
      ],
      "remarks": []
    }
  ]
}
```

## Internal Contract (Our API Wrapper)

All our `/api/wanderbeds/*` routes must return a consistent shape:

```typescript
{
  ok: boolean;
  data: any | null;
  meta: {
    source: "wanderbeds";
    server?: string;
    time?: string;
    ms?: number;
    status?: number;
  };
  error: {
    code: string;
    message: string;
    upstreamStatus?: number;
    upstreamMs?: number;
  } | null;
}
```

## Error Handling

- **401 Unauthorized**: Invalid credentials
- **400 Bad Request**: Invalid request payload
- **404 Not Found**: Resource not found
- **408 Timeout**: Request exceeded `timout` seconds
- **500 Internal Server Error**: Vendor server error

All errors must be wrapped in our internal contract with `ok: false` and appropriate error details.

## Notes

1. **Typo**: Vendor uses `timout` (not `timeout`) in search payload
2. **Token Lifecycle**: Token from search is valid for the session; use in avail/book calls
3. **Group Matching**: When selecting multiple rooms, ensure they're from the same `group`
4. **Coordinates**: `lat`/`lon` are strings; convert to numbers for internal use
5. **Nationality**: Must match between search and passenger data
6. **Child Birthdate**: Required for `type: "chd"` passengers

## Implementation Checklist

- [x] Contract documentation
- [ ] Clean client implementation (client.ts)
- [ ] Type definitions (types.ts)
- [ ] Response mappers (mappers.ts)
- [ ] Error handling (errors.ts)
- [ ] Route A: `/wanderbeds/health`
- [ ] Route B: `/wanderbeds/search`
- [ ] Route C: `/wanderbeds/availability`
- [ ] Route D: `/wanderbeds/book`
- [ ] Route E: `/wanderbeds/booking-info`
- [ ] Route F: `/wanderbeds/cancel`
- [ ] Frontend client integration
- [ ] Cleanup old code
