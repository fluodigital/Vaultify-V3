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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cityQuery = cityQuery;
exports.countryQuery = countryQuery;
exports.searchCharter = searchCharter;
exports.emptyLegAreas = emptyLegAreas;
exports.emptyLegQueryPage = emptyLegQueryPage;
exports.submitLead = submitLead;
exports.submitEmptyLegLead = submitEmptyLegLead;
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const jetbayHttp_1 = require("./jetbayHttp");
const crypto_1 = __importDefault(require("crypto"));
const db = admin.firestore();
const CommonResp = zod_1.z.object({
    code: zod_1.z.number().optional(),
    message: zod_1.z.string().optional(),
    success: zod_1.z.boolean().default(true),
    data: zod_1.z.any().optional(),
});
const AircraftInfo = zod_1.z.object({
    aircraftId: zod_1.z.string().optional(),
    tailNumber: zod_1.z.string().optional(),
    aircraftName: zod_1.z.string().optional(),
    cabinClass: zod_1.z.string().optional(),
    aircraftType: zod_1.z.string().optional(),
    seats: zod_1.z.number().optional(),
    wifi: zod_1.z.boolean().optional(),
    smoking: zod_1.z.boolean().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    price: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    depCity: zod_1.z.string().optional(),
    arrCity: zod_1.z.string().optional(),
});
const EmptyLegItem = zod_1.z.object({
    id: zod_1.z.string(),
    depCity: zod_1.z.string().optional(),
    arrCity: zod_1.z.string().optional(),
    depTime: zod_1.z.string().optional(),
    arrTime: zod_1.z.string().optional(),
    aircraftName: zod_1.z.string().optional(),
    seats: zod_1.z.number().optional(),
    price: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
});
const CityItem = zod_1.z.object({ code: zod_1.z.string().optional(), name: zod_1.z.string().optional(), country: zod_1.z.string().optional() });
const CountryItem = zod_1.z.object({ code: zod_1.z.string().optional(), name: zod_1.z.string().optional() });
const SearchListResp = CommonResp.extend({ data: zod_1.z.object({ records: zod_1.z.array(AircraftInfo).default([]) }).optional() });
const EmptyLegPageResp = CommonResp.extend({ data: zod_1.z.object({ records: zod_1.z.array(EmptyLegItem).default([]), total: zod_1.z.number().optional() }).optional() });
const CityQueryResp = CommonResp.extend({ data: zod_1.z.array(CityItem).default([]) });
const CountryQueryResp = CommonResp.extend({ data: zod_1.z.array(CountryItem).default([]) });
function hashKey(input) {
    return crypto_1.default.createHash('sha256').update(input).digest('hex');
}
function nowIso() {
    return admin.firestore.Timestamp.now();
}
// Normalization helpers
function toListingFromAircraft(a) {
    const id = `jetbay-charter-${a.aircraftId || a.tailNumber || hashKey(JSON.stringify(a)).slice(0, 12)}`;
    return {
        id,
        vertical: 'jet',
        vendor: 'jetbay',
        vendorRefId: a.aircraftId || a.tailNumber || id,
        title: a.aircraftName || 'Jet',
        seats: a.seats,
        wifi: a.wifi,
        smoking: a.smoking,
        images: a.images || [],
        isEmptyLeg: false,
        routeSummary: `${a.depCity || ''} → ${a.arrCity || ''}`.trim(),
        metadata: a,
    };
}
function toOfferFromAircraft(listingId, a) {
    return {
        id: `${listingId}-offer`,
        listingId,
        currency: a.currency || 'USD',
        priceDisplay: a.price ? `${a.price} ${a.currency || ''}`.trim() : 'On request',
        usdPrice: a.price,
        priceType: 'estimated',
        availability: 'unknown',
        createdAt: nowIso(),
        vendorRawHash: hashKey(JSON.stringify(a || {})),
    };
}
function toListingFromEmptyLeg(e) {
    const id = `jetbay-empty-${e.id}`;
    return {
        id,
        vertical: 'jet',
        vendor: 'jetbay',
        vendorRefId: e.id,
        title: e.aircraftName || 'Empty leg',
        seats: e.seats,
        isEmptyLeg: true,
        routeSummary: `${e.depCity || ''} → ${e.arrCity || ''}`.trim(),
        metadata: e,
    };
}
function toOfferFromEmptyLeg(listingId, e) {
    return {
        id: `${listingId}-offer`,
        listingId,
        currency: e.currency || 'USD',
        priceDisplay: e.price ? `${e.price} ${e.currency || ''}`.trim() : 'On request',
        usdPrice: e.price,
        priceType: 'estimated',
        availability: 'unknown',
        createdAt: nowIso(),
        vendorRawHash: hashKey(JSON.stringify(e || {})),
    };
}
async function cacheSet(path, data, ttlHours = 24) {
    await db.doc(path).set({ data, cachedAt: nowIso(), ttlHours });
}
async function cacheGet(path) {
    const snap = await db.doc(path).get();
    if (!snap.exists)
        return null;
    const val = snap.data();
    const cachedAt = val === null || val === void 0 ? void 0 : val.cachedAt;
    const ttl = (val === null || val === void 0 ? void 0 : val.ttlHours) || 24;
    if (cachedAt && cachedAt.toDate().getTime() + ttl * 3600000 < Date.now())
        return null;
    return (val === null || val === void 0 ? void 0 : val.data) || null;
}
// API wrappers
async function cityQuery(q) {
    const key = `vendors/jetbay/cache/cities/${hashKey(q)}`;
    const cached = await cacheGet(key);
    if (cached)
        return cached;
    const resp = CityQueryResp.parse(await (0, jetbayHttp_1.jetbayRequest)('GET', '/jetbay/api/data/v1/cityQuery', { query: { q } }));
    await cacheSet(key, resp.data || []);
    return resp.data || [];
}
async function countryQuery(q) {
    const key = `vendors/jetbay/cache/countries/${hashKey(q || 'all')}`;
    const cached = await cacheGet(key);
    if (cached)
        return cached;
    const resp = CountryQueryResp.parse(await (0, jetbayHttp_1.jetbayRequest)('GET', '/jetbay/api/data/countryQuery', { query: { q } }));
    await cacheSet(key, resp.data || []);
    return resp.data || [];
}
async function searchCharter(payload, correlationId, userId) {
    var _a;
    const resp = SearchListResp.parse(await (0, jetbayHttp_1.jetbayRequest)('POST', '/jetbay/api/search/searchList', { body: payload, correlationId }));
    const records = ((_a = resp.data) === null || _a === void 0 ? void 0 : _a.records) || [];
    const listings = records.map(toListingFromAircraft);
    const offers = records.map((r, idx) => toOfferFromAircraft(listings[idx].id, r));
    const searchId = `jetbay-charter-${hashKey(correlationId)}`;
    await db.collection('vendors').doc('jetbay').collection('charterSearches').doc(searchId).set({
        payload,
        listings,
        offers,
        rawCount: records.length,
        createdAt: nowIso(),
        userId: userId || null,
    });
    const batch = db.batch();
    listings.forEach((l) => batch.set(db.collection('listings').doc(l.id), l, { merge: true }));
    offers.forEach((o) => batch.set(db.collection('offers').doc(o.id), o, { merge: true }));
    await batch.commit();
    return { listings, offers };
}
async function emptyLegAreas() {
    const resp = CommonResp.parse(await (0, jetbayHttp_1.jetbayRequest)('GET', '/jetbay/api/emptyLeg/v1/areas'));
    return resp.data || [];
}
async function emptyLegQueryPage(params, correlationId, userId) {
    var _a, _b;
    const resp = EmptyLegPageResp.parse(await (0, jetbayHttp_1.jetbayRequest)('GET', '/jetbay/api/emptyLeg/v1/queryPage', { query: params, correlationId }));
    const records = ((_a = resp.data) === null || _a === void 0 ? void 0 : _a.records) || [];
    const listings = records.map(toListingFromEmptyLeg);
    const offers = records.map((r, idx) => toOfferFromEmptyLeg(listings[idx].id, r));
    const searchId = `jetbay-empty-${hashKey(JSON.stringify(params))}`;
    await db.collection('vendors').doc('jetbay').collection('emptyLegSearches').doc(searchId).set({
        params,
        listings,
        offers,
        rawCount: records.length,
        createdAt: nowIso(),
        userId: userId || null,
    });
    const batch = db.batch();
    listings.forEach((l) => batch.set(db.collection('listings').doc(l.id), l, { merge: true }));
    offers.forEach((o) => batch.set(db.collection('offers').doc(o.id), o, { merge: true }));
    await batch.commit();
    return { listings, offers, total: (_b = resp.data) === null || _b === void 0 ? void 0 : _b.total };
}
async function submitLead(payload, correlationId, userId) {
    const resp = CommonResp.parse(await (0, jetbayHttp_1.jetbayRequest)('POST', '/jetbay/api/lead/v1/submit/lead', { body: payload, correlationId }));
    const inquiryId = `jetbay-inquiry-${hashKey(`${payload.email || 'anon'}-${Date.now()}`)}`;
    await db.collection('inquiries').doc(inquiryId).set({
        vendor: 'jetbay',
        type: 'charter',
        status: resp.success !== false ? 'submitted' : 'failed',
        payloadRef: payload,
        createdAt: nowIso(),
        lastError: resp.success === false ? resp.message : undefined,
        userId: userId || null,
    });
    return { inquiryId, status: resp.success !== false ? 'submitted' : 'failed' };
}
async function submitEmptyLegLead(payload, correlationId, userId) {
    const resp = CommonResp.parse(await (0, jetbayHttp_1.jetbayRequest)('POST', '/jetbay/api/lead/v1/submitEmptyLegLead', { body: payload, correlationId }));
    const inquiryId = `jetbay-empty-inquiry-${hashKey(`${payload.email || 'anon'}-${Date.now()}`)}`;
    await db.collection('inquiries').doc(inquiryId).set({
        vendor: 'jetbay',
        type: 'empty_leg',
        status: resp.success !== false ? 'submitted' : 'failed',
        payloadRef: payload,
        createdAt: nowIso(),
        lastError: resp.success === false ? resp.message : undefined,
        userId: userId || null,
    });
    return { inquiryId, status: resp.success !== false ? 'submitted' : 'failed' };
}
//# sourceMappingURL=jetbayApi.js.map