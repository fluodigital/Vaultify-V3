"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256Hex = sha256Hex;
exports.hmacSha256Base64 = hmacSha256Base64;
exports.generateNonce = generateNonce;
exports.signHeaders = signHeaders;
const crypto_1 = __importDefault(require("crypto"));
const crypto_2 = require("crypto");
const jetbayConfig_1 = require("./jetbayConfig");
function sha256Hex(body) {
    return crypto_1.default.createHash('sha256').update(body).digest('hex');
}
function hmacSha256Base64(secret, canonical) {
    return crypto_1.default.createHmac('sha256', secret).update(canonical).digest('base64');
}
function generateNonce() {
    return (0, crypto_2.randomUUID)();
}
function signHeaders({ bodyString, timestamp, nonce }) {
    const cfg = (0, jetbayConfig_1.loadJetbayConfig)();
    const ts = timestamp || Date.now().toString();
    const n = nonce || generateNonce();
    const contentSha = sha256Hex(bodyString || '');
    const canonical = `${cfg.accessKey}\n${ts}\n${n}\n${contentSha}`;
    const signature = hmacSha256Base64(cfg.accessSecret, canonical);
    return {
        'Content-Type': 'application/json',
        Lang: cfg.lang,
        'X-JetBay-Access-Key': cfg.accessKey,
        'X-JetBay-Timestamp': ts,
        'X-JetBay-Nonce': n,
        'X-JetBay-Content-SHA256': contentSha,
        'X-JetBay-Signature': signature,
    };
}
//# sourceMappingURL=jetbaySigner.js.map