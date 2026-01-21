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
exports.streamHotellistToCurated = streamHotellistToCurated;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const zlib = __importStar(require("zlib"));
const https = __importStar(require("https"));
// @ts-ignore - stream-json types may not be available
const stream_json_1 = require("stream-json");
// @ts-ignore
const stream_chain_1 = require("stream-chain");
const wanderbedsConfig_1 = require("./wanderbedsConfig");
function buildBasicAuth(username, password) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return `Basic ${token}`;
}
function mapHotelToCanonical(raw) {
    var _a, _b, _c, _d, _f;
    return {
        hotelId: String((_a = raw.hotelid) !== null && _a !== void 0 ? _a : ''),
        name: String((_b = raw.name) !== null && _b !== void 0 ? _b : ''),
        city: String((_c = raw.city) !== null && _c !== void 0 ? _c : ''),
        cityId: raw.cityid != null ? String(raw.cityid) : undefined,
        country: String((_d = raw.country) !== null && _d !== void 0 ? _d : '').toUpperCase(),
        starRating: raw.starrating != null ? Number(raw.starrating) : 0,
        address: String((_f = raw.address) !== null && _f !== void 0 ? _f : ''),
        lat: raw.lat != null ? Number(raw.lat) : undefined,
        lng: raw.lng != null ? Number(raw.lng) : undefined,
        giata: raw.giata ? String(raw.giata) : undefined,
        heroImageUrl: '',
        source: 'hotellist_stream_seed',
        seededAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
}
function shouldKeepHotel(hotel, seedCountries, perCountryCounts, perCountryLimit, overallLimit, processed) {
    var _a;
    const country = (_a = hotel.country) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    if (!country || !seedCountries.has(country))
        return false;
    if (perCountryCounts[country] >= perCountryLimit)
        return false;
    if (processed >= overallLimit)
        return false;
    if (!hotel.hotelId || String(hotel.hotelId).trim().length === 0)
        return false;
    return true;
}
async function streamHotellistToCurated(options = {}) {
    var _a, _b, _c;
    const startMs = Date.now();
    const cfg = (0, wanderbedsConfig_1.loadWanderbedsConfig)();
    const seedCountries = new Set((options.seedCountries || ['AE', 'GB', 'US', 'CH', 'PT', 'FR', 'ES', 'IT']).map((c) => c.toUpperCase()));
    const perCountryLimit = (_a = options.perCountryLimit) !== null && _a !== void 0 ? _a : 40;
    const overallLimit = (_b = options.overallLimit) !== null && _b !== void 0 ? _b : 250;
    const hardTimeoutMs = (_c = options.hardTimeoutMs) !== null && _c !== void 0 ? _c : 120000;
    // Default to: vendors/{wanderbeds}/curation/{hotels}/items
    // If collectionPath is provided as string, parse it; otherwise use builder
    const collectionPathStr = options.collectionPath || 'vendors/wanderbeds/curation/hotels/items';
    const onProgress = options.onProgress || (() => { });
    // Parse collection path string to Firestore builder pattern
    // Format: "vendors/wanderbeds/curation/hotels/items" (even segments = collection)
    let collectionRef;
    const parts = collectionPathStr.split('/');
    if (parts.length >= 2 && parts.length % 2 === 0) {
        collectionRef = admin.firestore().collection(parts[0]);
        for (let i = 1; i < parts.length - 1; i += 2) {
            collectionRef = collectionRef.doc(parts[i]).collection(parts[i + 1]);
        }
    }
    else {
        // Fallback (may fail)
        collectionRef = admin.firestore().collection(collectionPathStr);
    }
    const perCountryCounts = {};
    let processed = 0;
    let abortedEarly = false;
    let firstBatchCommittedAt;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
        abortedEarly = true;
        abortController.abort();
    }, hardTimeoutMs);
    try {
        await onProgress({ stage: 'connecting', processed: 0, perCountryCounts });
        const url = new URL('/staticdata/hotellist', cfg.baseUrl);
        const authHeader = buildBasicAuth(cfg.username, cfg.password);
        // Use native https for streaming (Node 18+ supports AbortController)
        const requestOptions = {
            method: 'GET',
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            headers: {
                Accept: 'application/json',
                // Don't request compression - let the server decide
                // If server sends compressed, we'll detect it from content-encoding header
                Authorization: authHeader,
                'User-Agent': 'Vaultfy-Functions/1.0',
            },
            signal: abortController.signal, // Node 18+ supports AbortSignal
        };
        await onProgress({ stage: 'streaming', processed: 0, perCountryCounts });
        const response = await new Promise((resolve, reject) => {
            const req = https.request(requestOptions, (res) => {
                resolve(res);
            });
            req.on('error', reject);
            req.end();
        });
        if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
            throw new Error(`Wanderbeds returned ${response.statusCode}: ${response.statusMessage}`);
        }
        // Handle deflate decompression
        // Note: "deflate" in HTTP can mean either raw deflate OR zlib-wrapped deflate
        // Node.js createInflate() expects raw deflate, createInflateRaw() also expects raw
        // If it fails, we'll catch the error and try without decompression
        let stream = response;
        const contentEncoding = (response.headers['content-encoding'] || '').toLowerCase();
        functions.logger.info('[hotellistStream] Response headers', {
            'content-encoding': contentEncoding,
            'content-type': response.headers['content-type'],
            statusCode: response.statusCode
        });
        // Handle compression based on content-encoding header
        if (contentEncoding === 'deflate' || contentEncoding.includes('deflate')) {
            // Try raw deflate decompression
            // If it fails (Z_DATA_ERROR), the data might be uncompressed or zlib-wrapped
            const inflateStream = zlib.createInflate({ chunkSize: 64 * 1024 });
            inflateStream.on('error', (err) => {
                functions.logger.error('[hotellistStream] Deflate decompression error', {
                    error: err.message,
                    code: err.code,
                    name: err.name
                });
                // Don't destroy the stream here - let the pipeline handle it
            });
            stream = response.pipe(inflateStream);
            functions.logger.info('[hotellistStream] Attempting deflate decompression (raw)');
            // If decompression fails, we'll catch it in the pipeline error handler
        }
        else if (contentEncoding === 'gzip' || contentEncoding.includes('gzip')) {
            const gunzipStream = zlib.createGunzip();
            gunzipStream.on('error', (err) => {
                functions.logger.error('[hotellistStream] Gzip decompression error', { error: err.message });
            });
            stream = response.pipe(gunzipStream);
            functions.logger.info('[hotellistStream] Applied gzip decompression');
        }
        else {
            functions.logger.info('[hotellistStream] No compression header, using raw stream');
        }
        // Stream JSON parsing pipeline
        // Response structure: { "hotels": [...] }
        // Manually parse tokens to extract hotel objects from the hotels array
        const { Transform } = require('stream');
        let waitingForHotelsKey = true;
        let inHotelsArray = false;
        let currentArrayDepth = 0;
        let currentObject = null;
        let currentKey = null;
        let hotelIndex = 0;
        const hotelExtractor = new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                if (!chunk || typeof chunk !== 'object') {
                    callback();
                    return;
                }
                // Wait for "hotels" key
                if (waitingForHotelsKey && chunk.name === 'keyValue' && chunk.value === 'hotels') {
                    waitingForHotelsKey = false;
                    functions.logger.info('[hotellistStream] Found hotels key');
                    callback();
                    return;
                }
                // After hotels key, wait for array start
                if (!waitingForHotelsKey && !inHotelsArray && chunk.name === 'startArray') {
                    inHotelsArray = true;
                    currentArrayDepth = 1;
                    functions.logger.info('[hotellistStream] Entering hotels array');
                    callback();
                    return;
                }
                // Inside hotels array: parse hotel objects
                if (inHotelsArray) {
                    if (chunk.name === 'startObject') {
                        currentObject = {};
                        currentArrayDepth += 1;
                    }
                    else if (chunk.name === 'keyValue') {
                        currentKey = chunk.value;
                    }
                    else if (chunk.name === 'stringValue' || chunk.name === 'numberValue') {
                        if (currentKey && currentObject) {
                            currentObject[currentKey] = chunk.value;
                        }
                        currentKey = null;
                    }
                    else if (chunk.name === 'endObject') {
                        currentArrayDepth -= 1;
                        if (currentArrayDepth === 1 && currentObject) {
                            // Complete hotel object - emit it
                            this.push({ value: currentObject, key: hotelIndex++ });
                            currentObject = null;
                        }
                    }
                    else if (chunk.name === 'endArray') {
                        currentArrayDepth -= 1;
                        if (currentArrayDepth === 0) {
                            inHotelsArray = false;
                            functions.logger.info('[hotellistStream] Exited hotels array');
                        }
                    }
                }
                callback();
            }
        });
        const pipeline = (0, stream_chain_1.chain)([
            stream,
            (0, stream_json_1.parser)(),
            hotelExtractor,
        ]);
        // collectionRef is already set above from parsed path
        const batchLimit = 20; // Smaller batches for early commits
        let currentBatch = null;
        let batchOps = 0;
        const pendingHotels = [];
        let pipelineDestroyed = false;
        await new Promise((resolve, reject) => {
            let hotelDataCount = 0;
            let resolved = false;
            const startStreamMs = Date.now();
            let safetyTimeout = null;
            const doResolve = () => {
                if (resolved)
                    return;
                resolved = true;
                if (safetyTimeout)
                    clearTimeout(safetyTimeout);
                resolve();
            };
            // Set a safety timeout to ensure we don't hang forever
            safetyTimeout = setTimeout(() => {
                if (!resolved && !pipelineDestroyed) {
                    functions.logger.warn('[hotellistStream] Safety timeout reached', { hotelDataCount, processed, ms: Date.now() - startStreamMs });
                    pipelineDestroyed = true;
                    try {
                        pipeline.destroy();
                    }
                    catch (_e) { }
                    doResolve(); // Resolve instead of reject to avoid hanging
                }
            }, hardTimeoutMs - 1000); // 1s before hard timeout
            pipeline.on('data', async (data) => {
                hotelDataCount += 1;
                if (hotelDataCount === 1) {
                    functions.logger.info('[hotellistStream] First hotel data received', {
                        ms: Date.now() - startStreamMs,
                        hasValue: !!data.value
                    });
                }
                if (hotelDataCount % 100 === 0) {
                    functions.logger.info('[hotellistStream] Processing hotel', {
                        hotelDataCount,
                        processed,
                        ms: Date.now() - startStreamMs
                    });
                }
                if (abortedEarly || processed >= overallLimit || pipelineDestroyed) {
                    if (!pipelineDestroyed) {
                        pipelineDestroyed = true;
                        functions.logger.info('[hotellistStream] Aborting pipeline', { processed, overallLimit, abortedEarly });
                        try {
                            pipeline.destroy();
                        }
                        catch (_e) { }
                    }
                    doResolve();
                    return;
                }
                try {
                    const rawHotel = data.value;
                    if (!rawHotel || typeof rawHotel !== 'object') {
                        return; // Skip invalid hotel data
                    }
                    const hotel = mapHotelToCanonical(rawHotel);
                    if (!shouldKeepHotel(hotel, seedCountries, perCountryCounts, perCountryLimit, overallLimit, processed)) {
                        return;
                    }
                    pendingHotels.push(hotel);
                    perCountryCounts[hotel.country] = (perCountryCounts[hotel.country] || 0) + 1;
                    processed += 1;
                    // Commit first batch ASAP (after batchLimit hotels)
                    if (processed === batchLimit && !firstBatchCommittedAt) {
                        const firstBatch = admin.firestore().batch();
                        pendingHotels.forEach((h) => {
                            const docRef = collectionRef.doc(String(h.hotelId));
                            firstBatch.set(docRef, h, { merge: true });
                        });
                        await firstBatch.commit();
                        firstBatchCommittedAt = Date.now() - startMs;
                        await onProgress({ stage: 'first_batch_committed', processed, perCountryCounts });
                        pendingHotels.length = 0;
                    }
                    else if (pendingHotels.length >= batchLimit) {
                        // Regular batching
                        if (!currentBatch) {
                            currentBatch = admin.firestore().batch();
                            batchOps = 0;
                        }
                        pendingHotels.forEach((h) => {
                            const docRef = collectionRef.doc(String(h.hotelId));
                            currentBatch.set(docRef, h, { merge: true });
                            batchOps += 1;
                        });
                        if (batchOps >= 450) {
                            await currentBatch.commit();
                            await onProgress({ stage: 'batch_committed', processed, perCountryCounts });
                            currentBatch = null;
                            batchOps = 0;
                        }
                        pendingHotels.length = 0;
                    }
                    if (processed >= overallLimit) {
                        abortedEarly = true;
                        if (!pipelineDestroyed) {
                            pipelineDestroyed = true;
                            try {
                                pipeline.destroy();
                            }
                            catch (_e) { }
                        }
                        doResolve();
                    }
                }
                catch (err) {
                    // Continue processing on individual hotel errors
                    functions.logger.warn('[hotellistStream] hotel processing error', { error: err === null || err === void 0 ? void 0 : err.message });
                }
            });
            pipeline.on('end', () => {
                functions.logger.info('[hotellistStream] Pipeline ended', { hotelDataCount, processed, ms: Date.now() - startStreamMs });
                doResolve();
            });
            pipeline.on('error', (err) => {
                const errCode = err.code;
                functions.logger.error('[hotellistStream] Pipeline error', {
                    error: err.message,
                    name: err.name,
                    code: errCode,
                    hotelDataCount,
                    processed,
                    ms: Date.now() - startStreamMs
                });
                // Handle decompression errors - try without decompression
                if (errCode === 'Z_DATA_ERROR' || errCode === 'Z_BUF_ERROR' || err.message.includes('incorrect header check')) {
                    functions.logger.warn('[hotellistStream] Decompression failed, retrying without decompression', {
                        contentEncoding,
                        error: err.message
                    });
                    // Retry the request without decompression
                    // This is a fallback - we'll need to restart the stream
                    // For now, reject with a clear error message
                    resolved = true;
                    if (safetyTimeout)
                        clearTimeout(safetyTimeout);
                    reject(new Error(`Decompression failed (${errCode}): ${err.message}. The response may not be compressed or uses a different format.`));
                    return;
                }
                if (err.name === 'AbortError' || resolved) {
                    doResolve(); // Expected on timeout or already resolved
                }
                else {
                    resolved = true;
                    if (safetyTimeout)
                        clearTimeout(safetyTimeout);
                    reject(err);
                }
            });
        });
        // Commit any remaining hotels
        const remainingHotels = [...pendingHotels];
        if (currentBatch && batchOps > 0) {
            await currentBatch.commit();
        }
        if (remainingHotels.length > 0) {
            const finalBatch = admin.firestore().batch();
            remainingHotels.forEach((h) => {
                const docRef = collectionRef.doc(String(h.hotelId));
                finalBatch.set(docRef, h, { merge: true });
            });
            await finalBatch.commit();
        }
        clearTimeout(timeoutId);
        await onProgress({ stage: 'done', processed, perCountryCounts });
        return {
            seeded: processed,
            perCountryCounts,
            ms: Date.now() - startMs,
            abortedEarly,
            firstBatchCommittedAt,
        };
    }
    catch (err) {
        clearTimeout(timeoutId);
        const errCode = err === null || err === void 0 ? void 0 : err.code;
        const errMessage = (err === null || err === void 0 ? void 0 : err.message) || String(err);
        // Log the error with context
        functions.logger.error('[hotellistStream] streamHotellistToCurated failed', {
            error: errMessage,
            code: errCode,
            name: err === null || err === void 0 ? void 0 : err.name,
            processed,
            ms: Date.now() - startMs
        });
        if (err.name === 'AbortError' || abortedEarly) {
            return {
                seeded: processed,
                perCountryCounts,
                ms: Date.now() - startMs,
                abortedEarly: true,
                firstBatchCommittedAt,
            };
        }
        // Re-throw with more context for upstream error handling
        const enhancedError = new Error(`Hotellist streaming failed: ${errMessage} (code: ${errCode || 'unknown'})`);
        enhancedError.code = errCode;
        enhancedError.originalError = err;
        throw enhancedError;
    }
    finally {
        abortController.abort();
    }
}
//# sourceMappingURL=hotellistStream.js.map