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
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const express_1 = require("express");
const router = (0, express_1.Router)();
// Debounce: track last seed trigger time
let lastSeedTriggerMs = 0;
const SEED_DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes
async function checkAndTriggerFastSeed() {
    const now = Date.now();
    if (now - lastSeedTriggerMs < SEED_DEBOUNCE_MS) {
        return { triggered: false };
    }
    // Check if curated already has enough docs
    // Path structure: vendors/{wanderbeds}/curation/{hotels}/items/{hotelId}
    const curatedRef = admin.firestore().collection('vendors').doc('wanderbeds').collection('curation').doc('hotels').collection('items');
    const countSnapshot = await curatedRef.limit(80).get();
    if (countSnapshot.size >= 80) {
        return { triggered: false };
    }
    // Check if there's an active seed run (without orderBy to avoid index requirement)
    const seedRunsRef = admin.firestore().collection('vendors').doc('wanderbeds').collection('curation').doc('seedRuns').collection('runs');
    const activeRunsQueued = await seedRunsRef.where('status', '==', 'queued').limit(1).get();
    const activeRunsRunning = await seedRunsRef.where('status', '==', 'running').limit(1).get();
    const activeRuns = activeRunsQueued.size > 0 ? activeRunsQueued : activeRunsRunning;
    if (activeRuns.size > 0) {
        return { triggered: false, runId: activeRuns.docs[0].id };
    }
    // Trigger fast seed
    lastSeedTriggerMs = now;
    const runId = admin.firestore().collection('vendors').doc('wanderbeds').collection('curation').doc('seedRuns').collection('runs').doc().id;
    const runRef = admin.firestore().collection('vendors').doc('wanderbeds').collection('curation').doc('seedRuns').collection('runs').doc(runId);
    const nowTimestamp = admin.firestore.FieldValue.serverTimestamp();
    await runRef.set({
        status: 'queued',
        stage: 'queued',
        seededCount: 0,
        createdAt: nowTimestamp,
        updatedAt: nowTimestamp,
        mode: 'fast_stream',
    });
    // Queue the seed (for processCurationSeed trigger)
    // Path must match trigger: vendors/wanderbeds/curation/seedQueue/{queueId}
    await admin.firestore().collection('vendors').doc('wanderbeds').collection('curation').doc('seedQueue').collection('items').doc(runId).set({
        runId,
        payload: {
            mode: 'fast_stream',
            seedCountries: ['AE', 'GB', 'US', 'CH', 'PT', 'FR', 'ES', 'IT'],
            perCountryLimit: 40,
            overallLimit: 250,
        },
        createdAt: nowTimestamp,
    });
    return { triggered: true, runId };
}
// GET /hotels/curated
router.get('/hotels/curated', async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 50, 100);
        const startAfter = req.query.startAfter ? String(req.query.startAfter) : undefined;
        // Path: vendors/{wanderbeds}/curation/{hotels}/items/{hotelId}
        const curatedRef = admin.firestore().collection('vendors').doc('wanderbeds').collection('curation').doc('hotels').collection('items');
        let query = curatedRef.orderBy('country').orderBy(admin.firestore.FieldPath.documentId()).limit(limit);
        if (startAfter) {
            const startAfterDoc = await curatedRef.doc(startAfter).get();
            if (startAfterDoc.exists) {
                query = query.startAfter(startAfterDoc);
            }
        }
        const snapshot = await query.get();
        const hotels = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        // Check if seeding needed
        const curatedCountSnapshot = await curatedRef.count().get();
        const curatedCount = curatedCountSnapshot.data().count || 0;
        if (curatedCount === 0) {
            const seedResult = await checkAndTriggerFastSeed();
            if (seedResult.triggered) {
                return res.json({
                    hotels: [],
                    nextCursor: null,
                    seeding: true,
                    stage: 'seeding_started',
                    runId: seedResult.runId,
                    message: 'Preparing curated hotels',
                });
            }
            if (seedResult.runId) {
                // Existing seed running
                const runDoc = await admin.firestore().collection('vendors').doc('wanderbeds').collection('curation').doc('seedRuns').collection('runs').doc(seedResult.runId).get();
                const runData = runDoc.data();
                return res.json({
                    hotels: [],
                    nextCursor: null,
                    seeding: true,
                    stage: (runData === null || runData === void 0 ? void 0 : runData.stage) || 'running',
                    runId: seedResult.runId,
                    seededCount: (runData === null || runData === void 0 ? void 0 : runData.seededCount) || 0,
                    message: 'Preparing curated hotels',
                });
            }
            // No seed triggered, return empty
            return res.json({
                hotels: [],
                nextCursor: null,
                seeding: false,
            });
        }
        const nextCursor = hotels.length === limit && snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
        return res.json({
            hotels,
            nextCursor,
            seeding: false,
        });
    }
    catch (err) {
        functions.logger.error('[hotels/curated] error', { error: err === null || err === void 0 ? void 0 : err.message });
        return res.status(500).json({
            hotels: [],
            nextCursor: null,
            seeding: false,
            error: (err === null || err === void 0 ? void 0 : err.message) || 'Internal server error',
        });
    }
});
// GET /hotels/curated/debug
router.get('/hotels/curated/debug', async (req, res) => {
    var _a, _b, _c;
    try {
        // Path: vendors/{wanderbeds}/curation/{hotels}/items/{hotelId}
        const curatedRef = admin.firestore().collection('vendors').doc('wanderbeds').collection('curation').doc('hotels').collection('items');
        const curatedCount = await curatedRef.count().get();
        // Get latest seed run
        const seedRunsRef = admin.firestore().collection('vendors').doc('wanderbeds').collection('curation').doc('seedRuns').collection('runs');
        const latestRun = await seedRunsRef.orderBy(admin.firestore.FieldPath.documentId()).limit(1).get().catch(() => {
            // Fallback if no orderBy index
            return seedRunsRef.limit(1).get();
        });
        let latestSeed = null;
        if (latestRun.size > 0) {
            const runDoc = latestRun.docs[0];
            const runData = runDoc.data();
            latestSeed = {
                status: runData.status || 'unknown',
                seededCount: runData.seededCount || 0,
                stage: runData.stage || 'unknown',
                updatedAt: ((_c = (_b = (_a = runData.updatedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString()) || null,
                lastError: runData.lastError || null,
            };
        }
        return res.json({
            curatedCount: curatedCount.data().count,
            latestSeed,
        });
    }
    catch (err) {
        functions.logger.error('[hotels/curated/debug] error', { error: err === null || err === void 0 ? void 0 : err.message });
        return res.status(500).json({
            curatedCount: 0,
            latestSeed: null,
            error: (err === null || err === void 0 ? void 0 : err.message) || 'Internal server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=wanderbedsCuratedRoutes.js.map