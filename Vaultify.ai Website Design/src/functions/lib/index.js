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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCurationSeed = exports.seedCuratedHotels = exports.warmWanderbedsCache = exports.healthPing = exports.healthCheck = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const wanderbedsApi_1 = require("./vendors/wanderbeds/wanderbedsApi");
const curationSeeder_1 = require("./vendors/wanderbeds/curationSeeder");
const hotellistStream_1 = require("./vendors/wanderbeds/hotellistStream");
// Initialize Firebase Admin
admin.initializeApp();
// Export all function modules
__exportStar(require("./auth"), exports);
__exportStar(require("./bookings"), exports);
__exportStar(require("./payments"), exports);
__exportStar(require("./alfred"), exports);
__exportStar(require("./emails"), exports);
__exportStar(require("./jetbayRoutes"), exports);
__exportStar(require("./apiGateway"), exports);
// Health check endpoint
exports.healthCheck = functions.https.onRequest((request, response) => {
    response.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.healthPing = functions
    .region('us-central1')
    .https.onCall(async (data) => ({
    ok: true,
    ts: Date.now(),
    region: 'us-central1',
    data,
}));
exports.warmWanderbedsCache = functions.pubsub
    .schedule('every 6 hours')
    .timeZone('UTC')
    .onRun(async () => {
    const countriesToWarm = ['US', 'AE', 'GB'];
    const timeoutMs = 25000;
    try {
        await (0, wanderbedsApi_1.getHotelList)({ timeoutMs, bypassCache: true, allowStale: false });
    }
    catch (err) {
        functions.logger.warn('warm_wanderbeds_hotellist_failed', {
            message: (err === null || err === void 0 ? void 0 : err.message) || 'Unknown error',
        });
    }
    const results = await Promise.allSettled(countriesToWarm.map((code) => (0, wanderbedsApi_1.getCities)(code, 100, { timeoutMs, bypassCache: true, allowStale: false })));
    results.forEach((result, index) => {
        var _a;
        if (result.status === 'rejected') {
            functions.logger.warn('warm_wanderbeds_cities_failed', {
                countryCode: countriesToWarm[index],
                message: ((_a = result.reason) === null || _a === void 0 ? void 0 : _a.message) || 'Unknown error',
            });
        }
    });
});
exports.seedCuratedHotels = functions.pubsub
    .schedule('every 6 hours')
    .timeZone('UTC')
    .onRun(async () => {
    const minEntries = 120;
    const collectionPath = 'vendors/wanderbeds/curation/hotels/items';
    const snapshot = await admin.firestore().collection(collectionPath).limit(minEntries).get();
    if (snapshot.size >= minEntries)
        return;
    try {
        const runRef = admin.firestore().collection('vendors/wanderbeds/curation/seedRuns/items').doc();
        const runId = runRef.id;
        const requestPayload = {
            mode: 'from_hotellist',
            filters: {
                countries: ['AE', 'US', 'CH', 'FR', 'GB', 'IT', 'ES'],
                cities: [
                    'Dubai',
                    'Abu Dhabi',
                    'Aspen',
                    'Miami',
                    'New York',
                    'London',
                    'Paris',
                    'St. Moritz',
                    'Zurich',
                    'Milan',
                    'Ibiza',
                ],
                minStars: 4,
            },
            limitPerCity: 30,
            limitTotal: 200,
            requireGeo: true,
            enrichDetails: true,
        };
        const now = admin.firestore.FieldValue.serverTimestamp();
        await runRef.set({
            status: 'queued',
            progress: {
                stage: 'queued',
                processed: 0,
                total: 0,
                perCityCounts: {},
            },
            request: requestPayload,
            createdAt: now,
            updatedAt: now,
        });
        await admin.firestore().collection('vendors/wanderbeds/curation/seedQueue/items').doc(runId).set({
            runId,
            payload: requestPayload,
            createdAt: now,
        });
    }
    catch (err) {
        functions.logger.warn('curation_seed_failed', { message: (err === null || err === void 0 ? void 0 : err.message) || 'unknown' });
    }
});
exports.processCurationSeed = functions
    .runWith({ timeoutSeconds: 540, memory: '1GB' })
    .firestore.document('vendors/wanderbeds/curation/seedQueue/items/{queueId}')
    .onCreate(async (snap, context) => {
    var _a, _b, _c;
    const payload = snap.data() || {};
    const runId = payload.runId || context.params.queueId;
    const runRef = admin.firestore().collection('vendors').doc('wanderbeds').collection('curation').doc('seedRuns').collection('runs').doc(String(runId));
    const collectionPath = 'vendors/wanderbeds/curation/hotels/items';
    const request = payload.payload || {};
    const startedAt = Date.now();
    const maxRuntimeMs = 8 * 60 * 1000;
    let loggedFirstWrite = false;
    // Check for fast_stream mode - support both nested payload.payload.mode and direct payload.mode
    const isFastStream = request.mode === 'fast_stream' || payload.mode === 'fast_stream';
    functions.logger.info('curation_seed_payload_check', {
        runId,
        hasPayload: !!payload.payload,
        requestMode: request.mode,
        payloadMode: payload.mode,
        isFastStream
    });
    const updateRun = async (data) => {
        await runRef.set(Object.assign(Object.assign({}, data), { updatedAt: admin.firestore.FieldValue.serverTimestamp(), lastProgressAt: admin.firestore.FieldValue.serverTimestamp() }), { merge: true });
    };
    const updateProgress = async (progress) => {
        await updateRun({
            progress,
            seededCount: progress.processed,
            stage: progress.stage,
        });
        if (progress.stage === 'filtered_hotellist') {
            functions.logger.info('curation_seed_hotellist_fetched', { runId, total: progress.total });
        }
        if (!loggedFirstWrite && progress.stage === 'writing_curated' && progress.processed > 0) {
            loggedFirstWrite = true;
            functions.logger.info('curation_seed_first_write', { runId, seeded: progress.processed });
        }
        if (progress.stage === 'writing_curated' && progress.processed >= 10) {
            functions.logger.info('curation_seed_batch_write', { runId, seeded: progress.processed });
        }
    };
    try {
        functions.logger.info('curation_seed_started', { runId });
        await updateRun({
            status: 'running',
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            progress: {
                stage: 'starting',
                processed: 0,
                total: 0,
                perCityCounts: {},
            },
        });
        functions.logger.info('curation_seed_fetching_hotellist', { runId, mode: isFastStream ? 'fast_stream' : 'legacy' });
        let result;
        if (isFastStream) {
            // Use streaming hotellist reader
            const streamResult = await (0, hotellistStream_1.streamHotellistToCurated)({
                seedCountries: request.seedCountries || ['AE', 'GB', 'US', 'CH', 'PT', 'FR', 'ES', 'IT'],
                perCountryLimit: request.perCountryLimit || 40,
                overallLimit: request.overallLimit || 250,
                hardTimeoutMs: 120000,
                collectionPath,
                onProgress: async (progress) => {
                    await updateRun({
                        progress: {
                            stage: progress.stage,
                            processed: progress.processed,
                            total: progress.processed,
                            perCityCounts: progress.perCountryCounts,
                        },
                        seededCount: progress.processed,
                        stage: progress.stage,
                    });
                    if (progress.stage === 'first_batch_committed' && !loggedFirstWrite) {
                        loggedFirstWrite = true;
                        functions.logger.info('curation_seed_first_write', { runId, seeded: progress.processed });
                    }
                },
            });
            result = {
                seeded: streamResult.seeded,
                perCityCounts: streamResult.perCountryCounts,
                inserted: streamResult.seeded,
                updated: 0,
            };
        }
        else {
            // Legacy buffered approach
            result = await (0, curationSeeder_1.seedFromHotellist)(collectionPath, {
                filters: {
                    countries: Array.isArray((_a = request.filters) === null || _a === void 0 ? void 0 : _a.countries) ? request.filters.countries : [],
                    cities: Array.isArray((_b = request.filters) === null || _b === void 0 ? void 0 : _b.cities) ? request.filters.cities : [],
                    minStars: Number(((_c = request.filters) === null || _c === void 0 ? void 0 : _c.minStars) || 0),
                },
                limitPerCity: Number(request.limitPerCity || 30),
                limitTotal: Number(request.limitTotal || 200),
                requireGeo: Boolean(request.requireGeo),
                enrichDetails: Boolean(request.enrichDetails),
                timeoutMs: 60000,
                maxRuntimeMs,
                onProgress: async (progress) => {
                    await updateProgress(progress);
                    if (Date.now() - startedAt > maxRuntimeMs) {
                        throw new Error('seed_timeout');
                    }
                },
            });
        }
        functions.logger.info('curation_seed_completed', { runId, seeded: result.seeded });
        await updateRun({
            status: 'done',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            seededCount: result.seeded,
            perCityCounts: result.perCityCounts,
            result,
            stage: 'done',
            lastError: null,
        });
    }
    catch (err) {
        functions.logger.error('curation_seed_failed', { runId, message: (err === null || err === void 0 ? void 0 : err.message) || 'Seed failed' });
        await updateRun({
            status: 'error',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            errorCode: (err === null || err === void 0 ? void 0 : err.code) || 'seed_error',
            errorMessage: (err === null || err === void 0 ? void 0 : err.message) || 'Seed failed',
            stage: 'error',
            lastError: {
                code: (err === null || err === void 0 ? void 0 : err.code) || 'seed_error',
                message: (err === null || err === void 0 ? void 0 : err.message) || 'Seed failed',
                upstreamStatus: (err === null || err === void 0 ? void 0 : err.upstreamStatus) || null,
                upstreamMs: (err === null || err === void 0 ? void 0 : err.upstreamMs) || null,
            },
        });
    }
    finally {
        await snap.ref.delete().catch(() => undefined);
    }
});
//# sourceMappingURL=index.js.map