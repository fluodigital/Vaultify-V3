/**
 * Wanderbeds HTTP Client
 * 
 * Low-level HTTP client for Wanderbeds API
 * - Basic Auth
 * - Timeout handling
 * - Standard headers
 * - Request/response logging
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import http from 'http';
import https from 'https';
import * as functions from 'firebase-functions';
import { WanderbedsClientError, normalizeVendorError } from './errors';

const logger = functions.logger;

interface WanderbedsConfig {
  baseUrl: string;
  username: string;
  password: string;
  timeoutMs: number;
}

function loadConfig(): WanderbedsConfig {
  const fnCfg = functions.config();
  const baseUrl = fnCfg?.wanderbeds?.base_url || process.env.WANDERBEDS_BASE || 'https://api.wanderbeds.com';
  const username = fnCfg?.wanderbeds?.username || process.env.WANDERBEDS_USER || '';
  const password = fnCfg?.wanderbeds?.password || process.env.WANDERBEDS_PASS || '';
  const timeoutMs = Number(fnCfg?.wanderbeds?.timeout_ms || process.env.WANDERBEDS_TIMEOUT_MS || 60000);

  if (!username || !password) {
    throw new WanderbedsClientError(
      'Wanderbeds credentials missing. Set WANDERBEDS_USER and WANDERBEDS_PASS environment variables.',
      'config_error',
      500,
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    username,
    password,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 60000,
  };
}

function buildBasicAuth(username: string, password: string): string {
  const token = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${token}`;
}

/**
 * Convert timout (seconds) to milliseconds, with sane cap
 */
function parseTimeout(timout?: string | number): number {
  if (!timout) return 60000; // default 60s
  const seconds = typeof timout === 'string' ? parseInt(timout, 10) : timout;
  if (!Number.isFinite(seconds) || seconds <= 0) return 60000;
  // Cap at 120 seconds (vendor max)
  const cappedSeconds = Math.min(seconds, 120);
  return cappedSeconds * 1000;
}

interface RequestOptions {
  method: 'GET' | 'POST';
  path: string;
  body?: any;
  query?: Record<string, any>;
  token?: string; // Token from search response (for avail/book calls)
  timeoutMs?: number;
}

export async function wanderbedsRequest<T = any>(options: RequestOptions): Promise<T> {
  const cfg = loadConfig();
  const startMs = Date.now();
  const url = `${cfg.baseUrl}${options.path}`;

  const httpAgent = new http.Agent({ keepAlive: true });
  const httpsAgent = new https.Agent({ keepAlive: true });

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip,deflate',
    'Authorization': buildBasicAuth(cfg.username, cfg.password),
  };

  // Add token header if provided (for avail/book calls)
  if (options.token) {
    headers['Token'] = options.token;
  }

  // Determine timeout: use request timeout or parse from body.timout, or default
  const requestTimeoutMs = options.timeoutMs || parseTimeout(options.body?.timout) || cfg.timeoutMs;

  const requestConfig: AxiosRequestConfig = {
    method: options.method,
    url,
    headers,
    httpAgent,
    httpsAgent,
    timeout: requestTimeoutMs,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true, // Don't throw on non-2xx
  };

  if (options.method === 'GET' && options.query) {
    requestConfig.params = options.query;
  }

  if (options.method === 'POST' && options.body) {
    requestConfig.data = options.body;
  }

  try {
    const response = await axios.request(requestConfig);
    const durationMs = Date.now() - startMs;
    const payload = response.data ?? {};

    // Log request (never log credentials)
    logger.info('[wanderbeds_request]', {
      method: options.method,
      path: options.path,
      status: response.status,
      durationMs,
      hasToken: !!options.token,
      // Never log body (may contain credentials) or query
    });

    if (response.status < 200 || response.status >= 300) {
      const error = normalizeVendorError(
        { status: response.status, message: response.statusText, response: { data: payload } },
        options.path,
      );
      error.upstreamMs = durationMs;
      throw error;
    }

    return payload;
  } catch (err: any) {
    const durationMs = Date.now() - startMs;

    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      if (axiosError.code === 'ECONNABORTED') {
        const error = new WanderbedsClientError('Wanderbeds request timed out', 'wanderbeds_timeout', 408);
        error.upstreamMs = durationMs;
        throw error;
      }

      const status = axiosError.response?.status;
      const error = normalizeVendorError(
        {
          status,
          message: axiosError.message,
          response: { data: axiosError.response?.data },
        },
        options.path,
      );
      error.upstreamMs = durationMs;
      throw error;
    }

    // Re-throw if already our error type
    if (err instanceof WanderbedsClientError) {
      err.upstreamMs = durationMs;
      throw err;
    }

    // Unknown error
    const error = normalizeVendorError(err, options.path);
    error.upstreamMs = durationMs;
    throw error;
  }
}
