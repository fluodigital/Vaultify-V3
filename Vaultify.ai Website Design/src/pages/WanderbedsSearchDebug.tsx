import { useState, useEffect } from 'react';
import { apiPost, apiBaseUrl } from '../lib/api';

interface SearchRequest {
  hotels: number[];
  checkin: string;
  checkout: string;
  rooms: Array<{ adt: number; chd?: number; childAges?: number[] }>;
  nationality?: string;
  timout?: string;
}

interface RawResponse {
  ok: boolean;
  upstream?: {
    url: string;
    status: number;
    ms: number;
    headers: {
      contentType: string;
      contentEncoding: string;
      contentLength: string;
    };
    bodyTextPreview: string;
    parsed: {
      token?: string | null;
      time?: string | null;
      server?: string | null;
      count?: number | null;
      hotelsLen?: number | null;
      productsLen?: number | null;
      errorCode?: number | null;
      errorMessage?: string | null;
    };
  };
  error?: string;
}

export default function WanderbedsSearchDebug() {
  const [hotelId, setHotelId] = useState<string>('2657');
  const [checkin, setCheckin] = useState<string>('2026-02-02');
  const [checkout, setCheckout] = useState<string>('2026-02-07');
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [childAges, setChildAges] = useState<string>('');
  
  // Auto-clear child ages when children is set to 0
  useEffect(() => {
    if (children === 0) {
      setChildAges('');
    }
  }, [children]);
  const [nationality, setNationality] = useState<string>('FR');
  const [timeoutSeconds, setTimeoutSeconds] = useState<string>('20');

  const [requestJson, setRequestJson] = useState<string>('');
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<RawResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buildRequest = (): SearchRequest => {
    // Per Wanderbeds API docs (Search.txt): rooms must always include adt, chd, and age
    // Even if chd=0, send chd:0 and age:[]
    const childAgesArray = children > 0 && childAges.trim()
      ? childAges
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n) && n > 0)
      : [];
    
    // Ensure age array length matches chd
    const normalizedAges = children > 0
      ? childAgesArray.length === children
        ? childAgesArray
        : [...childAgesArray, ...Array(Math.max(0, children - childAgesArray.length)).fill(0)]
      : [];
    
    const rooms: Array<{ adt: number; chd: number; age: number[] }> = [
      {
        adt: adults,
        chd: children, // Always include chd, even if 0
        age: normalizedAges, // Always include age array, empty when chd=0
      },
    ];

    return {
      hotels: [parseInt(hotelId, 10)],
      checkin,
      checkout,
      rooms,
      nationality: nationality || 'FR',
      timout: timeoutSeconds || '20', // Note: typo in vendor API, must be "timout" not "timeout"
    };
  };

  const handleRunSearch = async () => {
    setLoading(true);
    setError(null);
    setBackendResponse(null);
    setRawResponse(null);

    const request = buildRequest();
    setRequestJson(JSON.stringify(request, null, 2));

    try {
      const response = await apiPost('/wanderbeds/search', request);
      setBackendResponse(response);
    } catch (err: any) {
      setError(err.message || 'Request failed');
      setBackendResponse({ error: err.message || 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleRunRawSearch = async () => {
    setLoading(true);
    setError(null);
    setBackendResponse(null);
    setRawResponse(null);

    const request = buildRequest();
    setRequestJson(JSON.stringify(request, null, 2));

    try {
      const response = await apiPost<RawResponse>('/debug/wanderbeds/search-raw', request);
      setRawResponse(response);
    } catch (err: any) {
      setError(err.message || 'Request failed');
      setRawResponse({ ok: false, error: err.message || 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  const loadWorkingExample = () => {
    setHotelId('1646');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const checkoutDate = new Date(futureDate);
    checkoutDate.setDate(checkoutDate.getDate() + 1);
    setCheckin(futureDate.toISOString().split('T')[0]);
    setCheckout(checkoutDate.toISOString().split('T')[0]);
    setAdults(2);
    setChildren(0);
    setChildAges('');
    setNationality('FR');
    setTimeoutSeconds('20');
  };

  const loadProblemExample = () => {
    setHotelId('2657');
    setCheckin('2026-02-02');
    setCheckout('2026-02-07');
    setAdults(1);
    setChildren(0);
    setChildAges('');
    setNationality('FR');
    setTimeoutSeconds('20');
  };

  const getCurlCommand = (endpoint: string) => {
    const request = buildRequest();
    const url = `${apiBaseUrl}${endpoint}`;
    return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '${JSON.stringify(request)}'`;
  };

  const extractRoomOffers = (response: any): Array<{
    offerId: string;
    name: string;
    refundable: boolean;
    meal: string;
    total: number;
    currency: string;
  }> => {
    const offers: Array<{
      offerId: string;
      name: string;
      refundable: boolean;
      meal: string;
      total: number;
      currency: string;
    }> = [];

    if (response?.data?.hotels) {
      for (const hotel of response.data.hotels) {
        if (hotel.rooms && Array.isArray(hotel.rooms)) {
          for (const room of hotel.rooms) {
            offers.push({
              offerId: room.offerId || room.offerid || '',
              name: room.name || '',
              refundable: room.refundable || false,
              meal: room.meal || '',
              total: room.price?.total || 0,
              currency: room.price?.currency || '',
            });
          }
        }
      }
    }

    return offers;
  };

  const roomOffers = backendResponse ? extractRoomOffers(backendResponse) : [];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Wanderbeds Search Debug</h1>

        {/* Input Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Search Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hotel ID</label>
              <input
                type="text"
                value={hotelId}
                onChange={(e) => setHotelId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Check-in</label>
              <input
                type="date"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Check-out</label>
              <input
                type="date"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adults</label>
              <input
                type="number"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value, 10) || 1)}
                min="1"
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Children</label>
              <input
                type="number"
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value, 10) || 0)}
                min="0"
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Child Ages (comma-separated)</label>
              <input
                type="text"
                value={childAges}
                onChange={(e) => setChildAges(e.target.value)}
                placeholder="5,7"
                disabled={children === 0}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {children > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Enter {children} age{children !== 1 ? 's' : ''} (comma-separated)
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nationality (2-letter)</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value.toUpperCase())}
                maxLength={2}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timeout (seconds)</label>
              <input
                type="text"
                value={timeoutSeconds}
                onChange={(e) => setTimeoutSeconds(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleRunSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Search (via backend /wanderbeds/search)
            </button>
            <button
              onClick={handleRunRawSearch}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Search (raw passthrough /debug/wanderbeds/search-raw)
            </button>
            <button
              onClick={loadWorkingExample}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
            >
              Load Working Example (1646)
            </button>
            <button
              onClick={loadProblemExample}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded"
            >
              Load Problem Example (2657)
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded p-4 mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="mt-2">Loading...</p>
          </div>
        )}

        {/* Output Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request JSON */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Request JSON</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-xs max-h-96">
              {requestJson || 'No request sent yet'}
            </pre>
          </div>

          {/* Backend Response */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Backend Response (mapped)</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-xs max-h-96">
              {backendResponse ? JSON.stringify(backendResponse, null, 2) : 'No response yet'}
            </pre>
          </div>

          {/* Raw Response */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upstream Raw Response</h2>
            {rawResponse ? (
              <div className="space-y-4">
                <div>
                  <strong>Status:</strong> {rawResponse.upstream?.status || 'N/A'}
                </div>
                <div>
                  <strong>Time:</strong> {rawResponse.upstream?.ms || 0}ms
                </div>
                <div>
                  <strong>Headers:</strong>
                  <pre className="bg-gray-900 p-2 rounded mt-1 text-xs">
                    {JSON.stringify(rawResponse.upstream?.headers || {}, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>Parsed Summary:</strong>
                  <pre className="bg-gray-900 p-2 rounded mt-1 text-xs">
                    {JSON.stringify(rawResponse.upstream?.parsed || {}, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>Body Preview (first 3000 chars):</strong>
                  <pre className="bg-gray-900 p-2 rounded mt-1 text-xs max-h-64 overflow-auto">
                    {rawResponse.upstream?.bodyTextPreview || 'N/A'}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No raw response yet</p>
            )}
          </div>

          {/* Room Offers */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Room Offers</h2>
            {roomOffers.length > 0 ? (
              <div className="space-y-2">
                {roomOffers.map((offer, idx) => (
                  <div key={idx} className="bg-gray-900 p-3 rounded">
                    <div><strong>Offer ID:</strong> {offer.offerId}</div>
                    <div><strong>Name:</strong> {offer.name}</div>
                    <div><strong>Refundable:</strong> {offer.refundable ? 'Yes' : 'No'}</div>
                    <div><strong>Meal:</strong> {offer.meal}</div>
                    <div><strong>Total:</strong> {offer.total} {offer.currency}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No room offers available</p>
            )}
          </div>
        </div>

        {/* Copy curl Section */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Copy curl Commands</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Backend Endpoint:</h3>
              <pre className="bg-gray-900 p-4 rounded overflow-auto text-xs">
                {getCurlCommand('/wanderbeds/search')}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Raw Passthrough Endpoint:</h3>
              <pre className="bg-gray-900 p-4 rounded overflow-auto text-xs">
                {getCurlCommand('/debug/wanderbeds/search-raw')}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
