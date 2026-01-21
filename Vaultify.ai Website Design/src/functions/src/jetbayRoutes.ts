import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { cityQuery, countryQuery, searchCharter, emptyLegQueryPage, submitLead, submitEmptyLegLead } from './vendors/jetbay/jetbayApi';

function cors(res: functions.Response) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

function parseBody(req: functions.https.Request) {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body || {};
}

const rateMap = new Map<string, { count: number; windowStart: number }>();
const WINDOW = 60_000;
const LIMIT = 30;
function rateLimit(key: string) {
  const now = Date.now();
  const entry = rateMap.get(key) || { count: 0, windowStart: now };
  if (now - entry.windowStart > WINDOW) { entry.count = 0; entry.windowStart = now; }
  entry.count += 1;
  rateMap.set(key, entry);
  return entry.count <= LIMIT;
}

async function requireAuth(req: functions.https.Request): Promise<string | null> {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch (_e) {
    return null;
  }
}

async function handlerCities(req: functions.https.Request, res: functions.Response): Promise<void> {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  const q = String(req.query.q || '').trim();
  if (!q) { res.status(400).json({ error: 'q required' }); return; }
  if (!rateLimit(req.ip || 'anon')) { res.status(429).json({ error: 'rate_limited' }); return; }
  try {
    const data = await cityQuery(q);
    res.json({ results: data });
  } catch (err: any) {
    res.status(500).json({ error: 'jetbay_error', message: err?.message });
  }
}

async function handlerCountries(req: functions.https.Request, res: functions.Response): Promise<void> {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  const q = req.query.q ? String(req.query.q) : undefined;
  if (!rateLimit(req.ip || 'anon')) { res.status(429).json({ error: 'rate_limited' }); return; }
  try {
    const data = await countryQuery(q);
    res.json({ results: data });
  } catch (err: any) {
    res.status(500).json({ error: 'jetbay_error', message: err?.message });
  }
}

async function handlerCharterSearch(req: functions.https.Request, res: functions.Response): Promise<void> {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!rateLimit(req.ip || 'anon')) { res.status(429).json({ error: 'rate_limited' }); return; }
  const body = parseBody(req);
  const correlationId = randomUUID();
  try {
    const { listings, offers } = await searchCharter(body, correlationId, undefined);
    res.json({ listings, offers, debugId: correlationId });
  } catch (err: any) {
    res.status(500).json({ error: 'jetbay_error', message: err?.message, debugId: correlationId });
  }
}

async function handlerEmptyLegSearch(req: functions.https.Request, res: functions.Response): Promise<void> {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!rateLimit(req.ip || 'anon')) { res.status(429).json({ error: 'rate_limited' }); return; }
  const params = req.query || {};
  const correlationId = randomUUID();
  try {
    const result = await emptyLegQueryPage(params, correlationId, undefined);
    res.json({ ...result, debugId: correlationId });
  } catch (err: any) {
    res.status(500).json({ error: 'jetbay_error', message: err?.message, debugId: correlationId });
  }
}

async function handlerInquiryCharter(req: functions.https.Request, res: functions.Response): Promise<void> {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  const uid = await requireAuth(req);
  if (!uid) { res.status(401).json({ error: 'auth_required' }); return; }
  const body = parseBody(req);
  const correlationId = randomUUID();
  try {
    const result = await submitLead(body, correlationId, uid);
    res.json({ ...result, debugId: correlationId, notice: 'Inquiry submitted to Jetbay' });
  } catch (err: any) {
    res.status(500).json({ error: 'jetbay_error', message: err?.message, debugId: correlationId });
  }
}

async function handlerInquiryEmpty(req: functions.https.Request, res: functions.Response): Promise<void> {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  const uid = await requireAuth(req);
  if (!uid) { res.status(401).json({ error: 'auth_required' }); return; }
  const body = parseBody(req);
  const correlationId = randomUUID();
  try {
    const result = await submitEmptyLegLead(body, correlationId, uid);
    res.json({ ...result, debugId: correlationId, notice: 'Inquiry submitted to Jetbay' });
  } catch (err: any) {
    res.status(500).json({ error: 'jetbay_error', message: err?.message, debugId: correlationId });
  }
}

export const jetbayCities = functions.https.onRequest(handlerCities);
export const jetbayCountries = functions.https.onRequest(handlerCountries);
export const jetbaySearchCharter = functions.https.onRequest(handlerCharterSearch);
export const jetbaySearchEmptyLegs = functions.https.onRequest(handlerEmptyLegSearch);
export const jetbayInquiryCharter = functions.https.onRequest(handlerInquiryCharter);
export const jetbayInquiryEmptyLeg = functions.https.onRequest(handlerInquiryEmpty);
