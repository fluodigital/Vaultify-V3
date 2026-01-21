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
exports.getSessionMemory = getSessionMemory;
exports.saveSessionMemory = saveSessionMemory;
exports.summarizeMemory = summarizeMemory;
const admin = __importStar(require("firebase-admin"));
const policy_1 = require("./policy");
const db = admin.firestore();
const fallbackMemory = new Map();
async function getSessionMemory(sessionId, userId) {
    if (!sessionId)
        return {};
    try {
        const ref = db.collection('alfredSessions').doc(sessionId);
        const snap = await ref.get();
        if (snap.exists) {
            const data = snap.data();
            if (userId && data.userId && data.userId !== userId)
                return {};
            return {
                userPreferences: data.userPreferences || {},
                currentTripContext: data.currentTripContext || {},
                pendingAction: data.pendingAction || null,
                lastShortlist: data.lastShortlist,
            };
        }
    }
    catch (err) {
        // Fallback to in-memory if Firestore unavailable
    }
    return fallbackMemory.get(sessionId) || {};
}
async function saveSessionMemory(sessionId, memory, userId) {
    if (!sessionId)
        return;
    const sanitized = {
        userId,
        userPreferences: memory.userPreferences || {},
        currentTripContext: memory.currentTripContext || {},
        pendingAction: memory.pendingAction || null,
        lastShortlist: memory.lastShortlist,
    };
    try {
        const ref = db.collection('alfredSessions').doc(sessionId);
        await ref.set(sanitized, { merge: true });
    }
    catch (err) {
        fallbackMemory.set(sessionId, sanitized);
    }
}
function summarizeMemory(memory) {
    const prefs = memory.userPreferences ? JSON.stringify(memory.userPreferences).slice(0, 400) : '';
    const ctx = memory.currentTripContext ? JSON.stringify(memory.currentTripContext).slice(0, 400) : '';
    return {
        userPreferences: prefs ? (0, policy_1.redactPII)(prefs) : undefined,
        currentTripContext: ctx ? (0, policy_1.redactPII)(ctx) : undefined,
        pendingAction: memory.pendingAction,
        lastShortlist: memory.lastShortlist ? '[cached shortlist]' : undefined,
    };
}
//# sourceMappingURL=memory.js.map