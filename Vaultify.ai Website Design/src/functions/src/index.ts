import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getCities, getHotelList } from './vendors/wanderbeds/wanderbedsApi';
import { seedFromHotellist, type SeedProgress } from './vendors/wanderbeds/curationSeeder';
import { streamHotellistToCurated } from './vendors/wanderbeds/hotellistStream';

// Initialize Firebase Admin
admin.initializeApp();

// Export all function modules
export * from './auth';
export * from './bookings';
export * from './payments';
export * from './alfred';
export * from './emails';
export * from './jetbayRoutes';
export * from './apiGateway';

// Health check endpoint
export const healthCheck = functions.https.onRequest((request, response) => {
  response.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export const healthPing = functions
  .region('us-central1')
  .https.onCall(async (data) => ({
    ok: true,
    ts: Date.now(),
    region: 'us-central1',
    data,
  }));

export const warmWanderbedsCache = functions.pubsub
  .schedule('every 6 hours')
  .timeZone('UTC')
  .onRun(async () => {
    const countriesToWarm = ['US', 'AE', 'GB'];
    const timeoutMs = 25000;
    try {
      await getHotelList({ timeoutMs, bypassCache: true, allowStale: false });
    } catch (err: any) {
      functions.logger.warn('warm_wanderbeds_hotellist_failed', {
        message: err?.message || 'Unknown error',
      });
    }

    const results = await Promise.allSettled(
      countriesToWarm.map((code) => getCities(code, 100, { timeoutMs, bypassCache: true, allowStale: false })),
    );
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        functions.logger.warn('warm_wanderbeds_cities_failed', {
          countryCode: countriesToWarm[index],
          message: (result.reason as any)?.message || 'Unknown error',
        });
      }
    });
  });

export const seedCuratedHotels = functions.pubsub
  .schedule('every 6 hours')
  .timeZone('UTC')
  .onRun(async () => {
    const minEntries = 120;
    const collectionPath = 'vendors/wanderbeds/curation/hotels/items';
    const snapshot = await admin.firestore().collection(collectionPath).limit(minEntries).get();
    if (snapshot.size >= minEntries) return;

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
    } catch (err: any) {
      functions.logger.warn('curation_seed_failed', { message: err?.message || 'unknown' });
    }
  });

export const processCurationSeed = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .firestore.document('vendors/wanderbeds/curation/seedQueue/items/{queueId}')
  .onCreate(async (snap, context) => {
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

    const updateRun = async (data: Record<string, any>) => {
      await runRef.set(
        {
          ...data,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastProgressAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    };

    const updateProgress = async (progress: SeedProgress) => {
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

      let result: any;
      if (isFastStream) {
        // Use streaming hotellist reader
        const streamResult = await streamHotellistToCurated({
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
      } else {
        // Legacy buffered approach
        result = await seedFromHotellist(collectionPath, {
          filters: {
            countries: Array.isArray(request.filters?.countries) ? request.filters.countries : [],
            cities: Array.isArray(request.filters?.cities) ? request.filters.cities : [],
            minStars: Number(request.filters?.minStars || 0),
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
    } catch (err: any) {
      functions.logger.error('curation_seed_failed', { runId, message: err?.message || 'Seed failed' });
      await updateRun({
        status: 'error',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        errorCode: err?.code || 'seed_error',
        errorMessage: err?.message || 'Seed failed',
        stage: 'error',
        lastError: {
          code: err?.code || 'seed_error',
          message: err?.message || 'Seed failed',
          upstreamStatus: err?.upstreamStatus || null,
          upstreamMs: err?.upstreamMs || null,
        },
      });
    } finally {
      await snap.ref.delete().catch(() => undefined);
    }
  });
