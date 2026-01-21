import { config as functionsConfig } from 'firebase-functions';

export type WanderbedsConfig = {
  baseUrl: string;
  username: string;
  password: string;
  timeoutMs: number;
};

function readFunctionsConfig() {
  try {
    const cfg = functionsConfig();
    return cfg?.wanderbeds || null;
  } catch (_e) {
    return null;
  }
}

export function loadWanderbedsConfig(): WanderbedsConfig {
  const fnCfg = readFunctionsConfig();
  const baseUrl = fnCfg?.base_url || process.env.WANDERBEDS_BASE_URL || 'https://api.wanderbeds.com';
  const username = fnCfg?.username || process.env.WANDERBEDS_USERNAME || '';
  const password = fnCfg?.password || process.env.WANDERBEDS_PASSWORD || '';
  const timeoutMs = Number(fnCfg?.timeout_ms || process.env.WANDERBEDS_TIMEOUT_MS || 15000);

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
