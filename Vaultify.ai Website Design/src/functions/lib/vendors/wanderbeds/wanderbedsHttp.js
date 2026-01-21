"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WanderbedsError = void 0;
exports.wanderbedsRequest = wanderbedsRequest;
exports.wanderbedsRequestWithMeta = wanderbedsRequestWithMeta;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const wanderbedsConfig_1 = require("./wanderbedsConfig");
class WanderbedsError extends Error {
    constructor(message, status, correlationId) {
        super(message);
        this.status = status;
        this.correlationId = correlationId;
    }
}
exports.WanderbedsError = WanderbedsError;
const RETRY_BASE = 200;
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function shouldRetry(status) {
    return !status || status >= 500;
}
function buildBasicAuth(username, password) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return `Basic ${token}`;
}
async function wanderbedsRequest(method, path, opts = {}) {
    var _a;
    const cfg = (0, wanderbedsConfig_1.loadWanderbedsConfig)();
    const correlationId = opts.correlationId || crypto_1.default.randomUUID();
    let url = `${cfg.baseUrl}${path}`;
    const timeoutMs = (_a = opts.timeoutMs) !== null && _a !== void 0 ? _a : cfg.timeoutMs;
    const httpAgent = new http_1.default.Agent({ keepAlive: true });
    const httpsAgent = new https_1.default.Agent({ keepAlive: true });
    // Per Wanderbeds docs: Token header is ONLY for /hotel/avail, /hotel/book, /hotel/bookinfo
    // NEVER send Token on /hotel/search
    const isSearchEndpoint = path === '/hotel/search';
    const shouldIncludeToken = opts.token && !isSearchEndpoint;
    const baseHeaders = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate',
        Authorization: buildBasicAuth(cfg.username, cfg.password),
    };
    if (shouldIncludeToken) {
        baseHeaders['Token'] = opts.token;
    }
    const attemptRequest = async (attempt) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        try {
            const requestConfig = {
                method,
                url,
                headers: baseHeaders,
                httpAgent,
                httpsAgent,
                timeout: timeoutMs,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                validateStatus: () => true,
            };
            if (method === 'GET') {
                requestConfig.params = opts.query;
            }
            if (method === 'POST') {
                requestConfig.data = opts.body || {};
                // Log request for debugging
                console.log('wanderbeds_request_sending', {
                    method,
                    url,
                    path,
                    body: opts.body,
                    hasAuth: !!cfg.username && !!cfg.password,
                    correlationId,
                });
            }
            const resp = await axios_1.default.request(requestConfig);
            const payload = (_a = resp.data) !== null && _a !== void 0 ? _a : {};
            // Log full response for debugging (first 1000 chars)
            if (method === 'POST' && path === '/hotel/search') {
                console.log('wanderbeds_search_response', {
                    status: resp.status,
                    statusText: resp.statusText,
                    headers: resp.headers,
                    dataPreview: JSON.stringify(payload).substring(0, 1000),
                    hasError: !!(payload === null || payload === void 0 ? void 0 : payload.error),
                    errorCode: (_b = payload === null || payload === void 0 ? void 0 : payload.error) === null || _b === void 0 ? void 0 : _b.code,
                    errorMessage: (_c = payload === null || payload === void 0 ? void 0 : payload.error) === null || _c === void 0 ? void 0 : _c.message,
                    count: payload === null || payload === void 0 ? void 0 : payload.count,
                    hotelsLength: ((_d = payload === null || payload === void 0 ? void 0 : payload.hotels) === null || _d === void 0 ? void 0 : _d.length) || (Array.isArray(payload === null || payload === void 0 ? void 0 : payload.hotels) ? payload.hotels.length : 0),
                    correlationId,
                });
            }
            // Check if response has an error field (even if status is 200)
            if (payload === null || payload === void 0 ? void 0 : payload.error) {
                const errorCode = payload.error.code;
                const errorMsg = typeof payload.error.message === 'string'
                    ? payload.error.message
                    : (payload.error.message || 'No results available');
                console.error('wanderbeds_api_error_in_response', {
                    status: resp.status,
                    errorCode,
                    errorMessage: errorMsg,
                    path,
                    correlationId,
                });
                // For "No results" (code 100), return empty result instead of throwing
                if (errorCode === 100) {
                    return Object.assign(Object.assign({}, payload), { count: 0, hotels: [] });
                }
                throw new WanderbedsError(errorMsg, resp.status || 404, correlationId);
            }
            if (resp.status < 200 || resp.status >= 300) {
                const msg = typeof (payload === null || payload === void 0 ? void 0 : payload.message) === 'string'
                    ? payload.message
                    : (typeof (payload === null || payload === void 0 ? void 0 : payload.error) === 'string'
                        ? payload.error
                        : (typeof (payload === null || payload === void 0 ? void 0 : payload.error) === 'object' && ((_e = payload === null || payload === void 0 ? void 0 : payload.error) === null || _e === void 0 ? void 0 : _e.message)
                            ? payload.error.message
                            : resp.statusText || 'Request failed'));
                // Log the full response for debugging
                console.error('wanderbeds_http_error_response', {
                    status: resp.status,
                    statusText: resp.statusText,
                    data: payload,
                    dataString: typeof payload === 'string' ? payload : JSON.stringify(payload),
                    headers: resp.headers,
                    url,
                    method,
                    path,
                    requestBody: method === 'POST' ? opts.body : undefined,
                    correlationId,
                });
                if (opts.safe && shouldRetry(resp.status) && attempt < ((_f = opts.retry) !== null && _f !== void 0 ? _f : 2)) {
                    await sleep(RETRY_BASE * Math.pow(2, attempt) + Math.random() * 50);
                    return attemptRequest(attempt + 1);
                }
                throw new WanderbedsError(msg, resp.status, correlationId);
            }
            return payload !== null && payload !== void 0 ? payload : {};
        }
        catch (err) {
            const axiosError = err;
            if ((axiosError === null || axiosError === void 0 ? void 0 : axiosError.code) === 'ECONNABORTED') {
                throw new WanderbedsError('Request timed out', 408, correlationId);
            }
            const status = (_h = (_g = axiosError === null || axiosError === void 0 ? void 0 : axiosError.response) === null || _g === void 0 ? void 0 : _g.status) !== null && _h !== void 0 ? _h : err === null || err === void 0 ? void 0 : err.status;
            if (opts.safe && shouldRetry(status) && attempt < ((_j = opts.retry) !== null && _j !== void 0 ? _j : 2)) {
                await sleep(RETRY_BASE * Math.pow(2, attempt) + Math.random() * 50);
                return attemptRequest(attempt + 1);
            }
            console.error('wanderbeds_request_error', {
                message: err === null || err === void 0 ? void 0 : err.message,
                status,
                correlationId,
                path,
            });
            throw err;
        }
    };
    return attemptRequest(0);
}
async function wanderbedsRequestWithMeta(method, path, opts = {}) {
    var _a, _b, _c, _d, _e;
    const cfg = (0, wanderbedsConfig_1.loadWanderbedsConfig)();
    const correlationId = opts.correlationId || crypto_1.default.randomUUID();
    const url = `${cfg.baseUrl}${path}`;
    const timeoutMs = (_a = opts.timeoutMs) !== null && _a !== void 0 ? _a : cfg.timeoutMs;
    const httpAgent = new http_1.default.Agent({ keepAlive: true });
    const httpsAgent = new https_1.default.Agent({ keepAlive: true });
    // Per Wanderbeds docs: Token header is ONLY for /hotel/avail, /hotel/book, /hotel/bookinfo
    // NEVER send Token on /hotel/search
    const isSearchEndpoint = path === '/hotel/search';
    const shouldIncludeToken = opts.token && !isSearchEndpoint;
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate',
        Authorization: buildBasicAuth(cfg.username, cfg.password),
    };
    if (shouldIncludeToken) {
        headers['Token'] = opts.token;
    }
    const start = Date.now();
    const requestConfig = {
        method,
        url,
        headers,
        httpAgent,
        httpsAgent,
        timeout: timeoutMs,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        validateStatus: () => true,
    };
    if (method === 'GET')
        requestConfig.params = opts.query;
    if (method === 'POST')
        requestConfig.data = opts.body || {};
    const resp = await axios_1.default.request(requestConfig);
    const ms = Date.now() - start;
    const payload = (_b = resp.data) !== null && _b !== void 0 ? _b : {};
    const upstreamBodyRawText = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const meta = {
        correlationId,
        url,
        method,
        ms,
        upstreamHttpStatus: resp.status,
        upstreamHeaders: {
            contentType: String(((_c = resp.headers) === null || _c === void 0 ? void 0 : _c['content-type']) || ''),
            contentEncoding: String(((_d = resp.headers) === null || _d === void 0 ? void 0 : _d['content-encoding']) || ''),
            contentLength: String(((_e = resp.headers) === null || _e === void 0 ? void 0 : _e['content-length']) || ''),
        },
        requestSentToUpstream: method === 'POST' ? (opts.body || {}) : (opts.query || {}),
        headersSentToUpstream: (() => {
            const sanitized = {
                Accept: headers['Accept'],
                'Content-Type': headers['Content-Type'],
                'Accept-Encoding': headers['Accept-Encoding'],
                Authorization: '[REDACTED_BASIC]',
            };
            // Only include Token if it was actually sent (not for search)
            if (shouldIncludeToken) {
                sanitized['Token'] = '[REDACTED_TOKEN]';
            }
            return sanitized;
        })(),
        upstreamBodyRawText,
        parsedBody: typeof payload === 'string' ? (() => { try {
            return JSON.parse(payload);
        }
        catch (_a) {
            return null;
        } })() : payload,
    };
    return { payload, meta };
}
//# sourceMappingURL=wanderbedsHttp.js.map