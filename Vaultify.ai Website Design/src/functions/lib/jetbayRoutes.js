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
exports.jetbayInquiryEmptyLeg = exports.jetbayInquiryCharter = exports.jetbaySearchEmptyLegs = exports.jetbaySearchCharter = exports.jetbayCountries = exports.jetbayCities = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto_1 = require("crypto");
const jetbayApi_1 = require("./vendors/jetbay/jetbayApi");
function cors(res) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}
function parseBody(req) {
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        }
        catch (_a) {
            return {};
        }
    }
    return req.body || {};
}
const rateMap = new Map();
const WINDOW = 60000;
const LIMIT = 30;
function rateLimit(key) {
    const now = Date.now();
    const entry = rateMap.get(key) || { count: 0, windowStart: now };
    if (now - entry.windowStart > WINDOW) {
        entry.count = 0;
        entry.windowStart = now;
    }
    entry.count += 1;
    rateMap.set(key, entry);
    return entry.count <= LIMIT;
}
async function requireAuth(req) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer '))
        return null;
    const token = authHeader.replace('Bearer ', '').trim();
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        return decoded.uid;
    }
    catch (_e) {
        return null;
    }
}
async function handlerCities(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    const q = String(req.query.q || '').trim();
    if (!q) {
        res.status(400).json({ error: 'q required' });
        return;
    }
    if (!rateLimit(req.ip || 'anon')) {
        res.status(429).json({ error: 'rate_limited' });
        return;
    }
    try {
        const data = await (0, jetbayApi_1.cityQuery)(q);
        res.json({ results: data });
    }
    catch (err) {
        res.status(500).json({ error: 'jetbay_error', message: err === null || err === void 0 ? void 0 : err.message });
    }
}
async function handlerCountries(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    const q = req.query.q ? String(req.query.q) : undefined;
    if (!rateLimit(req.ip || 'anon')) {
        res.status(429).json({ error: 'rate_limited' });
        return;
    }
    try {
        const data = await (0, jetbayApi_1.countryQuery)(q);
        res.json({ results: data });
    }
    catch (err) {
        res.status(500).json({ error: 'jetbay_error', message: err === null || err === void 0 ? void 0 : err.message });
    }
}
async function handlerCharterSearch(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'method_not_allowed' });
        return;
    }
    if (!rateLimit(req.ip || 'anon')) {
        res.status(429).json({ error: 'rate_limited' });
        return;
    }
    const body = parseBody(req);
    const correlationId = (0, crypto_1.randomUUID)();
    try {
        const { listings, offers } = await (0, jetbayApi_1.searchCharter)(body, correlationId, undefined);
        res.json({ listings, offers, debugId: correlationId });
    }
    catch (err) {
        res.status(500).json({ error: 'jetbay_error', message: err === null || err === void 0 ? void 0 : err.message, debugId: correlationId });
    }
}
async function handlerEmptyLegSearch(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'method_not_allowed' });
        return;
    }
    if (!rateLimit(req.ip || 'anon')) {
        res.status(429).json({ error: 'rate_limited' });
        return;
    }
    const params = req.query || {};
    const correlationId = (0, crypto_1.randomUUID)();
    try {
        const result = await (0, jetbayApi_1.emptyLegQueryPage)(params, correlationId, undefined);
        res.json(Object.assign(Object.assign({}, result), { debugId: correlationId }));
    }
    catch (err) {
        res.status(500).json({ error: 'jetbay_error', message: err === null || err === void 0 ? void 0 : err.message, debugId: correlationId });
    }
}
async function handlerInquiryCharter(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'method_not_allowed' });
        return;
    }
    const uid = await requireAuth(req);
    if (!uid) {
        res.status(401).json({ error: 'auth_required' });
        return;
    }
    const body = parseBody(req);
    const correlationId = (0, crypto_1.randomUUID)();
    try {
        const result = await (0, jetbayApi_1.submitLead)(body, correlationId, uid);
        res.json(Object.assign(Object.assign({}, result), { debugId: correlationId, notice: 'Inquiry submitted to Jetbay' }));
    }
    catch (err) {
        res.status(500).json({ error: 'jetbay_error', message: err === null || err === void 0 ? void 0 : err.message, debugId: correlationId });
    }
}
async function handlerInquiryEmpty(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'method_not_allowed' });
        return;
    }
    const uid = await requireAuth(req);
    if (!uid) {
        res.status(401).json({ error: 'auth_required' });
        return;
    }
    const body = parseBody(req);
    const correlationId = (0, crypto_1.randomUUID)();
    try {
        const result = await (0, jetbayApi_1.submitEmptyLegLead)(body, correlationId, uid);
        res.json(Object.assign(Object.assign({}, result), { debugId: correlationId, notice: 'Inquiry submitted to Jetbay' }));
    }
    catch (err) {
        res.status(500).json({ error: 'jetbay_error', message: err === null || err === void 0 ? void 0 : err.message, debugId: correlationId });
    }
}
exports.jetbayCities = functions.https.onRequest(handlerCities);
exports.jetbayCountries = functions.https.onRequest(handlerCountries);
exports.jetbaySearchCharter = functions.https.onRequest(handlerCharterSearch);
exports.jetbaySearchEmptyLegs = functions.https.onRequest(handlerEmptyLegSearch);
exports.jetbayInquiryCharter = functions.https.onRequest(handlerInquiryCharter);
exports.jetbayInquiryEmptyLeg = functions.https.onRequest(handlerInquiryEmpty);
//# sourceMappingURL=jetbayRoutes.js.map