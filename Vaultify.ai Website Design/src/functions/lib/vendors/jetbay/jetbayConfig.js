"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJetbayConfig = loadJetbayConfig;
const firebase_functions_1 = require("firebase-functions");
const env = process.env;
function readFunctionsJetbayConfig() {
    try {
        const cfg = (0, firebase_functions_1.config)();
        return ((cfg === null || cfg === void 0 ? void 0 : cfg.jetbay) || null);
    }
    catch (_err) {
        // functions.config() is only available in the Cloud Functions runtime and emulator
        return null;
    }
}
function loadJetbayConfig() {
    const runtimeCfg = readFunctionsJetbayConfig();
    const envFlag = ((runtimeCfg === null || runtimeCfg === void 0 ? void 0 : runtimeCfg.env) || env.JETBAY_ENV || 'dev').toLowerCase() === 'prod' ? 'prod' : 'dev';
    const baseUrl = envFlag === 'prod'
        ? (runtimeCfg === null || runtimeCfg === void 0 ? void 0 : runtimeCfg.base_url_prod) ||
            (runtimeCfg === null || runtimeCfg === void 0 ? void 0 : runtimeCfg.baseUrlProd) ||
            env.JETBAY_BASE_URL_PROD
        : (runtimeCfg === null || runtimeCfg === void 0 ? void 0 : runtimeCfg.base_url_dev) ||
            (runtimeCfg === null || runtimeCfg === void 0 ? void 0 : runtimeCfg.baseUrlDev) ||
            env.JETBAY_BASE_URL_DEV;
    const accessKey = (runtimeCfg === null || runtimeCfg === void 0 ? void 0 : runtimeCfg.access_key) ||
        (runtimeCfg === null || runtimeCfg === void 0 ? void 0 : runtimeCfg.accessKey) ||
        env.JETBAY_ACCESS_KEY ||
        '';
    const accessSecret = (runtimeCfg === null || runtimeCfg === void 0 ? void 0 : runtimeCfg.access_secret) ||
        (runtimeCfg === null || runtimeCfg === void 0 ? void 0 : runtimeCfg.accessSecret) ||
        env.JETBAY_ACCESS_SECRET ||
        '';
    const lang = ((runtimeCfg === null || runtimeCfg === void 0 ? void 0 : runtimeCfg.lang) || env.JETBAY_LANG || 'en-us').toLowerCase();
    if (!accessKey || !accessSecret) {
        throw new Error('Jetbay credentials are missing. Set jetbay.access_key and jetbay.access_secret via firebase functions:config:set or environment variables.');
    }
    return {
        env: envFlag,
        baseUrl: baseUrl || 'https://apidev.jet-bay.com',
        accessKey,
        accessSecret,
        lang,
    };
}
//# sourceMappingURL=jetbayConfig.js.map