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
exports.alfredConfirmApi = exports.alfredChatApi = void 0;
const functions = __importStar(require("firebase-functions"));
const crypto_1 = require("crypto");
const openaiClient_1 = require("./alfred/openaiClient");
const policy_1 = require("./alfred/policy");
const toolRouter_1 = require("./alfred/toolRouter");
const memory_1 = require("./alfred/memory");
const limiter = new Map();
const WINDOW_MS = 60000;
const MAX_REQ = 20;
const irreversibleTools = new Set(['create_booking_draft', 'cancel_booking', 'request_vendor_checkout']);
function rateLimit(key) {
    const now = Date.now();
    const entry = limiter.get(key) || { count: 0, windowStart: now };
    if (now - entry.windowStart > WINDOW_MS) {
        entry.count = 0;
        entry.windowStart = now;
    }
    entry.count += 1;
    limiter.set(key, entry);
    return entry.count <= MAX_REQ;
}
function parseBody(req) {
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        }
        catch (e) {
            return {};
        }
    }
    return req.body || {};
}
function cors(res) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
}
async function runToolsIfAllowed(toolCalls, context) {
    const results = [];
    for (const call of toolCalls.slice(0, 3)) {
        if (!context.confirmed && irreversibleTools.has(call.tool)) {
            continue;
        }
        const output = await (0, toolRouter_1.executeTool)(call, context);
        results.push({ tool: call.tool, output: (0, toolRouter_1.sanitizeToolResult)(output) });
    }
    return results;
}
async function handleChat(req, res) {
    var _a, _b, _c;
    cors(res);
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    const body = parseBody(req);
    const { sessionId, userId, message, context } = body;
    if (!message) {
        res.status(400).json({ error: 'message required' });
        return;
    }
    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!rateLimit(`${ip}:${sessionId || 'anon'}`)) {
        res.status(429).json({ error: 'rate_limited' });
        return;
    }
    const correlationId = (0, crypto_1.randomUUID)();
    const injection = (0, policy_1.detectPromptInjection)(message);
    if (injection.flagged && injection.severity === 'high') {
        res.json({ message: 'I can help with travel and lifestyle, but I cannot follow that instruction.', pendingConfirmation: false, debugId: correlationId });
        return;
    }
    const memory = await (0, memory_1.getSessionMemory)(sessionId || 'default', userId);
    const memorySummary = (0, memory_1.summarizeMemory)(memory);
    let plan;
    try {
        const { plan: generated } = await (0, openaiClient_1.generatePlan)({ userMessage: message, memorySummary, intentHint: context === null || context === void 0 ? void 0 : context.intent });
        plan = generated;
    }
    catch (err) {
        functions.logger.error('plan_generation_failed', { correlationId, err: String(err) });
        res.status(500).json({ error: 'plan_failed', debugId: correlationId });
        return;
    }
    const needsConfirmation = ((_a = plan.proposed_action) === null || _a === void 0 ? void 0 : _a.confirmationRequired) === true;
    if (needsConfirmation) {
        await (0, memory_1.saveSessionMemory)(sessionId || 'default', Object.assign(Object.assign({}, memory), { pendingAction: plan.proposed_action }), userId);
        res.json({
            message: plan.user_visible_message,
            pendingConfirmation: true,
            debugId: correlationId,
        });
        return;
    }
    const toolCalls = plan.recommended_next_tool_calls || [];
    let toolResults = [];
    try {
        toolResults = await runToolsIfAllowed(toolCalls, { correlationId, userId, sessionId, confirmed: true });
    }
    catch (err) {
        functions.logger.error('tool_failed', { correlationId, err: String(err) });
    }
    if (toolResults.length && ((_b = toolResults[0]) === null || _b === void 0 ? void 0 : _b.tool) === 'search_listings') {
        memory.lastShortlist = (_c = toolResults[0].output) === null || _c === void 0 ? void 0 : _c.results;
    }
    memory.pendingAction = null;
    await (0, memory_1.saveSessionMemory)(sessionId || 'default', memory, userId);
    const finalMessage = await (0, openaiClient_1.synthesizeFinalMessage)({ userMessage: message, plan, toolCalls, toolResults });
    res.json({ message: finalMessage, debugId: correlationId, pendingConfirmation: false, uiHints: { intent: plan.intent } });
    return;
}
async function handleConfirm(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    const body = parseBody(req);
    const { sessionId, userId, confirm } = body;
    if (!sessionId) {
        res.status(400).json({ error: 'sessionId required' });
        return;
    }
    const correlationId = (0, crypto_1.randomUUID)();
    const memory = await (0, memory_1.getSessionMemory)(sessionId, userId);
    const pending = memory.pendingAction;
    if (!pending) {
        res.status(400).json({ error: 'no pending action', debugId: correlationId });
        return;
    }
    if (!confirm) {
        res.json({ message: 'I will hold that request until you confirm.', pendingConfirmation: true, debugId: correlationId });
        return;
    }
    const toolCalls = pending.toolCalls || [];
    let toolResults = [];
    try {
        toolResults = await runToolsIfAllowed(toolCalls, { correlationId, userId, sessionId, confirmed: true });
    }
    catch (err) {
        functions.logger.error('confirm_tool_failed', { correlationId, err: String(err) });
    }
    memory.pendingAction = null;
    await (0, memory_1.saveSessionMemory)(sessionId, memory, userId);
    res.json({ message: 'Done. I executed the requested action and will monitor status.', debugId: correlationId, toolResults });
    return;
}
exports.alfredChatApi = functions.https.onRequest(handleChat);
exports.alfredConfirmApi = functions.https.onRequest(handleConfirm);
//# sourceMappingURL=alfred.js.map