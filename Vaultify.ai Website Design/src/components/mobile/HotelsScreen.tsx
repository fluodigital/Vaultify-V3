import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Star, MapPin } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  fetchCuratedHotels,
  fetchHotelDetails,
  getCachedHotelDetail,
  mapDetailsById,
  type HotelDetail,
  type HotelListItem,
} from '../../lib/hotels';
import { getApiUrl } from '../../lib/api';

type HotelSummary = HotelListItem;

type HotelsScreenProps = {
  onSelectHotel: (hotel: HotelSummary) => void;
};

export function HotelsScreen({ onSelectHotel }: HotelsScreenProps) {
  const [hotels, setHotels] = useState<HotelSummary[]>([]);
  const [detailsById, setDetailsById] = useState<Record<string, HotelDetail>>({});
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStage, setSeedStage] = useState<string | null>(null);
  const [seededCount, setSeededCount] = useState(0);
  const [seedErrorSince, setSeedErrorSince] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const curatedApiUrl = useMemo(() => getApiUrl('/hotels/curated'), []);

  const loadHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetchCuratedHotels({ limit: 20 });
      setHotels(resp.items);
      setSeeding(Boolean(resp.seeding));
      setSeedStage(resp.stage || null);
      setSeededCount(Number(resp.seededCount || 0));
      setSeedErrorSince((prev) =>
        resp.stage === 'error' ? prev || Date.now() : null,
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to load hotels');
      setSeedStage('error');
      setSeededCount(0);
      setSeedErrorSince((prev) => prev || Date.now());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  useEffect(() => {
    if (!seeding || hotels.length > 0) return;
    let isActive = true;
    const interval = setInterval(async () => {
      try {
        const resp = await fetchCuratedHotels({ limit: 20 });
        if (!isActive) return;
        setHotels(resp.items);
        setSeeding(Boolean(resp.seeding));
        setSeedStage(resp.stage || null);
        setSeededCount(Number(resp.seededCount || 0));
        setSeedErrorSince((prev) =>
          resp.stage === 'error' ? prev || Date.now() : null,
        );
      } catch {
        if (!isActive) return;
        setSeeding(false);
        setSeedStage('error');
        setSeedErrorSince((prev) => prev || Date.now());
      }
    }, 3000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [seeding, hotels.length, seedErrorSince]);

  useEffect(() => {
    if (seedStage !== 'error') return;
    const retry = setInterval(() => {
      loadHotels();
    }, 3000);
    return () => {
      clearInterval(retry);
    };
  }, [seedStage, loadHotels]);

  useEffect(() => {
    if (seedStage !== 'error' || !seedErrorSince) return;
    if (Date.now() - seedErrorSince < 30000) return;
    loadHotels();
  }, [seedStage, seedErrorSince, loadHotels]);

  useEffect(() => {
    if (!hotels.length) return;
    let isActive = true;
    const loadDetails = async () => {
      try {
        const ids = hotels
          .filter((hotel) => !hotel.heroImageUrl)
          .slice(0, 12)
          .map((hotel) => String(hotel.hotelid));
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
  }, [hotels.map((hotel) => `${hotel.hotelid}-${hotel.heroImageUrl || ''}`).join(',')]);

  return (
    <div className="h-full overflow-y-auto bg-[#000] px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl text-[#F5F5F0] font-semibold">Hotels</h1>
      </div>

      {(loading || detailsLoading) && (
        <div className="space-y-3">
          <div className="text-xs text-[#F5F5F0]/50">
            {seedStage === 'error' ? 'Couldn’t prepare hotels. Retrying…' : 'Preparing curated hotels…'}
            {seedStage && seedStage !== 'done' && <span className="ml-2">{`Stage: ${seedStage}`}</span>}
            {seededCount > 0 && <span className="ml-2">{`Seeded: ${seededCount}`}</span>}
          </div>
          <div className="text-[10px] text-[#F5F5F0]/40">{`API: ${curatedApiUrl}`}</div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          {error}
        </div>
      )}

      {!loading && !detailsLoading && !error && hotels.length === 0 && (
        <div className="space-y-3">
          <div className="text-xs text-[#F5F5F0]/50">
            {seedStage === 'error' ? 'Couldn’t prepare hotels. Retrying…' : 'Preparing curated hotels…'}
            {seedStage && seedStage !== 'done' && <span className="ml-2">{`Stage: ${seedStage}`}</span>}
            {seededCount > 0 && <span className="ml-2">{`Seeded: ${seededCount}`}</span>}
          </div>
          <div className="text-[10px] text-[#F5F5F0]/40">{`API: ${curatedApiUrl}`}</div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {hotels.map((hotel, idx) => {
          const detail = detailsById[String(hotel.hotelid)];
          const image = hotel.heroImageUrl || detail?.images?.[0]?.url;
          const location = [hotel.city, hotel.country].filter(Boolean).join(', ');
          const displayName = hotel.name || detail?.hotel?.name || 'Hotel';
          return (
            <motion.button
              key={String(hotel.hotelid)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="w-full text-left rounded-2xl border border-white/10 bg-white/5 p-0 overflow-hidden hover:border-[#D4AF7A]/40 transition"
              onClick={() => onSelectHotel(hotel)}
            >
              <div className="h-40 bg-[#111] relative">
                {image ? (
                  <ImageWithFallback src={image} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#F5F5F0]/30 text-xs">
                    Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg text-[#F5F5F0] font-semibold">{displayName}</p>
                  {hotel.starrating ? (
                    <span className="flex items-center gap-1 text-xs text-[#D4AF7A]">
                      <Star size={14} fill="#D4AF7A" color="#D4AF7A" />
                      {hotel.starrating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#F5F5F0]/60">
                  <MapPin size={12} />
                  <span>{location || hotel.address || '—'}</span>
                </div>
                <div className="text-sm text-[#F5F5F0]/60 mt-2">From — /night</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
