import { useState } from 'react';
import { motion } from 'motion/react';

interface Hotel {
  hotelId: string;
  name: string;
  country: string;
  city: string;
  starRating: number;
  cityId?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

interface PeekResponse {
  ok: boolean;
  hotels: Hotel[];
  received: number;
  returned: number;
  ms: number;
  aborted: boolean;
  debug?: {
    limit: number;
    country: string;
    city: string;
    minStars: number;
    contentEncoding?: string;
    timeout?: boolean;
  };
  error?: string;
}

export default function HotelsListDebug() {
  const [limit, setLimit] = useState('200');
  const [country, setCountry] = useState('CH');
  const [city, setCity] = useState('');
  const [minStars, setMinStars] = useState('0');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PeekResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://us-central1-vaultfy-377ee.cloudfunctions.net/api';

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams({
        limit: limit || '200',
        ...(country && { country }),
        ...(city && { city }),
        minStars: minStars || '0',
      });

      const url = `${baseUrl}/hotels/vendor/hotellist/peek?${params.toString()}`;
      console.log('[HotelsListDebug] Fetching:', url);

      const response = await fetch(url);
      const data: PeekResponse = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      console.log('[HotelsListDebug] Response:', data);
      setResult(data);
    } catch (err: any) {
      console.error('[HotelsListDebug] Error:', err);
      setError(err.message || 'Failed to fetch hotels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0] p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Hotels List Debug</h1>
          <p className="text-[#F5F5F0]/70 text-sm">
            Stream and peek first N hotels from Wanderbeds hotellist
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-lg border border-white/10 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Limit</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-[#F5F5F0] focus:border-[#D4AF7A] focus:outline-none"
                placeholder="200"
                min="1"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country (ISO 2-letter)</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-[#F5F5F0] focus:border-[#D4AF7A] focus:outline-none uppercase"
                placeholder="CH"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-[#F5F5F0] focus:border-[#D4AF7A] focus:outline-none"
                placeholder="(optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Min Stars</label>
              <input
                type="number"
                value={minStars}
                onChange={(e) => setMinStars(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-[#F5F5F0] focus:border-[#D4AF7A] focus:outline-none"
                placeholder="0"
                min="0"
                max="5"
              />
            </div>
          </div>
          <button
            onClick={handleFetch}
            disabled={loading}
            className="px-6 py-2 bg-[#D4AF7A] text-[#0A0A0A] rounded font-medium hover:bg-[#C9A06A] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Fetching...' : 'Fetch Hotels'}
          </button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8"
          >
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white/5 rounded-lg border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-[#F5F5F0]/70">Hotels Returned</p>
                  <p className="text-2xl font-bold text-[#D4AF7A]">{result.returned}</p>
                </div>
                <div>
                  <p className="text-[#F5F5F0]/70">Received</p>
                  <p className="text-2xl font-bold">{result.received}</p>
                </div>
                <div>
                  <p className="text-[#F5F5F0]/70">Time</p>
                  <p className="text-2xl font-bold">{result.ms}ms</p>
                </div>
                <div>
                  <p className="text-[#F5F5F0]/70">Aborted</p>
                  <p className="text-2xl font-bold">{result.aborted ? 'Yes' : 'No'}</p>
                </div>
              </div>
              {result.debug && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-[#F5F5F0]/70">Debug Info:</p>
                  <pre className="text-xs mt-2 bg-[#0A0A0A] p-3 rounded overflow-x-auto">
                    {JSON.stringify(result.debug, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {result.hotels.length > 0 ? (
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Hotels ({result.hotels.length})</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {result.hotels.map((hotel, index) => (
                    <div
                      key={`${hotel.hotelId}-${index}`}
                      className="bg-[#0A0A0A] rounded p-4 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-[#D4AF7A]">
                            {hotel.name || 'Unnamed Hotel'}
                          </p>
                          <p className="text-sm text-[#F5F5F0]/70 mt-1">
                            {hotel.city}, {hotel.country}
                            {hotel.starRating > 0 && ` • ${hotel.starRating}★`}
                          </p>
                          {hotel.address && (
                            <p className="text-xs text-[#F5F5F0]/50 mt-1">{hotel.address}</p>
                          )}
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-xs text-[#F5F5F0]/70">ID</p>
                          <p className="text-sm font-mono">{hotel.hotelId}</p>
                          {(hotel.lat !== undefined || hotel.lng !== undefined) && (
                            <p className="text-xs text-[#F5F5F0]/50 mt-1">
                              {hotel.lat?.toFixed(4)}, {hotel.lng?.toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg border border-white/10 p-6 text-center">
                <p className="text-[#F5F5F0]/70">No hotels found matching the filters</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
