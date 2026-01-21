import { config as firebaseConfig } from 'firebase-functions';

const env = process.env;

export type JetbayConfig = {
  env: 'dev' | 'prod';
  baseUrl: string;
  accessKey: string;
  accessSecret: string;
  lang: string;
};

type JetbayRuntimeConfig = Partial<{
  env: string;
  base_url_dev: string;
  base_url_prod: string;
  baseUrlDev: string;
  baseUrlProd: string;
  access_key: string;
  accessKey: string;
  access_secret: string;
  accessSecret: string;
  lang: string;
}>;

function readFunctionsJetbayConfig(): JetbayRuntimeConfig | null {
  try {
    const cfg = firebaseConfig();
    return (cfg?.jetbay || null) as JetbayRuntimeConfig | null;
  } catch (_err) {
    // functions.config() is only available in the Cloud Functions runtime and emulator
    return null;
  }
}

export function loadJetbayConfig(): JetbayConfig {
  const runtimeCfg = readFunctionsJetbayConfig();

  const envFlag =
    (runtimeCfg?.env || env.JETBAY_ENV || 'dev').toLowerCase() === 'prod' ? 'prod' : 'dev';

  const baseUrl =
    envFlag === 'prod'
      ? runtimeCfg?.base_url_prod ||
        runtimeCfg?.baseUrlProd ||
        env.JETBAY_BASE_URL_PROD
      : runtimeCfg?.base_url_dev ||
        runtimeCfg?.baseUrlDev ||
        env.JETBAY_BASE_URL_DEV;

  const accessKey =
    runtimeCfg?.access_key ||
    runtimeCfg?.accessKey ||
    env.JETBAY_ACCESS_KEY ||
    '';
  const accessSecret =
    runtimeCfg?.access_secret ||
    runtimeCfg?.accessSecret ||
    env.JETBAY_ACCESS_SECRET ||
    '';
  const lang = (runtimeCfg?.lang || env.JETBAY_LANG || 'en-us').toLowerCase();

  if (!accessKey || !accessSecret) {
    throw new Error(
      'Jetbay credentials are missing. Set jetbay.access_key and jetbay.access_secret via firebase functions:config:set or environment variables.',
    );
  }

  return {
    env: envFlag,
    baseUrl: baseUrl || 'https://apidev.jet-bay.com',
    accessKey,
    accessSecret,
    lang,
  };
}
