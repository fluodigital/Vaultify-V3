import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import * as https from 'https';
import * as http from 'http';
import * as zlib from 'zlib';
import * as crypto from 'crypto';
import { getHotelList, postHotelDetails, searchHotels, availHotels, book } from './vendors/wanderbeds/wanderbedsApi';
import { wanderbedsRequest } from './vendors/wanderbeds/wanderbedsHttp';
import { loadWanderbedsConfig } from './vendors/wanderbeds/wanderbedsConfig';

const allowedOrigins = (process.env.CORS_ORIGINS ||
  'http://localhost:4173,http://localhost:3000,https://vaultfy-biyycsclj-jay-zyonstudios-projects.vercel.app')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Debug: Test route
app.get('/wanderbeds/test', (req, res) => {
  return res.json({ ok: true, message: 'Wanderbeds routes are working' });
});

// Test endpoint for Wanderbeds search (for debugging)
app.post('/wanderbeds/test-search', async (req, res) => {
  try {
    const { hotels, checkin, checkout, rooms, nationality } = req.body;
    
    if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        error: 'hotels array required' 
      });
    }
    
    if (!checkin || !checkout) {
      return res.status(400).json({ 
        ok: false, 
        error: 'checkin and checkout dates required (YYYY-MM-DD)' 
      });
    }
    
    const hotelIds = hotels.map((id: any) => {
      const num = typeof id === 'string' ? parseInt(id, 10) : id;
      return isNaN(num) ? id : num;
    });
    
    functions.logger.info('[wanderbeds/test-search] Test search', {
      hotels: hotelIds,
      checkin,
      checkout,
      rooms,
      nationality,
    });
    
    // Test 1: Numeric IDs
    const result1 = await searchHotels({
      hotels: hotelIds,
      checkin,
      checkout,
      rooms: rooms || [{ adt: 1 }],
      nationality: nationality || 'FR',
      timout: '20',
    }, { timeoutMs: 30000 });
    
    const response: any = {
      ok: true,
      tests: {
        numericIds: {
          hotels: hotelIds,
          result: {
            count: result1?.count,
            hotelsCount: result1?.hotels?.length || 0,
            hasError: !!result1?.error,
            errorCode: result1?.error?.code,
            errorMessage: result1?.error?.message,
            token: result1?.token ? 'present' : 'missing',
          },
        },
      },
    };
    
    // Test 2: String IDs (if numeric failed)
    if (result1?.error?.code === 100 || result1?.count === 0) {
      functions.logger.info('[wanderbeds/test-search] Testing string IDs');
      const result2 = await searchHotels({
        hotels: hotelIds.map((id: any) => String(id)) as any,
        checkin,
        checkout,
        rooms: rooms || [{ adt: 1 }],
        nationality: nationality || 'FR',
        timout: '20',
      }, { timeoutMs: 30000 });
      
      response.tests.stringIds = {
        hotels: hotelIds.map((id: any) => String(id)),
        result: {
          count: result2?.count,
          hotelsCount: result2?.hotels?.length || 0,
          hasError: !!result2?.error,
          errorCode: result2?.error?.code,
          errorMessage: result2?.error?.message,
          token: result2?.token ? 'present' : 'missing',
        },
      };
    }
    
    return res.json(response);
  } catch (err: any) {
    functions.logger.error('[wanderbeds/test-search] error', { error: err?.message });
    return res.status(500).json({ 
      ok: false, 
      error: err?.message || 'Test search failed' 
    });
  }
});

// POST /wanderbeds/search - Search hotels with dates and get pricing/rooms (must be before curated routes)
// Per Wanderbeds docs: Search.txt
app.post('/wanderbeds/search', async (req, res) => {
  const correlationId = crypto.randomUUID();
  const startMs = Date.now();
  
  functions.logger.info('[wanderbeds/search] Route hit', { 
    correlationId,
    method: req.method, 
    path: req.path,
    body: { ...req.body, rooms: req.body.rooms ? `[${req.body.rooms.length} room(s)]` : 'missing' }, // Don't log full rooms array
  });
  
  try {
    const { hotels, checkin, checkout, rooms, nationality, timout } = req.body;
    
    if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
      return res.status(400).json({ 
        error: 'invalid_request', 
        message: 'Request body must include a "hotels" array with at least one hotel ID' 
      });
    }
    
    if (!checkin || !checkout) {
      return res.status(400).json({ 
        error: 'invalid_request', 
        message: 'Request body must include "checkin" and "checkout" dates (YYYY-MM-DD)' 
      });
    }
    
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({ 
        error: 'invalid_request', 
        message: 'Request body must include a "rooms" array with at least one room specification' 
      });
    }
    
    if (!nationality) {
      return res.status(400).json({ 
        error: 'invalid_request', 
        message: 'Request body must include "nationality" (ISO 2-letter country code)' 
      });
    }
    
    // Validate hotel IDs are numbers
    // Note: Keep as numbers (not strings) as Wanderbeds API expects numeric IDs
    const hotelIds = hotels.map((id) => {
      const num = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(num)) {
        throw new Error(`Invalid hotel ID: ${id}`);
      }
      return num;
    });
    
    // Log request details with correlation ID
    functions.logger.info('[wanderbeds/search] Searching hotels', {
      correlationId,
      hotelCount: hotelIds.length,
      hotelIds: hotelIds.slice(0, 5),
      checkin,
      checkout,
      roomCount: rooms.length,
      nationality,
      timout: timout || '20',
    });
    
    const nationalityRequested = String(nationality || '').toUpperCase();

    // Nationality sweep debug mode (ONLY when enabled)
    // Check both Firebase Functions config and environment variable
    const functionsConfig = functions.config();
    const sweepEnabled = 
      functionsConfig?.wanderbeds?.debug_nationality_sweep === 'true' ||
      process.env.WANDERBEDS_DEBUG_NATIONALITY_SWEEP === 'true';
    const sweepOrder = [nationalityRequested, 'GB', 'US', 'PH'].filter(Boolean);
    const fallbackTried: string[] = [];
    let nationalityUsed = nationalityRequested;
    let fallbackHit = false;

    // Try search (and optionally sweep) until we get hotels/count > 0
    // Rooms will be normalized by searchHotels() to include chd and age per docs
    let result: any = null;
    const debugAttempts: Array<{
      nationality: string;
      upstreamHttpStatus: number;
      errorCode?: number;
      errorMessage?: string;
      count: number;
      hotelsLen: number;
      ms: number;
    }> = [];
    
    for (const natAttempt of (sweepEnabled ? sweepOrder : [nationalityRequested])) {
      fallbackTried.push(natAttempt);
      const attemptStart = Date.now();

      functions.logger.info('[wanderbeds/search] Upstream attempt', {
        correlationId,
        hotelIds: hotelIds.slice(0, 5),
        checkin,
        checkout,
        nationalityAttempt: natAttempt,
        rooms,
      });

      result = await searchHotels(
        {
          hotels: hotelIds,
          checkin,
          checkout,
          rooms,
          nationality: natAttempt,
          timout: timout || '20',
          __correlationId: correlationId,
        },
        { timeoutMs: 30000 }
      );

      const attemptMs = Date.now() - attemptStart;
      const upstream = result?.__upstream;
      const upstreamErrorCode = result?.error?.code;
      const upstreamErrorMessage = result?.error?.message;
      const upstreamHttpStatus = upstream?.upstreamHttpStatus ?? 0;

      // Record attempt diagnostics
      debugAttempts.push({
        nationality: natAttempt,
        upstreamHttpStatus,
        errorCode: upstreamErrorCode,
        errorMessage: upstreamErrorMessage,
        count: result?.count ?? 0,
        hotelsLen: Array.isArray(result?.hotels) ? result.hotels.length : 0,
        ms: attemptMs,
      });

      functions.logger.info('[wanderbeds/search] Upstream attempt result', {
        correlationId,
        nationalityAttempt: natAttempt,
        upstreamHttpStatus,
        upstreamErrorCode,
        upstreamErrorMessage,
        count: result?.count,
        hotelsLen: Array.isArray(result?.hotels) ? result.hotels.length : 0,
        ms: attemptMs,
      });

      const hasHotels = (result && !result.error && (result.count > 0 || (Array.isArray(result.hotels) && result.hotels.length > 0)));
      const isNoResults = (upstreamErrorCode === 100) || (result?.count === 0 && (!result?.hotels || result.hotels.length === 0));

      if (hasHotels) {
        nationalityUsed = natAttempt;
        fallbackHit = natAttempt !== nationalityRequested;
        break;
      }

      // Stop sweeping if it's not a pure "no results" case
      if (!isNoResults) {
        nationalityUsed = natAttempt;
        break;
      }
    }
    
    const ms = Date.now() - startMs;
    
    functions.logger.info('[wanderbeds/search] Search result', {
      correlationId,
      hasResult: !!result,
      hotelCount: result?.hotels?.length || 0,
      token: result?.token ? 'present' : 'missing',
      count: result?.count,
      hasError: !!result?.error,
      errorCode: result?.error?.code,
      errorMessage: result?.error?.message,
      ms,
      upstreamStatus: '200', // Wanderbeds returns 200 even with error.code=100
    });
    
    // Handle "No results" case (error code 100) - per docs, this is a valid response, not an error
    if (result?.error?.code === 100 || (result?.count === 0 && (!result?.hotels || result.hotels.length === 0))) {
      functions.logger.info('[wanderbeds/search] No results available', {
        correlationId,
        errorCode: result?.error?.code,
        errorMessage: result?.error?.message,
        nationalityRequested,
        nationalityUsed,
        fallbackTried,
        fallbackHit,
        sweepEnabled,
      });

      // Return in availability structure format even for "No results"
      return res.json({
        ok: true,
        data: {
          ...result,
          hotels: [],
          count: 0,
          // Ensure data.products[] structure is present (empty for no results)
          data: result?.data || {
            success: false,
            products: [],
            summary: undefined,
            required: {
              nationality: 1,
              chdbirthdate: 0,
            },
          },
        },
        meta: {
          source: 'wanderbeds',
          correlationId,
          ms,
          nationalityRequested,
          nationalityUsed,
          fallbackTried,
          fallbackHit,
        },
        debug: (() => {
          const lastUpstream = result?.__upstream;
          if (!lastUpstream) return null;
          return {
            requestSentToUpstream: lastUpstream.requestSentToUpstream,
            headersSentToUpstream: lastUpstream.headersSentToUpstream,
            upstreamHttpStatus: lastUpstream.upstreamHttpStatus,
            upstreamHeaders: lastUpstream.upstreamHeaders,
            upstreamBodyRawText: lastUpstream.upstreamBodyRawText,
            parsedBody: lastUpstream.parsedBody,
            ...(sweepEnabled && debugAttempts.length > 0 ? { attempts: debugAttempts } : {}),
          };
        })(),
        error: null,
      });
    }
    
    functions.logger.info('[wanderbeds/search] Success', {
      correlationId,
      hotelCount: result?.hotels?.length || 0,
      ms,
    });
    
    // Return in availability structure format: data.products[], data.required
    // This matches the format from /hotel/avail for consistent frontend consumption
    return res.json({
      ok: true,
      data: {
        ...result,
        // Ensure data.products[] structure is present (from transformSearchToAvailabilityFormat)
        data: result?.data || {
          success: !result?.error && (result?.hotels?.length || 0) > 0,
          products: result?.hotels?.map((h: any) => ({
            hotelid: h.hotelId,
            hotelname: h.name,
            starrating: h.starRating,
            country: h.country,
            cityname: h.cityName,
            address: h.address,
            location: h.location,
            rooms: h.rooms || [],
            remarks: [],
          })) || [],
          summary: undefined,
          required: {
            nationality: 1,
            chdbirthdate: 0,
          },
        },
      },
      meta: {
        source: 'wanderbeds',
        correlationId,
        ms,
        nationalityRequested,
        nationalityUsed,
        fallbackTried,
        fallbackHit,
      },
      debug: (() => {
        const lastUpstream = result?.__upstream;
        if (!lastUpstream) return null;
        return {
          requestSentToUpstream: lastUpstream.requestSentToUpstream,
          headersSentToUpstream: lastUpstream.headersSentToUpstream,
          upstreamHttpStatus: lastUpstream.upstreamHttpStatus,
          upstreamHeaders: lastUpstream.upstreamHeaders,
          upstreamBodyRawText: lastUpstream.upstreamBodyRawText,
          parsedBody: lastUpstream.parsedBody,
          ...(sweepEnabled && debugAttempts.length > 0 ? { attempts: debugAttempts } : {}),
        };
      })(),
      error: null,
    });
  } catch (err: any) {
    const ms = Date.now() - startMs;
    functions.logger.error('[wanderbeds/search] Error', {
      correlationId,
      error: err?.message,
      status: err?.status,
      stack: err?.stack,
      upstreamCorrelationId: err?.correlationId,
      ms,
    });
    
    // If it's a Wanderbeds API error, return structured error
    const httpStatus = err?.status || 500;
    const errorCode = err?.code || 'server_error';
    const errorMessage = err?.message || 'Internal server error';
    
    return res.status(httpStatus).json({
      ok: false,
      data: null,
      meta: {
        source: 'wanderbeds',
        correlationId,
        ms,
      },
      error: {
        code: errorCode,
        message: errorMessage,
        upstreamStatus: err?.status,
      },
    });
  }
});

// POST /wanderbeds/avail - Check hotel availability (per Wanderbeds docs: Availability.txt)
app.post('/wanderbeds/avail', async (req, res) => {
  const correlationId = crypto.randomUUID();
  const startMs = Date.now();
  
  functions.logger.info('[wanderbeds/avail] Route hit', { 
    correlationId,
    method: req.method, 
    path: req.path,
    body: { ...req.body, token: req.body.token ? 'present' : 'missing' }, // Don't log full token
  });
  
  try {
    const { token, rooms } = req.body;
    
    if (!token) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'invalid_request',
          message: 'Request body must include "token" from search response',
        },
        meta: { correlationId, ms: Date.now() - startMs },
      });
    }
    
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'invalid_request',
          message: 'Request body must include "rooms" array with at least one offer ID',
        },
        meta: { correlationId, ms: Date.now() - startMs },
      });
    }
    
    functions.logger.info('[wanderbeds/avail] Checking availability', {
      correlationId,
      offerCount: rooms.length,
      offerIds: rooms.slice(0, 5), // Log first 5 only
    });
    
    // Per Wanderbeds docs (Availability.txt): body is { rooms: [offerid strings] }
    // Token goes in header, not body
    const result = await availHotels(
      { rooms },
      { token, timeoutMs: 30000 }
    );
    
    const ms = Date.now() - startMs;
    
    functions.logger.info('[wanderbeds/avail] Availability result', {
      correlationId,
      hasResult: !!result,
      productsCount: result?.mapped?.products?.length || 0,
      token: result?.token ? 'present' : 'missing',
      ms,
    });
    
    return res.json({
      ok: true,
      data: result.mapped || { products: [], summary: undefined, required: undefined },
      meta: {
        source: 'wanderbeds',
        correlationId,
        ms,
        token: result.token || token, // Return new token if avail returned one
      },
      error: null,
    });
  } catch (err: any) {
    const ms = Date.now() - startMs;
    functions.logger.error('[wanderbeds/avail] Error', {
      correlationId,
      error: err?.message,
      status: err?.status,
      stack: err?.stack,
    });
    
    return res.status(err?.status || 500).json({
      ok: false,
      data: null,
      meta: {
        source: 'wanderbeds',
        correlationId,
        ms,
      },
      error: {
        code: err?.code || 'server_error',
        message: err?.message || 'Internal server error',
        upstreamStatus: err?.status,
      },
    });
  }
});

// POST /wanderbeds/book - Book hotel (per Wanderbeds docs: Book.txt)
app.post('/wanderbeds/book', async (req, res) => {
  const correlationId = crypto.randomUUID();
  const startMs = Date.now();
  
  functions.logger.info('[wanderbeds/book] Route hit', {
    correlationId,
    method: req.method,
    path: req.path,
    body: {
      token: req.body.token ? 'present' : 'missing',
      client_reference: req.body.client_reference,
      passengerCount: req.body.passengers?.length || 0,
    },
  });
  
  try {
    const { token, client_reference, passengers } = req.body;
    
    if (!token) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'invalid_request',
          message: 'Request body must include "token" from search/avail response',
        },
        meta: { correlationId, ms: Date.now() - startMs },
      });
    }
    
    if (!client_reference) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'invalid_request',
          message: 'Request body must include "client_reference" (unique booking identifier)',
        },
        meta: { correlationId, ms: Date.now() - startMs },
      });
    }
    
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'invalid_request',
          message: 'Request body must include "passengers" array with at least one passenger',
        },
        meta: { correlationId, ms: Date.now() - startMs },
      });
    }
    
    functions.logger.info('[wanderbeds/book] Booking hotel', {
      correlationId,
      client_reference,
      passengerCount: passengers.length,
    });
    
    // Per Wanderbeds docs (Book.txt): body is { client_reference, passengers }
    // Token goes in header, not body
    const result = await book(
      { client_reference, passengers },
      { token, timeoutMs: 30000 }
    );
    
    const ms = Date.now() - startMs;
    
    functions.logger.info('[wanderbeds/book] Booking result', {
      correlationId,
      hasResult: !!result,
      productsCount: result?.products?.length || 0,
      token: result?.token ? 'present' : 'missing',
      ms,
    });
    
    return res.json({
      ok: true,
      data: result,
      meta: {
        source: 'wanderbeds',
        correlationId,
        ms,
        token: result.token || token,
      },
      error: null,
    });
  } catch (err: any) {
    const ms = Date.now() - startMs;
    functions.logger.error('[wanderbeds/book] Error', {
      correlationId,
      error: err?.message,
      status: err?.status,
      stack: err?.stack,
    });
    
    return res.status(err?.status || 500).json({
      ok: false,
      data: null,
      meta: {
        source: 'wanderbeds',
        correlationId,
        ms,
      },
      error: {
        code: err?.code || 'server_error',
        message: err?.message || 'Internal server error',
        upstreamStatus: err?.status,
      },
    });
  }
});

// ============================================================================
// DEBUG ENDPOINTS - Raw passthrough to Wanderbeds (isolated, no refactors)
// ============================================================================

// POST /debug/wanderbeds/search-raw - Raw passthrough to /hotel/search
app.post('/debug/wanderbeds/search-raw', async (req, res) => {
  const startMs = Date.now();
  try {
    const cfg = loadWanderbedsConfig();
    const url = new URL('/hotel/search', cfg.baseUrl);
    const authHeader = `Basic ${Buffer.from(`${cfg.username}:${cfg.password}`).toString('base64')}`;
    
    const requestBody = req.body;
    
    const requestOptions: https.RequestOptions = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
        'User-Agent': 'Vaultfy-Functions-Debug/1.0',
      },
    };
    
    const response: http.IncomingMessage = await new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => resolve(res));
      req.on('error', reject);
      req.write(JSON.stringify(requestBody));
      req.end();
    });
    
    let bodyText = '';
    const chunks: Buffer[] = [];
    
    response.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    await new Promise<void>((resolve, reject) => {
      response.on('end', resolve);
      response.on('error', reject);
    });
    
    bodyText = Buffer.concat(chunks).toString('utf8');
    
    let parsedBody: any = null;
    try {
      parsedBody = JSON.parse(bodyText);
    } catch (e) {
      parsedBody = null;
    }
    
    const ms = Date.now() - startMs;
    
    // Always return HTTP 200, even if upstream returns "No results" (error code 100)
    // Per requirements: "No results" is not a 404, it's a business response
    return res.status(200).json({
      ok: true,
      upstreamHttpStatus: response.statusCode || 0,
      upstreamBody: bodyText, // raw text
      parsedBody, // parsed JSON (or null)
      parsed: {
        token: parsedBody?.token || null,
        error: {
          code: parsedBody?.error?.code ?? null,
          message: parsedBody?.error?.message || null,
        },
        count: parsedBody?.count ?? null,
        hotelsLen: Array.isArray(parsedBody?.hotels) ? parsedBody.hotels.length : null,
      },
      requestSentToUpstream: requestBody,
      headersSentToUpstream: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate',
        Authorization: '[REDACTED_BASIC]',
      },
      upstreamHeaders: {
        contentType: response.headers['content-type'] || '',
        contentEncoding: response.headers['content-encoding'] || '',
        contentLength: response.headers['content-length'] || '',
      },
      ms,
      url: url.toString(),
    });
  } catch (err: any) {
    const ms = Date.now() - startMs;
    functions.logger.error('[debug/search-raw] Error', { error: err.message, stack: err.stack });
    return res.status(500).json({
      ok: false,
      error: err.message || 'Internal server error',
      ms,
    });
  }
});

// POST /debug/wanderbeds/avail-raw - Raw passthrough to /hotel/avail
app.post('/debug/wanderbeds/avail-raw', async (req, res) => {
  const startMs = Date.now();
  try {
    const cfg = loadWanderbedsConfig();
    const url = new URL('/hotel/avail', cfg.baseUrl);
    const authHeader = `Basic ${Buffer.from(`${cfg.username}:${cfg.password}`).toString('base64')}`;
    
    const requestBody = req.body;
    
    const requestOptions: https.RequestOptions = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
        'User-Agent': 'Vaultfy-Functions-Debug/1.0',
      },
    };
    
    const response: http.IncomingMessage = await new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => resolve(res));
      req.on('error', reject);
      req.write(JSON.stringify(requestBody));
      req.end();
    });
    
    let bodyText = '';
    const chunks: Buffer[] = [];
    
    response.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    await new Promise<void>((resolve, reject) => {
      response.on('end', resolve);
      response.on('error', reject);
    });
    
    bodyText = Buffer.concat(chunks).toString('utf8');
    const bodyPreview = bodyText.substring(0, 3000);
    
    let parsed: any = {};
    try {
      parsed = JSON.parse(bodyText);
    } catch (e) {
      // Not JSON, keep parsed empty
    }
    
    const ms = Date.now() - startMs;
    
    return res.json({
      ok: true,
      upstream: {
        url: url.toString(),
        status: response.statusCode || 0,
        ms,
        headers: {
          contentType: response.headers['content-type'] || '',
          contentEncoding: response.headers['content-encoding'] || '',
          contentLength: response.headers['content-length'] || '',
        },
        bodyTextPreview: bodyPreview,
        parsed: {
          token: parsed?.token || null,
          time: parsed?.time || null,
          server: parsed?.server || null,
          productsLen: Array.isArray(parsed?.data?.products) ? parsed.data.products.length : null,
          errorCode: parsed?.error?.code ?? null,
          errorMessage: parsed?.error?.message || null,
        },
      },
    });
  } catch (err: any) {
    const ms = Date.now() - startMs;
    functions.logger.error('[debug/avail-raw] Error', { error: err.message, stack: err.stack });
    return res.status(500).json({
      ok: false,
      error: err.message || 'Internal server error',
      ms,
    });
  }
});

// POST /debug/wanderbeds/hoteldetails-raw - Raw passthrough to /staticdata/hoteldetails
app.post('/debug/wanderbeds/hoteldetails-raw', async (req, res) => {
  const startMs = Date.now();
  try {
    const cfg = loadWanderbedsConfig();
    const url = new URL('/staticdata/hoteldetails', cfg.baseUrl);
    const authHeader = `Basic ${Buffer.from(`${cfg.username}:${cfg.password}`).toString('base64')}`;
    
    const requestBody = req.body;
    
    const requestOptions: https.RequestOptions = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
        'User-Agent': 'Vaultfy-Functions-Debug/1.0',
      },
    };
    
    const response: http.IncomingMessage = await new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => resolve(res));
      req.on('error', reject);
      req.write(JSON.stringify(requestBody));
      req.end();
    });
    
    let bodyText = '';
    const chunks: Buffer[] = [];
    
    response.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    await new Promise<void>((resolve, reject) => {
      response.on('end', resolve);
      response.on('error', reject);
    });
    
    bodyText = Buffer.concat(chunks).toString('utf8');
    const bodyPreview = bodyText.substring(0, 3000);
    
    let parsed: any = {};
    try {
      parsed = JSON.parse(bodyText);
    } catch (e) {
      // Not JSON, keep parsed empty
    }
    
    const ms = Date.now() - startMs;
    
    return res.json({
      ok: true,
      upstream: {
        url: url.toString(),
        status: response.statusCode || 0,
        ms,
        headers: {
          contentType: response.headers['content-type'] || '',
          contentEncoding: response.headers['content-encoding'] || '',
          contentLength: response.headers['content-length'] || '',
        },
        bodyTextPreview: bodyPreview,
        parsed: {
          hotelsLen: Array.isArray(parsed?.hotels) ? parsed.hotels.length : null,
          errorCode: parsed?.error?.code ?? null,
          errorMessage: parsed?.error?.message || null,
        },
      },
    });
  } catch (err: any) {
    const ms = Date.now() - startMs;
    functions.logger.error('[debug/hoteldetails-raw] Error', { error: err.message, stack: err.stack });
    return res.status(500).json({
      ok: false,
      error: err.message || 'Internal server error',
      ms,
    });
  }
});

// Mount curated routes
import curatedRoutes from './routes/wanderbedsCuratedRoutes';
app.use('/', curatedRoutes);

// Get hotels by location (country/city) - REWRITTEN with proper mapping and debug
app.get('/hotels/static/hotels-by-location', async (req, res) => {
  const startMs = Date.now();
  const debug: {
    curatedCount: number;
    hotellistCount: number;
    afterCountry: number;
    afterCity: number;
    afterStars: number;
    sample: Array<{ hotelId: string; country: string; city: string; cityId?: string; starRating: number }>;
  } = {
    curatedCount: 0,
    hotellistCount: 0,
    afterCountry: 0,
    afterCity: 0,
    afterStars: 0,
    sample: [],
  };

  try {
    const country = req.query.country ? String(req.query.country).toUpperCase() : undefined;
    const cityId = req.query.cityId ? String(req.query.cityId) : undefined;
    const cityName = req.query.cityName ? String(req.query.cityName) : undefined;
    const minStars = req.query.minStars != null ? Number(req.query.minStars) : 0; // Default to 0

    if (!country) {
      res.status(400).json({ error: 'country_required', message: 'Country parameter is required', debug });
      return;
    }

    // Helper: Map raw Wanderbeds hotel object to canonical shape
    const mapHotel = (raw: any): any => {
      return {
        hotelId: String(raw.hotelid ?? raw.hotelId ?? ''),
        name: String(raw.name ?? raw.hotelname ?? ''),
        starRating: raw.starrating != null || raw.starRating != null ? Number(raw.starrating ?? raw.starRating ?? 0) : 0,
        cityId: raw.cityid != null || raw.cityId != null ? String(raw.cityid ?? raw.cityId ?? '') : undefined,
        city: String(raw.city ?? raw.cityname ?? ''),
        country: String(raw.country ?? ''),
        address: String(raw.address ?? ''),
        lat: raw.lat != null ? Number(raw.lat) : undefined,
        lng: raw.lng != null ? Number(raw.lng ?? raw.lon ?? undefined) : undefined,
      };
    };

    // Helper: Filter by country (case-insensitive uppercase)
    const filterByCountry = (hotels: any[], countryCode: string): any[] => {
      const countryUpper = countryCode.toUpperCase();
      return hotels.filter((h) => {
        const hCountry = (h.country || '').toUpperCase();
        return hCountry === countryUpper;
      });
    };

    // Helper: Filter by city
    const filterByCity = (hotels: any[], cityIdParam?: string, cityNameParam?: string, countryParam?: string): any[] => {
      if (!cityIdParam && !cityNameParam) return hotels;
      
      // Never filter by city if cityName equals country name
      if (cityNameParam && countryParam && cityNameParam.toLowerCase() === countryParam.toLowerCase()) {
        return hotels;
      }

      return hotels.filter((h) => {
        // Prefer cityId exact match
        if (cityIdParam && h.cityId) {
          return String(h.cityId) === String(cityIdParam);
        }
        
        // Fallback to city name fuzzy match
        if (cityNameParam && h.city) {
          const hCity = h.city.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ');
          const cityLower = cityNameParam.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ');
          return hCity.includes(cityLower) || cityLower.includes(hCity) || hCity === cityLower;
        }
        
        return false;
      });
    };

    // Helper: Filter by minStars
    const filterByStars = (hotels: any[], minStarsParam: number): any[] => {
      if (minStarsParam == null || !Number.isFinite(minStarsParam)) return hotels;
      return hotels.filter((h) => {
        return Number.isFinite(h.starRating) && h.starRating >= minStarsParam;
      });
    };

    let result: any[] = [];
    let source = 'error';

    // STEP 1: Try curated collection (vendors/wanderbeds/curation/hotels/{hotelId})
    try {
      // FIXED: Use correct path vendors/wanderbeds/curation/hotels (no /items)
      const curatedRef = admin.firestore().collection('vendors/wanderbeds/curation/hotels');
      const curatedSnapshot = await curatedRef.where('country', '==', country).limit(500).get();
      debug.curatedCount = curatedSnapshot.size;

      if (curatedSnapshot.size > 0) {
        result = curatedSnapshot.docs.map((doc) => {
          const data = doc.data();
          return mapHotel({
            hotelid: data.hotelId || doc.id,
            hotelId: data.hotelId || doc.id,
            name: data.name,
            starrating: data.starRating,
            starRating: data.starRating,
            cityid: data.cityId,
            cityId: data.cityId,
            city: data.city,
            country: data.country,
            address: data.address,
            lat: data.lat,
            lng: data.lng,
          });
        });
        source = 'curated';
      }
    } catch (curatedErr: any) {
      functions.logger.warn('[hotels-by-location] curated query failed', { error: curatedErr?.message, country });
    }

    // STEP 2: Fallback to hotellist if curated is empty
    if (result.length === 0) {
      try {
        const data = await Promise.race([
          getHotelList({ bypassCache: false, timeoutMs: 20000, allowStale: true }),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Hotellist timeout')), 20000)),
        ]);

        const hotelsRaw = data?.hotels || data?.data?.hotels || [];
        const hotelsArray = Array.isArray(hotelsRaw) ? hotelsRaw : [];
        debug.hotellistCount = hotelsArray.length;

        // MAP to canonical shape BEFORE filtering
        result = hotelsArray.map(mapHotel);
        source = 'hotellist_fallback';
      } catch (hotellistErr: any) {
        functions.logger.warn('[hotels-by-location] hotellist fallback failed', {
          error: hotellistErr?.message,
          country,
        });
        res.json({
          hotels: [],
          total: 0,
          source: 'error',
          error: 'hotellist_failed',
          message: 'Unable to load hotels',
          debug,
        });
        return;
      }
    }

    // STEP 3: Apply filters (using canonical shape)
    debug.afterCountry = result.length;
    result = filterByCountry(result, country);
    debug.afterCountry = result.length;

    debug.afterCity = result.length;
    result = filterByCity(result, cityId, cityName, country);
    debug.afterCity = result.length;

    debug.afterStars = result.length;
    result = filterByStars(result, minStars);
    debug.afterStars = result.length;

    // Limit to first 100
    result = result.slice(0, 100);

    // Filter out invalid hotelIds
    result = result.filter((h) => h.hotelId && String(h.hotelId).trim().length > 0);

    // Set debug sample
    debug.sample = result.slice(0, 5).map((h) => ({
      hotelId: h.hotelId,
      country: h.country,
      city: h.city,
      cityId: h.cityId,
      starRating: h.starRating,
    }));

    const durationMs = Date.now() - startMs;
    functions.logger.info('[hotels-by-location] complete', {
      country,
      cityId,
      cityName,
      minStars,
      resultCount: result.length,
      source,
      durationMs,
      debug,
    });

    res.json({
      hotels: result,
      total: result.length,
      source,
      debug,
    });
  } catch (err: any) {
    const durationMs = Date.now() - startMs;
    functions.logger.error('[hotels-by-location] error', {
      error: err?.message,
      stack: err?.stack,
      durationMs,
    });
    res.status(500).json({
      hotels: [],
      total: 0,
      source: 'error',
      error: 'server_error',
      message: err?.message || 'Internal server error',
      debug,
    });
  }
});

// Probe endpoint to diagnose Wanderbeds connectivity
// GET /hotels/vendor/hotellist/peek - Stream and peek first N hotels from Wanderbeds hotellist
app.get('/hotels/vendor/hotellist/peek', async (req, res) => {
  const startMs = Date.now();
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 200, 500);
  const country = (req.query.country as string)?.toUpperCase().trim() || '';
  const city = (req.query.city as string)?.trim() || '';
  const minStars = Math.max(0, parseInt(req.query.minStars as string, 10) || 0);
  
  functions.logger.info('[hotellist/peek] Request', { limit, country, city, minStars });
  
  try {
    const cfg = loadWanderbedsConfig();
    const url = new URL('/staticdata/hotellist', cfg.baseUrl);
    const authHeader = `Basic ${Buffer.from(`${cfg.username}:${cfg.password}`).toString('base64')}`;
    
    const hotels: any[] = [];
    let received = 0;
    let aborted = false;
    let contentEncoding = '';
    
    const abortController = new AbortController();
    const requestOptions: https.RequestOptions = {
      method: 'GET',
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      headers: {
        Accept: 'application/json',
        // Don't request deflate explicitly - server may ignore or send uncompressed
        // Handle whatever compression (or lack of) server sends based on content-encoding header
        Authorization: authHeader,
        'User-Agent': 'Vaultfy-Functions/1.0',
      },
      signal: abortController.signal as any,
    };
    
    const response: http.IncomingMessage = await new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => resolve(res));
      req.on('error', reject);
      req.end();
    });
    
    if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
      res.status(response.statusCode || 500).json({
        ok: false,
        error: `Wanderbeds returned ${response.statusCode}: ${response.statusMessage}`,
      });
      return;
    }
    
    contentEncoding = (response.headers['content-encoding'] || '').toLowerCase();
    functions.logger.info('[hotellist/peek] Response headers', {
      'content-encoding': contentEncoding,
      'content-type': response.headers['content-type'],
      statusCode: response.statusCode,
    });
    
    // Handle decompression based on actual response content-encoding header
    // Follow pattern from hotellistStream.ts - handle deflate, gzip, or raw
    let stream: NodeJS.ReadableStream = response as any;
    
    if (contentEncoding === 'deflate' || contentEncoding.includes('deflate')) {
      // Server says it's deflate - try to decompress (may fail if it's zlib-wrapped deflate)
      const inflateStream = zlib.createInflate({ chunkSize: 64 * 1024 });
      
      inflateStream.on('error', (err: Error) => {
        functions.logger.error('[hotellist/peek] Deflate decompression error', {
          error: err.message,
          code: (err as any).code,
          name: err.name,
          'content-encoding': contentEncoding,
        });
        // Error will propagate - we'll catch it in pipeline error handler
      });
      
      stream = response.pipe(inflateStream) as any;
      functions.logger.info('[hotellist/peek] Attempting deflate decompression');
    } else if (contentEncoding === 'gzip' || contentEncoding.includes('gzip')) {
      const gunzipStream = zlib.createGunzip();
      gunzipStream.on('error', (err: Error) => {
        functions.logger.error('[hotellist/peek] Gzip decompression error', { error: err.message });
      });
      stream = response.pipe(gunzipStream) as any;
      functions.logger.info('[hotellist/peek] Attempting gzip decompression');
    } else {
      // No compression header - server ignored Accept-Encoding or sent uncompressed
      functions.logger.info('[hotellist/peek] No compression detected, using raw stream');
    }
    
    // Use stream-json for proper JSON streaming
    // @ts-ignore - stream-json types may not be available
    const streamJson = require('stream-json');
    const jsonParser = streamJson.parser;
    const { Transform } = require('stream');
    
    let waitingForHotelsKey = true;
    let inHotelsArray = false;
    let currentObject: any = null;
    let currentKey: string | null = null;
    let currentArrayDepth = 0;
    let streamEnded = false;
    
    let shouldStop = false;
    const hotelExtractor = new Transform({
      objectMode: true,
      transform(chunk: any, encoding: string, callback: Function) {
        if (!chunk || typeof chunk !== 'object' || streamEnded || shouldStop) {
          callback();
          return;
        }
        
        // Wait for "hotels" key
        if (waitingForHotelsKey && chunk.name === 'keyValue' && chunk.value === 'hotels') {
          waitingForHotelsKey = false;
          callback();
          return;
        }
        
        // After hotels key, wait for array start
        if (!waitingForHotelsKey && !inHotelsArray && chunk.name === 'startArray') {
          inHotelsArray = true;
          currentArrayDepth = 1;
          callback();
          return;
        }
        
        // Inside hotels array: parse hotel objects
        if (inHotelsArray) {
          if (chunk.name === 'startObject') {
            currentObject = {};
            currentArrayDepth += 1;
          } else if (chunk.name === 'keyValue') {
            currentKey = chunk.value;
          } else if (chunk.name === 'stringValue' || chunk.name === 'numberValue') {
            if (currentKey && currentObject) {
              currentObject[currentKey] = chunk.value;
            }
            currentKey = null;
          } else if (chunk.name === 'endObject') {
            currentArrayDepth -= 1;
            if (currentArrayDepth === 1 && currentObject) {
              // Complete hotel object - check filters and add if matches
              received++;
              
              const hotel = {
                hotelId: String(currentObject.hotelid || currentObject.id || ''),
                name: String(currentObject.hotelname || currentObject.name || ''),
                country: String(currentObject.country || '').toUpperCase(),
                city: String(currentObject.city || currentObject.cityname || ''),
                starRating: Number(currentObject.starrating || currentObject.starRating || 0),
                cityId: currentObject.cityid ? String(currentObject.cityid) : undefined,
                address: currentObject.address || '',
                lat: currentObject.lat ? Number(currentObject.lat) : undefined,
                lng: currentObject.lng ? Number(currentObject.lng) : undefined,
              };
              
              // Apply filters
              const matchesCountry = !country || hotel.country === country;
              const matchesCity = !city || hotel.city.toLowerCase().includes(city.toLowerCase());
              const matchesStars = hotel.starRating >= minStars;
              
              if (matchesCountry && matchesCity && matchesStars && hotel.hotelId) {
                hotels.push(hotel);
                
                // Abort if we have enough
                if (hotels.length >= limit) {
                  aborted = true;
                  streamEnded = true;
                  shouldStop = true;
                  // Abort the upstream connection
                  abortController.abort();
                  // Destroy the pipeline to stop processing
                  try {
                    pipeline.destroy();
                  } catch (e) {
                    // Ignore destroy errors
                  }
                  // Return early but don't end the transform stream
                  callback();
    return;
                }
              }
              
              currentObject = null;
            }
          } else if (chunk.name === 'endArray') {
            currentArrayDepth -= 1;
            if (currentArrayDepth === 0) {
              inHotelsArray = false;
              streamEnded = true;
            }
          }
        }
        callback();
      },
    });
    
    // Pipe stream through JSON parser and extractor
    const pipeline = stream.pipe(jsonParser()).pipe(hotelExtractor);
    
    // Handle stream errors
    stream.on('error', (err: Error) => {
      functions.logger.error('[hotellist/peek] Stream error', {
        error: err.message,
        code: (err as any).code,
        contentEncoding,
      });
      
      // If deflate decompression fails, it might be zlib-wrapped deflate or uncompressed
      // Return error - user can try again or we can improve error handling later
      if (!res.headersSent) {
        const errorMsg = (err as any).code === 'Z_DATA_ERROR'
          ? `Decompression error: Server may have sent uncompressed data despite compression request. Try without compression.`
          : `Stream error: ${err.message}`;
        res.status(500).json({ ok: false, error: errorMsg });
      }
    });
    
    pipeline.on('error', (err: Error) => {
      functions.logger.error('[hotellist/peek] Parser error', { error: err.message });
      if (!res.headersSent) {
        res.status(500).json({ ok: false, error: `Parser error: ${err.message}` });
      }
    });
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        aborted = true;
        abortController.abort();
        const ms = Date.now() - startMs;
        res.json({
          ok: true,
          hotels,
          received,
          returned: hotels.length,
          ms,
          aborted,
          debug: {
            limit,
            country: country || 'any',
            city: city || 'any',
            minStars,
            timeout: true,
            contentEncoding: contentEncoding || 'none',
          },
        });
      }
    }, 30000); // 30s timeout
    
    // Wait for stream to end
    pipeline.on('end', () => {
      clearTimeout(timeoutId);
      if (res.headersSent) return;
      
      const ms = Date.now() - startMs;
      functions.logger.info('[hotellist/peek] Complete', { 
        hotels: hotels.length, 
        received, 
        aborted, 
        ms 
      });
      
      res.json({
        ok: true,
        hotels,
        received,
        returned: hotels.length,
        ms,
        aborted,
        debug: {
          limit,
          country: country || 'any',
          city: city || 'any',
          minStars,
          contentEncoding: contentEncoding || 'none',
        },
      });
    });
    
    // Return early - stream will handle response
    return;
    
  } catch (err: any) {
    functions.logger.error('[hotellist/peek] Error', { error: err.message, stack: err.stack });
    if (!res.headersSent) {
      res.status(500).json({ 
        ok: false, 
        error: err.message || 'Internal server error',
        ms: Date.now() - startMs,
      });
    }
  }
});

app.get('/hotels/vendor/probe', async (_req, res) => {
  const startMs = Date.now();
  const probe: {
    kind: string;
    baseUrl: string;
    hasCreds: boolean;
    countries: { ok: boolean; status?: number; ms?: number; error?: string };
    hotellist: { ok: boolean; status?: number; ms?: number; bytes?: number; count?: number; error?: string };
    error: { code: string; message: string } | null;
  } = {
    kind: 'wanderbeds_probe_v1',
    baseUrl: '',
    hasCreds: false,
    countries: { ok: false },
    hotellist: { ok: false },
    error: null,
  };

  try {
    const cfg = loadWanderbedsConfig();
    probe.baseUrl = cfg.baseUrl;
    probe.hasCreds = !!(cfg.username && cfg.password);

    // Test countries endpoint
    try {
      const countriesStartMs = Date.now();
      await wanderbedsRequest('GET', '/staticdata/countries', {
        timeoutMs: 5000,
        safe: true,
      });
      const countriesMs = Date.now() - countriesStartMs;
      probe.countries = {
        ok: true,
        status: 200,
        ms: countriesMs,
      };
    } catch (countriesErr: any) {
      const countriesMs = Date.now() - (startMs + 50);
      probe.countries = {
        ok: false,
        status: countriesErr?.status || 500,
        ms: countriesMs,
        error: countriesErr?.message || 'Unknown error',
      };
    }

    // Test hotellist endpoint (use Promise.race to avoid function timeout)
    try {
      const hotellistStartMs = Date.now();
      const hotellistPromise = getHotelList({ bypassCache: false, timeoutMs: 30000, allowStale: true });
      // Race with a 25s timeout to ensure probe completes within function timeout
      const hotellistResp = await Promise.race([
        hotellistPromise,
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Probe timeout (25s)')), 25000)),
      ]);
      const hotellistMs = Date.now() - hotellistStartMs;
      
      // Calculate response size
      const hotelsRaw = hotellistResp?.hotels || hotellistResp?.data?.hotels || [];
      const hotelsArray = Array.isArray(hotelsRaw) ? hotelsRaw : [];
      const responseJson = JSON.stringify(hotellistResp);
      const responseBytes = Buffer.byteLength(responseJson, 'utf8');

      probe.hotellist = {
        ok: true,
        status: 200,
        ms: hotellistMs,
        bytes: responseBytes,
        count: hotelsArray.length,
      };
    } catch (hotellistErr: any) {
      const hotellistMs = Date.now() - (startMs + 100);
      const status = hotellistErr?.status || (hotellistErr?.message?.includes('timeout') || hotellistErr?.code === 'ECONNABORTED' ? 408 : 500);
      probe.hotellist = {
        ok: false,
        status,
        ms: hotellistMs,
        error: hotellistErr?.message || (hotellistErr?.code === 'ECONNABORTED' ? 'Request timeout' : 'Unknown error'),
      };
    }

    res.json(probe);
  } catch (err: any) {
    probe.error = {
      code: 'probe_error',
      message: err?.message || 'Probe failed',
    };
    res.status(500).json(probe);
  }
});

// POST /hotels/static/hoteldetails - Get detailed hotel information
app.post('/hotels/static/hoteldetails', async (req, res) => {
  try {
    const { hotels } = req.body;
    
    if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
      return res.status(400).json({ 
        error: 'invalid_request', 
        message: 'Request body must include a "hotels" array with at least one hotel ID' 
      });
    }

    // Validate hotel IDs are numbers or numeric strings
    const hotelIds = hotels.map((id) => {
      const num = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(num)) {
        throw new Error(`Invalid hotel ID: ${id}`);
      }
      return num;
    });

    functions.logger.info('[hoteldetails] Fetching details', { count: hotelIds.length, ids: hotelIds.slice(0, 5) });

    const detailsResp = await postHotelDetails(hotelIds, {
      timeoutMs: 30000,
      bypassCache: false,
      allowStale: true,
    });

    // Response format: { hotels: [...] }
    const hotelsArray = Array.isArray(detailsResp?.hotels) ? detailsResp.hotels : [];
    
    functions.logger.info('[hoteldetails] Fetched details', { 
      requested: hotelIds.length, 
      returned: hotelsArray.length 
    });

    return res.json({ hotels: hotelsArray });
  } catch (err: any) {
    functions.logger.error('[hoteldetails] Error', { error: err?.message, code: err?.code });
    return res.status(err?.status || 500).json({
      error: err?.code || 'hoteldetails_error',
      message: err?.message || 'Failed to fetch hotel details',
      hotels: [],
    });
  }
});

export const api = functions.https.onRequest(app);