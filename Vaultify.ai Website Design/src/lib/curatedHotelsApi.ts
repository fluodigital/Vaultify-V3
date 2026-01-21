import { apiGet } from './api';

/**
 * Shared API helper for curated hotels
 * Used by both /hotels/ page and /debug/hotels-curated page
 */

export interface CuratedHotelRaw {
  hotelId?: string | number;
  id?: string | number;
  hotelid?: string | number;
  name?: string;
  hotelname?: string;
  city?: string;
  cityName?: string;
  country?: string;
  countryCode?: string;
  starRating?: number;
  starrating?: number;
  heroImageUrl?: string;
  hero?: string;
  image?: string;
  lat?: string | number;
  latitude?: string | number;
  lng?: string | number;
  longitude?: string | number;
  address?: string;
  imageCount?: number;
  shortDescription?: string;
  [key: string]: any;
}

export interface NormalizedCuratedHotel {
  hotelId: string;
  name: string;
  city: string;
  country: string;
  starRating: number;
  heroImageUrl: string;
  lat: number | null;
  lng: number | null;
  address?: string;
  imageCount?: number;
  shortDescription?: string;
}

/**
 * Normalize hotel data to handle field name variations
 * Never fails - always returns a valid hotel object even with missing fields
 */
export function normalizeHotel(h: CuratedHotelRaw): NormalizedCuratedHotel {
  const hotelId = String(h.hotelId || h.id || h.hotelid || '');
  const name = h.name || h.hotelname || '';
  const city = h.city || h.cityName || '';
  const country = (h.country || h.countryCode || '').toUpperCase();
  
  // Star rating: default to 0 if missing
  const starRating = Number(h.starRating ?? h.starrating ?? 0) || 0;
  
  // Hero image: try multiple field names
  const heroImageUrl = h.heroImageUrl || h.hero || h.image || '';
  
  // Lat/Lng: parseFloat, can be NaN (UI must handle this)
  const latRaw = h.lat ?? h.latitude ?? '';
  const lat = typeof latRaw === 'number' ? latRaw : parseFloat(String(latRaw));
  const latFinal = Number.isFinite(lat) ? lat : null;
  
  const lngRaw = h.lng ?? h.longitude ?? '';
  const lng = typeof lngRaw === 'number' ? lngRaw : parseFloat(String(lngRaw));
  const lngFinal = Number.isFinite(lng) ? lng : null;

  return {
    hotelId,
    name,
    city,
    country,
    starRating,
    heroImageUrl,
    lat: latFinal,
    lng: lngFinal,
    address: h.address,
    imageCount: h.imageCount,
    shortDescription: h.shortDescription,
  };
}

export interface CuratedHotelsPageResponse {
  hotels: CuratedHotelRaw[];
  nextCursor: string | null;
  seeding?: boolean;
  stage?: string;
  runId?: string;
  seededCount?: number;
  message?: string;
  error?: string;
}

/**
 * Fetch a page of curated hotels from the API
 * @param options - limit and startAfter cursor for pagination
 * @returns Raw API response
 */
export async function fetchCuratedHotelsPage(
  options: { limit?: number; startAfter?: string | null } = {},
): Promise<CuratedHotelsPageResponse> {
  const limit = Math.min(options.limit || 100, 200);
  const params: Record<string, any> = { limit };
  if (options.startAfter) {
    params.startAfter = options.startAfter;
  }

  const resp = await apiGet<CuratedHotelsPageResponse>('/hotels/curated', params);
  return resp;
}

export interface CuratedHotelsDebugResponse {
  curatedCount?: number;
  latestSeed?: {
    status?: string;
    seededCount?: number;
    stage?: string;
    updatedAt?: string;
    lastError?: string;
  };
  error?: string;
}

/**
 * Fetch debug info about curated hotels
 * Handles 404 gracefully (returns error message in response)
 */
export async function fetchCuratedHotelsDebug(): Promise<CuratedHotelsDebugResponse> {
  try {
    const resp = await apiGet<CuratedHotelsDebugResponse>('/hotels/curated/debug');
    return resp;
  } catch (err: any) {
    if (err?.message?.includes('404')) {
      return { error: 'Debug endpoint not available (404)' };
    }
    return { error: err?.message || 'Failed to fetch debug info' };
  }
}
