"use strict";
/**
 * Wanderbeds HTTP Client
 *
 * Low-level HTTP client for Wanderbeds API
 * - Basic Auth
 * - Timeout handling
 * - Standard headers
 * - Request/response logging
 */
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
exports.wanderbedsRequest = wanderbedsRequest;
const axios_1 = __importDefault(require("axios"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const functions = __importStar(require("firebase-functions"));
const errors_1 = require("./errors");
const logger = functions.logger;
function loadConfig() {
    var _a, _b, _c, _d;
    const fnCfg = functions.config();
    const baseUrl = ((_a = fnCfg === null || fnCfg === void 0 ? void 0 : fnCfg.wanderbeds) === null || _a === void 0 ? void 0 : _a.base_url) || process.env.WANDERBEDS_BASE || 'https://api.wanderbeds.com';
    const username = ((_b = fnCfg === null || fnCfg === void 0 ? void 0 : fnCfg.wanderbeds) === null || _b === void 0 ? void 0 : _b.username) || process.env.WANDERBEDS_USER || '';
    const password = ((_c = fnCfg === null || fnCfg === void 0 ? void 0 : fnCfg.wanderbeds) === null || _c === void 0 ? void 0 : _c.password) || process.env.WANDERBEDS_PASS || '';
    const timeoutMs = Number(((_d = fnCfg === null || fnCfg === void 0 ? void 0 : fnCfg.wanderbeds) === null || _d === void 0 ? void 0 : _d.timeout_ms) || process.env.WANDERBEDS_TIMEOUT_MS || 60000);
    if (!username || !password) {
        throw new errors_1.WanderbedsClientError('Wanderbeds credentials missing. Set WANDERBEDS_USER and WANDERBEDS_PASS environment variables.', 'config_error', 500);
    }
    return {
        baseUrl: baseUrl.replace(/\/$/, ''),
        username,
        password,
        timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 60000,
    };
}
function buildBasicAuth(username, password) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return `Basic ${token}`;
}
/**
 * Convert timout (seconds) to milliseconds, with sane cap
 */
function parseTimeout(timout) {
    if (!timout)
        return 60000; // default 60s
    const seconds = typeof timout === 'string' ? parseInt(timout, 10) : timout;
    if (!Number.isFinite(seconds) || seconds <= 0)
        return 60000;
    // Cap at 120 seconds (vendor max)
    const cappedSeconds = Math.min(seconds, 120);
    return cappedSeconds * 1000;
}
async function wanderbedsRequest(options) {
    var _a, _b, _c, _d;
    const cfg = loadConfig();
    const startMs = Date.now();
    const url = `${cfg.baseUrl}${options.path}`;
    const httpAgent = new http_1.default.Agent({ keepAlive: true });
    const httpsAgent = new https_1.default.Agent({ keepAlive: true });
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate',
        'Authorization': buildBasicAuth(cfg.username, cfg.password),
    };
    // Add token header if provided (for avail/book calls)
    if (options.token) {
        headers['Token'] = options.token;
    }
    // Determine timeout: use request timeout or parse from body.timout, or default
    const requestTimeoutMs = options.timeoutMs || parseTimeout((_a = options.body) === null || _a === void 0 ? void 0 : _a.timout) || cfg.timeoutMs;
    const requestConfig = {
        method: options.method,
        url,
        headers,
        httpAgent,
        httpsAgent,
        timeout: requestTimeoutMs,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        validateStatus: () => true, // Don't throw on non-2xx
    };
    if (options.method === 'GET' && options.query) {
        requestConfig.params = options.query;
    }
    if (options.method === 'POST' && options.body) {
        requestConfig.data = options.body;
    }
    try {
        const response = await axios_1.default.request(requestConfig);
        const durationMs = Date.now() - startMs;
        const payload = (_b = response.data) !== null && _b !== void 0 ? _b : {};
        // Log request (never log credentials)
        logger.info('[wanderbeds_request]', {
            method: options.method,
            path: options.path,
            status: response.status,
            durationMs,
            hasToken: !!options.token,
            // Never log body (may contain credentials) or query
        });
        if (response.status < 200 || response.status >= 300) {
            const error = (0, errors_1.normalizeVendorError)({ status: response.status, message: response.statusText, response: { data: payload } }, options.path);
            error.upstreamMs = durationMs;
            throw error;
        }
        return payload;
    }
    catch (err) {
        const durationMs = Date.now() - startMs;
        if (axios_1.default.isAxiosError(err)) {
            const axiosError = err;
            if (axiosError.code === 'ECONNABORTED') {
                const error = new errors_1.WanderbedsClientError('Wanderbeds request timed out', 'wanderbeds_timeout', 408);
                error.upstreamMs = durationMs;
                throw error;
            }
            const status = (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.status;
            const error = (0, errors_1.normalizeVendorError)({
                status,
                message: axiosError.message,
                response: { data: (_d = axiosError.response) === null || _d === void 0 ? void 0 : _d.data },
            }, options.path);
            error.upstreamMs = durationMs;
            throw error;
        }
        // Re-throw if already our error type
        if (err instanceof errors_1.WanderbedsClientError) {
            err.upstreamMs = durationMs;
            throw err;
        }
        // Unknown error
        const error = (0, errors_1.normalizeVendorError)(err, options.path);
        error.upstreamMs = durationMs;
        throw error;
    }
}
//# sourceMappingURL=client.js.map