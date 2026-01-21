"use strict";
/**
 * Wanderbeds API Error Types
 *
 * Clean error handling for Wanderbeds integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WanderbedsClientError = void 0;
exports.normalizeVendorError = normalizeVendorError;
class WanderbedsClientError extends Error {
    constructor(message, code, statusCode = 502, upstreamStatus, upstreamMs) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.upstreamStatus = upstreamStatus;
        this.upstreamMs = upstreamMs;
        this.name = 'WanderbedsClientError';
    }
}
exports.WanderbedsClientError = WanderbedsClientError;
/**
 * Convert vendor error to internal error
 */
function normalizeVendorError(err, endpoint) {
    var _a, _b, _c;
    if (err instanceof WanderbedsClientError) {
        return err;
    }
    const status = (err === null || err === void 0 ? void 0 : err.status) || (err === null || err === void 0 ? void 0 : err.statusCode) || ((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status);
    const message = (err === null || err === void 0 ? void 0 : err.message) || ((_c = (_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Wanderbeds request failed';
    if (status === 401) {
        return new WanderbedsClientError('Invalid Wanderbeds credentials', 'wanderbeds_auth_error', 401, status);
    }
    if (status === 400) {
        return new WanderbedsClientError(`Invalid request to ${endpoint}`, 'wanderbeds_bad_request', 400, status);
    }
    if (status === 404) {
        return new WanderbedsClientError(`Resource not found: ${endpoint}`, 'wanderbeds_not_found', 404, status);
    }
    if (status === 408 || (err === null || err === void 0 ? void 0 : err.code) === 'ECONNABORTED') {
        return new WanderbedsClientError('Wanderbeds request timed out', 'wanderbeds_timeout', 408, status);
    }
    if (status >= 500) {
        return new WanderbedsClientError('Wanderbeds server error', 'wanderbeds_server_error', 502, status);
    }
    return new WanderbedsClientError(message, 'wanderbeds_unknown_error', 502, status);
}
//# sourceMappingURL=errors.js.map