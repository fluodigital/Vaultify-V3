import { auth } from './firebase';

const DEFAULT_BASE = 'https://us-central1-vaultfy-377ee.cloudfunctions.net/api';
const base = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, '');

export const apiBaseUrl = base;

async function authHeader() {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildUrl(path: string, params?: Record<string, any>) {
  const qs = params
    ? Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  const prefix = base ? `${base}` : '';
  return `${prefix}${path}${qs ? (path.includes('?') ? '&' : '?') + qs : ''}`;
}

export function getApiUrl(path: string, params?: Record<string, any>) {
  return buildUrl(path, params);
}

export async function apiGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  const headers = await authHeader();
  const res = await fetch(buildUrl(path, params), { headers });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body?: any, opts?: { requireAuth?: boolean }): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const authHeaders = await authHeader();
  Object.assign(headers, authHeaders);
  if (opts?.requireAuth && !authHeaders.Authorization) {
    throw new Error('auth_required');
  }
  const res = await fetch(buildUrl(path), { method: 'POST', headers, body: JSON.stringify(body || {}) });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}
