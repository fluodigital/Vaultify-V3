import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import { apiGet, apiPost } from './api';
import { db } from './firebase';

export type HotelListItem = {
  hotelid: string | number;
  name?: string;
  starrating?: number;
  city?: string;
  country?: string;
  address?: string;
  lat?: string | number;
  lng?: string | number;
  heroImageUrl?: string;
  imageCount?: number;
  shortDescription?: string;
};

type CuratedHotelDoc = {
  hotelId: string | number;
  name?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  starRating?: number;
  heroImageUrl?: string;
  imageCount?: number;
  shortDescription?: string;
};

export type HotelDetail = {
  hotel?: { hotelid?: string | number; name?: string };
  city?: { name?: string };
  country?: string;
  starrating?: number;
  accommodation?: string;
  address?: string;
  areadetails?: string;
  description?: string;
  facilities?: string[];
  images?: Array<{ url: string }>;
  remarks?: string[];
  lat?: number;
  lng?: number;
};

const hotelDetailsCache = new Map<string, HotelDetail>();

const toId = (value: string | number | undefined | null) => String(value ?? '');

const toNumber = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const hasCoordinates = (hotel: HotelListItem) => {
  const lat = toNumber(hotel.lat);
  const lng = toNumber(hotel.lng);
  if (lat === undefined || lng === undefined) return false;
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
};

const hashSeed = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
};

const createSeededRandom = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const dailySeed = () => {
  const today = new Date();
  const key = today.toISOString().slice(0, 10);
  return hashSeed(key);
};

const shuffleWithSeed = <T,>(items: T[], seed: number) => {
  const rng = createSeededRandom(seed);
  const output = [...items];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
};

const resolveDetailId = (detail: HotelDetail) =>
  toId(detail?.hotel?.hotelid ?? (detail as any)?.hotelid ?? (detail as any)?.id);

export const mapDetailsById = (details: HotelDetail[]) =>
  details.reduce<Record<string, HotelDetail>>((acc, detail) => {
    const id = resolveDetailId(detail);
    if (id) acc[id] = detail;
    return acc;
  }, {});

export const getCachedHotelDetail = (hotelId: string | number) =>
  hotelDetailsCache.get(toId(hotelId));

type CuratedFetchOptions = {
  limit?: number;
  startAfter?: string | number;
};

export type CuratedHotelsResponse = {
  items: HotelListItem[];
  nextCursor: string | null;
  seeding?: boolean;
  stage?: string;
  seededCount?: number;
  lastProgressAt?: string | null;
  error?: { code?: string; message?: string } | null;
  meta?: Record<string, any>;
};

export async function fetchCuratedHotels(
  options: CuratedFetchOptions = {},
): Promise<CuratedHotelsResponse> {
  const limitValue = Number.isFinite(options.limit) ? Math.min(Math.max(Number(options.limit), 1), 200) : 200;
  const cursorValue = options.startAfter ? String(options.startAfter) : null;
  try {
    const baseQuery = query(
      collection(db, 'vendors', 'wanderbeds', 'curation', 'hotels', 'items'),
      orderBy('hotelId'),
      limit(limitValue),
    );
    const snapshot = await getDocs(cursorValue ? query(baseQuery, startAfter(cursorValue)) : baseQuery);
    const hotels = snapshot.docs.map((doc) => {
      const data = doc.data() as CuratedHotelDoc;
      return {
        hotelid: data.hotelId,
        name: data.name,
        starrating: data.starRating,
        city: data.city,
        country: data.country,
        lat: toNumber(data.lat),
        lng: toNumber(data.lng),
        heroImageUrl: data.heroImageUrl,
        imageCount: data.imageCount,
        shortDescription: data.shortDescription,
      };
    });
    if (hotels.length > 0) {
      const last = hotels[hotels.length - 1];
      return {
        items: hotels,
        nextCursor: last?.hotelid ? String(last.hotelid) : null,
        seeding: false,
        stage: 'done',
        seededCount: hotels.length,
        lastProgressAt: new Date().toISOString(),
        error: null,
      };
    }
  } catch {
    // Fall through to API fallback.
  }

  const resp = await apiGet<{
    ok?: boolean;
    hotels?: any[];
    meta?: {
      nextCursor?: string | null;
      seeding?: boolean;
      stage?: string;
      seededCount?: number;
      lastProgressAt?: string | null;
      error?: { code?: string; message?: string } | null;
      [key: string]: any;
    };
  }>('/hotels/curated', {
    limit: limitValue,
    startAfter: cursorValue || undefined,
  });
  const list = Array.isArray(resp?.hotels) ? resp.hotels : [];
  if (import.meta.env.DEV && !Array.isArray(resp?.hotels)) {
    // eslint-disable-next-line no-console
    console.warn('[curated] unexpected response shape', resp);
  }
  const items = list.map((hotel: any) => ({
    hotelid: hotel.hotelId ?? hotel.hotelid,
    name: hotel.name,
    starrating: hotel.starRating ?? hotel.starrating,
    city: hotel.city,
    country: hotel.country,
    address: hotel.address,
    lat: toNumber(hotel.lat),
    lng: toNumber(hotel.lng),
    heroImageUrl: hotel.heroImageUrl,
    imageCount: hotel.imageCount,
    shortDescription: hotel.shortDescription,
  }));
  return {
    items,
    nextCursor:
      resp?.meta?.nextCursor ??
      (items[items.length - 1]?.hotelid ? String(items[items.length - 1]?.hotelid) : null),
    seeding: resp?.meta?.seeding,
    stage: resp?.meta?.stage,
    seededCount: resp?.meta?.seededCount,
    lastProgressAt: resp?.meta?.lastProgressAt ?? null,
    error: resp?.meta?.error ?? null,
    meta: resp?.meta,
  };
}

export type WarmCacheRequest = {
  what: string[];
  hotels?: Array<string | number>;
  countryCodes?: string[];
};

export async function warmHotelsCache(payload: WarmCacheRequest) {
  return apiPost('/hotels/admin/warm-cache', payload, { requireAuth: true });
}

export async function fetchHotelDetails(hotelIds: Array<string | number>): Promise<HotelDetail[]> {
  const ids = hotelIds.map((id) => toId(id)).filter(Boolean);
  const missing = ids.filter((id) => !hotelDetailsCache.has(id));
  if (missing.length > 0) {
    const resp = await apiPost<{ hotels?: HotelDetail[] }>('/hotels/static/hoteldetails', {
      hotels: missing,
    });
    const fetched = Array.isArray(resp?.hotels) ? resp.hotels : [];
    fetched.forEach((detail) => {
      const id = resolveDetailId(detail);
      if (id) hotelDetailsCache.set(id, detail);
    });
  }
  return ids
    .map((id) => hotelDetailsCache.get(id))
    .filter((detail): detail is HotelDetail => Boolean(detail));
}

export function selectDailyCuratedHotels(hotels: HotelListItem[]): HotelListItem[] {
  const withRating = hotels.filter((hotel) => (hotel.starrating ?? 0) >= 4);
  const withGeo = withRating.filter(hasCoordinates);
  const pool = withGeo.length >= 12 ? withGeo : withRating.length >= 12 ? withRating : hotels;
  if (pool.length <= 12) return pool;
  const targetCount = Math.min(pool.length, Math.max(12, Math.min(20, Math.round(pool.length * 0.3))));
  return shuffleWithSeed(pool, dailySeed()).slice(0, targetCount);
}

export const getHotelLocation = (hotel: HotelListItem) =>
  [hotel.city, hotel.country].filter(Boolean).join(', ');

export const toHotelCoordinates = (hotel: HotelListItem) => ({
  lat: toNumber(hotel.lat),
  lng: toNumber(hotel.lng),
});
