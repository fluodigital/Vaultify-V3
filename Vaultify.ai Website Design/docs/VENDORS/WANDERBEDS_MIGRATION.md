# Wanderbeds Integration Migration Guide

## Overview

A clean, rebuilt Wanderbeds integration is now available. This document outlines the migration from old routes to the new canonical API.

## New Canonical Routes

All new routes are under `/api/wanderbeds/*` and return a consistent contract:

```typescript
{
  ok: boolean;
  data: T | null;
  meta: {
    source: 'wanderbeds';
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

### Route Mapping

| Old Route | New Route | Status |
|-----------|-----------|--------|
| `POST /hotels/search` | `POST /wanderbeds/search` | ✅ Available |
| `POST /hotels/avail` | `POST /wanderbeds/availability` | ✅ Available |
| `POST /hotels/book` | `POST /wanderbeds/book` | ✅ Available |
| `POST /hotels/bookinfo` | `POST /wanderbeds/booking-info` | ✅ Available |
| `POST /hotels/cancel` | `POST /wanderbeds/cancel` | ✅ Available |

**Health Check** (new):
- `GET /wanderbeds/health` - Check vendor connectivity

## Migration Checklist

### Frontend

- [x] New client library: `src/lib/wanderbeds.ts`
- [ ] Update components using old `/hotels/*` routes
- [ ] Replace `searchHotels()` calls with `searchWanderbedsHotels()`
- [ ] Replace `availHotels()` calls with `checkWanderbedsAvailability()`
- [ ] Update booking flows to use new routes

### Backend

- [x] New clean API layer: `src/functions/src/vendors/wanderbeds/{client,types,mappers,errors}.ts`
- [x] New canonical routes: `/api/wanderbeds/*`
- [ ] Migrate `curationSeeder.ts` to use new client (currently uses old `wanderbedsApi.ts`)
- [ ] Migrate Alfred tools if they use Wanderbeds
- [ ] Remove old routes once all clients migrated

## Code Locations

### New Clean Integration

**Backend:**
- `src/functions/src/vendors/wanderbeds/client.ts` - HTTP client
- `src/functions/src/vendors/wanderbeds/types.ts` - Vendor types
- `src/functions/src/vendors/wanderbeds/mappers.ts` - Response mappers
- `src/functions/src/vendors/wanderbeds/errors.ts` - Error handling
- `src/functions/src/vendors/wanderbeds/index.ts` - Exports

**Routes:**
- `src/functions/src/apiGateway.ts` - Routes A-F under `/wanderbeds/*`

**Frontend:**
- `src/lib/wanderbeds.ts` - Frontend client

### Legacy Code (Still in Use)

**Note:** These files are still used by `curationSeeder.ts` and should be migrated later:

- `src/functions/src/vendors/wanderbeds/wanderbedsApi.ts` - Old API wrapper (used by curationSeeder)
- `src/functions/src/vendors/wanderbeds/wanderbedsHttp.ts` - Old HTTP client (used by curationSeeder)
- `src/functions/src/vendors/wanderbeds/wanderbedsConfig.ts` - Config (still used)
- `src/functions/src/vendors/wanderbeds/wanderbedsSchemas.ts` - Zod schemas (still used)

**Old Routes (Deprecated):**
- `POST /hotels/search` - Deprecated, use `/wanderbeds/search`
- `POST /hotels/avail` - Deprecated, use `/wanderbeds/availability`
- `POST /hotels/book` - Deprecated, use `/wanderbeds/book`
- `POST /hotels/bookinfo` - Deprecated, use `/wanderbeds/booking-info`
- `POST /hotels/cancel` - Deprecated, use `/wanderbeds/cancel`

## Benefits of New Integration

1. **Consistent Contract**: All routes return `{ ok, data, meta, error }` shape
2. **Better Error Handling**: Normalized errors with upstream status/timing
3. **Type Safety**: Full TypeScript types for requests/responses
4. **Clean Separation**: Vendor shapes mapped to internal models
5. **No Credentials**: All vendor credentials stay server-side
6. **Logging**: Request duration, status, and endpoint logging
7. **Token Handling**: Explicit token flow (search -> avail/book)

## Example Migration

### Before (Old Route)

```typescript
const response = await fetch('/api/hotels/search', {
  method: 'POST',
  body: JSON.stringify({
    hotels: [1479],
    checkin: '2026-05-10',
    checkout: '2026-05-12',
    rooms: [{ adt: 2 }],
    nationality: 'AE',
  }),
});
const data = await response.json();
// data shape varies, no consistent error handling
```

### After (New Route)

```typescript
import { searchWanderbedsHotels, isWanderbedsSuccess, getWanderbedsError } from '@/lib/wanderbeds';

const response = await searchWanderbedsHotels({
  hotels: [1479],
  checkin: '2026-05-10',
  checkout: '2026-05-12',
  rooms: [{ adt: 2 }],
  nationality: 'AE',
  timout: '20',
});

if (isWanderbedsSuccess(response)) {
  const { token, count, hotels } = response.data;
  // Use data...
} else {
  const error = getWanderbedsError(response);
  // Handle error...
}
```

## Testing

All new routes can be tested with curl:

```bash
# Health check
curl -i https://us-central1-vaultfy-377ee.cloudfunctions.net/api/wanderbeds/health

# Search
curl -X POST https://us-central1-vaultfy-377ee.cloudfunctions.net/api/wanderbeds/search \
  -H "Content-Type: application/json" \
  -d '{
    "hotels": [1479],
    "checkin": "2026-05-10",
    "checkout": "2026-05-12",
    "rooms": [{"adt": 2}],
    "nationality": "AE",
    "timout": "20"
  }'
```

## Future Cleanup

Once all clients are migrated:

1. Remove old `/hotels/*` routes from `apiGateway.ts`
2. Migrate `curationSeeder.ts` to use new client
3. Remove old files: `wanderbedsApi.ts`, `wanderbedsHttp.ts`, `wanderbedsSchemas.ts`
4. Keep `wanderbedsConfig.ts` if still needed, or migrate to new client's config

## Notes

- Old routes include `X-Deprecated: true` headers to warn clients
- The curation seeder still uses old code and should be migrated in a future PR
- All new routes are fully tested and production-ready
