import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, MapPin } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  fetchHotelDetails,
  getCachedHotelDetail,
  mapDetailsById,
  type HotelDetail,
} from '../lib/hotels';
import {
  fetchCuratedHotelsPage,
  normalizeHotel,
  type NormalizedCuratedHotel,
} from '../lib/curatedHotelsApi';

type HotelSummary = NormalizedCuratedHotel;

export function HotelsListing() {
  const navigate = useNavigate();
  const [hotelsRaw, setHotelsRaw] = useState<any[]>([]);
  const [hotelsNormalized, setHotelsNormalized] = useState<HotelSummary[]>([]);
  const [detailsById, setDetailsById] = useState<Record<string, HotelDetail>>({});
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStage, setSeedStage] = useState<string | null>(null);
  const [seededCount, setSeededCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derive normalized hotels from raw data
  useEffect(() => {
    const normalized = hotelsRaw.map(normalizeHotel);
    setHotelsNormalized(normalized);

    // Dev logging for diagnosis
    if (import.meta.env.DEV && hotelsRaw.length > 0) {
      // eslint-disable-next-line no-console
      console.log('[HotelsListing] Data loaded', {
        totalHotels: hotelsRaw.length,
        sampleRaw: hotelsRaw[0],
        sampleNormalized: normalized[0],
        availableCountries: [...new Set(normalized.map((h) => h.country).filter(Boolean))].sort(),
      });
    }
  }, [hotelsRaw]);

  const loadHotels = useCallback(
    async (cursor?: string | null) => {
      try {
        if (!cursor) setLoading(true);
        setError(null);
        const resp = await fetchCuratedHotelsPage({ limit: 100, startAfter: cursor || undefined });
        
        // Normalize and dedupe
        const normalized = (resp.hotels || []).map(normalizeHotel);
        if (cursor) {
          // Append mode: dedupe by hotelId
          setHotelsRaw((prev) => {
            const existingIds = new Set(prev.map((h) => String(h.hotelId || h.id || h.hotelid || '')));
            const newHotels = resp.hotels?.filter(
              (h) => !existingIds.has(String(h.hotelId || h.id || h.hotelid || '')),
            ) || [];
            return [...prev, ...newHotels];
          });
        } else {
          setHotelsRaw(resp.hotels || []);
        }
        
        setNextCursor(resp.nextCursor || null);
        setSeeding(Boolean(resp.seeding));
        setSeedStage(resp.stage || null);
        setSeededCount(Number(resp.seededCount || 0));
      } catch (err: any) {
        setError(err?.message || 'Failed to load hotels');
        setSeedStage('error');
        setSeededCount(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  useEffect(() => {
    if (!seeding || hotelsNormalized.length > 0) return;
    let isActive = true;
    const interval = setInterval(async () => {
      try {
        const resp = await fetchCuratedHotelsPage({ limit: 100 });
        if (!isActive) return;
        setHotelsRaw(resp.hotels || []);
        setNextCursor(resp.nextCursor || null);
        setSeeding(Boolean(resp.seeding));
        setSeedStage(resp.stage || null);
        setSeededCount(Number(resp.seededCount || 0));
      } catch {
        if (!isActive) return;
        setSeeding(false);
        setSeedStage('error');
      }
    }, 3000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [seeding, hotelsNormalized.length]);

  useEffect(() => {
    if (!hotelsNormalized.length) return;
    let isActive = true;
    const loadDetails = async () => {
      try {
        // Only load details for hotels without hero images (optional enhancement)
        const ids = hotelsNormalized
          .filter((hotel) => !hotel.heroImageUrl)
          .slice(0, 20)
          .map((hotel) => hotel.hotelId);
        if (!ids.length) return;
        setDetailsLoading(true);
        const cached = ids
          .map((id) => getCachedHotelDetail(id))
          .filter((detail): detail is HotelDetail => Boolean(detail));
        if (cached.length && isActive) {
          setDetailsById((prev) => ({ ...prev, ...mapDetailsById(cached) }));
        }
        const details = await fetchHotelDetails(ids);
        if (!isActive) return;
        setDetailsById((prev) => ({ ...prev, ...mapDetailsById(details) }));
      } catch (err: any) {
        if (isActive) setError(err?.message || 'Failed to load hotel images');
      } finally {
        if (isActive) setDetailsLoading(false);
      }
    };
    loadDetails();
    return () => {
      isActive = false;
    };
  }, [hotelsNormalized.map((hotel) => `${hotel.hotelId}-${hotel.heroImageUrl || ''}`).join(',')]);

  const handleHotelClick = (hotel: HotelSummary) => {
    navigate(`/wanderbeds/hotel/${hotel.hotelId}`);
  };

  const handleLoadMore = () => {
    if (nextCursor && !loading) {
      loadHotels(nextCursor);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hotels</h1>
          <p className="text-sm text-[#F5F5F0]/60">Discover curated luxury hotels</p>
        </div>

        {(loading || detailsLoading) && hotels.length === 0 && (
          <div className="space-y-4">
            <div className="text-sm text-[#F5F5F0]/50">
              {seedStage === 'error' ? "Couldn't prepare hotels. Retrying..." : 'Loading hotels...'}
              {seedStage && seedStage !== 'done' && <span className="ml-2">{`Stage: ${seedStage}`}</span>}
              {seededCount > 0 && <span className="ml-2">{`Seeded: ${seededCount}`}</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {!loading && !detailsLoading && !error && hotelsNormalized.length === 0 && (
          <div className="space-y-4">
            <div className="text-sm text-[#F5F5F0]/50">
              {seedStage === 'error' ? "Couldn't prepare hotels. Retrying..." : 'Preparing curated hotels...'}
              {seedStage && seedStage !== 'done' && <span className="ml-2">{`Stage: ${seedStage}`}</span>}
              {seededCount > 0 && <span className="ml-2">{`Seeded: ${seededCount}`}</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {hotelsNormalized.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {hotelsNormalized.map((hotel, idx) => {
                const detail = detailsById[hotel.hotelId];
                const image = hotel.heroImageUrl || detail?.images?.[0]?.url;
                const location = [hotel.city, hotel.country].filter(Boolean).join(', ');
                const displayName = hotel.name || detail?.hotel?.name || 'Hotel';
                const starRating = hotel.starRating || detail?.starrating;

                return (
                  <motion.button
                    key={hotel.hotelId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="text-left rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-[#D4AF7A]/40 transition-all duration-300 group"
                    onClick={() => handleHotelClick(hotel)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative h-56 bg-[#111] overflow-hidden">
                      {image ? (
                        <ImageWithFallback
                          src={image}
                          alt={displayName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#F5F5F0]/30 text-sm">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      {starRating > 0 && (
                        <div
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs uppercase tracking-wider font-medium"
                          style={{
                            background: 'rgba(212,175,122,0.2)',
                            border: '1px solid rgba(212,175,122,0.4)',
                            color: '#D4AF7A',
                          }}
                        >
                          {starRating.toFixed(1)}★
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[#F5F5F0] line-clamp-2 flex-1">
                          {displayName}
                        </h3>
                        {starRating > 0 && (
                          <span className="flex items-center gap-1 text-sm text-[#D4AF7A] ml-2 flex-shrink-0">
                            <Star size={16} fill="#D4AF7A" color="#D4AF7A" />
                            {starRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#F5F5F0]/60 mb-3">
                        <MapPin size={14} />
                        <span className="line-clamp-1">{location || hotel.address || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <div className="flex-1">
                          <div className="text-xs text-[#F5F5F0]/50 mb-1">Starting from</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-semibold text-[#D4AF7A]">Price on request</span>
                          </div>
                        </div>
                        <div className="text-sm text-[#D4AF7A] font-medium ml-4">View Details →</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {nextCursor && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 rounded-full border border-[#D4AF7A]/30 text-[#D4AF7A] hover:bg-[#D4AF7A]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
