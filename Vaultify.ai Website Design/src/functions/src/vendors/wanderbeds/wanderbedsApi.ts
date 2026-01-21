import * as admin from 'firebase-admin';
import { wanderbedsRequest, wanderbedsRequestWithMeta, type WanderbedsUpstreamMeta, WanderbedsError } from './wanderbedsHttp';
import { availResponseSchema, bookInfoResponseSchema, bookResponseSchema, hotelSearchResponseSchema } from './wanderbedsSchemas';

const getDb = () => admin.firestore();

type CacheRead = {
  data: any | null;
  cachedAt?: Date;
  ttlHours?: number;
  expired: boolean;
};

type CacheReadOptions = {
  allowExpired?: boolean;
};

const resolveCachePath = (pathOrCollection: string, docId?: string) =>
  docId ? `${pathOrCollection}/${docId}` : pathOrCollection;

async function cacheRead(pathOrCollection: string, docId?: string, opts: CacheReadOptions = {}): Promise<CacheRead | null> {
  const path = resolveCachePath(pathOrCollection, docId);
  const snap = await getDb().doc(path).get();
  if (!snap.exists) return null;
  const val = snap.data();
  const cachedAt = val?.cachedAt?.toDate?.() as Date | undefined;
  const ttlHours = val?.ttlHours || 24;
  const expired = cachedAt ? cachedAt.getTime() + ttlHours * 3600_000 < Date.now() : false;
  if (expired && !opts.allowExpired) return null;
  return { data: val?.data ?? null, cachedAt, ttlHours, expired };
}

async function cacheGet(pathOrCollection: string, docId?: string) {
  const read = await cacheRead(pathOrCollection, docId);
  return read?.data ?? null;
}

async function cacheSet(pathOrCollection: string, data: any, ttlHours = 24, docId?: string) {
  const path = resolveCachePath(pathOrCollection, docId);
  await getDb().doc(path).set({ data, cachedAt: admin.firestore.FieldValue.serverTimestamp(), ttlHours });
}

export class WanderbedsGatewayError extends Error {
  code: string;

  statusCode: number;

  constructor(message: string, code: string, statusCode = 502) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

type StaticFetchOptions = {
  timeoutMs?: number;
  bypassCache?: boolean;
  allowStale?: boolean;
};

const toStalePayload = (data: any, cachedAt?: Date) => ({
  ...data,
  stale: true,
  cachedAt: cachedAt ? cachedAt.toISOString() : null,
  source: 'cache',
});

const isTimeoutError = (err: any) => err instanceof WanderbedsError && err.status === 408;

export async function getStarRatings() {
  const cachePath = 'vendors/wanderbeds/cache/starratings';
  const cached = await cacheGet(cachePath);
  if (cached) return cached;
  const resp = await wanderbedsRequest('GET', '/staticdata/starratings', { safe: true, retry: 2 });
  await cacheSet(cachePath, resp, 24);
  return resp;
}

export async function getRoomTypes() {
  const cachePath = 'vendors/wanderbeds/cache/roomtypes';
  const cached = await cacheGet(cachePath);
  if (cached) return cached;
  const resp = await wanderbedsRequest('GET', '/staticdata/roomtypes', { safe: true, retry: 2 });
  await cacheSet(cachePath, resp, 24);
  return resp;
}

export async function getMealTypes() {
  const cachePath = 'vendors/wanderbeds/cache/mealtypes';
  const cached = await cacheGet(cachePath);
  if (cached) return cached;
  const resp = await wanderbedsRequest('GET', '/staticdata/mealtypes', { safe: true, retry: 2 });
  await cacheSet(cachePath, resp, 24);
  return resp;
}

export async function getCountries() {
  const cachePath = 'vendors/wanderbeds/cache/countries';
  const cached = await cacheGet(cachePath);
  if (cached) return cached;
  const resp = await wanderbedsRequest('GET', '/staticdata/countries', { safe: true, retry: 2 });
  await cacheSet(cachePath, resp, 24);
  return resp;
}

export async function getCities(countryCode: string, items = 100, opts: StaticFetchOptions = {}) {
  const cachePath = `vendors/wanderbeds/cache/cities/${countryCode}/data`;
  if (!opts.bypassCache) {
    const cached = await cacheGet(cachePath);
    if (cached) return cached;
  }
  try {
    const resp = await wanderbedsRequest('GET', `/staticdata/cities/${countryCode}/`, {
      safe: true,
      retry: 2,
      query: { items },
      timeoutMs: opts.timeoutMs,
    });
    await cacheSet(cachePath, resp, 24);
    return resp;
  } catch (err: any) {
    if (opts.allowStale !== false) {
      const stale = await cacheRead(cachePath, undefined, { allowExpired: true });
      if (stale?.data) return toStalePayload(stale.data, stale.cachedAt);
    }
    if (isTimeoutError(err)) {
      throw new WanderbedsGatewayError('Wanderbeds timed out', 'wanderbeds_timeout', 502);
    }
    throw new WanderbedsGatewayError('Wanderbeds unavailable', 'wanderbeds_upstream_error', 502);
  }
}

export async function getHotelList(opts: StaticFetchOptions = {}) {
  const cachePath = 'vendors/wanderbeds/cache/hotellist';
  if (!opts.bypassCache) {
    const cached = await cacheGet(cachePath);
    if (cached) return cached;
  }
  try {
    // Use 60s timeout for hotellist (huge payload) if not specified
    const timeoutMs = opts.timeoutMs ?? 60000;
    const resp = await wanderbedsRequest('GET', '/staticdata/hotellist', {
      safe: true,
      retry: 2,
      timeoutMs,
    });
    await cacheSet(cachePath, resp, 24);
    return resp;
  } catch (err: any) {
    if (opts.allowStale !== false) {
      const stale = await cacheRead(cachePath, undefined, { allowExpired: true });
      if (stale?.data) return toStalePayload(stale.data, stale.cachedAt);
    }
    if (isTimeoutError(err)) {
      throw new WanderbedsGatewayError('Wanderbeds timed out', 'wanderbeds_timeout', 502);
    }
    throw new WanderbedsGatewayError('Wanderbeds unavailable', 'wanderbeds_upstream_error', 502);
  }
}

export async function postHotelDetails(hotels: Array<string | number>, opts: StaticFetchOptions = {}) {
  const cachePath = hotels.length === 1 ? `vendors/wanderbeds/hoteldetails/${hotels[0]}` : null;
  if (cachePath) {
    if (!opts.bypassCache) {
      const cached = await cacheGet(cachePath);
      if (cached) return cached;
    }
  }
  try {
    const resp = await wanderbedsRequest('POST', '/staticdata/hoteldetails', {
      body: { hotels },
      safe: true,
      retry: 1,
      timeoutMs: opts.timeoutMs,
    });
    if (cachePath) {
      await cacheSet(cachePath, resp, 24);
    }
    return resp;
  } catch (err: any) {
    if (cachePath && opts.allowStale !== false) {
      const stale = await cacheRead(cachePath, undefined, { allowExpired: true });
      if (stale?.data) return toStalePayload(stale.data, stale.cachedAt);
    }
    if (isTimeoutError(err)) {
      throw new WanderbedsGatewayError('Wanderbeds timed out', 'wanderbeds_timeout', 502);
    }
    throw new WanderbedsGatewayError('Wanderbeds unavailable', 'wanderbeds_upstream_error', 502);
  }
}

function normalizeTimeout(payload: any) {
  if (payload && payload.timeout && !payload.timout) {
    payload.timout = payload.timeout;
    delete payload.timeout;
  }
  return payload;
}

/**
 * Normalize rooms payload per Wanderbeds API docs (Search.txt):
 * - Always include adt (int)
 * - Always include chd (int) - even if 0
 * - Always include age (array of ints) - even if chd=0, send age:[]
 * - age length must match chd when chd > 0
 */
function normalizeRooms(rooms: any[]): Array<{ adt: number; chd: number; age: number[] }> {
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return [{ adt: 1, chd: 0, age: [] }];
  }
  
  return rooms.map((room) => {
    const adt = typeof room.adt === 'number' ? room.adt : (typeof room.adt === 'string' ? parseInt(room.adt, 10) : 1);
    const chd = typeof room.chd === 'number' ? room.chd : (typeof room.chd === 'string' ? parseInt(room.chd, 10) : 0);
    
    // Normalize age array
    let age: number[] = [];
    if (Array.isArray(room.age)) {
      age = room.age.map((a: any) => typeof a === 'number' ? a : parseInt(String(a), 10)).filter((a: number) => !isNaN(a));
    } else if (typeof room.childAges === 'string' && room.childAges.trim()) {
      // Support comma-separated string format
      age = room.childAges.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((a: number) => !isNaN(a));
    }
    
    // Ensure age length matches chd (pad with 0s if needed, or truncate)
    if (chd > 0 && age.length !== chd) {
      if (age.length < chd) {
        // Pad with 0s (default age)
        age = [...age, ...Array(chd - age.length).fill(0)];
      } else {
        // Truncate to match chd
        age = age.slice(0, chd);
      }
    } else if (chd === 0) {
      // Always send empty array when chd=0
      age = [];
    }
    
    return {
      adt: Math.max(1, adt), // Ensure at least 1 adult
      chd: Math.max(0, chd), // Ensure non-negative
      age,
    };
  });
}

export function mapHotelsResponse(resp: any) {
  // Log raw response structure for debugging
  console.log('mapHotelsResponse raw', {
    hasHotels: !!resp?.hotels,
    hotelsType: Array.isArray(resp?.hotels) ? 'array' : typeof resp?.hotels,
    hotelsLength: Array.isArray(resp?.hotels) ? resp.hotels.length : 'not-array',
    count: resp?.count,
    hasData: !!resp?.data,
    dataHotels: Array.isArray(resp?.data?.hotels) ? resp.data.hotels.length : 'not-array',
    fullKeys: Object.keys(resp || {}),
    dataKeys: resp?.data ? Object.keys(resp.data) : [],
  });
  
  // Try multiple response structures
  let hotels: any[] = [];
  
  // Structure 1: Direct hotels array
  if (Array.isArray(resp?.hotels)) {
    hotels = resp.hotels;
  }
  // Structure 2: Nested in data
  else if (Array.isArray(resp?.data?.hotels)) {
    hotels = resp.data.hotels;
  }
  // Structure 3: Schema parsed
  else {
    const parsed = hotelSearchResponseSchema.safeParse(resp);
    if (parsed.success) {
      hotels = parsed.data.hotels || [];
    } else {
      console.warn('mapHotelsResponse schema parse failed', { 
        errors: parsed.error?.errors,
        respKeys: Object.keys(resp || {}),
      });
    }
  }
  
  console.log('mapHotelsResponse found hotels', { count: hotels.length });
  
  return hotels.map((h) => ({
    hotelId: h.hotelid,
    name: h.hotelname || '',
    starRating: h.starrating,
    cityName: h.cityname,
    country: h.country,
    address: h.address,
    location: {
      lat: h.location?.lat ? Number(h.location.lat) : undefined,
      lng: h.location?.lon ? Number(h.location.lon) : undefined,
    },
    rooms: (h.rooms || []).map(mapRoom),
  }));
}

function mapRoom(r: any) {
  return {
    offerId: r.offerid,
    name: r.name,
    refundable: r.refundable,
    meal: r.meal,
    roomtype: r.roomtype,
    view: r.view,
    price: {
      base: r.price?.baseprice,
      tax: r.price?.tax,
      margin: r.price?.margin,
      total: r.price?.total,
      currency: r.price?.currency,
    },
    cancelpolicy: r.cancelpolicy,
    additionalfees: r.additionalfees,
    remarks: r.remarks,
    roomindex: r.roomindex,
    group: r.group,
    package: r.package,
  };
}

function mapAvailResponse(resp: any) {
  const parsed = availResponseSchema.safeParse(resp);
  if (!parsed.success) return { products: [], summary: undefined, required: undefined };
  const data = parsed.data.data || {};
  const products = (data.products || []).map((p) => ({
    hotelId: p.hotelid,
    name: p.hotelname,
    starRating: p.starrating,
    cityName: p.cityname,
    country: p.country,
    address: p.address,
    location: {
      lat: p.location?.lat ? Number(p.location.lat) : undefined,
      lng: p.location?.lon ? Number(p.location.lon) : undefined,
    },
    rooms: (p.rooms || []).map(mapRoom),
    remarks: p.remarks,
  }));
  return {
    token: parsed.data.token,
    products,
    summary: data.summary,
    required: data.required,
  };
}

/**
 * Transform search response to availability structure format
 * This ensures consistent response shape: data.products[], data.required
 */
function transformSearchToAvailabilityFormat(resp: any, hotels: any[]) {
  // Transform hotels to products format (matching availability response structure)
  const products = hotels.map((h) => ({
    hotelid: h.hotelId,
    hotelname: h.name,
    accommodation: undefined, // Not in search response
    starrating: h.starRating,
    country: h.country,
    cityid: undefined, // Not in search response
    cityname: h.cityName,
    address: h.address,
    location: h.location ? {
      lat: h.location.lat ? String(h.location.lat) : undefined,
      lon: h.location.lng ? String(h.location.lng) : undefined,
    } : undefined,
    rooms: h.rooms || [],
    remarks: [],
  }));

  // Calculate summary from rooms (if available)
  const allRooms = hotels.flatMap((h) => h.rooms || []);
  const summary = allRooms.length > 0 ? {
    currency: allRooms[0]?.price?.currency || 'USD',
    nettotal: allRooms.reduce((sum: number, r: any) => sum + (r.price?.base || 0), 0),
    tax: allRooms.reduce((sum: number, r: any) => sum + (r.price?.tax || 0), 0),
    margin: allRooms.reduce((sum: number, r: any) => sum + (r.price?.margin || 0), 0),
    total: allRooms.reduce((sum: number, r: any) => sum + (r.price?.total || 0), 0),
    paymentplan: {},
    taxinfo: [],
  } : undefined;

  // Default required flags (nationality is typically required)
  const required = {
    nationality: 1, // Typically required
    chdbirthdate: 0, // Only if children exist
  };

  return {
    success: !resp?.error && hotels.length > 0,
    products,
    summary,
    required,
  };
}

export async function searchHotels(payload: any, opts: StaticFetchOptions = {}) {
  // Normalize rooms payload per Wanderbeds API docs (Search.txt)
  const normalizedPayload = {
    ...payload,
    rooms: normalizeRooms(payload.rooms || []),
  };
  const body = normalizeTimeout(normalizedPayload);
  // Capture upstream meta for debug surfaces (exact request + upstream status/body)
  const { payload: resp, meta } = await wanderbedsRequestWithMeta('POST', '/hotel/search', {
    body,
    safe: true,
    retry: 1,
    timeoutMs: opts.timeoutMs,
    correlationId: (payload && payload.__correlationId) || undefined,
  });
  const hotels = mapHotelsResponse(resp);
  const searchId = `search-${Date.now()}`;
  await cacheSet(
    `vendors/wanderbeds/searches/${searchId}`,
    {
      request: body,
      respSummary: {
        count: resp?.count ?? null,
        hotels: hotels.length,
        errorCode: resp?.error?.code ?? null,
      },
    },
    24
  );
  
  // Transform to availability structure format for consistent frontend consumption
  const data = transformSearchToAvailabilityFormat(resp, hotels);
  
  return { 
    ...resp, 
    hotels, // Keep for backward compatibility
    data, // New availability structure format
    __upstream: meta as WanderbedsUpstreamMeta 
  };
}

export async function availHotels(payload: any, opts: { token?: string; timeoutMs?: number } = {}) {
  // Per Wanderbeds docs (Availability.txt): body is { rooms: [offerid strings] }
  // Token must be in header, not body
  const body = { rooms: Array.isArray(payload.rooms) ? payload.rooms : [] };
  const resp = await wanderbedsRequest('POST', '/hotel/avail', { 
    body, 
    safe: true, 
    retry: 1,
    token: opts.token || payload.token, // Token header per docs
    timeoutMs: opts.timeoutMs,
  });
  const mapped = mapAvailResponse(resp);
  const availId = `avail-${Date.now()}`;
  await cacheSet(
    `vendors/wanderbeds/avails/${availId}`,
    { request: body, respSummary: { products: mapped.products.length } },
    24
  );
  return { ...resp, mapped };
}

export async function book(payload: any, opts: { token?: string; timeoutMs?: number } = {}) {
  // Per Wanderbeds docs (Book.txt): body is { client_reference, passengers }
  // Token must be in header, not body
  const body = {
    client_reference: payload.client_reference,
    passengers: payload.passengers || [],
  };
  const resp = await wanderbedsRequest('POST', '/hotel/book', { 
    body, 
    safe: false, 
    retry: 0,
    token: opts.token || payload.token, // Token header per docs
    timeoutMs: opts.timeoutMs,
  });
  const parsed = bookResponseSchema.safeParse(resp);
  return parsed.success ? parsed.data : resp;
}

export async function bookInfo(payload: any, opts: { token?: string; timeoutMs?: number } = {}) {
  // Per Wanderbeds docs (Booking Info.txt): body is { client_reference, booking_reference }
  // Token is optional in header
  const body = {
    client_reference: payload.client_reference,
    booking_reference: payload.booking_reference,
  };
  const resp = await wanderbedsRequest('POST', '/hotel/bookinfo', { 
    body, 
    safe: true, 
    retry: 1,
    token: opts.token || payload.token, // Optional token header
    timeoutMs: opts.timeoutMs,
  });
  const parsed = bookInfoResponseSchema.safeParse(resp);
  return parsed.success ? parsed.data : resp;
}

export async function cancel(payload: any) {
  const resp = await wanderbedsRequest('POST', '/hotel/cancel', { body: payload, safe: false, retry: 0 });
  const parsed = bookInfoResponseSchema.safeParse(resp);
  return parsed.success ? parsed.data : resp;
}
