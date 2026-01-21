import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  Plane,
  Home,
  Hotel,
  Car,
  Sparkles,
  TrendingUp,
  MapPin,
  Map as MapIcon,
  List,
  Star,
  Clock,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { InteractiveMap } from './InteractiveMap';
import {
  fetchCuratedHotels,
  fetchHotelDetails,
  getCachedHotelDetail,
  getHotelLocation,
  mapDetailsById,
  selectDailyCuratedHotels,
  toHotelCoordinates,
  type HotelDetail,
  type HotelListItem,
} from '../../lib/hotels';
import { getApiUrl } from '../../lib/api';

interface DashboardProps {
  onOpenAlfred: () => void;
  onHotelSelect?: (hotel: HotelListItem) => void;
  showMapToggle?: boolean;
  onMapMarkerSelectionChange?: (isSelected: boolean) => void;
}

type QuickAction = {
  label: string;
  icon: LucideIcon;
  color: string;
};

const quickActions: QuickAction[] = [
  { label: 'Jet charter', icon: Plane, color: '#D4AF7A' },
  { label: 'Private villa', icon: Home, color: '#60a5fa' },
  { label: 'Five-star stay', icon: Hotel, color: '#34d399' },
  { label: 'Chauffeur', icon: Car, color: '#f59e0b' },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatRating = (rating?: number) => {
  if (!rating) return null;
  return rating.toFixed(1);
};

export function Dashboard({
  onOpenAlfred,
  onHotelSelect,
  showMapToggle = true,
  onMapMarkerSelectionChange,
}: DashboardProps) {
  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [curatedHotels, setCuratedHotels] = useState<HotelListItem[]>([]);
  const [detailsById, setDetailsById] = useState<Record<string, HotelDetail>>({});
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStage, setSeedStage] = useState<string | null>(null);
  const [seededCount, setSeededCount] = useState(0);
  const [seedErrorSince, setSeedErrorSince] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapView, setMapView] = useState(false);
  const curatedApiUrl = useMemo(() => getApiUrl('/hotels/curated'), []);

  const loadHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetchCuratedHotels({ limit: 200 });
      setHotels(resp.items);
      setCuratedHotels(selectDailyCuratedHotels(resp.items));
      setSeeding(Boolean(resp.seeding));
      setSeedStage(resp.stage || null);
      setSeededCount(Number(resp.seededCount || 0));
      setSeedErrorSince((prev) =>
        resp.stage === 'error' ? prev || Date.now() : null,
      );
    } catch (err: any) {
      const message = err?.message || 'Unable to load hotels right now.';
      setHotels([]);
      setCuratedHotels([]);
      setSeeding(false);
      setSeedStage('error');
      setSeededCount(0);
      setSeedErrorSince((prev) => prev || Date.now());
      setError(message);
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
        const resp = await fetchCuratedHotels({ limit: 200 });
        if (!isActive) return;
        setHotels(resp.items);
        setCuratedHotels(selectDailyCuratedHotels(resp.items));
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


  const curatedIds = useMemo(
    () => curatedHotels.map((hotel) => String(hotel.hotelid)),
    [curatedHotels],
  );
  const idsNeedingDetails = useMemo(
    () =>
      curatedHotels
        .filter((hotel) => !hotel.heroImageUrl)
        .slice(0, 12)
        .map((hotel) => String(hotel.hotelid)),
    [curatedHotels],
  );

  useEffect(() => {
    if (!idsNeedingDetails.length) return;
    let isActive = true;
    const loadDetails = async () => {
      try {
        setDetailsLoading(true);
        const cached = idsNeedingDetails
          .map((id) => getCachedHotelDetail(id))
          .filter((detail): detail is HotelDetail => Boolean(detail));
        if (cached.length && isActive) {
          setDetailsById((prev) => ({ ...prev, ...mapDetailsById(cached) }));
        }
        const details = await fetchHotelDetails(idsNeedingDetails);
        if (!isActive) return;
        setDetailsById((prev) => ({ ...prev, ...mapDetailsById(details) }));
      } catch (err: any) {
        if (!isActive) return;
        setError(err?.message || 'Unable to load hotel details.');
      } finally {
        if (isActive) setDetailsLoading(false);
      }
    };
    loadDetails();
    return () => {
      isActive = false;
    };
  }, [idsNeedingDetails.join(',')]);

  const featuredHotels = curatedHotels.slice(0, 3);
  const homesHotels = curatedHotels.slice(3, 9);

  const trendingDestinations = useMemo(() => {
    const counts = new globalThis.Map<string, { label: string; count: number }>();
    hotels.forEach((hotel) => {
      const label = [hotel.city, hotel.country].filter(Boolean).join(', ');
      if (!label) return;
      const entry = counts.get(label) || { label, count: 0 };
      entry.count += 1;
      counts.set(label, entry);
    });
    const entries = Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 3);
    const total = Math.max(hotels.length, 1);
    return entries.map((entry) => ({
      label: entry.label,
      count: entry.count,
      share: Math.round((entry.count / total) * 100),
    }));
  }, [hotels]);

  const mapItems = useMemo(
    () =>
      curatedHotels.map((hotel) => {
        const id = String(hotel.hotelid);
        const detail = detailsById[id];
        const location = getHotelLocation(hotel);
        const displayName = hotel.name || detail?.hotel?.name || 'Hotel';
        return {
          id,
          title: displayName,
          location: location || '—',
          image: hotel.heroImageUrl || detail?.images?.[0]?.url,
          priceLabel: 'From — /night',
          tag: formatRating(detail?.starrating || hotel.starrating)
            ? `${formatRating(detail?.starrating || hotel.starrating)}★`
            : undefined,
          description: hotel.shortDescription || detail?.description || detail?.areadetails || '—',
          details: detail?.address || hotel.address || '—',
          secondaryLabel: formatRating(detail?.starrating || hotel.starrating) || '—',
        };
      }),
    [curatedHotels, detailsById],
  );

  const mapMarkers = useMemo(
    () =>
      curatedHotels.flatMap((hotel) => {
        const coords = toHotelCoordinates(hotel);
        if (coords.lat === undefined || coords.lng === undefined) return [];
        return [
          {
            id: `hotel-${hotel.hotelid}`,
            itemId: String(hotel.hotelid),
            lat: coords.lat,
            lng: coords.lng,
            city: hotel.city || hotel.country || '—',
            label: hotel.name || 'Hotel',
          },
        ];
      }),
    [curatedHotels],
  );

  return (
    <div className="h-full overflow-y-auto bg-[#000000] relative">
      {/* Header with personalization */}
      <div className="px-6 pt-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-3">
            <p className="text-sm text-[#F5F5F0]/60 mb-1">{getGreeting()}</p>
            <h1 className="text-3xl text-[#F5F5F0]">
              <span className="italic">Marcus</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-sm text-[#F5F5F0]/60">
              Alfred is ready • Response time: {'<'}12s
            </p>
          </div>
        </motion.div>
      </div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-6 mb-6"
      >
        <div
          className="p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(184,147,94,0.15), rgba(212,175,122,0.08))',
            border: '1px solid rgba(212,175,122,0.25)',
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A)',
            }}
          />

          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#F5F5F0]/50 mb-2">
                  Active bookings
                </p>
                <p className="text-4xl text-[#F5F5F0] mb-1">—</p>
                <div className="flex items-center gap-1 text-xs text-[#F5F5F0]/50">
                  <TrendingUp size={12} />
                  <span>Awaiting live feed</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-[#F5F5F0]/50 mb-2">
                  This month
                </p>
                <p
                  className="text-4xl mb-1"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  —
                </p>
                <p className="text-xs text-[#F5F5F0]/50">Spend data pending</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 mb-6"
      >
        <h2 className="text-xs uppercase tracking-wider text-[#F5F5F0]/60 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={onOpenAlfred}
                className="flex flex-col items-center gap-2 p-3 rounded-xl"
                style={{
                  background: 'rgba(45,45,45,0.8)',
                  border: '1px solid rgba(212,175,122,0.1)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `${action.color}15`,
                  }}
                >
                  <Icon size={18} style={{ color: action.color }} />
                </div>
                <span className="text-xs text-[#F5F5F0]/70 text-center">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Search Bar */}
      <div className="px-6 mb-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onClick={onOpenAlfred}
          className="flex items-center gap-3 px-4 py-3 rounded-full cursor-pointer"
          style={{
            background: 'rgba(45,45,45,0.8)',
            border: '1px solid rgba(212,175,122,0.15)',
          }}
        >
          <div className="text-[#D4AF7A]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <span className="text-sm text-[#F5F5F0]/50">Start your search</span>
        </motion.div>
      </div>

      {error && (
        <div className="px-6 mb-6">
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            {error}
          </div>
        </div>
      )}

      {/* Curated For You / Map Toggle */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg text-[#F5F5F0]">Curated for you</h2>
            <p className="text-xs text-[#F5F5F0]/50">Daily selection from Wanderbeds</p>
          </div>
          {showMapToggle && (
            <div className="flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setMapView(false)}
                className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1 ${
                  !mapView ? 'text-[#000000]' : 'text-[#F5F5F0]/60'
                }`}
                style={{
                  background: !mapView ? 'linear-gradient(135deg, #B8935E, #D4AF7A)' : 'transparent',
                }}
              >
                <List size={12} />
                List
              </button>
              <button
                type="button"
                onClick={() => setMapView(true)}
                className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1 ${
                  mapView ? 'text-[#000000]' : 'text-[#F5F5F0]/60'
                }`}
                style={{
                  background: mapView ? 'linear-gradient(135deg, #B8935E, #D4AF7A)' : 'transparent',
                }}
              >
                <MapIcon size={12} />
                Map
              </button>
            </div>
          )}
        </div>

        {mapView ? (
          <div className="relative h-[520px] rounded-2xl overflow-hidden border border-white/10">
            {mapMarkers.length > 0 ? (
              <InteractiveMap
                markers={mapMarkers}
                items={mapItems}
                onItemSelect={(item) => {
                  const selected = curatedHotels.find(
                    (hotel) => String(hotel.hotelid) === item.id,
                  );
                  if (selected) onHotelSelect?.(selected);
                }}
                onMarkerSelectionChange={onMapMarkerSelectionChange}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#F5F5F0]/60 bg-[#0a0a0a]">
                {seedStage === 'error'
                  ? 'Couldn’t prepare hotels. Retrying…'
                  : loading || detailsLoading || seeding
                    ? 'Preparing curated hotels…'
                    : 'Curated hotels are being prepared…'}
              </div>
            )}
          </div>
        ) : (
          <>
            {loading || detailsLoading ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="text-xs text-[#F5F5F0]/50">
                  {seedStage === 'error' ? 'Couldn’t prepare hotels. Retrying…' : 'Preparing curated hotels…'}
                  {seedStage && seedStage !== 'done' && (
                    <span className="ml-2">{`Stage: ${seedStage}`}</span>
                  )}
                  {seededCount > 0 && <span className="ml-2">{`Seeded: ${seededCount}`}</span>}
                </div>
                <div className="text-[10px] text-[#F5F5F0]/40">{`API: ${curatedApiUrl}`}</div>
                {[1, 2, 3].map((key) => (
                  <div key={key} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : curatedHotels.length === 0 ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="text-xs text-[#F5F5F0]/50">
                  {seedStage === 'error' ? 'Couldn’t prepare hotels. Retrying…' : 'Preparing curated hotels…'}
                  {seedStage && seedStage !== 'done' && (
                    <span className="ml-2">{`Stage: ${seedStage}`}</span>
                  )}
                  {seededCount > 0 && <span className="ml-2">{`Seeded: ${seededCount}`}</span>}
                </div>
                <div className="text-[10px] text-[#F5F5F0]/40">{`API: ${curatedApiUrl}`}</div>
                {[1, 2, 3].map((key) => (
                  <div key={key} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {featuredHotels.map((hotel) => {
                  const detail = detailsById[String(hotel.hotelid)];
                  const image = hotel.heroImageUrl || detail?.images?.[0]?.url;
                  const location = getHotelLocation(hotel);
                  const displayName = hotel.name || detail?.hotel?.name || 'Hotel';
                  return (
                    <motion.button
                      key={String(hotel.hotelid)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-left rounded-2xl overflow-hidden border border-white/10 bg-white/5"
                      onClick={() => onHotelSelect?.(hotel)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative h-44 bg-[#111]">
                        {image ? (
                          <ImageWithFallback src={image} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#F5F5F0]/40">
                            Image
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] uppercase tracking-wider"
                          style={{
                            background: 'rgba(212,175,122,0.2)',
                            border: '1px solid rgba(212,175,122,0.4)',
                            color: '#D4AF7A',
                          }}
                        >
                          {formatRating(detail?.starrating || hotel.starrating) || '—'}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-lg text-[#F5F5F0] font-semibold">
                            {displayName}
                          </p>
                          {formatRating(detail?.starrating || hotel.starrating) ? (
                            <span className="flex items-center gap-1 text-xs text-[#D4AF7A]">
                              <Star size={14} fill="#D4AF7A" color="#D4AF7A" />
                              {formatRating(detail?.starrating || hotel.starrating)}
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
            )}
          </>
        )}
      </div>

      {/* Homes our guests love */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg text-[#F5F5F0]">Homes our guests love</h2>
          <button type="button" className="text-xs text-[#D4AF7A]">View all</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {(loading || detailsLoading) && (
            <>
              <div className="text-xs text-[#F5F5F0]/50 min-w-[220px]">
                {seedStage === 'error' ? 'Couldn’t prepare hotels. Retrying…' : 'Preparing curated hotels…'}
                {seedStage && seedStage !== 'done' && (
                  <span className="ml-2">{`Stage: ${seedStage}`}</span>
                )}
                {seededCount > 0 && <span className="ml-2">{`Seeded: ${seededCount}`}</span>}
              </div>
              <div className="text-[10px] text-[#F5F5F0]/40 min-w-[220px]">{`API: ${curatedApiUrl}`}</div>
              {[1, 2, 3].map((key) => (
                <div key={key} className="min-w-[220px] h-56 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </>
          )}
          {!loading && !detailsLoading && homesHotels.length === 0 && (
            <>
              <div className="text-xs text-[#F5F5F0]/50 min-w-[220px]">
                {seedStage === 'error' ? 'Couldn’t prepare hotels. Retrying…' : 'Preparing curated hotels…'}
                {seedStage && seedStage !== 'done' && (
                  <span className="ml-2">{`Stage: ${seedStage}`}</span>
                )}
                {seededCount > 0 && <span className="ml-2">{`Seeded: ${seededCount}`}</span>}
              </div>
              <div className="text-[10px] text-[#F5F5F0]/40 min-w-[220px]">{`API: ${curatedApiUrl}`}</div>
              {[1, 2, 3].map((key) => (
                <div key={key} className="min-w-[220px] h-56 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </>
          )}
          {!loading &&
            !detailsLoading &&
            homesHotels.map((hotel) => {
              const detail = detailsById[String(hotel.hotelid)];
              const image = hotel.heroImageUrl || detail?.images?.[0]?.url;
              const location = getHotelLocation(hotel);
              const displayName = hotel.name || detail?.hotel?.name || 'Hotel';
              return (
                <motion.button
                  key={String(hotel.hotelid)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-w-[220px] text-left rounded-2xl overflow-hidden border border-white/10 bg-white/5"
                  onClick={() => onHotelSelect?.(hotel)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="h-36 bg-[#111]">
                    {image ? (
                      <ImageWithFallback src={image} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#F5F5F0]/40">
                        Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-[#F5F5F0] mb-1">{displayName}</p>
                    <div className="flex items-center gap-2 text-xs text-[#F5F5F0]/60">
                      <MapPin size={12} />
                      <span>{location || hotel.address || '—'}</span>
                    </div>
                    <div className="text-xs text-[#F5F5F0]/60 mt-2">From — /night</div>
                  </div>
                </motion.button>
              );
            })}
        </div>
      </div>

      {/* Trending Destinations */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wider text-[#F5F5F0]/60">Trending destinations</h2>
          <TrendingUp size={14} className="text-[#D4AF7A]" />
        </div>
        <div className="space-y-3">
          {trendingDestinations.map((destination) => (
            <div
              key={destination.label}
              className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5"
            >
              <div>
                <p className="text-sm text-[#F5F5F0]">{destination.label}</p>
                <p className="text-xs text-[#F5F5F0]/50">{destination.count} hotels</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#D4AF7A]">{destination.share}%</p>
                <p className="text-xs text-[#F5F5F0]/50">of catalog</p>
              </div>
            </div>
          ))}
          {!loading && trendingDestinations.length === 0 && (
            <div className="text-sm text-[#F5F5F0]/60">No destinations available.</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wider text-[#F5F5F0]/60">Recent activity</h2>
          <Clock size={14} className="text-[#D4AF7A]" />
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-sm text-[#F5F5F0]/60">
          No recent activity yet.
        </div>
      </div>

      {/* Ask Alfred CTA */}
      <div className="px-6 pb-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          onClick={onOpenAlfred}
          className="w-full py-4 rounded-xl text-[#000000] relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center gap-2 relative z-10">
            <Sparkles size={20} />
            <span className="uppercase tracking-wider text-sm">Ask Alfred Anything</span>
          </div>

          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-200%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 1,
            }}
          />
        </motion.button>
      </div>
    </div>
  );
}
