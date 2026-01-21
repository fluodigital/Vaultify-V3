"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JetbayAuthError = exports.JetbayError = void 0;
exports.jetbayRequest = jetbayRequest;
const node_fetch_1 = __importDefault(require("node-fetch"));
const url_1 = require("url");
const crypto_1 = __importDefault(require("crypto"));
const jetbayConfig_1 = require("./jetbayConfig");
const jetbaySigner_1 = require("./jetbaySigner");
class JetbayError extends Error {
    constructor(message, code, status, correlationId) {
        super(message);
        this.code = code;
        this.status = status;
        this.correlationId = correlationId;
    }
}
exports.JetbayError = JetbayError;
class JetbayAuthError extends JetbayError {
}
exports.JetbayAuthError = JetbayAuthError;
const RETRY_BASE = 200;
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function shouldRetry(status) {
    return !status || status >= 500;
}
async function jetbayRequest(method, path, opts = {}) {
    const cfg = (0, jetbayConfig_1.loadJetbayConfig)();
    const correlationId = opts.correlationId || crypto_1.default.randomUUID();
    let url = `${cfg.baseUrl}${path}`;
    if (opts.query) {
        const qs = new url_1.URLSearchParams();
        Object.entries(opts.query).forEach(([k, v]) => {
            if (v === undefined || v === null)
                return;
            qs.append(k, String(v));
        });
        const qsStr = qs.toString();
        if (qsStr)
            url += (url.includes('?') ? '&' : '?') + qsStr;
    }
    const bodyString = method === 'POST' ? JSON.stringify(opts.body || {}) : '';
    const headers = (0, jetbaySigner_1.signHeaders)({ bodyString });
    const init = {
        method,
        headers,
        body: method === 'POST' ? bodyString : undefined,
    };
    const attemptRequest = async (attempt) => {
        var _a;
        const resp = await (0, node_fetch_1.default)(url, init);
        const text = await resp.text();
        let json = null;
        try {
            json = text ? JSON.parse(text) : null;
        }
        catch (_e) { }
        if (!resp.ok) {
            const msg = (json === null || json === void 0 ? void 0 : json.message) || resp.statusText;
            if (shouldRetry(resp.status) && attempt < ((_a = opts.retry) !== null && _a !== void 0 ? _a : 2)) {
                await sleep(RETRY_BASE * Math.pow(2, attempt) + Math.random() * 50);
                return attemptRequest(attempt + 1);
            }
            const err = new JetbayError(msg, json === null || json === void 0 ? void 0 : json.code, resp.status, correlationId);
            if ((json === null || json === void 0 ? void 0 : json.code) && json.code >= 4001 && json.code <= 4007) {
                throw new JetbayAuthError(msg, json.code, resp.status, correlationId);
            }
            throw err;
        }
        if (json && json.success === false) {
            const msg = json.message || 'Jetbay error';
            if (json.code && json.code >= 4001 && json.code <= 4007) {
                throw new JetbayAuthError(msg, json.code, resp.status, correlationId);
            }
            throw new JetbayError(msg, json.code, resp.status, correlationId);
        }
        return json !== null && json !== void 0 ? json : {};
    };
    try {
        return await attemptRequest(0);
    }
    catch (err) {
        // Redact signature-related headers
        console.error('jetbay_request_error', {
            message: err === null || err === void 0 ? void 0 : err.message,
            code: err === null || err === void 0 ? void 0 : err.code,
            status: err === null || err === void 0 ? void 0 : err.status,
            correlationId,
            path,
        });
        throw err;
    }
}
//# sourceMappingURL=jetbayHttp.js.map