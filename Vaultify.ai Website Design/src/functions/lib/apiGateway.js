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
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const https = __importStar(require("https"));
const zlib = __importStar(require("zlib"));
const crypto = __importStar(require("crypto"));
const wanderbedsApi_1 = require("./vendors/wanderbeds/wanderbedsApi");
const wanderbedsHttp_1 = require("./vendors/wanderbeds/wanderbedsHttp");
const wanderbedsConfig_1 = require("./vendors/wanderbeds/wanderbedsConfig");
const allowedOrigins = (process.env.CORS_ORIGINS ||
    'http://localhost:4173,http://localhost:3000,https://vaultfy-biyycsclj-jay-zyonstudios-projects.vercel.app')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
const app = (0, express_1.default)();
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Debug: Test route
app.get('/wanderbeds/test', (req, res) => {
    return res.json({ ok: true, message: 'Wanderbeds routes are working' });
});
// Test endpoint for Wanderbeds search (for debugging)
app.post('/wanderbeds/test-search', async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { hotels, checkin, checkout, rooms, nationality } = req.body;
        if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
            return res.status(400).json({
                ok: false,
                error: 'hotels array required'
            });
        }
        if (!checkin || !checkout) {
            return res.status(400).json({
                ok: false,
                error: 'checkin and checkout dates required (YYYY-MM-DD)'
            });
        }
        const hotelIds = hotels.map((id) => {
            const num = typeof id === 'string' ? parseInt(id, 10) : id;
            return isNaN(num) ? id : num;
        });
        functions.logger.info('[wanderbeds/test-search] Test search', {
            hotels: hotelIds,
            checkin,
            checkout,
            rooms,
            nationality,
        });
        // Test 1: Numeric IDs
        const result1 = await (0, wanderbedsApi_1.searchHotels)({
            hotels: hotelIds,
            checkin,
            checkout,
            rooms: rooms || [{ adt: 1 }],
            nationality: nationality || 'FR',
            timout: '20',
        }, { timeoutMs: 30000 });
        const response = {
            ok: true,
            tests: {
                numericIds: {
                    hotels: hotelIds,
                    result: {
                        count: result1 === null || result1 === void 0 ? void 0 : result1.count,
                        hotelsCount: ((_a = result1 === null || result1 === void 0 ? void 0 : result1.hotels) === null || _a === void 0 ? void 0 : _a.length) || 0,
                        hasError: !!(result1 === null || result1 === void 0 ? void 0 : result1.error),
                        errorCode: (_b = result1 === null || result1 === void 0 ? void 0 : result1.error) === null || _b === void 0 ? void 0 : _b.code,
                        errorMessage: (_c = result1 === null || result1 === void 0 ? void 0 : result1.error) === null || _c === void 0 ? void 0 : _c.message,
                        token: (result1 === null || result1 === void 0 ? void 0 : result1.token) ? 'present' : 'missing',
                    },
                },
            },
        };
        // Test 2: String IDs (if numeric failed)
        if (((_d = result1 === null || result1 === void 0 ? void 0 : result1.error) === null || _d === void 0 ? void 0 : _d.code) === 100 || (result1 === null || result1 === void 0 ? void 0 : result1.count) === 0) {
            functions.logger.info('[wanderbeds/test-search] Testing string IDs');
            const result2 = await (0, wanderbedsApi_1.searchHotels)({
                hotels: hotelIds.map((id) => String(id)),
                checkin,
                checkout,
                rooms: rooms || [{ adt: 1 }],
                nationality: nationality || 'FR',
                timout: '20',
            }, { timeoutMs: 30000 });
            response.tests.stringIds = {
                hotels: hotelIds.map((id) => String(id)),
                result: {
                    count: result2 === null || result2 === void 0 ? void 0 : result2.count,
                    hotelsCount: ((_e = result2 === null || result2 === void 0 ? void 0 : result2.hotels) === null || _e === void 0 ? void 0 : _e.length) || 0,
                    hasError: !!(result2 === null || result2 === void 0 ? void 0 : result2.error),
                    errorCode: (_f = result2 === null || result2 === void 0 ? void 0 : result2.error) === null || _f === void 0 ? void 0 : _f.code,
                    errorMessage: (_g = result2 === null || result2 === void 0 ? void 0 : result2.error) === null || _g === void 0 ? void 0 : _g.message,
                    token: (result2 === null || result2 === void 0 ? void 0 : result2.token) ? 'present' : 'missing',
                },
            };
        }
        return res.json(response);
    }
    catch (err) {
        functions.logger.error('[wanderbeds/test-search] error', { error: err === null || err === void 0 ? void 0 : err.message });
        return res.status(500).json({
            ok: false,
            error: (err === null || err === void 0 ? void 0 : err.message) || 'Test search failed'
        });
    }
});
// POST /wanderbeds/search - Search hotels with dates and get pricing/rooms (must be before curated routes)
// Per Wanderbeds docs: Search.txt
app.post('/wanderbeds/search', async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const correlationId = crypto.randomUUID();
    const startMs = Date.now();
    functions.logger.info('[wanderbeds/search] Route hit', {
        correlationId,
        method: req.method,
        path: req.path,
        body: Object.assign(Object.assign({}, req.body), { rooms: req.body.rooms ? `[${req.body.rooms.length} room(s)]` : 'missing' }), // Don't log full rooms array
    });
    try {
        const { hotels, checkin, checkout, rooms, nationality, timout } = req.body;
        if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
            return res.status(400).json({
                error: 'invalid_request',
                message: 'Request body must include a "hotels" array with at least one hotel ID'
            });
        }
        if (!checkin || !checkout) {
            return res.status(400).json({
                error: 'invalid_request',
                message: 'Request body must include "checkin" and "checkout" dates (YYYY-MM-DD)'
            });
        }
        if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
            return res.status(400).json({
                error: 'invalid_request',
                message: 'Request body must include a "rooms" array with at least one room specification'
            });
        }
        if (!nationality) {
            return res.status(400).json({
                error: 'invalid_request',
                message: 'Request body must include "nationality" (ISO 2-letter country code)'
            });
        }
        // Validate hotel IDs are numbers
        // Note: Keep as numbers (not strings) as Wanderbeds API expects numeric IDs
        const hotelIds = hotels.map((id) => {
            const num = typeof id === 'string' ? parseInt(id, 10) : id;
            if (isNaN(num)) {
                throw new Error(`Invalid hotel ID: ${id}`);
            }
            return num;
        });
        // Log request details with correlation ID
        functions.logger.info('[wanderbeds/search] Searching hotels', {
            correlationId,
            hotelCount: hotelIds.length,
            hotelIds: hotelIds.slice(0, 5),
            checkin,
            checkout,
            roomCount: rooms.length,
            nationality,
            timout: timout || '20',
        });
        const nationalityRequested = String(nationality || '').toUpperCase();
        // Nationality sweep debug mode (ONLY when enabled)
        // Check both Firebase Functions config and environment variable
        const functionsConfig = functions.config();
        const sweepEnabled = ((_a = functionsConfig === null || functionsConfig === void 0 ? void 0 : functionsConfig.wanderbeds) === null || _a === void 0 ? void 0 : _a.debug_nationality_sweep) === 'true' ||
            process.env.WANDERBEDS_DEBUG_NATIONALITY_SWEEP === 'true';
        const sweepOrder = [nationalityRequested, 'GB', 'US', 'PH'].filter(Boolean);
        const fallbackTried = [];
        let nationalityUsed = nationalityRequested;
        let fallbackHit = false;
        // Try search (and optionally sweep) until we get hotels/count > 0
        // Rooms will be normalized by searchHotels() to include chd and age per docs
        let result = null;
        const debugAttempts = [];
        for (const natAttempt of (sweepEnabled ? sweepOrder : [nationalityRequested])) {
            fallbackTried.push(natAttempt);
            const attemptStart = Date.now();
            functions.logger.info('[wanderbeds/search] Upstream attempt', {
                correlationId,
                hotelIds: hotelIds.slice(0, 5),
                checkin,
                checkout,
                nationalityAttempt: natAttempt,
                rooms,
            });
            result = await (0, wanderbedsApi_1.searchHotels)({
                hotels: hotelIds,
                checkin,
                checkout,
                rooms,
                nationality: natAttempt,
                timout: timout || '20',
                __correlationId: correlationId,
            }, { timeoutMs: 30000 });
            const attemptMs = Date.now() - attemptStart;
            const upstream = result === null || result === void 0 ? void 0 : result.__upstream;
            const upstreamErrorCode = (_b = result === null || result === void 0 ? void 0 : result.error) === null || _b === void 0 ? void 0 : _b.code;
            const upstreamErrorMessage = (_c = result === null || result === void 0 ? void 0 : result.error) === null || _c === void 0 ? void 0 : _c.message;
            const upstreamHttpStatus = (_d = upstream === null || upstream === void 0 ? void 0 : upstream.upstreamHttpStatus) !== null && _d !== void 0 ? _d : 0;
            // Record attempt diagnostics
            debugAttempts.push({
                nationality: natAttempt,
                upstreamHttpStatus,
                errorCode: upstreamErrorCode,
                errorMessage: upstreamErrorMessage,
                count: (_e = result === null || result === void 0 ? void 0 : result.count) !== null && _e !== void 0 ? _e : 0,
                hotelsLen: Array.isArray(result === null || result === void 0 ? void 0 : result.hotels) ? result.hotels.length : 0,
                ms: attemptMs,
            });
            functions.logger.info('[wanderbeds/search] Upstream attempt result', {
                correlationId,
                nationalityAttempt: natAttempt,
                upstreamHttpStatus,
                upstreamErrorCode,
                upstreamErrorMessage,
                count: result === null || result === void 0 ? void 0 : result.count,
                hotelsLen: Array.isArray(result === null || result === void 0 ? void 0 : result.hotels) ? result.hotels.length : 0,
                ms: attemptMs,
            });
            const hasHotels = (result && !result.error && (result.count > 0 || (Array.isArray(result.hotels) && result.hotels.length > 0)));
            const isNoResults = (upstreamErrorCode === 100) || ((result === null || result === void 0 ? void 0 : result.count) === 0 && (!(result === null || result === void 0 ? void 0 : result.hotels) || result.hotels.length === 0));
            if (hasHotels) {
                nationalityUsed = natAttempt;
                fallbackHit = natAttempt !== nationalityRequested;
                break;
            }
            // Stop sweeping if it's not a pure "no results" case
            if (!isNoResults) {
                nationalityUsed = natAttempt;
                break;
            }
        }
        const ms = Date.now() - startMs;
        functions.logger.info('[wanderbeds/search] Search result', {
            correlationId,
            hasResult: !!result,
            hotelCount: ((_f = result === null || result === void 0 ? void 0 : result.hotels) === null || _f === void 0 ? void 0 : _f.length) || 0,
            token: (result === null || result === void 0 ? void 0 : result.token) ? 'present' : 'missing',
            count: result === null || result === void 0 ? void 0 : result.count,
            hasError: !!(result === null || result === void 0 ? void 0 : result.error),
            errorCode: (_g = result === null || result === void 0 ? void 0 : result.error) === null || _g === void 0 ? void 0 : _g.code,
            errorMessage: (_h = result === null || result === void 0 ? void 0 : result.error) === null || _h === void 0 ? void 0 : _h.message,
            ms,
            upstreamStatus: '200', // Wanderbeds returns 200 even with error.code=100
        });
        // Handle "No results" case (error code 100) - per docs, this is a valid response, not an error
        if (((_j = result === null || result === void 0 ? void 0 : result.error) === null || _j === void 0 ? void 0 : _j.code) === 100 || ((result === null || result === void 0 ? void 0 : result.count) === 0 && (!(result === null || result === void 0 ? void 0 : result.hotels) || result.hotels.length === 0))) {
            functions.logger.info('[wanderbeds/search] No results available', {
                correlationId,
                errorCode: (_k = result === null || result === void 0 ? void 0 : result.error) === null || _k === void 0 ? void 0 : _k.code,
                errorMessage: (_l = result === null || result === void 0 ? void 0 : result.error) === null || _l === void 0 ? void 0 : _l.message,
                nationalityRequested,
                nationalityUsed,
                fallbackTried,
                fallbackHit,
                sweepEnabled,
            });
            return res.json({
                ok: true,
                data: Object.assign(Object.assign({}, result), { hotels: [], count: 0 }),
                meta: {
                    source: 'wanderbeds',
                    correlationId,
                    ms,
                    nationalityRequested,
                    nationalityUsed,
                    fallbackTried,
                    fallbackHit,
                },
                debug: (() => {
                    const lastUpstream = result === null || result === void 0 ? void 0 : result.__upstream;
                    if (!lastUpstream)
                        return null;
                    return Object.assign({ requestSentToUpstream: lastUpstream.requestSentToUpstream, headersSentToUpstream: lastUpstream.headersSentToUpstream, upstreamHttpStatus: lastUpstream.upstreamHttpStatus, upstreamHeaders: lastUpstream.upstreamHeaders, upstreamBodyRawText: lastUpstream.upstreamBodyRawText, parsedBody: lastUpstream.parsedBody }, (sweepEnabled && debugAttempts.length > 0 ? { attempts: debugAttempts } : {}));
                })(),
                error: null,
            });
        }
        functions.logger.info('[wanderbeds/search] Success', {
            correlationId,
            hotelCount: ((_m = result === null || result === void 0 ? void 0 : result.hotels) === null || _m === void 0 ? void 0 : _m.length) || 0,
            ms,
        });
        return res.json({
            ok: true,
            data: result,
            meta: {
                source: 'wanderbeds',
                correlationId,
                ms,
                nationalityRequested,
                nationalityUsed,
                fallbackTried,
                fallbackHit,
            },
            debug: (() => {
                const lastUpstream = result === null || result === void 0 ? void 0 : result.__upstream;
                if (!lastUpstream)
                    return null;
                return Object.assign({ requestSentToUpstream: lastUpstream.requestSentToUpstream, headersSentToUpstream: lastUpstream.headersSentToUpstream, upstreamHttpStatus: lastUpstream.upstreamHttpStatus, upstreamHeaders: lastUpstream.upstreamHeaders, upstreamBodyRawText: lastUpstream.upstreamBodyRawText, parsedBody: lastUpstream.parsedBody }, (sweepEnabled && debugAttempts.length > 0 ? { attempts: debugAttempts } : {}));
            })(),
            error: null,
        });
    }
    catch (err) {
        const ms = Date.now() - startMs;
        functions.logger.error('[wanderbeds/search] Error', {
            correlationId,
            error: err === null || err === void 0 ? void 0 : err.message,
            status: err === null || err === void 0 ? void 0 : err.status,
            stack: err === null || err === void 0 ? void 0 : err.stack,
            upstreamCorrelationId: err === null || err === void 0 ? void 0 : err.correlationId,
            ms,
        });
        // If it's a Wanderbeds API error, return structured error
        const httpStatus = (err === null || err === void 0 ? void 0 : err.status) || 500;
        const errorCode = (err === null || err === void 0 ? void 0 : err.code) || 'server_error';
        const errorMessage = (err === null || err === void 0 ? void 0 : err.message) || 'Internal server error';
        return res.status(httpStatus).json({
            ok: false,
            data: null,
            meta: {
                source: 'wanderbeds',
                correlationId,
                ms,
            },
            error: {
                code: errorCode,
                message: errorMessage,
                upstreamStatus: err === null || err === void 0 ? void 0 : err.status,
            },
        });
    }
});
// POST /wanderbeds/avail - Check hotel availability (per Wanderbeds docs: Availability.txt)
app.post('/wanderbeds/avail', async (req, res) => {
    var _a, _b;
    const correlationId = crypto.randomUUID();
    const startMs = Date.now();
    functions.logger.info('[wanderbeds/avail] Route hit', {
        correlationId,
        method: req.method,
        path: req.path,
        body: Object.assign(Object.assign({}, req.body), { token: req.body.token ? 'present' : 'missing' }), // Don't log full token
    });
    try {
        const { token, rooms } = req.body;
        if (!token) {
            return res.status(400).json({
                ok: false,
                error: {
                    code: 'invalid_request',
                    message: 'Request body must include "token" from search response',
                },
                meta: { correlationId, ms: Date.now() - startMs },
            });
        }
        if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
            return res.status(400).json({
                ok: false,
                error: {
                    code: 'invalid_request',
                    message: 'Request body must include "rooms" array with at least one offer ID',
                },
                meta: { correlationId, ms: Date.now() - startMs },
            });
        }
        functions.logger.info('[wanderbeds/avail] Checking availability', {
            correlationId,
            offerCount: rooms.length,
            offerIds: rooms.slice(0, 5), // Log first 5 only
        });
        // Per Wanderbeds docs (Availability.txt): body is { rooms: [offerid strings] }
        // Token goes in header, not body
        const result = await (0, wanderbedsApi_1.availHotels)({ rooms }, { token, timeoutMs: 30000 });
        const ms = Date.now() - startMs;
        functions.logger.info('[wanderbeds/avail] Availability result', {
            correlationId,
            hasResult: !!result,
            productsCount: ((_b = (_a = result === null || result === void 0 ? void 0 : result.mapped) === null || _a === void 0 ? void 0 : _a.products) === null || _b === void 0 ? void 0 : _b.length) || 0,
            token: (result === null || result === void 0 ? void 0 : result.token) ? 'present' : 'missing',
            ms,
        });
        return res.json({
            ok: true,
            data: result.mapped || { products: [], summary: undefined, required: undefined },
            meta: {
                source: 'wanderbeds',
                correlationId,
                ms,
                token: result.token || token, // Return new token if avail returned one
            },
            error: null,
        });
    }
    catch (err) {
        const ms = Date.now() - startMs;
        functions.logger.error('[wanderbeds/avail] Error', {
            correlationId,
            error: err === null || err === void 0 ? void 0 : err.message,
            status: err === null || err === void 0 ? void 0 : err.status,
            stack: err === null || err === void 0 ? void 0 : err.stack,
        });
        return res.status((err === null || err === void 0 ? void 0 : err.status) || 500).json({
            ok: false,
            data: null,
            meta: {
                source: 'wanderbeds',
                correlationId,
                ms,
            },
            error: {
                code: (err === null || err === void 0 ? void 0 : err.code) || 'server_error',
                message: (err === null || err === void 0 ? void 0 : err.message) || 'Internal server error',
                upstreamStatus: err === null || err === void 0 ? void 0 : err.status,
            },
        });
    }
});
// POST /wanderbeds/book - Book hotel (per Wanderbeds docs: Book.txt)
app.post('/wanderbeds/book', async (req, res) => {
    var _a, _b;
    const correlationId = crypto.randomUUID();
    const startMs = Date.now();
    functions.logger.info('[wanderbeds/book] Route hit', {
        correlationId,
        method: req.method,
        path: req.path,
        body: {
            token: req.body.token ? 'present' : 'missing',
            client_reference: req.body.client_reference,
            passengerCount: ((_a = req.body.passengers) === null || _a === void 0 ? void 0 : _a.length) || 0,
        },
    });
    try {
        const { token, client_reference, passengers } = req.body;
        if (!token) {
            return res.status(400).json({
                ok: false,
                error: {
                    code: 'invalid_request',
                    message: 'Request body must include "token" from search/avail response',
                },
                meta: { correlationId, ms: Date.now() - startMs },
            });
        }
        if (!client_reference) {
            return res.status(400).json({
                ok: false,
                error: {
                    code: 'invalid_request',
                    message: 'Request body must include "client_reference" (unique booking identifier)',
                },
                meta: { correlationId, ms: Date.now() - startMs },
            });
        }
        if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
            return res.status(400).json({
                ok: false,
                error: {
                    code: 'invalid_request',
                    message: 'Request body must include "passengers" array with at least one passenger',
                },
                meta: { correlationId, ms: Date.now() - startMs },
            });
        }
        functions.logger.info('[wanderbeds/book] Booking hotel', {
            correlationId,
            client_reference,
            passengerCount: passengers.length,
        });
        // Per Wanderbeds docs (Book.txt): body is { client_reference, passengers }
        // Token goes in header, not body
        const result = await (0, wanderbedsApi_1.book)({ client_reference, passengers }, { token, timeoutMs: 30000 });
        const ms = Date.now() - startMs;
        functions.logger.info('[wanderbeds/book] Booking result', {
            correlationId,
            hasResult: !!result,
            productsCount: ((_b = result === null || result === void 0 ? void 0 : result.products) === null || _b === void 0 ? void 0 : _b.length) || 0,
            token: (result === null || result === void 0 ? void 0 : result.token) ? 'present' : 'missing',
            ms,
        });
        return res.json({
            ok: true,
            data: result,
            meta: {
                source: 'wanderbeds',
                correlationId,
                ms,
                token: result.token || token,
            },
            error: null,
        });
    }
    catch (err) {
        const ms = Date.now() - startMs;
        functions.logger.error('[wanderbeds/book] Error', {
            correlationId,
            error: err === null || err === void 0 ? void 0 : err.message,
            status: err === null || err === void 0 ? void 0 : err.status,
            stack: err === null || err === void 0 ? void 0 : err.stack,
        });
        return res.status((err === null || err === void 0 ? void 0 : err.status) || 500).json({
            ok: false,
            data: null,
            meta: {
                source: 'wanderbeds',
                correlationId,
                ms,
            },
            error: {
                code: (err === null || err === void 0 ? void 0 : err.code) || 'server_error',
                message: (err === null || err === void 0 ? void 0 : err.message) || 'Internal server error',
                upstreamStatus: err === null || err === void 0 ? void 0 : err.status,
            },
        });
    }
});
// ============================================================================
// DEBUG ENDPOINTS - Raw passthrough to Wanderbeds (isolated, no refactors)
// ============================================================================
// POST /debug/wanderbeds/search-raw - Raw passthrough to /hotel/search
app.post('/debug/wanderbeds/search-raw', async (req, res) => {
    var _a, _b, _c, _d;
    const startMs = Date.now();
    try {
        const cfg = (0, wanderbedsConfig_1.loadWanderbedsConfig)();
        const url = new URL('/hotel/search', cfg.baseUrl);
        const authHeader = `Basic ${Buffer.from(`${cfg.username}:${cfg.password}`).toString('base64')}`;
        const requestBody = req.body;
        const requestOptions = {
            method: 'POST',
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: authHeader,
                'User-Agent': 'Vaultfy-Functions-Debug/1.0',
            },
        };
        const response = await new Promise((resolve, reject) => {
            const req = https.request(requestOptions, (res) => resolve(res));
            req.on('error', reject);
            req.write(JSON.stringify(requestBody));
            req.end();
        });
        let bodyText = '';
        const chunks = [];
        response.on('data', (chunk) => {
            chunks.push(chunk);
        });
        await new Promise((resolve, reject) => {
            response.on('end', resolve);
            response.on('error', reject);
        });
        bodyText = Buffer.concat(chunks).toString('utf8');
        let parsedBody = null;
        try {
            parsedBody = JSON.parse(bodyText);
        }
        catch (e) {
            parsedBody = null;
        }
        const ms = Date.now() - startMs;
        // Always return HTTP 200, even if upstream returns "No results" (error code 100)
        // Per requirements: "No results" is not a 404, it's a business response
        return res.status(200).json({
            ok: true,
            upstreamHttpStatus: response.statusCode || 0,
            upstreamBody: bodyText, // raw text
            parsedBody, // parsed JSON (or null)
            parsed: {
                token: (parsedBody === null || parsedBody === void 0 ? void 0 : parsedBody.token) || null,
                error: {
                    code: (_b = (_a = parsedBody === null || parsedBody === void 0 ? void 0 : parsedBody.error) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : null,
                    message: ((_c = parsedBody === null || parsedBody === void 0 ? void 0 : parsedBody.error) === null || _c === void 0 ? void 0 : _c.message) || null,
                },
                count: (_d = parsedBody === null || parsedBody === void 0 ? void 0 : parsedBody.count) !== null && _d !== void 0 ? _d : null,
                hotelsLen: Array.isArray(parsedBody === null || parsedBody === void 0 ? void 0 : parsedBody.hotels) ? parsedBody.hotels.length : null,
            },
            requestSentToUpstream: requestBody,
            headersSentToUpstream: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip,deflate',
                Authorization: '[REDACTED_BASIC]',
            },
            upstreamHeaders: {
                contentType: response.headers['content-type'] || '',
                contentEncoding: response.headers['content-encoding'] || '',
                contentLength: response.headers['content-length'] || '',
            },
            ms,
            url: url.toString(),
        });
    }
    catch (err) {
        const ms = Date.now() - startMs;
        functions.logger.error('[debug/search-raw] Error', { error: err.message, stack: err.stack });
        return res.status(500).json({
            ok: false,
            error: err.message || 'Internal server error',
            ms,
        });
    }
});
// POST /debug/wanderbeds/avail-raw - Raw passthrough to /hotel/avail
app.post('/debug/wanderbeds/avail-raw', async (req, res) => {
    var _a, _b, _c, _d;
    const startMs = Date.now();
    try {
        const cfg = (0, wanderbedsConfig_1.loadWanderbedsConfig)();
        const url = new URL('/hotel/avail', cfg.baseUrl);
        const authHeader = `Basic ${Buffer.from(`${cfg.username}:${cfg.password}`).toString('base64')}`;
        const requestBody = req.body;
        const requestOptions = {
            method: 'POST',
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: authHeader,
                'User-Agent': 'Vaultfy-Functions-Debug/1.0',
            },
        };
        const response = await new Promise((resolve, reject) => {
            const req = https.request(requestOptions, (res) => resolve(res));
            req.on('error', reject);
            req.write(JSON.stringify(requestBody));
            req.end();
        });
        let bodyText = '';
        const chunks = [];
        response.on('data', (chunk) => {
            chunks.push(chunk);
        });
        await new Promise((resolve, reject) => {
            response.on('end', resolve);
            response.on('error', reject);
        });
        bodyText = Buffer.concat(chunks).toString('utf8');
        const bodyPreview = bodyText.substring(0, 3000);
        let parsed = {};
        try {
            parsed = JSON.parse(bodyText);
        }
        catch (e) {
            // Not JSON, keep parsed empty
        }
        const ms = Date.now() - startMs;
        return res.json({
            ok: true,
            upstream: {
                url: url.toString(),
                status: response.statusCode || 0,
                ms,
                headers: {
                    contentType: response.headers['content-type'] || '',
                    contentEncoding: response.headers['content-encoding'] || '',
                    contentLength: response.headers['content-length'] || '',
                },
                bodyTextPreview: bodyPreview,
                parsed: {
                    token: (parsed === null || parsed === void 0 ? void 0 : parsed.token) || null,
                    time: (parsed === null || parsed === void 0 ? void 0 : parsed.time) || null,
                    server: (parsed === null || parsed === void 0 ? void 0 : parsed.server) || null,
                    productsLen: Array.isArray((_a = parsed === null || parsed === void 0 ? void 0 : parsed.data) === null || _a === void 0 ? void 0 : _a.products) ? parsed.data.products.length : null,
                    errorCode: (_c = (_b = parsed === null || parsed === void 0 ? void 0 : parsed.error) === null || _b === void 0 ? void 0 : _b.code) !== null && _c !== void 0 ? _c : null,
                    errorMessage: ((_d = parsed === null || parsed === void 0 ? void 0 : parsed.error) === null || _d === void 0 ? void 0 : _d.message) || null,
                },
            },
        });
    }
    catch (err) {
        const ms = Date.now() - startMs;
        functions.logger.error('[debug/avail-raw] Error', { error: err.message, stack: err.stack });
        return res.status(500).json({
            ok: false,
            error: err.message || 'Internal server error',
            ms,
        });
    }
});
// POST /debug/wanderbeds/hoteldetails-raw - Raw passthrough to /staticdata/hoteldetails
app.post('/debug/wanderbeds/hoteldetails-raw', async (req, res) => {
    var _a, _b, _c;
    const startMs = Date.now();
    try {
        const cfg = (0, wanderbedsConfig_1.loadWanderbedsConfig)();
        const url = new URL('/staticdata/hoteldetails', cfg.baseUrl);
        const authHeader = `Basic ${Buffer.from(`${cfg.username}:${cfg.password}`).toString('base64')}`;
        const requestBody = req.body;
        const requestOptions = {
            method: 'POST',
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: authHeader,
                'User-Agent': 'Vaultfy-Functions-Debug/1.0',
            },
        };
        const response = await new Promise((resolve, reject) => {
            const req = https.request(requestOptions, (res) => resolve(res));
            req.on('error', reject);
            req.write(JSON.stringify(requestBody));
            req.end();
        });
        let bodyText = '';
        const chunks = [];
        response.on('data', (chunk) => {
            chunks.push(chunk);
        });
        await new Promise((resolve, reject) => {
            response.on('end', resolve);
            response.on('error', reject);
        });
        bodyText = Buffer.concat(chunks).toString('utf8');
        const bodyPreview = bodyText.substring(0, 3000);
        let parsed = {};
        try {
            parsed = JSON.parse(bodyText);
        }
        catch (e) {
            // Not JSON, keep parsed empty
        }
        const ms = Date.now() - startMs;
        return res.json({
            ok: true,
            upstream: {
                url: url.toString(),
                status: response.statusCode || 0,
                ms,
                headers: {
                    contentType: response.headers['content-type'] || '',
                    contentEncoding: response.headers['content-encoding'] || '',
                    contentLength: response.headers['content-length'] || '',
                },
                bodyTextPreview: bodyPreview,
                parsed: {
                    hotelsLen: Array.isArray(parsed === null || parsed === void 0 ? void 0 : parsed.hotels) ? parsed.hotels.length : null,
                    errorCode: (_b = (_a = parsed === null || parsed === void 0 ? void 0 : parsed.error) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : null,
                    errorMessage: ((_c = parsed === null || parsed === void 0 ? void 0 : parsed.error) === null || _c === void 0 ? void 0 : _c.message) || null,
                },
            },
        });
    }
    catch (err) {
        const ms = Date.now() - startMs;
        functions.logger.error('[debug/hoteldetails-raw] Error', { error: err.message, stack: err.stack });
        return res.status(500).json({
            ok: false,
            error: err.message || 'Internal server error',
            ms,
        });
    }
});
// Mount curated routes
const wanderbedsCuratedRoutes_1 = __importDefault(require("./routes/wanderbedsCuratedRoutes"));
app.use('/', wanderbedsCuratedRoutes_1.default);
// Get hotels by location (country/city) - REWRITTEN with proper mapping and debug
app.get('/hotels/static/hotels-by-location', async (req, res) => {
    var _a;
    const startMs = Date.now();
    const debug = {
        curatedCount: 0,
        hotellistCount: 0,
        afterCountry: 0,
        afterCity: 0,
        afterStars: 0,
        sample: [],
    };
    try {
        const country = req.query.country ? String(req.query.country).toUpperCase() : undefined;
        const cityId = req.query.cityId ? String(req.query.cityId) : undefined;
        const cityName = req.query.cityName ? String(req.query.cityName) : undefined;
        const minStars = req.query.minStars != null ? Number(req.query.minStars) : 0; // Default to 0
        if (!country) {
            res.status(400).json({ error: 'country_required', message: 'Country parameter is required', debug });
            return;
        }
        // Helper: Map raw Wanderbeds hotel object to canonical shape
        const mapHotel = (raw) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            return {
                hotelId: String((_b = (_a = raw.hotelid) !== null && _a !== void 0 ? _a : raw.hotelId) !== null && _b !== void 0 ? _b : ''),
                name: String((_d = (_c = raw.name) !== null && _c !== void 0 ? _c : raw.hotelname) !== null && _d !== void 0 ? _d : ''),
                starRating: raw.starrating != null || raw.starRating != null ? Number((_f = (_e = raw.starrating) !== null && _e !== void 0 ? _e : raw.starRating) !== null && _f !== void 0 ? _f : 0) : 0,
                cityId: raw.cityid != null || raw.cityId != null ? String((_h = (_g = raw.cityid) !== null && _g !== void 0 ? _g : raw.cityId) !== null && _h !== void 0 ? _h : '') : undefined,
                city: String((_k = (_j = raw.city) !== null && _j !== void 0 ? _j : raw.cityname) !== null && _k !== void 0 ? _k : ''),
                country: String((_l = raw.country) !== null && _l !== void 0 ? _l : ''),
                address: String((_m = raw.address) !== null && _m !== void 0 ? _m : ''),
                lat: raw.lat != null ? Number(raw.lat) : undefined,
                lng: raw.lng != null ? Number((_p = (_o = raw.lng) !== null && _o !== void 0 ? _o : raw.lon) !== null && _p !== void 0 ? _p : undefined) : undefined,
            };
        };
        // Helper: Filter by country (case-insensitive uppercase)
        const filterByCountry = (hotels, countryCode) => {
            const countryUpper = countryCode.toUpperCase();
            return hotels.filter((h) => {
                const hCountry = (h.country || '').toUpperCase();
                return hCountry === countryUpper;
            });
        };
        // Helper: Filter by city
        const filterByCity = (hotels, cityIdParam, cityNameParam, countryParam) => {
            if (!cityIdParam && !cityNameParam)
                return hotels;
            // Never filter by city if cityName equals country name
            if (cityNameParam && countryParam && cityNameParam.toLowerCase() === countryParam.toLowerCase()) {
                return hotels;
            }
            return hotels.filter((h) => {
                // Prefer cityId exact match
                if (cityIdParam && h.cityId) {
                    return String(h.cityId) === String(cityIdParam);
                }
                // Fallback to city name fuzzy match
                if (cityNameParam && h.city) {
                    const hCity = h.city.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ');
                    const cityLower = cityNameParam.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ');
                    return hCity.includes(cityLower) || cityLower.includes(hCity) || hCity === cityLower;
                }
                return false;
            });
        };
        // Helper: Filter by minStars
        const filterByStars = (hotels, minStarsParam) => {
            if (minStarsParam == null || !Number.isFinite(minStarsParam))
                return hotels;
            return hotels.filter((h) => {
                return Number.isFinite(h.starRating) && h.starRating >= minStarsParam;
            });
        };
        let result = [];
        let source = 'error';
        // STEP 1: Try curated collection (vendors/wanderbeds/curation/hotels/{hotelId})
        try {
            // FIXED: Use correct path vendors/wanderbeds/curation/hotels (no /items)
            const curatedRef = admin.firestore().collection('vendors/wanderbeds/curation/hotels');
            const curatedSnapshot = await curatedRef.where('country', '==', country).limit(500).get();
            debug.curatedCount = curatedSnapshot.size;
            if (curatedSnapshot.size > 0) {
                result = curatedSnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return mapHotel({
                        hotelid: data.hotelId || doc.id,
                        hotelId: data.hotelId || doc.id,
                        name: data.name,
                        starrating: data.starRating,
                        starRating: data.starRating,
                        cityid: data.cityId,
                        cityId: data.cityId,
                        city: data.city,
                        country: data.country,
                        address: data.address,
                        lat: data.lat,
                        lng: data.lng,
                    });
                });
                source = 'curated';
            }
        }
        catch (curatedErr) {
            functions.logger.warn('[hotels-by-location] curated query failed', { error: curatedErr === null || curatedErr === void 0 ? void 0 : curatedErr.message, country });
        }
        // STEP 2: Fallback to hotellist if curated is empty
        if (result.length === 0) {
            try {
                const data = await Promise.race([
                    (0, wanderbedsApi_1.getHotelList)({ bypassCache: false, timeoutMs: 20000, allowStale: true }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Hotellist timeout')), 20000)),
                ]);
                const hotelsRaw = (data === null || data === void 0 ? void 0 : data.hotels) || ((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.hotels) || [];
                const hotelsArray = Array.isArray(hotelsRaw) ? hotelsRaw : [];
                debug.hotellistCount = hotelsArray.length;
                // MAP to canonical shape BEFORE filtering
                result = hotelsArray.map(mapHotel);
                source = 'hotellist_fallback';
            }
            catch (hotellistErr) {
                functions.logger.warn('[hotels-by-location] hotellist fallback failed', {
                    error: hotellistErr === null || hotellistErr === void 0 ? void 0 : hotellistErr.message,
                    country,
                });
                res.json({
                    hotels: [],
                    total: 0,
                    source: 'error',
                    error: 'hotellist_failed',
                    message: 'Unable to load hotels',
                    debug,
                });
                return;
            }
        }
        // STEP 3: Apply filters (using canonical shape)
        debug.afterCountry = result.length;
        result = filterByCountry(result, country);
        debug.afterCountry = result.length;
        debug.afterCity = result.length;
        result = filterByCity(result, cityId, cityName, country);
        debug.afterCity = result.length;
        debug.afterStars = result.length;
        result = filterByStars(result, minStars);
        debug.afterStars = result.length;
        // Limit to first 100
        result = result.slice(0, 100);
        // Filter out invalid hotelIds
        result = result.filter((h) => h.hotelId && String(h.hotelId).trim().length > 0);
        // Set debug sample
        debug.sample = result.slice(0, 5).map((h) => ({
            hotelId: h.hotelId,
            country: h.country,
            city: h.city,
            cityId: h.cityId,
            starRating: h.starRating,
        }));
        const durationMs = Date.now() - startMs;
        functions.logger.info('[hotels-by-location] complete', {
            country,
            cityId,
            cityName,
            minStars,
            resultCount: result.length,
            source,
            durationMs,
            debug,
        });
        res.json({
            hotels: result,
            total: result.length,
            source,
            debug,
        });
    }
    catch (err) {
        const durationMs = Date.now() - startMs;
        functions.logger.error('[hotels-by-location] error', {
            error: err === null || err === void 0 ? void 0 : err.message,
            stack: err === null || err === void 0 ? void 0 : err.stack,
            durationMs,
        });
        res.status(500).json({
            hotels: [],
            total: 0,
            source: 'error',
            error: 'server_error',
            message: (err === null || err === void 0 ? void 0 : err.message) || 'Internal server error',
            debug,
        });
    }
});
// Probe endpoint to diagnose Wanderbeds connectivity
// GET /hotels/vendor/hotellist/peek - Stream and peek first N hotels from Wanderbeds hotellist
app.get('/hotels/vendor/hotellist/peek', async (req, res) => {
    var _a, _b;
    const startMs = Date.now();
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);
    const country = ((_a = req.query.country) === null || _a === void 0 ? void 0 : _a.toUpperCase().trim()) || '';
    const city = ((_b = req.query.city) === null || _b === void 0 ? void 0 : _b.trim()) || '';
    const minStars = Math.max(0, parseInt(req.query.minStars, 10) || 0);
    functions.logger.info('[hotellist/peek] Request', { limit, country, city, minStars });
    try {
        const cfg = (0, wanderbedsConfig_1.loadWanderbedsConfig)();
        const url = new URL('/staticdata/hotellist', cfg.baseUrl);
        const authHeader = `Basic ${Buffer.from(`${cfg.username}:${cfg.password}`).toString('base64')}`;
        const hotels = [];
        let received = 0;
        let aborted = false;
        let contentEncoding = '';
        const abortController = new AbortController();
        const requestOptions = {
            method: 'GET',
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            headers: {
                Accept: 'application/json',
                // Don't request deflate explicitly - server may ignore or send uncompressed
                // Handle whatever compression (or lack of) server sends based on content-encoding header
                Authorization: authHeader,
                'User-Agent': 'Vaultfy-Functions/1.0',
            },
            signal: abortController.signal,
        };
        const response = await new Promise((resolve, reject) => {
            const req = https.request(requestOptions, (res) => resolve(res));
            req.on('error', reject);
            req.end();
        });
        if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
            res.status(response.statusCode || 500).json({
                ok: false,
                error: `Wanderbeds returned ${response.statusCode}: ${response.statusMessage}`,
            });
            return;
        }
        contentEncoding = (response.headers['content-encoding'] || '').toLowerCase();
        functions.logger.info('[hotellist/peek] Response headers', {
            'content-encoding': contentEncoding,
            'content-type': response.headers['content-type'],
            statusCode: response.statusCode,
        });
        // Handle decompression based on actual response content-encoding header
        // Follow pattern from hotellistStream.ts - handle deflate, gzip, or raw
        let stream = response;
        if (contentEncoding === 'deflate' || contentEncoding.includes('deflate')) {
            // Server says it's deflate - try to decompress (may fail if it's zlib-wrapped deflate)
            const inflateStream = zlib.createInflate({ chunkSize: 64 * 1024 });
            inflateStream.on('error', (err) => {
                functions.logger.error('[hotellist/peek] Deflate decompression error', {
                    error: err.message,
                    code: err.code,
                    name: err.name,
                    'content-encoding': contentEncoding,
                });
                // Error will propagate - we'll catch it in pipeline error handler
            });
            stream = response.pipe(inflateStream);
            functions.logger.info('[hotellist/peek] Attempting deflate decompression');
        }
        else if (contentEncoding === 'gzip' || contentEncoding.includes('gzip')) {
            const gunzipStream = zlib.createGunzip();
            gunzipStream.on('error', (err) => {
                functions.logger.error('[hotellist/peek] Gzip decompression error', { error: err.message });
            });
            stream = response.pipe(gunzipStream);
            functions.logger.info('[hotellist/peek] Attempting gzip decompression');
        }
        else {
            // No compression header - server ignored Accept-Encoding or sent uncompressed
            functions.logger.info('[hotellist/peek] No compression detected, using raw stream');
        }
        // Use stream-json for proper JSON streaming
        // @ts-ignore - stream-json types may not be available
        const streamJson = require('stream-json');
        const jsonParser = streamJson.parser;
        const { Transform } = require('stream');
        let waitingForHotelsKey = true;
        let inHotelsArray = false;
        let currentObject = null;
        let currentKey = null;
        let currentArrayDepth = 0;
        let streamEnded = false;
        let shouldStop = false;
        const hotelExtractor = new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                if (!chunk || typeof chunk !== 'object' || streamEnded || shouldStop) {
                    callback();
                    return;
                }
                // Wait for "hotels" key
                if (waitingForHotelsKey && chunk.name === 'keyValue' && chunk.value === 'hotels') {
                    waitingForHotelsKey = false;
                    callback();
                    return;
                }
                // After hotels key, wait for array start
                if (!waitingForHotelsKey && !inHotelsArray && chunk.name === 'startArray') {
                    inHotelsArray = true;
                    currentArrayDepth = 1;
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
                            // Complete hotel object - check filters and add if matches
                            received++;
                            const hotel = {
                                hotelId: String(currentObject.hotelid || currentObject.id || ''),
                                name: String(currentObject.hotelname || currentObject.name || ''),
                                country: String(currentObject.country || '').toUpperCase(),
                                city: String(currentObject.city || currentObject.cityname || ''),
                                starRating: Number(currentObject.starrating || currentObject.starRating || 0),
                                cityId: currentObject.cityid ? String(currentObject.cityid) : undefined,
                                address: currentObject.address || '',
                                lat: currentObject.lat ? Number(currentObject.lat) : undefined,
                                lng: currentObject.lng ? Number(currentObject.lng) : undefined,
                            };
                            // Apply filters
                            const matchesCountry = !country || hotel.country === country;
                            const matchesCity = !city || hotel.city.toLowerCase().includes(city.toLowerCase());
                            const matchesStars = hotel.starRating >= minStars;
                            if (matchesCountry && matchesCity && matchesStars && hotel.hotelId) {
                                hotels.push(hotel);
                                // Abort if we have enough
                                if (hotels.length >= limit) {
                                    aborted = true;
                                    streamEnded = true;
                                    shouldStop = true;
                                    // Abort the upstream connection
                                    abortController.abort();
                                    // Destroy the pipeline to stop processing
                                    try {
                                        pipeline.destroy();
                                    }
                                    catch (e) {
                                        // Ignore destroy errors
                                    }
                                    // Return early but don't end the transform stream
                                    callback();
                                    return;
                                }
                            }
                            currentObject = null;
                        }
                    }
                    else if (chunk.name === 'endArray') {
                        currentArrayDepth -= 1;
                        if (currentArrayDepth === 0) {
                            inHotelsArray = false;
                            streamEnded = true;
                        }
                    }
                }
                callback();
            },
        });
        // Pipe stream through JSON parser and extractor
        const pipeline = stream.pipe(jsonParser()).pipe(hotelExtractor);
        // Handle stream errors
        stream.on('error', (err) => {
            functions.logger.error('[hotellist/peek] Stream error', {
                error: err.message,
                code: err.code,
                contentEncoding,
            });
            // If deflate decompression fails, it might be zlib-wrapped deflate or uncompressed
            // Return error - user can try again or we can improve error handling later
            if (!res.headersSent) {
                const errorMsg = err.code === 'Z_DATA_ERROR'
                    ? `Decompression error: Server may have sent uncompressed data despite compression request. Try without compression.`
                    : `Stream error: ${err.message}`;
                res.status(500).json({ ok: false, error: errorMsg });
            }
        });
        pipeline.on('error', (err) => {
            functions.logger.error('[hotellist/peek] Parser error', { error: err.message });
            if (!res.headersSent) {
                res.status(500).json({ ok: false, error: `Parser error: ${err.message}` });
            }
        });
        // Set timeout
        const timeoutId = setTimeout(() => {
            if (!res.headersSent) {
                aborted = true;
                abortController.abort();
                const ms = Date.now() - startMs;
                res.json({
                    ok: true,
                    hotels,
                    received,
                    returned: hotels.length,
                    ms,
                    aborted,
                    debug: {
                        limit,
                        country: country || 'any',
                        city: city || 'any',
                        minStars,
                        timeout: true,
                        contentEncoding: contentEncoding || 'none',
                    },
                });
            }
        }, 30000); // 30s timeout
        // Wait for stream to end
        pipeline.on('end', () => {
            clearTimeout(timeoutId);
            if (res.headersSent)
                return;
            const ms = Date.now() - startMs;
            functions.logger.info('[hotellist/peek] Complete', {
                hotels: hotels.length,
                received,
                aborted,
                ms
            });
            res.json({
                ok: true,
                hotels,
                received,
                returned: hotels.length,
                ms,
                aborted,
                debug: {
                    limit,
                    country: country || 'any',
                    city: city || 'any',
                    minStars,
                    contentEncoding: contentEncoding || 'none',
                },
            });
        });
        // Return early - stream will handle response
        return;
    }
    catch (err) {
        functions.logger.error('[hotellist/peek] Error', { error: err.message, stack: err.stack });
        if (!res.headersSent) {
            res.status(500).json({
                ok: false,
                error: err.message || 'Internal server error',
                ms: Date.now() - startMs,
            });
        }
    }
});
app.get('/hotels/vendor/probe', async (_req, res) => {
    var _a, _b;
    const startMs = Date.now();
    const probe = {
        kind: 'wanderbeds_probe_v1',
        baseUrl: '',
        hasCreds: false,
        countries: { ok: false },
        hotellist: { ok: false },
        error: null,
    };
    try {
        const cfg = (0, wanderbedsConfig_1.loadWanderbedsConfig)();
        probe.baseUrl = cfg.baseUrl;
        probe.hasCreds = !!(cfg.username && cfg.password);
        // Test countries endpoint
        try {
            const countriesStartMs = Date.now();
            await (0, wanderbedsHttp_1.wanderbedsRequest)('GET', '/staticdata/countries', {
                timeoutMs: 5000,
                safe: true,
            });
            const countriesMs = Date.now() - countriesStartMs;
            probe.countries = {
                ok: true,
                status: 200,
                ms: countriesMs,
            };
        }
        catch (countriesErr) {
            const countriesMs = Date.now() - (startMs + 50);
            probe.countries = {
                ok: false,
                status: (countriesErr === null || countriesErr === void 0 ? void 0 : countriesErr.status) || 500,
                ms: countriesMs,
                error: (countriesErr === null || countriesErr === void 0 ? void 0 : countriesErr.message) || 'Unknown error',
            };
        }
        // Test hotellist endpoint (use Promise.race to avoid function timeout)
        try {
            const hotellistStartMs = Date.now();
            const hotellistPromise = (0, wanderbedsApi_1.getHotelList)({ bypassCache: false, timeoutMs: 30000, allowStale: true });
            // Race with a 25s timeout to ensure probe completes within function timeout
            const hotellistResp = await Promise.race([
                hotellistPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Probe timeout (25s)')), 25000)),
            ]);
            const hotellistMs = Date.now() - hotellistStartMs;
            // Calculate response size
            const hotelsRaw = (hotellistResp === null || hotellistResp === void 0 ? void 0 : hotellistResp.hotels) || ((_a = hotellistResp === null || hotellistResp === void 0 ? void 0 : hotellistResp.data) === null || _a === void 0 ? void 0 : _a.hotels) || [];
            const hotelsArray = Array.isArray(hotelsRaw) ? hotelsRaw : [];
            const responseJson = JSON.stringify(hotellistResp);
            const responseBytes = Buffer.byteLength(responseJson, 'utf8');
            probe.hotellist = {
                ok: true,
                status: 200,
                ms: hotellistMs,
                bytes: responseBytes,
                count: hotelsArray.length,
            };
        }
        catch (hotellistErr) {
            const hotellistMs = Date.now() - (startMs + 100);
            const status = (hotellistErr === null || hotellistErr === void 0 ? void 0 : hotellistErr.status) || (((_b = hotellistErr === null || hotellistErr === void 0 ? void 0 : hotellistErr.message) === null || _b === void 0 ? void 0 : _b.includes('timeout')) || (hotellistErr === null || hotellistErr === void 0 ? void 0 : hotellistErr.code) === 'ECONNABORTED' ? 408 : 500);
            probe.hotellist = {
                ok: false,
                status,
                ms: hotellistMs,
                error: (hotellistErr === null || hotellistErr === void 0 ? void 0 : hotellistErr.message) || ((hotellistErr === null || hotellistErr === void 0 ? void 0 : hotellistErr.code) === 'ECONNABORTED' ? 'Request timeout' : 'Unknown error'),
            };
        }
        res.json(probe);
    }
    catch (err) {
        probe.error = {
            code: 'probe_error',
            message: (err === null || err === void 0 ? void 0 : err.message) || 'Probe failed',
        };
        res.status(500).json(probe);
    }
});
// POST /hotels/static/hoteldetails - Get detailed hotel information
app.post('/hotels/static/hoteldetails', async (req, res) => {
    try {
        const { hotels } = req.body;
        if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
            return res.status(400).json({
                error: 'invalid_request',
                message: 'Request body must include a "hotels" array with at least one hotel ID'
            });
        }
        // Validate hotel IDs are numbers or numeric strings
        const hotelIds = hotels.map((id) => {
            const num = typeof id === 'string' ? parseInt(id, 10) : id;
            if (isNaN(num)) {
                throw new Error(`Invalid hotel ID: ${id}`);
            }
            return num;
        });
        functions.logger.info('[hoteldetails] Fetching details', { count: hotelIds.length, ids: hotelIds.slice(0, 5) });
        const detailsResp = await (0, wanderbedsApi_1.postHotelDetails)(hotelIds, {
            timeoutMs: 30000,
            bypassCache: false,
            allowStale: true,
        });
        // Response format: { hotels: [...] }
        const hotelsArray = Array.isArray(detailsResp === null || detailsResp === void 0 ? void 0 : detailsResp.hotels) ? detailsResp.hotels : [];
        functions.logger.info('[hoteldetails] Fetched details', {
            requested: hotelIds.length,
            returned: hotelsArray.length
        });
        return res.json({ hotels: hotelsArray });
    }
    catch (err) {
        functions.logger.error('[hoteldetails] Error', { error: err === null || err === void 0 ? void 0 : err.message, code: err === null || err === void 0 ? void 0 : err.code });
        return res.status((err === null || err === void 0 ? void 0 : err.status) || 500).json({
            error: (err === null || err === void 0 ? void 0 : err.code) || 'hoteldetails_error',
            message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch hotel details',
            hotels: [],
        });
    }
});
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=apiGateway.js.map