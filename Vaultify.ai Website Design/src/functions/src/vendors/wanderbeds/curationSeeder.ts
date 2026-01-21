import * as admin from 'firebase-admin';
import { postHotelDetails } from './wanderbedsApi';
import { wanderbedsRequest } from './wanderbedsHttp';

type SeedFilters = {
  countries?: string[];
  cities?: string[];
  minStars?: number;
};

export type SeedProgress = {
  stage: string;
  processed: number;
  total: number;
  perCityCounts?: Record<string, number>;
};

export type SeedFromHotellistOptions = {
  filters: SeedFilters;
  limitPerCity: number;
  limitTotal: number;
  requireGeo: boolean;
  enrichDetails: boolean;
  timeoutMs: number;
  maxRuntimeMs?: number;
  onProgress?: (progress: SeedProgress) => Promise<void> | void;
};

type HotellistEntry = {
  hotelid?: string | number;
  name?: string;
  city?: string;
  country?: string;
  address?: string;
  starrating?: number;
  lat?: string | number;
  lng?: string | number;
};

type CuratedHotelEntry = {
  hotelId: string | number;
  name?: string;
  city?: string;
  country?: string;
  address?: string;
  lat?: number;
  lng?: number;
  starRating?: number;
  source: 'hotellist_seed';
  seededAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
  heroImageUrl?: string;
  imageCount?: number;
  shortDescription?: string;
  facilitiesCount?: number;
};

const normalizeNumber = (value: any) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

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

const shuffleWithSeed = <T,>(items: T[], seed: number) => {
  const rng = createSeededRandom(seed);
  const output = [...items];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
};

const getDailySeed = () => {
  const key = new Date().toISOString().slice(0, 10);
  return hashSeed(key);
};

const matchesCity = (city: string | undefined, filters: string[]) => {
  if (!city) return null;
  const normalizedCity = normalizeText(city);
  return filters.find((target) => normalizedCity.includes(normalizeText(target))) || null;
};

const extractHotels = (payload: any): HotellistEntry[] => {
  const list = payload?.hotels || payload?.data?.hotels || [];
  return Array.isArray(list) ? list : [];
};

export async function seedFromHotellist(
  collectionPath: string,
  options: SeedFromHotellistOptions,
) {
  const startedAt = Date.now();
  const assertNotTimedOut = () => {
    if (!options.maxRuntimeMs) return;
    if (Date.now() - startedAt > options.maxRuntimeMs) {
      throw new Error('seed_timeout');
    }
  };

  const updateProgress = async (progress: SeedProgress) => {
    if (options.onProgress) {
      await options.onProgress(progress);
    }
  };

  await updateProgress({ stage: 'fetching_hotellist', processed: 0, total: 0 });
  let payload: any;
  const hotellistStart = Date.now();
  try {
    payload = await wanderbedsRequest('GET', '/staticdata/hotellist', {
      safe: false,
      retry: 0,
      timeoutMs: options.timeoutMs,
    });
  } catch (err: any) {
    const wrapped = new Error(err?.message || 'Failed to fetch hotellist');
    (wrapped as any).code = 'hotellist_fetch_failed';
    (wrapped as any).upstreamStatus = err?.status || err?.response?.status || null;
    (wrapped as any).upstreamMs = Date.now() - hotellistStart;
    throw wrapped;
  }
  assertNotTimedOut();
  const hotellist = extractHotels(payload);
  if (!hotellist.length) {
    const emptyErr = new Error(
      'Wanderbeds hotellist returned 0 items (check env/credentials/baseUrl).',
    );
    (emptyErr as any).code = 'hotellist_empty';
    (emptyErr as any).upstreamStatus = 200;
    (emptyErr as any).upstreamMs = Date.now() - hotellistStart;
    throw emptyErr;
  }
  const allowedCountries = new Set((options.filters.countries || []).map((code) => String(code).toUpperCase()));
  const cityFilters = options.filters.cities || [];
  const minStars = options.filters.minStars ?? 0;

  const grouped: Record<string, HotellistEntry[]> = {};
  hotellist.forEach((hotel) => {
    const countryCode = String(hotel.country || '').toUpperCase();
    if (allowedCountries.size && !allowedCountries.has(countryCode)) return;
    if ((hotel.starrating ?? 0) < minStars) return;
    if (options.requireGeo) {
      const lat = normalizeNumber(hotel.lat);
      const lng = normalizeNumber(hotel.lng);
      if (lat === undefined || lng === undefined) return;
    }
    const matchedCity = cityFilters.length ? matchesCity(hotel.city, cityFilters) : hotel.city;
    if (!matchedCity) return;
    if (!grouped[matchedCity]) grouped[matchedCity] = [];
    grouped[matchedCity].push(hotel);
  });

  await updateProgress({
    stage: 'filtered_hotellist',
    processed: 0,
    total: hotellist.length,
    perCityCounts: Object.fromEntries(
      Object.entries(grouped).map(([city, items]) => [city, items.length]),
    ),
  });

  const dailySeed = getDailySeed();
  const selected: HotellistEntry[] = [];
  Object.entries(grouped).forEach(([cityKey, hotels]) => {
    const citySeed = hashSeed(`${cityKey}-${dailySeed}`);
    const shuffled = shuffleWithSeed(hotels, citySeed);
    selected.push(...shuffled.slice(0, options.limitPerCity));
  });

  const finalSeed = shuffleWithSeed(selected, dailySeed).slice(0, options.limitTotal);
  const seededAt = admin.firestore.FieldValue.serverTimestamp();
  const updatedAt = admin.firestore.FieldValue.serverTimestamp();

  const curatedEntries: CuratedHotelEntry[] = finalSeed
    .map((hotel) => ({
      hotelId: hotel.hotelid || '',
      name: hotel.name || undefined,
      city: hotel.city || undefined,
      country: hotel.country || undefined,
      address: hotel.address || undefined,
      lat: normalizeNumber(hotel.lat),
      lng: normalizeNumber(hotel.lng),
      starRating: normalizeNumber(hotel.starrating),
      source: 'hotellist_seed' as const,
      seededAt,
      updatedAt,
    }))
    .filter((entry) => String(entry.hotelId).trim().length > 0);

  await updateProgress({
    stage: 'running',
    processed: 0,
    total: curatedEntries.length,
  });

  const collectionRef = admin.firestore().collection(collectionPath);
  const existingDocs = await admin.firestore().getAll(
    ...curatedEntries.map((entry) => collectionRef.doc(String(entry.hotelId))),
  );
  const existingMap = new Map(existingDocs.map((doc) => [doc.id, doc.exists]));

  let inserted = 0;
  let updated = 0;
  const batchLimit = 500;
  let processed = 0;
  const firstBatchSize = Math.min(10, curatedEntries.length);
  if (firstBatchSize > 0) {
    const batch = admin.firestore().batch();
    curatedEntries.slice(0, firstBatchSize).forEach((entry) => {
      const docRef = collectionRef.doc(String(entry.hotelId));
      batch.set(docRef, entry, { merge: true });
      if (existingMap.get(String(entry.hotelId))) {
        updated += 1;
      } else {
        inserted += 1;
      }
    });
    await batch.commit();
    processed += firstBatchSize;
    await updateProgress({
      stage: 'writing_curated',
      processed,
      total: curatedEntries.length,
    });
    assertNotTimedOut();
  }

  for (let i = firstBatchSize; i < curatedEntries.length; i += batchLimit) {
    const batch = admin.firestore().batch();
    curatedEntries.slice(i, i + batchLimit).forEach((entry) => {
      const docRef = collectionRef.doc(String(entry.hotelId));
      batch.set(docRef, entry, { merge: true });
      if (existingMap.get(String(entry.hotelId))) {
        updated += 1;
      } else {
        inserted += 1;
      }
    });
    await batch.commit();
    processed += Math.min(batchLimit, curatedEntries.length - i);
    await updateProgress({
      stage: 'writing_curated',
      processed,
      total: curatedEntries.length,
    });
    assertNotTimedOut();
  }

  if (options.enrichDetails && curatedEntries.length) {
    const ids = curatedEntries.map((entry) => entry.hotelId);
    const chunks: Array<Array<string | number>> = [];
    for (let i = 0; i < ids.length; i += 20) {
      chunks.push(ids.slice(i, i + 20));
    }
    processed = 0;
    for (const chunk of chunks) {
      await updateProgress({
        stage: 'enriching_details',
        processed,
        total: curatedEntries.length,
      });
      const detailsResp = await postHotelDetails(chunk, {
        timeoutMs: options.timeoutMs,
        bypassCache: true,
        allowStale: true,
      });
      assertNotTimedOut();
      const details = detailsResp?.hotels || [];
      details.forEach((detail: any) => {
        const hotelId = detail?.hotel?.hotelid || detail?.hotelid;
        const entry = curatedEntries.find((item) => String(item.hotelId) === String(hotelId));
        if (!entry) return;
        const description = detail?.description || detail?.areadetails || '';
        entry.heroImageUrl = detail?.images?.[0]?.url || entry.heroImageUrl;
        entry.imageCount = Array.isArray(detail?.images) ? detail.images.length : entry.imageCount;
        entry.shortDescription = description ? description.slice(0, 220) : entry.shortDescription;
        entry.facilitiesCount = Array.isArray(detail?.facilities)
          ? detail.facilities.length
          : entry.facilitiesCount;
      });
      processed += chunk.length;
    }

    processed = 0;
    for (let i = 0; i < curatedEntries.length; i += batchLimit) {
      const batch = admin.firestore().batch();
      curatedEntries.slice(i, i + batchLimit).forEach((entry) => {
        const docRef = collectionRef.doc(String(entry.hotelId));
        batch.set(docRef, entry, { merge: true });
      });
      await batch.commit();
      processed += Math.min(batchLimit, curatedEntries.length - i);
      await updateProgress({
        stage: 'writing_enriched',
        processed,
        total: curatedEntries.length,
      });
      assertNotTimedOut();
    }
  }

  const perCityCounts: Record<string, number> = {};
  curatedEntries.forEach((entry) => {
    const key = entry.city || 'Unknown';
    perCityCounts[key] = (perCityCounts[key] || 0) + 1;
  });

  await updateProgress({
    stage: 'done',
    processed: curatedEntries.length,
    total: curatedEntries.length,
    perCityCounts,
  });

  return {
    seeded: curatedEntries.length,
    inserted,
    updated,
    perCityCounts,
    sampleHotelIds: curatedEntries.slice(0, 10).map((entry) => entry.hotelId),
  };
}
