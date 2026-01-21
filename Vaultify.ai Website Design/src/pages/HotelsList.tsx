import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Types
interface Hotel {
  id?: string;
  hotelId: string;
  name?: string;
  country?: string;
  city?: string;
  starRating?: number;
  lat?: number;
  lng?: number;
  heroImageUrl?: string;
}

interface CuratedResponse {
  hotels: Hotel[];
  nextCursor: string | null;
  seeding?: boolean;
  stage?: string;
  runId?: string;
  seededCount?: number;
  message?: string;
  error?: string;
}

interface DebugResponse {
  curatedCount?: number;
  latestSeed?: {
    status?: string;
    seededCount?: number;
    stage?: string;
    updatedAt?: string | null;
    lastError?: unknown;
  } | null;
  queueDepth?: number;
  error?: string;
}

interface FetchResult {
  ok: boolean;
  status: number;
  data?: unknown;
  text?: string;
}

// API helpers (local to this page)
function buildBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) {
    return 'https://us-central1-vaultfy-377ee.cloudfunctions.net/api';
  }
  return String(envUrl).replace(/\/$/, '');
}

async function fetchJson(url: string): Promise<FetchResult> {
  try {
    console.log('[HotelsList] fetchJson: Starting fetch to', url);
    const response = await fetch(url);
    console.log('[HotelsList] fetchJson: Response status', response.status, response.statusText);
    const text = await response.text();
    console.log('[HotelsList] fetchJson: Response text length', text.length);
    let data: unknown;
    try {
      data = JSON.parse(text);
      console.log('[HotelsList] fetchJson: Parsed JSON successfully');
    } catch (parseErr) {
      console.warn('[HotelsList] fetchJson: JSON parse failed', parseErr);
      data = null;
    }
    return {
      ok: response.ok,
      status: response.status,
      data,
      text,
    };
  } catch (err: unknown) {
    console.error('[HotelsList] fetchJson: Fetch error', err);
    return {
      ok: false,
      status: 0,
      data: null,
      text: err instanceof Error ? err.message : String(err),
    };
  }
}

export default function HotelsList() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [debugData, setDebugData] = useState<DebugResponse | null>(null);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [stage, setStage] = useState<string>('');
  const [runId, setRunId] = useState<string>('');
  const [seededCount, setSeededCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchUrl, setLastFetchUrl] = useState<string>('');
  const [lastDebugUrl, setLastDebugUrl] = useState<string>('');
  const [rawResponse, setRawResponse] = useState<string>('');
  const [rawDebugResponse, setRawDebugResponse] = useState<string>('');
  const [mountTime] = useState<number>(Date.now());
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const debugPollingRef = useRef<NodeJS.Timeout | null>(null);

  const baseUrl = useMemo(() => buildBaseUrl(), []);

  const fetchHotels = useCallback(async (startAfter?: string) => {
    const params = new URLSearchParams({ limit: '50' });
    if (startAfter) {
      params.set('startAfter', startAfter);
    }
    const url = `${baseUrl}/hotels/curated?${params.toString()}`;
    setLastFetchUrl(url);
    console.log('[HotelsList] Fetching hotels from:', url);

    const result = await fetchJson(url);
    console.log('[HotelsList] Hotels fetch result:', { ok: result.ok, status: result.status, hasData: !!result.data });
    console.log('[HotelsList] Hotels response data:', result.data);
    console.log('[HotelsList] Hotels response data type:', typeof result.data);
    console.log('[HotelsList] Hotels response data.hotels:', result.data && typeof result.data === 'object' ? (result.data as any).hotels : 'N/A');
    console.log('[HotelsList] Hotels response data.hotels length:', result.data && typeof result.data === 'object' && Array.isArray((result.data as any).hotels) ? (result.data as any).hotels.length : 'N/A');
    setRawResponse(JSON.stringify(result.data || result.text, null, 2));

    if (!result.ok || result.status >= 400) {
      setError(`HTTP ${result.status}: ${result.text || 'Unknown error'}`);
      return;
    }

    const data = result.data as CuratedResponse;
    if (!data || typeof data !== 'object') {
      setError('Invalid response format');
      return;
    }

    setError(null);
    const newSeeding = data.seeding || false;
    const newStage = data.stage || '';
    const newRunId = data.runId || '';
    const newSeededCount = data.seededCount || 0;
    const newNextCursor = data.nextCursor || null;
    const newHotels = data.hotels || [];

    console.log('[HotelsList] Setting state:', { 
      seeding: newSeeding, 
      stage: newStage, 
      runId: newRunId, 
      seededCount: newSeededCount,
      hotelsCount: newHotels.length 
    });

    setSeeding(newSeeding);
    setStage(newStage);
    setRunId(newRunId);
    setSeededCount(newSeededCount);
    setNextCursor(newNextCursor);

    if (startAfter) {
      setHotels((prev) => [...prev, ...newHotels]);
    } else {
      setHotels(newHotels);
    }
  }, [baseUrl]);

  const fetchDebug = useCallback(async () => {
    const url = `${baseUrl}/hotels/curated/debug`;
    setLastDebugUrl(url);
    console.log('[HotelsList] Fetching debug from:', url);

    const result = await fetchJson(url);
    console.log('[HotelsList] Debug fetch result:', { ok: result.ok, status: result.status, hasData: !!result.data });
    console.log('[HotelsList] Debug response data:', result.data);
    setRawDebugResponse(JSON.stringify(result.data || result.text, null, 2));

    if (result.ok && result.data && typeof result.data === 'object') {
      setDebugData(result.data as DebugResponse);
    }
  }, [baseUrl]);

  const forceRefresh = useCallback(() => {
    setHotels([]);
    setNextCursor(null);
    setError(null);
    fetchHotels();
    fetchDebug();
  }, [fetchHotels, fetchDebug]);

  const loadNextPage = useCallback(() => {
    if (nextCursor) {
      fetchHotels(nextCursor);
    }
  }, [nextCursor, fetchHotels]);

  // Initial fetch
  useEffect(() => {
    console.log('[HotelsList] Mounting, fetching hotels and debug...');
    console.log('[HotelsList] Base URL:', baseUrl);
    fetchHotels().catch((err) => {
      console.error('[HotelsList] fetchHotels error:', err);
      setError(`Fetch error: ${err instanceof Error ? err.message : String(err)}`);
    });
    fetchDebug().catch((err) => {
      console.error('[HotelsList] fetchDebug error:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Polling when seeding
  useEffect(() => {
    if (seeding || (stage && stage !== 'done')) {
      // Stop polling if we have hotels
      if (hotels.length > 0) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        if (debugPollingRef.current) {
          clearInterval(debugPollingRef.current);
          debugPollingRef.current = null;
        }
        return;
      }

      // Poll hotels every 5s
      if (!pollingRef.current) {
        pollingRef.current = setInterval(() => {
          fetchHotels();
        }, 5000);
      }

      // Poll debug every 10s
      if (!debugPollingRef.current) {
        debugPollingRef.current = setInterval(() => {
          fetchDebug();
        }, 10000);
      }
    } else {
      // Stop polling when not seeding
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (debugPollingRef.current) {
        clearInterval(debugPollingRef.current);
        debugPollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (debugPollingRef.current) {
        clearInterval(debugPollingRef.current);
        debugPollingRef.current = null;
      }
    };
  }, [seeding, stage, hotels.length, fetchHotels, fetchDebug]);

  // Check for timeout warning
  const elapsedMinutes = (Date.now() - mountTime) / 60000;
  const showTimeoutWarning = hotels.length === 0 && elapsedMinutes > 2;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[#D4AF7A]/70 hover:text-[#D4AF7A] mb-4"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold mb-2">Hotels List (Debug)</h1>
          <p className="text-sm text-[#F5F5F0]/60">Direct fetch from backend gateway</p>
        </div>

        {/* Status Bar */}
        <div className="bg-[#1F1F1F] border border-[#D4AF7A]/20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#F5F5F0]/60">Hotels returned: </span>
              <span className="font-bold">{hotels.length}</span>
            </div>
            <div>
              <span className="text-[#F5F5F0]/60">Stage: </span>
              <span className="font-bold">{stage || 'N/A'}</span>
              {seededCount > 0 && (
                <>
                  {' | '}
                  <span className="text-[#F5F5F0]/60">SeededCount: </span>
                  <span className="font-bold">{seededCount}</span>
                </>
              )}
              {runId && (
                <>
                  {' | '}
                  <span className="text-[#F5F5F0]/60">RunId: </span>
                  <span className="font-mono text-xs">{runId.slice(0, 8)}...</span>
                </>
              )}
            </div>
            <div className="md:col-span-2">
              <span className="text-[#F5F5F0]/60">URL: </span>
              <span className="font-mono text-xs break-all">{lastFetchUrl || 'N/A'}</span>
            </div>
          </div>

          {/* Timeout Warning */}
          {showTimeoutWarning && (
            <div className="mt-4 p-3 bg-[#8B0000]/30 border border-[#8B0000]/50 rounded text-sm text-[#FF6B6B]">
              ⚠️ Still no hotels. Check debug output below.
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-[#8B0000]/30 border border-[#8B0000]/50 rounded text-sm text-[#FF6B6B]">
              Error: {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={forceRefresh}
              className="px-4 py-2 bg-[#D4AF7A] text-[#0A0A0A] rounded hover:bg-[#D4AF7A]/90 text-sm font-medium"
            >
              Force Refresh
            </button>
            {nextCursor && (
              <button
                onClick={loadNextPage}
                className="px-4 py-2 bg-[#1F1F1F] border border-[#D4AF7A]/30 text-[#F5F5F0] rounded hover:border-[#D4AF7A]/50 text-sm"
              >
                Load Next Page
              </button>
            )}
          </div>
        </div>

        {/* Debug Section */}
        {debugData && (
          <div className="bg-[#1F1F1F] border border-[#D4AF7A]/20 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-bold mb-3">Debug</h2>
            <div className="text-xs">
              <span className="text-[#F5F5F0]/60">Debug URL: </span>
              <span className="font-mono break-all">{lastDebugUrl || 'N/A'}</span>
            </div>
            <pre className="mt-3 p-3 bg-[#0A0A0A] rounded border border-[#D4AF7A]/10 overflow-auto text-xs">
              {rawDebugResponse || 'No debug data'}
            </pre>
          </div>
        )}

        {/* Hotels List */}
        <div className="bg-[#1F1F1F] border border-[#D4AF7A]/20 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold mb-3">Hotels ({hotels.length})</h2>
          {hotels.length === 0 ? (
            <div className="text-[#F5F5F0]/60 text-sm py-8 text-center">
              No hotels found. {seeding ? 'Seeding in progress...' : 'Waiting for data.'}
            </div>
          ) : (
            <div className="space-y-3">
              {hotels.map((hotel, idx) => (
                <div
                  key={hotel.id || hotel.hotelId || idx}
                  className="p-3 bg-[#0A0A0A] rounded border border-[#D4AF7A]/10 hover:border-[#D4AF7A]/30 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[#F5F5F0]/60">hotelId: </span>
                      <span className="font-mono">{hotel.hotelId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#F5F5F0]/60">name: </span>
                      <span>{hotel.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#F5F5F0]/60">country / city: </span>
                      <span>
                        {hotel.country || 'N/A'} / {hotel.city || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#F5F5F0]/60">starRating: </span>
                      <span>{hotel.starRating !== undefined ? hotel.starRating : 'N/A'}</span>
                    </div>
                    {hotel.lat !== undefined && hotel.lng !== undefined && (
                      <div>
                        <span className="text-[#F5F5F0]/60">lat, lng: </span>
                        <span className="font-mono text-xs">
                          {hotel.lat.toFixed(4)}, {hotel.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                    {hotel.heroImageUrl && (
                      <div>
                        <span className="text-[#F5F5F0]/60">heroImageUrl: </span>
                        <span className="font-mono text-xs break-all">{hotel.heroImageUrl.slice(0, 60)}...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Raw Response */}
        <div className="bg-[#1F1F1F] border border-[#D4AF7A]/20 rounded-lg p-4">
          <h2 className="text-lg font-bold mb-3">Copy Raw Response</h2>
          <pre className="p-3 bg-[#0A0A0A] rounded border border-[#D4AF7A]/10 overflow-auto text-xs">
            {rawResponse || 'No response data'}
          </pre>
        </div>
      </div>
    </div>
  );
}
