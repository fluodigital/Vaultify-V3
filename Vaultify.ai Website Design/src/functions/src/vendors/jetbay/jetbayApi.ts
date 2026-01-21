import * as admin from 'firebase-admin';
import { z } from 'zod';
import { jetbayRequest } from './jetbayHttp';
import crypto from 'crypto';

const db = admin.firestore();

const CommonResp = z.object({
  code: z.number().optional(),
  message: z.string().optional(),
  success: z.boolean().default(true),
  data: z.any().optional(),
});

const AircraftInfo = z.object({
  aircraftId: z.string().optional(),
  tailNumber: z.string().optional(),
  aircraftName: z.string().optional(),
  cabinClass: z.string().optional(),
  aircraftType: z.string().optional(),
  seats: z.number().optional(),
  wifi: z.boolean().optional(),
  smoking: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  depCity: z.string().optional(),
  arrCity: z.string().optional(),
});

const EmptyLegItem = z.object({
  id: z.string(),
  depCity: z.string().optional(),
  arrCity: z.string().optional(),
  depTime: z.string().optional(),
  arrTime: z.string().optional(),
  aircraftName: z.string().optional(),
  seats: z.number().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
});

const CityItem = z.object({ code: z.string().optional(), name: z.string().optional(), country: z.string().optional() });
const CountryItem = z.object({ code: z.string().optional(), name: z.string().optional() });

const SearchListResp = CommonResp.extend({ data: z.object({ records: z.array(AircraftInfo).default([]) }).optional() });
const EmptyLegPageResp = CommonResp.extend({ data: z.object({ records: z.array(EmptyLegItem).default([]), total: z.number().optional() }).optional() });
const CityQueryResp = CommonResp.extend({ data: z.array(CityItem).default([]) });
const CountryQueryResp = CommonResp.extend({ data: z.array(CountryItem).default([]) });

function hashKey(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function nowIso() {
  return admin.firestore.Timestamp.now();
}

// Normalization helpers
function toListingFromAircraft(a: z.infer<typeof AircraftInfo>) {
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

function toOfferFromAircraft(listingId: string, a: z.infer<typeof AircraftInfo>) {
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

function toListingFromEmptyLeg(e: z.infer<typeof EmptyLegItem>) {
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

function toOfferFromEmptyLeg(listingId: string, e: z.infer<typeof EmptyLegItem>) {
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

async function cacheSet(path: string, data: any, ttlHours = 24) {
  await db.doc(path).set({ data, cachedAt: nowIso(), ttlHours });
}

async function cacheGet(path: string) {
  const snap = await db.doc(path).get();
  if (!snap.exists) return null;
  const val = snap.data();
  const cachedAt = val?.cachedAt as admin.firestore.Timestamp | undefined;
  const ttl = val?.ttlHours || 24;
  if (cachedAt && cachedAt.toDate().getTime() + ttl * 3600_000 < Date.now()) return null;
  return val?.data || null;
}

// API wrappers
export async function cityQuery(q: string) {
  const key = `vendors/jetbay/cache/cities/${hashKey(q)}`;
  const cached = await cacheGet(key);
  if (cached) return cached;
  const resp = CityQueryResp.parse(await jetbayRequest('GET', '/jetbay/api/data/v1/cityQuery', { query: { q } }));
  await cacheSet(key, resp.data || []);
  return resp.data || [];
}

export async function countryQuery(q?: string) {
  const key = `vendors/jetbay/cache/countries/${hashKey(q || 'all')}`;
  const cached = await cacheGet(key);
  if (cached) return cached;
  const resp = CountryQueryResp.parse(await jetbayRequest('GET', '/jetbay/api/data/countryQuery', { query: { q } }));
  await cacheSet(key, resp.data || []);
  return resp.data || [];
}

export async function searchCharter(payload: any, correlationId: string, userId?: string) {
  const resp = SearchListResp.parse(await jetbayRequest('POST', '/jetbay/api/search/searchList', { body: payload, correlationId }));
  const records = resp.data?.records || [];
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

export async function emptyLegAreas() {
  const resp = CommonResp.parse(await jetbayRequest('GET', '/jetbay/api/emptyLeg/v1/areas'));
  return resp.data || [];
}

export async function emptyLegQueryPage(params: any, correlationId: string, userId?: string) {
  const resp = EmptyLegPageResp.parse(await jetbayRequest('GET', '/jetbay/api/emptyLeg/v1/queryPage', { query: params, correlationId }));
  const records = resp.data?.records || [];
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
  return { listings, offers, total: resp.data?.total };
}

export async function submitLead(payload: any, correlationId: string, userId?: string) {
  const resp = CommonResp.parse(await jetbayRequest('POST', '/jetbay/api/lead/v1/submit/lead', { body: payload, correlationId }));
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

export async function submitEmptyLegLead(payload: any, correlationId: string, userId?: string) {
  const resp = CommonResp.parse(await jetbayRequest('POST', '/jetbay/api/lead/v1/submitEmptyLegLead', { body: payload, correlationId }));
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
