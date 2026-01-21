# Wanderbeds Hotel Search Integration - Detailed Problem Report

## Problem Statement

**Symptom**: When users select dates on a hotel detail page (e.g., `/wanderbeds/hotel/2657`), the pricing and room options fail to load. The frontend receives a "No results" error from the backend, even though:
- A competitor website (destinowonders.com) can successfully fetch pricing for the same hotel with identical dates
- The API authentication is working (tokens are being returned)
- Other hotels (e.g., hotel 1646) work correctly with the same code

**User Impact**: Users cannot view pricing or book hotels, creating a critical blocker for the booking flow.

---

## Architecture & Implementation

### 1. Frontend Flow

**File**: `src/pages/WanderbedsHotelDetail.tsx`

**Flow**:
1. User navigates to hotel detail page (e.g., `/wanderbeds/hotel/2657`)
2. Component fetches hotel details from:
   - First: Curated Firestore collection (`vendors/wanderbeds/curation/hotels/items`)
   - Fallback: Backend API `/hotels/static/hoteldetails`
3. Default dates are set to **Feb 2-7, 2026** (5 nights) - matching competitor's working example
4. When dates are selected, `useEffect` triggers pricing fetch:
   ```typescript
   const searchResp = await searchWanderbedsHotels({
     hotels: [hotelId],  // Numeric ID (e.g., 2657)
     checkin: dates.checkin,  // "2026-02-02"
     checkout: dates.checkout,  // "2026-02-07"
     rooms: [{ adt: 1 }],  // 1 adult (changed from 2 to match competitor)
     nationality: hotel.country || 'AE',  // Hotel's country code (e.g., "FR")
     timout: '20',
   });
   ```
5. Response is checked for errors and rooms are displayed

**Key Settings**:
- Default dates: Feb 2-7, 2026 (5 nights) - matches competitor
- Rooms: 1 adult (changed from 2 to match competitor)
- Minimum check-in: 5 days in advance (user requirement)
- Date validation: Ensures checkout > checkin and checkin >= 5 days from today

---

### 2. Frontend API Client

**File**: `src/lib/wanderbeds.ts`

**Function**: `searchWanderbedsHotels(request: WanderbedsSearchRequest)`

**Implementation**:
```typescript
export async function searchWanderbedsHotels(request: WanderbedsSearchRequest): Promise<ApiResponse<WanderbedsSearchResponse>> {
  return apiPost<ApiResponse<WanderbedsSearchResponse>>('/wanderbeds/search', request);
}
```

**Request Structure**:
```typescript
interface WanderbedsSearchRequest {
  hotels: number[];  // Array of hotel IDs (e.g., [2657])
  checkin: string;   // YYYY-MM-DD format
  checkout: string;  // YYYY-MM-DD format
  rooms: Array<{
    adt: number;     // Adults (1 or 2)
    chd?: number;    // Children (optional)
    age?: number[];  // Ages of children (optional)
  }>;
  nationality: string;  // ISO 2-letter country code (e.g., "FR", "AE")
  timout?: string;      // Note: typo in vendor API - must be "timout" not "timeout"
}
```

**Response Structure**:
```typescript
interface WanderbedsSearchResponse {
  token: string;
  count: number;
  hotels: WanderbedsHotel[];
}

interface WanderbedsHotel {
  id: string;
  name: string;
  rooms: WanderbedsRoom[];  // Array of available room options
  // ... other fields
}

interface WanderbedsRoom {
  offerId: string;
  name: string;
  price: {
    total: number;
    currency: string;
  };
  // ... room details (meal, view, refundable, etc.)
}
```

---

### 3. Backend API Gateway

**File**: `src/functions/src/apiGateway.ts`

**Endpoint**: `POST /wanderbeds/search`

**Flow**:
1. Validates request body (hotels array, dates, rooms, nationality)
2. Converts hotel IDs to numbers:
   ```typescript
   const hotelIds = hotels.map((id) => {
     const num = typeof id === 'string' ? parseInt(id, 10) : id;
     if (isNaN(num)) throw new Error(`Invalid hotel ID: ${id}`);
     return num;
   });
   ```
3. **First attempt**: Tries search with numeric hotel IDs
   ```typescript
   let result = await searchHotels({
     hotels: hotelIds,  // [2657]
     checkin,
     checkout,
     rooms,
     nationality,
     timout: timout || '20',
   }, { timeoutMs: 30000 });
   ```
4. **Fallback**: If no results, tries string hotel IDs (for compatibility)
   ```typescript
   if ((result?.error?.code === 100 || result?.count === 0) && hotelIds.length === 1) {
     const stringResult = await searchHotels({
       hotels: [String(hotelIds[0])] as any,  // ["2657"]
       // ... same other params
     });
     // Use stringResult if it worked
   }
   ```
5. Handles "No results" (error code 100) as success with empty array:
   ```typescript
   if (result?.error?.code === 100 || (result?.count === 0 && !result?.hotels?.length)) {
     return res.json({
       ok: true,
       data: { hotels: [], count: 0, ...result },
       error: null,
     });
   }
   ```
6. Returns successful response with hotels array

**Logging**:
- Logs exact request body (JSON stringified)
- Logs search results (count, hotels length, error codes)
- Logs fallback attempts (numeric vs string IDs)

---

### 4. Wanderbeds API Client

**File**: `src/functions/src/vendors/wanderbeds/wanderbedsApi.ts`

**Function**: `searchHotels(payload: any, opts: StaticFetchOptions)`

**Implementation**:
```typescript
export async function searchHotels(payload: any, opts: StaticFetchOptions = {}) {
  const body = normalizeTimeout({ ...payload });  // Ensures "timout" not "timeout"
  const resp = await wanderbedsRequest('POST', '/hotel/search', {
    body,
    safe: true,
    retry: 1,
    timeoutMs: opts.timeoutMs || 30000,
  });
  const hotels = mapHotelsResponse(resp);  // Maps vendor format to internal format
  return { ...resp, hotels };
}
```

**Response Mapping**:
```typescript
function mapHotelsResponse(resp: any) {
  // Tries multiple response structures:
  // 1. Direct hotels array: resp.hotels
  // 2. Nested in data: resp.data.hotels
  // 3. Schema parsed: hotelSearchResponseSchema.safeParse(resp)
  
  let hotels: any[] = [];
  if (Array.isArray(resp?.hotels)) {
    hotels = resp.hotels;
  } else if (Array.isArray(resp?.data?.hotels)) {
    hotels = resp.data.hotels;
  } else {
    const parsed = hotelSearchResponseSchema.safeParse(resp);
    hotels = parsed.success ? parsed.data.hotels || [] : [];
  }
  
  // Maps vendor format to internal format:
  return hotels.map((h) => ({
    hotelId: h.hotelid,        // vendor: "hotelid" -> internal: "hotelId"
    name: h.hotelname,         // vendor: "hotelname" -> internal: "name"
    starRating: h.starrating,  // vendor: "starrating" -> internal: "starRating"
    rooms: (h.rooms || []).map(mapRoom),  // Maps room objects
    // ... other fields
  }));
}
```

**Room Mapping**:
```typescript
function mapRoom(r: any) {
  return {
    offerId: r.offerid,
    name: r.name,
    price: {
      base: r.price?.baseprice,      // vendor: "baseprice" -> internal: "base"
      tax: r.price?.tax,
      margin: r.price?.margin,
      total: r.price?.total,
      currency: r.price?.currency,
    },
    meal: r.meal,        // { code: "2", name: "Bed & Breakfast" }
    roomtype: r.roomtype,  // { code: "590", name: "Deluxe Room" }
    view: r.view,        // { code: "28", name: "Land View" }
    refundable: r.refundable,
    package: r.package,
    // ... other fields
  };
}
```

---

### 5. HTTP Client Layer

**File**: `src/functions/src/vendors/wanderbeds/wanderbedsHttp.ts`

**Function**: `wanderbedsRequest(method: 'GET' | 'POST', path: string, opts: HttpOptions)`

**Implementation**:
```typescript
export async function wanderbedsRequest(method: 'GET' | 'POST', path: string, opts: HttpOptions = {}) {
  const cfg = loadWanderbedsConfig();  // Loads credentials from Firebase Functions config
  const url = `${cfg.baseUrl}${path}`;  // https://api.wanderbeds.com/hotel/search
  
  const baseHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip,deflate',
    Authorization: buildBasicAuth(cfg.username, cfg.password),  // Basic auth
  };
  
  const requestConfig: AxiosRequestConfig = {
    method,
    url,
    headers: baseHeaders,
    timeout: opts.timeoutMs || cfg.timeoutMs || 15000,
    maxBodyLength: Infinity,      // Allow large payloads
    maxContentLength: Infinity,    // Allow large responses
    validateStatus: () => true,    // Don't throw on 404/500 - we handle it
  };
  
  if (method === 'POST') {
    requestConfig.data = opts.body || {};
  }
  
  const resp = await axios.request(requestConfig);
  const payload = resp.data ?? {};
  
  // Special handling for "/hotel/search" endpoint:
  if (method === 'POST' && path === '/hotel/search') {
    // Logs full response structure for debugging
    console.log('wanderbeds_search_response', {
      status: resp.status,
      dataPreview: JSON.stringify(payload).substring(0, 1000),
      hasError: !!payload?.error,
      errorCode: payload?.error?.code,
      count: payload?.count,
      hotelsLength: Array.isArray(payload?.hotels) ? payload.hotels.length : 0,
    });
  }
  
  // Check for error field in response (even if status is 200)
  if (payload?.error) {
    const errorCode = payload.error.code;
    const errorMsg = payload.error.message || 'No results available';
    
    // For "No results" (code 100), return empty result instead of throwing
    if (errorCode === 100) {
      return { ...payload, count: 0, hotels: [] };
    }
    
    throw new WanderbedsError(errorMsg, resp.status || 404, correlationId);
  }
  
  // Handle HTTP errors (404, 500, etc.)
  if (resp.status < 200 || resp.status >= 300) {
    // Extract error message from various response formats
    const msg = payload?.message || payload?.error?.message || resp.statusText;
    throw new WanderbedsError(msg, resp.status, correlationId);
  }
  
  return payload;
}
```

**Configuration**:
- Base URL: `https://api.wanderbeds.com`
- Credentials: Loaded from Firebase Functions config (`wanderbeds.username`, `wanderbeds.password`)
- Timeout: 30 seconds for search requests
- Authentication: Basic Auth header

---

## Request Flow Diagram

```
Frontend (WanderbedsHotelDetail.tsx)
  │
  ├─> User selects dates (e.g., Feb 2-7, 2026)
  │
  ├─> Calls: searchWanderbedsHotels({
  │       hotels: [2657],
  │       checkin: "2026-02-02",
  │       checkout: "2026-02-07",
  │       rooms: [{ adt: 1 }],
  │       nationality: "FR",
  │       timout: "20"
  │     })
  │
  └─> HTTP POST to: /wanderbeds/search
        │
        ▼
Backend API Gateway (apiGateway.ts)
  │
  ├─> Validates request
  ├─> Converts hotel IDs to numbers: [2657]
  ├─> Logs exact request body (JSON)
  │
  └─> Calls: searchHotels({ hotels: [2657], ... })
        │
        ▼
Wanderbeds API Client (wanderbedsApi.ts)
  │
  ├─> Normalizes timeout field (ensures "timout" not "timeout")
  │
  └─> Calls: wanderbedsRequest('POST', '/hotel/search', { body, ... })
        │
        ▼
HTTP Client (wanderbedsHttp.ts)
  │
  ├─> Loads credentials from Firebase Functions config
  ├─> Builds Basic Auth header
  ├─> Creates Axios request with:
  │     - URL: https://api.wanderbeds.com/hotel/search
  │     - Method: POST
  │     - Headers: Accept, Content-Type, Authorization
  │     - Body: { hotels: [2657], checkin: "...", ... }
  │     - Timeout: 30000ms
  │
  └─> Sends request to Wanderbeds API
        │
        ▼
Wanderbeds API (External)
  │
  ├─> Authenticates (Basic Auth)
  ├─> Validates request format
  ├─> Searches availability for hotel 2657
  │
  ├─> [SUCCESS CASE - Hotel 1646]:
  │     Returns: {
  │       token: "...",
  │       count: 1,
  │       hotels: [{ hotelid: "1646", rooms: [...], ... }]
  │     }
  │
  └─> [FAILURE CASE - Hotel 2657]:
        Returns: {
          token: "...",
          error: { code: 100, message: "No results" }
        }
        │
        ▼
HTTP Client receives response
  │
  ├─> Logs full response (first 1000 chars)
  ├─> Detects error field in response
  ├─> For error code 100: Returns empty result { count: 0, hotels: [] }
  └─> Returns response payload
        │
        ▼
API Client maps response
  │
  ├─> mapHotelsResponse() extracts hotels array
  │     - Tries resp.hotels (direct)
  │     - Tries resp.data.hotels (nested)
  │     - Tries schema parsing (fallback)
  ├─> Maps vendor format to internal format:
  │     - hotelid -> hotelId
  │     - hotelname -> name
  │     - starrating -> starRating
  │     - price.baseprice -> price.base
  ├─> Maps rooms array
  └─> Returns: { ...resp, hotels: mappedHotels }
        │
        ▼
API Gateway receives result
  │
  ├─> If no results, tries string hotel IDs (fallback)
  ├─> Logs search result (count, hotels length, error)
  ├─> Handles "No results" as success with empty array
  └─> Returns to frontend:
        {
          ok: true,
          data: { hotels: [], count: 0, ... },
          error: null
        }
        │
        ▼
Frontend receives response
  │
  ├─> Checks for error or empty hotels array
  ├─> Shows error message: "No rooms available for the selected dates..."
  └─> Does NOT display pricing (empty rooms array)
```

---

## Test Results

### ✅ WORKING: Hotel 1646 (Tryp Lisboa Caparica Mar Hotel)

**Request**:
```json
{
  "hotels": [1646],
  "checkin": "2026-05-10",
  "checkout": "2026-05-12",
  "rooms": [{"adt": 2, "chd": 1, "age": [6]}],
  "nationality": "AE",
  "timout": "20"
}
```

**Response**:
```json
{
  "ok": true,
  "data": {
    "count": 1,
    "hotels": [{
      "hotelId": "1646",
      "name": "Tryp Lisboa Caparica Mar Hotel",
      "starRating": 4,
      "rooms": [
        {
          "offerId": "21dox8yrj",
          "name": "TWIN DELUXE LAND VIEW ROOM",
          "price": {"total": 255.36, "currency": "USD"},
          "meal": {"code": "2", "name": "Bed & Breakfast"},
          "roomtype": {"code": "590", "name": "Deluxe Room"},
          "view": {"code": "28", "name": "Land View"}
        }
        // ... 11 more rooms
      ]
    }]
  }
}
```

**Result**: ✅ **SUCCESS** - 12 room options with pricing displayed

---

### ❌ NOT WORKING: Hotel 2657 (Zenitude Hôtel - Résidences Bassin D'Arcachon)

**Requests Tested**:

1. **Competitor's exact parameters**:
   ```json
   {
     "hotels": [2657],
     "checkin": "2026-02-02",
     "checkout": "2026-02-07",
     "rooms": [{"adt": 1}],
     "nationality": "FR",
     "timout": "20"
   }
   ```

2. **With numeric hotel ID**: `[2657]` → ❌ "No results"
3. **With string hotel ID**: `["2657"]` → ❌ "No results"
4. **Different dates**: Multiple combinations → ❌ All fail
5. **Different room configs**: 1 adult, 2 adults → ❌ All fail

**Wanderbeds API Response**:
```json
{
  "token": "BcFBDoAgDATAL9Ug2_qcraBJY4TIQQ4-3pl2WmNEnz0GJ2S4XfV9bvBbFJb3JDhIWR1bUSnQpOLIrPgB",
  "time": "2026-01-19T17:39:35+00:00",
  "server": "api",
  "error": {
    "code": 100,
    "message": "No results"
  },
  "count": 0,
  "hotels": []
}
```

**HTTP Status**: 404 (Not Found)

**Result**: ❌ **FAILURE** - Consistent "No results" for all date/parameter combinations

---

### ❌ NOT WORKING: Hotel 1479

**Request**: Same format as hotel 1646 (which works)

**Response**: Same "No results" error (code 100)

**Result**: ❌ **FAILURE**

---

## Key Observations

### 1. Authentication Works ✅
- All requests return valid tokens from Wanderbeds
- Credentials are correctly configured
- API connection is established

### 2. Request Format is Correct ✅
- Matches Wanderbeds API documentation exactly
- Hotel IDs are numeric (as per docs example: `[1479, 1642, 1646, 1650]`)
- Date format is correct (YYYY-MM-DD)
- Room structure matches docs
- All required fields present

### 3. Response Mapping Works ✅
- Hotel 1646 successfully maps from vendor format to internal format
- Rooms are correctly extracted and displayed
- Pricing information is preserved

### 4. Hotel-Specific Issue ❌
- **Hotel 1646**: Works perfectly
- **Hotel 2657**: Fails consistently
- **Hotel 1479**: Also fails
- This indicates the issue is **NOT** with the code, but with **API access/availability**

---

## Debugging Features Implemented

### 1. Enhanced Logging

**Backend** (`apiGateway.ts`):
- Logs exact request body (JSON stringified)
- Logs search results (count, hotels length, error codes)
- Logs fallback attempts (numeric vs string IDs)

**HTTP Client** (`wanderbedsHttp.ts`):
- Logs full response (first 1000 chars) for `/hotel/search` endpoint
- Logs response structure (hasHotels, hotelsType, count, error codes)
- Logs authentication status

**Response Mapping** (`wanderbedsApi.ts`):
- Logs raw response structure
- Logs which mapping path succeeded (direct, nested, or schema parsed)
- Logs hotel count found

### 2. Fallback Mechanisms

**Hotel ID Format**:
- Tries numeric IDs first: `[2657]`
- Falls back to string IDs: `["2657"]` if numeric fails

**Response Structure**:
- Tries `resp.hotels` (direct array)
- Tries `resp.data.hotels` (nested)
- Falls back to schema parsing

### 3. Test Endpoint

**Endpoint**: `POST /wanderbeds/test-search`

**Purpose**: Test different hotel IDs and parameters without going through the UI

**Usage**:
```bash
curl -X POST https://us-central1-vaultfy-377ee.cloudfunctions.net/api/wanderbeds/test-search \
  -H "Content-Type: application/json" \
  -d '{
    "hotels": [2657],
    "checkin": "2026-02-02",
    "checkout": "2026-02-07",
    "rooms": [{"adt": 1}],
    "nationality": "FR"
  }'
```

**Returns**:
- Test results for both numeric and string hotel ID formats
- Error codes and messages
- Response structure details

---

## Configuration

### Firebase Functions Config

**Credentials Location**: Firebase Functions configuration

**Required Environment Variables**:
```
wanderbeds.username = <Wanderbeds API username>
wanderbeds.password = <Wanderbeds API password>
wanderbeds.base_url = https://api.wanderbeds.com (default)
wanderbeds.timeout_ms = 15000 (default, overridden to 30000 for search)
```

**Loading** (`wanderbedsConfig.ts`):
```typescript
export function loadWanderbedsConfig(): WanderbedsConfig {
  const fnCfg = readFunctionsConfig();
  const username = fnCfg?.username || process.env.WANDERBEDS_USERNAME || '';
  const password = fnCfg?.password || process.env.WANDERBEDS_PASSWORD || '';
  
  if (!username || !password) {
    throw new Error('Wanderbeds credentials are missing.');
  }
  
  return { username, password, baseUrl: '...', timeoutMs: 15000 };
}
```

---

## Error Handling

### Frontend Error Handling

**File**: `WanderbedsHotelDetail.tsx`

**Error States**:
1. **No results from API**:
   ```typescript
   if (hasError || hasNoHotels) {
     setError(`No rooms available for the selected dates. Try dates at least 30 days in advance.`);
     setRooms([]);
   }
   ```
2. **Invalid dates** (less than 5 days away):
   ```typescript
   if (checkinDate < minCheckinDate) {
     setError('Check-in date must be at least 5 days from today.');
     return;
   }
   ```
3. **Network/fetch errors**: Displayed in error state

### Backend Error Handling

**File**: `apiGateway.ts`

**Error Response Format**:
```typescript
{
  ok: false,
  data: null,
  meta: { source: 'wanderbeds', ms: Date.now() },
  error: {
    code: 'server_error' | 'invalid_request' | 'wanderbeds_error',
    message: string,
    upstreamStatus?: number,
    upstreamMs?: number
  }
}
```

**Special Handling**:
- Error code 100 ("No results") → Returns `ok: true` with empty hotels array (not an error)
- 404 from Wanderbeds → Treated as "No results" (not a routing error)
- Timeout errors → Returns 408 with clear message

---

## Data Flow: Hotel Detail Page

```
1. User visits /wanderbeds/hotel/2657
   │
   ├─> Component loads
   ├─> Fetches hotel details from Firestore or API
   └─> Sets default dates: Feb 2-7, 2026 (5 nights)
   
2. User selects dates (or uses defaults)
   │
   ├─> useEffect triggers on date change
   ├─> Validates dates (>= 5 days away, checkout > checkin)
   └─> Calls searchWanderbedsHotels()
   
3. API Request Flow
   │
   ├─> Frontend → Backend: POST /wanderbeds/search
   ├─> Backend → Wanderbeds: POST /hotel/search
   └─> Wanderbeds → Backend: Response (with/without hotels)
   
4. Response Processing
   │
   ├─> Backend maps vendor format → internal format
   ├─> Backend → Frontend: Returns standardized response
   └─> Frontend maps to UI components
   
5. UI Update
   │
   ├─> If rooms found: Display room cards with pricing
   ├─> If no rooms: Show error message
   └─> If loading: Show loading skeleton
```

---

## Comparison with Competitor

### Competitor (destinowonders.com) - WORKING

**Hotel**: 2657 (Zenitude Hôtel - Résidences Bassin D'Arcachon)
**Dates**: Feb 2-7, 2026 (5 nights)
**Parameters**: 1 room, 1 adult
**Result**: ✅ Shows multiple room options with pricing (3,920 PHP to 30,437 PHP)

### Our Implementation - NOT WORKING

**Hotel**: 2657 (same hotel)
**Dates**: Feb 2-7, 2026 (same dates)
**Parameters**: 1 room, 1 adult (same parameters)
**Request Format**: Matches Wanderbeds docs exactly
**Result**: ❌ "No results" (error code 100)

**Difference**: Not in code, but likely in **API access level/account tier**

---

## Root Cause Analysis

### What We Know ✅

1. **Code is correct**: Hotel 1646 works with identical code
2. **Request format is correct**: Matches Wanderbeds documentation
3. **Authentication works**: All requests return valid tokens
4. **Response mapping works**: Successfully maps hotel 1646 response
5. **Hotel-specific**: Only certain hotels (2657, 1479) fail, others work

### What We Don't Know ❌

1. **Why hotel 2657 fails**: No errors in our code, but Wanderbeds returns "No results"
2. **Account differences**: What makes the competitor's account different?
3. **Hotel availability**: Is hotel 2657 restricted in our account?

### Most Likely Causes

1. **API Access Level**: Your Wanderbeds credentials may have a lower access tier
2. **Hotel Restrictions**: Hotel 2657 may not be available for search in your account
3. **Contract Differences**: Competitor may have a different contract/tier with more hotels
4. **Account Configuration**: Hotel 2657 may be whitelisted/blacklisted differently

---

## Recommendations

### Immediate Actions

1. **Contact Wanderbeds Support**:
   - Verify account access to hotel 2657
   - Confirm which hotels are available for search
   - Check if your account tier supports all hotels
   - Ask if hotel 2657 requires special access

2. **Test Other Hotels**:
   - Test all hotels in your curated list
   - Identify which hotels work vs. don't work
   - Create a whitelist of available hotels

3. **Verify Hotel IDs**:
   - Confirm hotel 2657 is the correct ID for your account
   - Check if different regions/accounts use different IDs

### Code Improvements (Already Implemented)

✅ Fallback to string hotel IDs
✅ Enhanced logging for debugging
✅ Test endpoint for direct API testing
✅ Multiple response structure handling
✅ Detailed error messages

### Future Enhancements

1. **Hotel Availability Cache**: Cache which hotels are available for search
2. **Graceful Degradation**: Show message if hotel not available for search
3. **Alternative Search**: Try different date ranges if initial search fails
4. **User Feedback**: Clear messaging when hotel not available through API

---

## Testing Summary

### Test 1: Hotel 1646 (Working Reference)
- ✅ Request: `[1646]`, dates `2026-05-10` to `2026-05-12`
- ✅ Response: 12 rooms with pricing ($255-$662 USD)
- ✅ Status: **SUCCESS**

### Test 2: Hotel 2657 (Problem Hotel)
- ❌ Request: `[2657]`, dates `2026-02-02` to `2026-02-07`
- ❌ Response: Error code 100 "No results"
- ❌ Status: **FAILURE**

### Test 3: Hotel 2657 with String ID
- ❌ Request: `["2657"]` (string format)
- ❌ Response: Same error code 100
- ❌ Status: **FAILURE**

### Test 4: Hotel 2657 with Different Dates
- ❌ Multiple date combinations tested
- ❌ All return "No results"
- ❌ Status: **FAILURE**

### Test 5: Hotel 1479
- ❌ Same request format as working hotel 1646
- ❌ Response: Error code 100
- ❌ Status: **FAILURE**

---

## Conclusion

The implementation is **architecturally sound** and **correctly follows Wanderbeds API documentation**. The issue is **account-level access/availability**, not code.

**Evidence**:
- Hotel 1646 works perfectly with the same code
- Request format matches documentation exactly
- Response mapping successfully handles working responses
- All hotels failing are hotel-specific (not date/parameter-specific)

**Next Step**: Contact Wanderbeds to verify account access to hotel 2657 and other hotels in your curated list.
