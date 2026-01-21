import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  fetchCuratedHotelsPage,
  fetchCuratedHotelsDebug,
  normalizeHotel,
  type NormalizedCuratedHotel,
  type CuratedHotelsPageResponse,
  type CuratedHotelsDebugResponse,
} from '../lib/curatedHotelsApi';

export default function DebugCuratedHotels() {
  const [hotels, setHotels] = useState<NormalizedCuratedHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [curatedResponse, setCuratedResponse] = useState<CuratedHotelsPageResponse | null>(null);
  const [debugResponse, setDebugResponse] = useState<CuratedHotelsDebugResponse | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchData = async (cursor?: string | null) => {
    try {
      setError(null);
      if (!cursor) {
        setLoading(true);
      }

      // Fetch curated hotels using shared helper
      const curatedData = await fetchCuratedHotelsPage({ limit: 200, startAfter: cursor || undefined });
      setCuratedResponse(curatedData);

      // Normalize and dedupe hotels
      const normalized = (curatedData.hotels || []).map(normalizeHotel);
      if (cursor) {
        // Append mode: dedupe by hotelId
        setHotels((prev) => {
          const existingIds = new Set(prev.map((h) => h.hotelId));
          const newHotels = normalized.filter((h) => !existingIds.has(h.hotelId));
          return [...prev, ...newHotels];
        });
      } else {
        setHotels(normalized);
      }

      setNextCursor(curatedData.nextCursor || null);

      // Fetch debug info using shared helper
      const debugData = await fetchCuratedHotelsDebug();
      setDebugResponse(debugData);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch curated hotels');
      setCuratedResponse({ hotels: [], nextCursor: null, error: err?.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setHotels([]);
    setNextCursor(null);
    fetchData();
  };

  const handleLoadMore = () => {
    if (nextCursor) {
      fetchData(nextCursor);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F0] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Curated Hotels Debug</h1>

        {/* Status Strip */}
        {curatedResponse && (
          <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-[#F5F5F0]/50">Seeding:</span>{' '}
                <span className={curatedResponse.seeding ? 'text-yellow-400' : 'text-green-400'}>
                  {curatedResponse.seeding ? 'Yes' : 'No'}
                </span>
              </div>
              {curatedResponse.stage && (
                <div>
                  <span className="text-[#F5F5F0]/50">Stage:</span> <span>{curatedResponse.stage}</span>
                </div>
              )}
              {curatedResponse.runId && (
                <div>
                  <span className="text-[#F5F5F0]/50">Run ID:</span>{' '}
                  <span className="font-mono text-xs">{curatedResponse.runId}</span>
                </div>
              )}
              {curatedResponse.seededCount !== undefined && (
                <div>
                  <span className="text-[#F5F5F0]/50">Seeded Count:</span> <span>{curatedResponse.seededCount}</span>
                </div>
              )}
              {curatedResponse.nextCursor && (
                <div>
                  <span className="text-[#F5F5F0]/50">Next Cursor:</span>{' '}
                  <span className="font-mono text-xs">{curatedResponse.nextCursor.substring(0, 20)}...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Count */}
        <div className="mb-6">
          <div className="text-3xl font-bold text-[#D4AF7A]">
            Hotels returned: {hotels.length}
          </div>
        </div>

        {/* Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-[#D4AF7A]/20 text-[#D4AF7A] hover:bg-[#D4AF7A]/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Refresh
          </button>
          {nextCursor && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-[#D4AF7A]/20 text-[#D4AF7A] hover:bg-[#D4AF7A]/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Load More
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        {hotels.length > 0 ? (
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse border border-white/10">
              <thead>
                <tr className="bg-white/5">
                  <th className="border border-white/10 p-3 text-left">Hotel ID</th>
                  <th className="border border-white/10 p-3 text-left">Name</th>
                  <th className="border border-white/10 p-3 text-left">City</th>
                  <th className="border border-white/10 p-3 text-left">Country</th>
                  <th className="border border-white/10 p-3 text-left">Star Rating</th>
                  <th className="border border-white/10 p-3 text-left">Hero Image</th>
                  <th className="border border-white/10 p-3 text-left">Lat</th>
                  <th className="border border-white/10 p-3 text-left">Lng</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel, idx) => (
                  <tr key={`${hotel.hotelId}-${idx}`} className="hover:bg-white/5">
                    <td className="border border-white/10 p-3 font-mono text-xs">{hotel.hotelId}</td>
                    <td className="border border-white/10 p-3">{hotel.name}</td>
                    <td className="border border-white/10 p-3">{hotel.city}</td>
                    <td className="border border-white/10 p-3">{hotel.country}</td>
                    <td className="border border-white/10 p-3">{hotel.starRating || '-'}</td>
                    <td className="border border-white/10 p-3">
                      {hotel.heroImageUrl ? (
                        <a
                          href={hotel.heroImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D4AF7A] hover:underline text-xs"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-[#F5F5F0]/40">-</span>
                      )}
                    </td>
                    <td className="border border-white/10 p-3 font-mono text-xs">{hotel.lat?.toFixed(4) || '-'}</td>
                    <td className="border border-white/10 p-3 font-mono text-xs">{hotel.lng?.toFixed(4) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loading ? (
          <div className="mb-8 p-8 text-center text-[#F5F5F0]/50">
            No hotels found
          </div>
        ) : null}

        {/* Loading */}
        {loading && hotels.length === 0 && (
          <div className="mb-8 flex items-center justify-center py-12">
            <Loader2 size={32} className="text-[#D4AF7A] animate-spin" />
          </div>
        )}

        {/* Raw JSON Blocks */}
        <div className="space-y-4">
          <details className="bg-white/5 border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold mb-2">Raw Response: /hotels/curated</summary>
            <pre className="mt-4 text-xs overflow-auto max-h-96 bg-[#0A0A0A] p-4 rounded border border-white/5">
              {JSON.stringify(curatedResponse, null, 2)}
            </pre>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold mb-2">Raw Response: /hotels/curated/debug</summary>
            <pre className="mt-4 text-xs overflow-auto max-h-96 bg-[#0A0A0A] p-4 rounded border border-white/5">
              {JSON.stringify(debugResponse, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
