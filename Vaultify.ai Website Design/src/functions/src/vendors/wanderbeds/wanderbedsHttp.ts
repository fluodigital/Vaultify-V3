import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import http from 'http';
import https from 'https';
import { loadWanderbedsConfig } from './wanderbedsConfig';

export class WanderbedsError extends Error {
  constructor(message: string, public status?: number, public correlationId?: string) {
    super(message);
  }
}

type HttpOptions = {
  query?: Record<string, any>;
  body?: any;
  timeoutMs?: number;
  retry?: number;
  safe?: boolean;
  token?: string; // Token header for avail/book requests (per Wanderbeds docs: "Token" header)
  correlationId?: string; // allow caller-provided correlation id for log correlation
};

const RETRY_BASE = 200;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function shouldRetry(status?: number) {
  return !status || status >= 500;
}

function buildBasicAuth(username: string, password: string) {
  const token = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${token}`;
}

export async function wanderbedsRequest(method: 'GET' | 'POST', path: string, opts: HttpOptions = {}) {
  const cfg = loadWanderbedsConfig();
  const correlationId = opts.correlationId || crypto.randomUUID();
  let url = `${cfg.baseUrl}${path}`;

  const timeoutMs = opts.timeoutMs ?? cfg.timeoutMs;
  const httpAgent = new http.Agent({ keepAlive: true });
  const httpsAgent = new https.Agent({ keepAlive: true });

  // Per Wanderbeds docs: Token header is ONLY for /hotel/avail, /hotel/book, /hotel/bookinfo
  // NEVER send Token on /hotel/search
  const isSearchEndpoint = path === '/hotel/search';
  const shouldIncludeToken = opts.token && !isSearchEndpoint;
  
  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip,deflate',
    Authorization: buildBasicAuth(cfg.username, cfg.password),
  };
  
  if (shouldIncludeToken) {
    baseHeaders['Token'] = opts.token!;
  }

      const attemptRequest = async (attempt: number): Promise<any> => {
    try {
      const requestConfig: AxiosRequestConfig = {
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

      const resp = await axios.request(requestConfig);
      const payload = resp.data ?? {};
      
      // Log full response for debugging (first 1000 chars)
      if (method === 'POST' && path === '/hotel/search') {
        console.log('wanderbeds_search_response', {
          status: resp.status,
          statusText: resp.statusText,
          headers: resp.headers,
          dataPreview: JSON.stringify(payload).substring(0, 1000),
          hasError: !!payload?.error,
          errorCode: payload?.error?.code,
          errorMessage: payload?.error?.message,
          count: payload?.count,
          hotelsLength: payload?.hotels?.length || (Array.isArray(payload?.hotels) ? payload.hotels.length : 0),
          correlationId,
        });
      }
      
      // Check if response has an error field (even if status is 200)
      if (payload?.error) {
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
          return { ...payload, count: 0, hotels: [] };
        }
        
        throw new WanderbedsError(errorMsg, resp.status || 404, correlationId);
      }

      if (resp.status < 200 || resp.status >= 300) {
        const msg = typeof payload?.message === 'string' 
          ? payload.message 
          : (typeof payload?.error === 'string' 
            ? payload.error 
            : (typeof payload?.error === 'object' && payload?.error?.message
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
        
        if (opts.safe && shouldRetry(resp.status) && attempt < (opts.retry ?? 2)) {
          await sleep(RETRY_BASE * Math.pow(2, attempt) + Math.random() * 50);
          return attemptRequest(attempt + 1);
        }
        throw new WanderbedsError(msg, resp.status, correlationId);
      }
      return payload ?? {};
    } catch (err: any) {
      const axiosError = err as AxiosError;
      if (axiosError?.code === 'ECONNABORTED') {
        throw new WanderbedsError('Request timed out', 408, correlationId);
      }
      const status = axiosError?.response?.status ?? err?.status;
      if (opts.safe && shouldRetry(status) && attempt < (opts.retry ?? 2)) {
        await sleep(RETRY_BASE * Math.pow(2, attempt) + Math.random() * 50);
        return attemptRequest(attempt + 1);
      }
      console.error('wanderbeds_request_error', {
        message: err?.message,
        status,
        correlationId,
        path,
      });
      throw err;
    }
  };

  return attemptRequest(0);
}

// ----------------------------------------------------------------------------
// Debug helper: capture upstream HTTP status/headers/body + sanitized request
// ----------------------------------------------------------------------------

export type WanderbedsUpstreamMeta = {
  correlationId: string;
  url: string;
  method: 'GET' | 'POST';
  ms: number;
  upstreamHttpStatus: number;
  upstreamHeaders: {
    contentType: string;
    contentEncoding: string;
    contentLength: string;
  };
  requestSentToUpstream: any;
  headersSentToUpstream: Record<string, string>; // Sanitized headers (proper case, no auth)
  upstreamBodyRawText: string;
  parsedBody: any;
};

export async function wanderbedsRequestWithMeta(method: 'GET' | 'POST', path: string, opts: HttpOptions = {}): Promise<{ payload: any; meta: WanderbedsUpstreamMeta }> {
  const cfg = loadWanderbedsConfig();
  const correlationId = opts.correlationId || crypto.randomUUID();
  const url = `${cfg.baseUrl}${path}`;

  const timeoutMs = opts.timeoutMs ?? cfg.timeoutMs;
  const httpAgent = new http.Agent({ keepAlive: true });
  const httpsAgent = new https.Agent({ keepAlive: true });

  // Per Wanderbeds docs: Token header is ONLY for /hotel/avail, /hotel/book, /hotel/bookinfo
  // NEVER send Token on /hotel/search
  const isSearchEndpoint = path === '/hotel/search';
  const shouldIncludeToken = opts.token && !isSearchEndpoint;
  
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip,deflate',
    Authorization: buildBasicAuth(cfg.username, cfg.password),
  };
  if (shouldIncludeToken) {
    headers['Token'] = opts.token!;
  }

  const start = Date.now();

  const requestConfig: AxiosRequestConfig = {
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
  if (method === 'GET') requestConfig.params = opts.query;
  if (method === 'POST') requestConfig.data = opts.body || {};

  const resp = await axios.request(requestConfig);
  const ms = Date.now() - start;

  const payload = resp.data ?? {};
  const upstreamBodyRawText = typeof payload === 'string' ? payload : JSON.stringify(payload);

  const meta: WanderbedsUpstreamMeta = {
    correlationId,
    url,
    method,
    ms,
    upstreamHttpStatus: resp.status,
    upstreamHeaders: {
      contentType: String(resp.headers?.['content-type'] || ''),
      contentEncoding: String(resp.headers?.['content-encoding'] || ''),
      contentLength: String(resp.headers?.['content-length'] || ''),
    },
    requestSentToUpstream: method === 'POST' ? (opts.body || {}) : (opts.query || {}),
    headersSentToUpstream: (() => {
      const sanitized: Record<string, string> = {
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
    parsedBody: typeof payload === 'string' ? (() => { try { return JSON.parse(payload); } catch { return null; } })() : payload,
  };

  return { payload, meta };
}
