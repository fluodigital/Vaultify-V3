import fetch, { RequestInit } from 'node-fetch';
import { URLSearchParams } from 'url';
import crypto from 'crypto';
import { loadJetbayConfig } from './jetbayConfig';
import { signHeaders } from './jetbaySigner';

export class JetbayError extends Error {
  constructor(message: string, public code?: number, public status?: number, public correlationId?: string) {
    super(message);
  }
}

export class JetbayAuthError extends JetbayError {}

export type HttpOptions = {
  query?: Record<string, any>;
  body?: any;
  correlationId?: string;
  retry?: number;
};

const RETRY_BASE = 200;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function shouldRetry(status?: number) {
  return !status || status >= 500;
}

export async function jetbayRequest(method: 'GET' | 'POST', path: string, opts: HttpOptions = {}) {
  const cfg = loadJetbayConfig();
  const correlationId = opts.correlationId || crypto.randomUUID();
  let url = `${cfg.baseUrl}${path}`;

  if (opts.query) {
    const qs = new URLSearchParams();
    Object.entries(opts.query).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      qs.append(k, String(v));
    });
    const qsStr = qs.toString();
    if (qsStr) url += (url.includes('?') ? '&' : '?') + qsStr;
  }

  const bodyString = method === 'POST' ? JSON.stringify(opts.body || {}) : '';
  const headers = signHeaders({ bodyString });

  const init: RequestInit = {
    method,
    headers,
    body: method === 'POST' ? bodyString : undefined,
  };

  const attemptRequest = async (attempt: number): Promise<any> => {
    const resp = await fetch(url, init);
    const text = await resp.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch (_e) {}

    if (!resp.ok) {
      const msg = json?.message || resp.statusText;
      if (shouldRetry(resp.status) && attempt < (opts.retry ?? 2)) {
        await sleep(RETRY_BASE * Math.pow(2, attempt) + Math.random() * 50);
        return attemptRequest(attempt + 1);
      }
      const err = new JetbayError(msg, json?.code, resp.status, correlationId);
      if (json?.code && json.code >= 4001 && json.code <= 4007) {
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

    return json ?? {};
  };

  try {
    return await attemptRequest(0);
  } catch (err: any) {
    // Redact signature-related headers
    console.error('jetbay_request_error', {
      message: err?.message,
      code: err?.code,
      status: err?.status,
      correlationId,
      path,
    });
    throw err;
  }
}
