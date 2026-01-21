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
exports.seedFromHotellist = seedFromHotellist;
const admin = __importStar(require("firebase-admin"));
const wanderbedsApi_1 = require("./wanderbedsApi");
const wanderbedsHttp_1 = require("./wanderbedsHttp");
const normalizeNumber = (value) => {
    if (value === undefined || value === null || value === '')
        return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};
const normalizeText = (value) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const hashSeed = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return hash >>> 0;
};
const createSeededRandom = (seed) => {
    let t = seed + 0x6d2b79f5;
    return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), t | 1);
        r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
};
const shuffleWithSeed = (items, seed) => {
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
const matchesCity = (city, filters) => {
    if (!city)
        return null;
    const normalizedCity = normalizeText(city);
    return filters.find((target) => normalizedCity.includes(normalizeText(target))) || null;
};
const extractHotels = (payload) => {
    var _a;
    const list = (payload === null || payload === void 0 ? void 0 : payload.hotels) || ((_a = payload === null || payload === void 0 ? void 0 : payload.data) === null || _a === void 0 ? void 0 : _a.hotels) || [];
    return Array.isArray(list) ? list : [];
};
async function seedFromHotellist(collectionPath, options) {
    var _a, _b;
    const startedAt = Date.now();
    const assertNotTimedOut = () => {
        if (!options.maxRuntimeMs)
            return;
        if (Date.now() - startedAt > options.maxRuntimeMs) {
            throw new Error('seed_timeout');
        }
    };
    const updateProgress = async (progress) => {
        if (options.onProgress) {
            await options.onProgress(progress);
        }
    };
    await updateProgress({ stage: 'fetching_hotellist', processed: 0, total: 0 });
    let payload;
    const hotellistStart = Date.now();
    try {
        payload = await (0, wanderbedsHttp_1.wanderbedsRequest)('GET', '/staticdata/hotellist', {
            safe: false,
            retry: 0,
            timeoutMs: options.timeoutMs,
        });
    }
    catch (err) {
        const wrapped = new Error((err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch hotellist');
        wrapped.code = 'hotellist_fetch_failed';
        wrapped.upstreamStatus = (err === null || err === void 0 ? void 0 : err.status) || ((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || null;
        wrapped.upstreamMs = Date.now() - hotellistStart;
        throw wrapped;
    }
    assertNotTimedOut();
    const hotellist = extractHotels(payload);
    if (!hotellist.length) {
        const emptyErr = new Error('Wanderbeds hotellist returned 0 items (check env/credentials/baseUrl).');
        emptyErr.code = 'hotellist_empty';
        emptyErr.upstreamStatus = 200;
        emptyErr.upstreamMs = Date.now() - hotellistStart;
        throw emptyErr;
    }
    const allowedCountries = new Set((options.filters.countries || []).map((code) => String(code).toUpperCase()));
    const cityFilters = options.filters.cities || [];
    const minStars = (_b = options.filters.minStars) !== null && _b !== void 0 ? _b : 0;
    const grouped = {};
    hotellist.forEach((hotel) => {
        var _a;
        const countryCode = String(hotel.country || '').toUpperCase();
        if (allowedCountries.size && !allowedCountries.has(countryCode))
            return;
        if (((_a = hotel.starrating) !== null && _a !== void 0 ? _a : 0) < minStars)
            return;
        if (options.requireGeo) {
            const lat = normalizeNumber(hotel.lat);
            const lng = normalizeNumber(hotel.lng);
            if (lat === undefined || lng === undefined)
                return;
        }
        const matchedCity = cityFilters.length ? matchesCity(hotel.city, cityFilters) : hotel.city;
        if (!matchedCity)
            return;
        if (!grouped[matchedCity])
            grouped[matchedCity] = [];
        grouped[matchedCity].push(hotel);
    });
    await updateProgress({
        stage: 'filtered_hotellist',
        processed: 0,
        total: hotellist.length,
        perCityCounts: Object.fromEntries(Object.entries(grouped).map(([city, items]) => [city, items.length])),
    });
    const dailySeed = getDailySeed();
    const selected = [];
    Object.entries(grouped).forEach(([cityKey, hotels]) => {
        const citySeed = hashSeed(`${cityKey}-${dailySeed}`);
        const shuffled = shuffleWithSeed(hotels, citySeed);
        selected.push(...shuffled.slice(0, options.limitPerCity));
    });
    const finalSeed = shuffleWithSeed(selected, dailySeed).slice(0, options.limitTotal);
    const seededAt = admin.firestore.FieldValue.serverTimestamp();
    const updatedAt = admin.firestore.FieldValue.serverTimestamp();
    const curatedEntries = finalSeed
        .map((hotel) => ({
        hotelId: hotel.hotelid || '',
        name: hotel.name || undefined,
        city: hotel.city || undefined,
        country: hotel.country || undefined,
        address: hotel.address || undefined,
        lat: normalizeNumber(hotel.lat),
        lng: normalizeNumber(hotel.lng),
        starRating: normalizeNumber(hotel.starrating),
        source: 'hotellist_seed',
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
    const existingDocs = await admin.firestore().getAll(...curatedEntries.map((entry) => collectionRef.doc(String(entry.hotelId))));
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
            }
            else {
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
            }
            else {
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
        const chunks = [];
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
            const detailsResp = await (0, wanderbedsApi_1.postHotelDetails)(chunk, {
                timeoutMs: options.timeoutMs,
                bypassCache: true,
                allowStale: true,
            });
            assertNotTimedOut();
            const details = (detailsResp === null || detailsResp === void 0 ? void 0 : detailsResp.hotels) || [];
            details.forEach((detail) => {
                var _a, _b, _c;
                const hotelId = ((_a = detail === null || detail === void 0 ? void 0 : detail.hotel) === null || _a === void 0 ? void 0 : _a.hotelid) || (detail === null || detail === void 0 ? void 0 : detail.hotelid);
                const entry = curatedEntries.find((item) => String(item.hotelId) === String(hotelId));
                if (!entry)
                    return;
                const description = (detail === null || detail === void 0 ? void 0 : detail.description) || (detail === null || detail === void 0 ? void 0 : detail.areadetails) || '';
                entry.heroImageUrl = ((_c = (_b = detail === null || detail === void 0 ? void 0 : detail.images) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.url) || entry.heroImageUrl;
                entry.imageCount = Array.isArray(detail === null || detail === void 0 ? void 0 : detail.images) ? detail.images.length : entry.imageCount;
                entry.shortDescription = description ? description.slice(0, 220) : entry.shortDescription;
                entry.facilitiesCount = Array.isArray(detail === null || detail === void 0 ? void 0 : detail.facilities)
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
    const perCityCounts = {};
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
//# sourceMappingURL=curationSeeder.js.map