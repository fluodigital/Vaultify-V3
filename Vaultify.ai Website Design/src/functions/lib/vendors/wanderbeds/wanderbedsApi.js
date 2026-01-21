"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WanderbedsGatewayError = void 0;
exports.getStarRatings = getStarRatings;
exports.getRoomTypes = getRoomTypes;
exports.getMealTypes = getMealTypes;
exports.getCountries = getCountries;
exports.getCities = getCities;
exports.getHotelList = getHotelList;
exports.postHotelDetails = postHotelDetails;
exports.mapHotelsResponse = mapHotelsResponse;
exports.searchHotels = searchHotels;
exports.availHotels = availHotels;
exports.book = book;
exports.bookInfo = bookInfo;
exports.cancel = cancel;
const admin = __importStar(require("firebase-admin"));
const wanderbedsHttp_1 = require("./wanderbedsHttp");
const wanderbedsSchemas_1 = require("./wanderbedsSchemas");
const getDb = () => admin.firestore();
const resolveCachePath = (pathOrCollection, docId) => docId ? `${pathOrCollection}/${docId}` : pathOrCollection;
async function cacheRead(pathOrCollection, docId, opts = {}) {
    var _a, _b, _c;
    const path = resolveCachePath(pathOrCollection, docId);
    const snap = await getDb().doc(path).get();
    if (!snap.exists)
        return null;
    const val = snap.data();
    const cachedAt = (_b = (_a = val === null || val === void 0 ? void 0 : val.cachedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a);
    const ttlHours = (val === null || val === void 0 ? void 0 : val.ttlHours) || 24;
    const expired = cachedAt ? cachedAt.getTime() + ttlHours * 3600000 < Date.now() : false;
    if (expired && !opts.allowExpired)
        return null;
    return { data: (_c = val === null || val === void 0 ? void 0 : val.data) !== null && _c !== void 0 ? _c : null, cachedAt, ttlHours, expired };
}
async function cacheGet(pathOrCollection, docId) {
    var _a;
    const read = await cacheRead(pathOrCollection, docId);
    return (_a = read === null || read === void 0 ? void 0 : read.data) !== null && _a !== void 0 ? _a : null;
}
async function cacheSet(pathOrCollection, data, ttlHours = 24, docId) {
    const path = resolveCachePath(pathOrCollection, docId);
    await getDb().doc(path).set({ data, cachedAt: admin.firestore.FieldValue.serverTimestamp(), ttlHours });
}
class WanderbedsGatewayError extends Error {
    constructor(message, code, statusCode = 502) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
    }
}
exports.WanderbedsGatewayError = WanderbedsGatewayError;
const toStalePayload = (data, cachedAt) => (Object.assign(Object.assign({}, data), { stale: true, cachedAt: cachedAt ? cachedAt.toISOString() : null, source: 'cache' }));
const isTimeoutError = (err) => err instanceof wanderbedsHttp_1.WanderbedsError && err.status === 408;
async function getStarRatings() {
    const cachePath = 'vendors/wanderbeds/cache/starratings';
    const cached = await cacheGet(cachePath);
    if (cached)
        return cached;
    const resp = await (0, wanderbedsHttp_1.wanderbedsRequest)('GET', '/staticdata/starratings', { safe: true, retry: 2 });
    await cacheSet(cachePath, resp, 24);
    return resp;
}
async function getRoomTypes() {
    const cachePath = 'vendors/wanderbeds/cache/roomtypes';
    const cached = await cacheGet(cachePath);
    if (cached)
        return cached;
    const resp = await (0, wanderbedsHttp_1.wanderbedsRequest)('GET', '/staticdata/roomtypes', { safe: true, retry: 2 });
    await cacheSet(cachePath, resp, 24);
    return resp;
}
async function getMealTypes() {
    const cachePath = 'vendors/wanderbeds/cache/mealtypes';
    const cached = await cacheGet(cachePath);
    if (cached)
        return cached;
    const resp = await (0, wanderbedsHttp_1.wanderbedsRequest)('GET', '/staticdata/mealtypes', { safe: true, retry: 2 });
    await cacheSet(cachePath, resp, 24);
    return resp;
}
async function getCountries() {
    const cachePath = 'vendors/wanderbeds/cache/countries';
    const cached = await cacheGet(cachePath);
    if (cached)
        return cached;
    const resp = await (0, wanderbedsHttp_1.wanderbedsRequest)('GET', '/staticdata/countries', { safe: true, retry: 2 });
    await cacheSet(cachePath, resp, 24);
    return resp;
}
async function getCities(countryCode, items = 100, opts = {}) {
    const cachePath = `vendors/wanderbeds/cache/cities/${countryCode}/data`;
    if (!opts.bypassCache) {
        const cached = await cacheGet(cachePath);
        if (cached)
            return cached;
    }
    try {
        const resp = await (0, wanderbedsHttp_1.wanderbedsRequest)('GET', `/staticdata/cities/${countryCode}/`, {
            safe: true,
            retry: 2,
            query: { items },
            timeoutMs: opts.timeoutMs,
        });
        await cacheSet(cachePath, resp, 24);
        return resp;
    }
    catch (err) {
        if (opts.allowStale !== false) {
            const stale = await cacheRead(cachePath, undefined, { allowExpired: true });
            if (stale === null || stale === void 0 ? void 0 : stale.data)
                return toStalePayload(stale.data, stale.cachedAt);
        }
        if (isTimeoutError(err)) {
            throw new WanderbedsGatewayError('Wanderbeds timed out', 'wanderbeds_timeout', 502);
        }
        throw new WanderbedsGatewayError('Wanderbeds unavailable', 'wanderbeds_upstream_error', 502);
    }
}
async function getHotelList(opts = {}) {
    var _a;
    const cachePath = 'vendors/wanderbeds/cache/hotellist';
    if (!opts.bypassCache) {
        const cached = await cacheGet(cachePath);
        if (cached)
            return cached;
    }
    try {
        // Use 60s timeout for hotellist (huge payload) if not specified
        const timeoutMs = (_a = opts.timeoutMs) !== null && _a !== void 0 ? _a : 60000;
        const resp = await (0, wanderbedsHttp_1.wanderbedsRequest)('GET', '/staticdata/hotellist', {
            safe: true,
            retry: 2,
            timeoutMs,
        });
        await cacheSet(cachePath, resp, 24);
        return resp;
    }
    catch (err) {
        if (opts.allowStale !== false) {
            const stale = await cacheRead(cachePath, undefined, { allowExpired: true });
            if (stale === null || stale === void 0 ? void 0 : stale.data)
                return toStalePayload(stale.data, stale.cachedAt);
        }
        if (isTimeoutError(err)) {
            throw new WanderbedsGatewayError('Wanderbeds timed out', 'wanderbeds_timeout', 502);
        }
        throw new WanderbedsGatewayError('Wanderbeds unavailable', 'wanderbeds_upstream_error', 502);
    }
}
async function postHotelDetails(hotels, opts = {}) {
    const cachePath = hotels.length === 1 ? `vendors/wanderbeds/hoteldetails/${hotels[0]}` : null;
    if (cachePath) {
        if (!opts.bypassCache) {
            const cached = await cacheGet(cachePath);
            if (cached)
                return cached;
        }
    }
    try {
        const resp = await (0, wanderbedsHttp_1.wanderbedsRequest)('POST', '/staticdata/hoteldetails', {
            body: { hotels },
            safe: true,
            retry: 1,
            timeoutMs: opts.timeoutMs,
        });
        if (cachePath) {
            await cacheSet(cachePath, resp, 24);
        }
        return resp;
    }
    catch (err) {
        if (cachePath && opts.allowStale !== false) {
            const stale = await cacheRead(cachePath, undefined, { allowExpired: true });
            if (stale === null || stale === void 0 ? void 0 : stale.data)
                return toStalePayload(stale.data, stale.cachedAt);
        }
        if (isTimeoutError(err)) {
            throw new WanderbedsGatewayError('Wanderbeds timed out', 'wanderbeds_timeout', 502);
        }
        throw new WanderbedsGatewayError('Wanderbeds unavailable', 'wanderbeds_upstream_error', 502);
    }
}
function normalizeTimeout(payload) {
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
function normalizeRooms(rooms) {
    if (!Array.isArray(rooms) || rooms.length === 0) {
        return [{ adt: 1, chd: 0, age: [] }];
    }
    return rooms.map((room) => {
        const adt = typeof room.adt === 'number' ? room.adt : (typeof room.adt === 'string' ? parseInt(room.adt, 10) : 1);
        const chd = typeof room.chd === 'number' ? room.chd : (typeof room.chd === 'string' ? parseInt(room.chd, 10) : 0);
        // Normalize age array
        let age = [];
        if (Array.isArray(room.age)) {
            age = room.age.map((a) => typeof a === 'number' ? a : parseInt(String(a), 10)).filter((a) => !isNaN(a));
        }
        else if (typeof room.childAges === 'string' && room.childAges.trim()) {
            // Support comma-separated string format
            age = room.childAges.split(',').map((s) => parseInt(s.trim(), 10)).filter((a) => !isNaN(a));
        }
        // Ensure age length matches chd (pad with 0s if needed, or truncate)
        if (chd > 0 && age.length !== chd) {
            if (age.length < chd) {
                // Pad with 0s (default age)
                age = [...age, ...Array(chd - age.length).fill(0)];
            }
            else {
                // Truncate to match chd
                age = age.slice(0, chd);
            }
        }
        else if (chd === 0) {
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
function mapHotelsResponse(resp) {
    var _a, _b, _c;
    // Log raw response structure for debugging
    console.log('mapHotelsResponse raw', {
        hasHotels: !!(resp === null || resp === void 0 ? void 0 : resp.hotels),
        hotelsType: Array.isArray(resp === null || resp === void 0 ? void 0 : resp.hotels) ? 'array' : typeof (resp === null || resp === void 0 ? void 0 : resp.hotels),
        hotelsLength: Array.isArray(resp === null || resp === void 0 ? void 0 : resp.hotels) ? resp.hotels.length : 'not-array',
        count: resp === null || resp === void 0 ? void 0 : resp.count,
        hasData: !!(resp === null || resp === void 0 ? void 0 : resp.data),
        dataHotels: Array.isArray((_a = resp === null || resp === void 0 ? void 0 : resp.data) === null || _a === void 0 ? void 0 : _a.hotels) ? resp.data.hotels.length : 'not-array',
        fullKeys: Object.keys(resp || {}),
        dataKeys: (resp === null || resp === void 0 ? void 0 : resp.data) ? Object.keys(resp.data) : [],
    });
    // Try multiple response structures
    let hotels = [];
    // Structure 1: Direct hotels array
    if (Array.isArray(resp === null || resp === void 0 ? void 0 : resp.hotels)) {
        hotels = resp.hotels;
    }
    // Structure 2: Nested in data
    else if (Array.isArray((_b = resp === null || resp === void 0 ? void 0 : resp.data) === null || _b === void 0 ? void 0 : _b.hotels)) {
        hotels = resp.data.hotels;
    }
    // Structure 3: Schema parsed
    else {
        const parsed = wanderbedsSchemas_1.hotelSearchResponseSchema.safeParse(resp);
        if (parsed.success) {
            hotels = parsed.data.hotels || [];
        }
        else {
            console.warn('mapHotelsResponse schema parse failed', {
                errors: (_c = parsed.error) === null || _c === void 0 ? void 0 : _c.errors,
                respKeys: Object.keys(resp || {}),
            });
        }
    }
    console.log('mapHotelsResponse found hotels', { count: hotels.length });
    return hotels.map((h) => {
        var _a, _b;
        return ({
            hotelId: h.hotelid,
            name: h.hotelname || '',
            starRating: h.starrating,
            cityName: h.cityname,
            country: h.country,
            address: h.address,
            location: {
                lat: ((_a = h.location) === null || _a === void 0 ? void 0 : _a.lat) ? Number(h.location.lat) : undefined,
                lng: ((_b = h.location) === null || _b === void 0 ? void 0 : _b.lon) ? Number(h.location.lon) : undefined,
            },
            rooms: (h.rooms || []).map(mapRoom),
        });
    });
}
function mapRoom(r) {
    var _a, _b, _c, _d, _e;
    return {
        offerId: r.offerid,
        name: r.name,
        refundable: r.refundable,
        meal: r.meal,
        roomtype: r.roomtype,
        view: r.view,
        price: {
            base: (_a = r.price) === null || _a === void 0 ? void 0 : _a.baseprice,
            tax: (_b = r.price) === null || _b === void 0 ? void 0 : _b.tax,
            margin: (_c = r.price) === null || _c === void 0 ? void 0 : _c.margin,
            total: (_d = r.price) === null || _d === void 0 ? void 0 : _d.total,
            currency: (_e = r.price) === null || _e === void 0 ? void 0 : _e.currency,
        },
        cancelpolicy: r.cancelpolicy,
        additionalfees: r.additionalfees,
        remarks: r.remarks,
        roomindex: r.roomindex,
        group: r.group,
        package: r.package,
    };
}
function mapAvailResponse(resp) {
    const parsed = wanderbedsSchemas_1.availResponseSchema.safeParse(resp);
    if (!parsed.success)
        return { products: [], summary: undefined, required: undefined };
    const data = parsed.data.data || {};
    const products = (data.products || []).map((p) => {
        var _a, _b;
        return ({
            hotelId: p.hotelid,
            name: p.hotelname,
            starRating: p.starrating,
            cityName: p.cityname,
            country: p.country,
            address: p.address,
            location: {
                lat: ((_a = p.location) === null || _a === void 0 ? void 0 : _a.lat) ? Number(p.location.lat) : undefined,
                lng: ((_b = p.location) === null || _b === void 0 ? void 0 : _b.lon) ? Number(p.location.lon) : undefined,
            },
            rooms: (p.rooms || []).map(mapRoom),
            remarks: p.remarks,
        });
    });
    return {
        token: parsed.data.token,
        products,
        summary: data.summary,
        required: data.required,
    };
}
async function searchHotels(payload, opts = {}) {
    var _a, _b, _c;
    // Normalize rooms payload per Wanderbeds API docs (Search.txt)
    const normalizedPayload = Object.assign(Object.assign({}, payload), { rooms: normalizeRooms(payload.rooms || []) });
    const body = normalizeTimeout(normalizedPayload);
    // Capture upstream meta for debug surfaces (exact request + upstream status/body)
    const { payload: resp, meta } = await (0, wanderbedsHttp_1.wanderbedsRequestWithMeta)('POST', '/hotel/search', {
        body,
        safe: true,
        retry: 1,
        timeoutMs: opts.timeoutMs,
        correlationId: (payload && payload.__correlationId) || undefined,
    });
    const hotels = mapHotelsResponse(resp);
    const searchId = `search-${Date.now()}`;
    await cacheSet(`vendors/wanderbeds/searches/${searchId}`, {
        request: body,
        respSummary: {
            count: (_a = resp === null || resp === void 0 ? void 0 : resp.count) !== null && _a !== void 0 ? _a : null,
            hotels: hotels.length,
            errorCode: (_c = (_b = resp === null || resp === void 0 ? void 0 : resp.error) === null || _b === void 0 ? void 0 : _b.code) !== null && _c !== void 0 ? _c : null,
        },
    }, 24);
    return Object.assign(Object.assign({}, resp), { hotels, __upstream: meta });
}
async function availHotels(payload, opts = {}) {
    // Per Wanderbeds docs (Availability.txt): body is { rooms: [offerid strings] }
    // Token must be in header, not body
    const body = { rooms: Array.isArray(payload.rooms) ? payload.rooms : [] };
    const resp = await (0, wanderbedsHttp_1.wanderbedsRequest)('POST', '/hotel/avail', {
        body,
        safe: true,
        retry: 1,
        token: opts.token || payload.token, // Token header per docs
        timeoutMs: opts.timeoutMs,
    });
    const mapped = mapAvailResponse(resp);
    const availId = `avail-${Date.now()}`;
    await cacheSet(`vendors/wanderbeds/avails/${availId}`, { request: body, respSummary: { products: mapped.products.length } }, 24);
    return Object.assign(Object.assign({}, resp), { mapped });
}
async function book(payload, opts = {}) {
    // Per Wanderbeds docs (Book.txt): body is { client_reference, passengers }
    // Token must be in header, not body
    const body = {
        client_reference: payload.client_reference,
        passengers: payload.passengers || [],
    };
    const resp = await (0, wanderbedsHttp_1.wanderbedsRequest)('POST', '/hotel/book', {
        body,
        safe: false,
        retry: 0,
        token: opts.token || payload.token, // Token header per docs
        timeoutMs: opts.timeoutMs,
    });
    const parsed = wanderbedsSchemas_1.bookResponseSchema.safeParse(resp);
    return parsed.success ? parsed.data : resp;
}
async function bookInfo(payload, opts = {}) {
    // Per Wanderbeds docs (Booking Info.txt): body is { client_reference, booking_reference }
    // Token is optional in header
    const body = {
        client_reference: payload.client_reference,
        booking_reference: payload.booking_reference,
    };
    const resp = await (0, wanderbedsHttp_1.wanderbedsRequest)('POST', '/hotel/bookinfo', {
        body,
        safe: true,
        retry: 1,
        token: opts.token || payload.token, // Optional token header
        timeoutMs: opts.timeoutMs,
    });
    const parsed = wanderbedsSchemas_1.bookInfoResponseSchema.safeParse(resp);
    return parsed.success ? parsed.data : resp;
}
async function cancel(payload) {
    const resp = await (0, wanderbedsHttp_1.wanderbedsRequest)('POST', '/hotel/cancel', { body: payload, safe: false, retry: 0 });
    const parsed = wanderbedsSchemas_1.bookInfoResponseSchema.safeParse(resp);
    return parsed.success ? parsed.data : resp;
}
//# sourceMappingURL=wanderbedsApi.js.map