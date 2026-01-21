"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWanderbedsConfig = loadWanderbedsConfig;
const firebase_functions_1 = require("firebase-functions");
function readFunctionsConfig() {
    try {
        const cfg = (0, firebase_functions_1.config)();
        return (cfg === null || cfg === void 0 ? void 0 : cfg.wanderbeds) || null;
    }
    catch (_e) {
        return null;
    }
}
function loadWanderbedsConfig() {
    const fnCfg = readFunctionsConfig();
    const baseUrl = (fnCfg === null || fnCfg === void 0 ? void 0 : fnCfg.base_url) || process.env.WANDERBEDS_BASE_URL || 'https://api.wanderbeds.com';
    const username = (fnCfg === null || fnCfg === void 0 ? void 0 : fnCfg.username) || process.env.WANDERBEDS_USERNAME || '';
    const password = (fnCfg === null || fnCfg === void 0 ? void 0 : fnCfg.password) || process.env.WANDERBEDS_PASSWORD || '';
    const timeoutMs = Number((fnCfg === null || fnCfg === void 0 ? void 0 : fnCfg.timeout_ms) || process.env.WANDERBEDS_TIMEOUT_MS || 15000);
    if (!username || !password) {
        throw new Error('Wanderbeds credentials are missing. Set wanderbeds.username and wanderbeds.password in Functions config.');
    }
    return {
        baseUrl,
        username,
        password,
        timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : 15000,
    };
}
//# sourceMappingURL=wanderbedsConfig.js.map