import crypto from 'crypto';
import { randomUUID } from 'crypto';
import { loadJetbayConfig } from './jetbayConfig';

export function sha256Hex(body: string) {
  return crypto.createHash('sha256').update(body).digest('hex');
}

export function hmacSha256Base64(secret: string, canonical: string) {
  return crypto.createHmac('sha256', secret).update(canonical).digest('base64');
}

export function generateNonce() {
  return randomUUID();
}

export type SignParams = {
  bodyString: string;
  timestamp?: string;
  nonce?: string;
};

export function signHeaders({ bodyString, timestamp, nonce }: SignParams) {
  const cfg = loadJetbayConfig();
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
  } as Record<string, string>;
}
