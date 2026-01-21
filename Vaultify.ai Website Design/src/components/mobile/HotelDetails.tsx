import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MapPin, Star, Sparkles, ChevronDown, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { fetchHotelDetails, getCachedHotelDetail, type HotelDetail } from '../../lib/hotels';

type HotelDetailsProps = {
  hotelId: string | number;
  onBack: () => void;
};

export function HotelDetails({ hotelId, onBack }: HotelDetailsProps) {
  const [detail, setDetail] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const cached = getCachedHotelDetail(hotelId);
        if (cached && isActive) setDetail(cached);
        const resp = await fetchHotelDetails([hotelId]);
        if (!isActive) return;
        setDetail(resp[0] || null);
      } catch (err: any) {
        if (!isActive) return;
        setError(err?.message || 'Failed to load hotel details');
      } finally {
        if (isActive) setLoading(false);
      }
    };
    load();
    return () => {
      isActive = false;
    };
  }, [hotelId]);

  const name = detail?.hotel?.name || 'Hotel';
  const city = detail?.city?.name;
  const country = detail?.country;
  const rating = detail?.starrating ? detail.starrating.toFixed(1) : null;

  const images = useMemo(
    () => (detail?.images || []).map((image) => image.url).filter(Boolean),
    [detail?.images],
  );

  const amenities = detail?.facilities || [];
  const highlights = detail?.remarks || [];
  const premiumAccommodations = detail?.accommodation ? [detail.accommodation] : [];

  return (
    <div className="h-full overflow-y-auto bg-[#000000] pb-24">
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl border-b"
        style={{
          background: 'rgba(0,0,0,0.8)',
          borderColor: 'rgba(212,175,122,0.1)',
        }}
      >
        <motion.button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(45,45,45,0.8)',
            border: '1px solid rgba(212,175,122,0.2)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={20} style={{ color: '#D4AF7A' }} />
        </motion.button>
        <div className="text-xs text-[#F5F5F0]/60">Hotel details</div>
      </div>

      {/* Gallery */}
      <div className="relative">
        <div className="relative h-80 bg-[#1F1F1F]">
          {images.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGalleryIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <ImageWithFallback
                  src={images[selectedGalleryIndex]}
                  alt={`${name} - Image ${selectedGalleryIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#F5F5F0]/40">
              No images available
            </div>
          )}

          {images.length > 0 && (
            <div
              className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full backdrop-blur-xl z-10"
              style={{
                background: 'rgba(0,0,0,0.7)',
                border: '1px solid rgba(212,175,122,0.3)',
              }}
            >
              <span className="text-xs text-[#F5F5F0]">
                {selectedGalleryIndex + 1} / {images.length}
              </span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="px-6 py-4 overflow-x-auto">
            <div className="flex gap-2">
              {images.map((image, index) => (
                <motion.button
                  key={image}
                  onClick={() => setSelectedGalleryIndex(index)}
                  className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden"
                  style={{
                    border:
                      selectedGalleryIndex === index
                        ? '2px solid #D4AF7A'
                        : '2px solid rgba(212,175,122,0.2)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ImageWithFallback src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  {selectedGalleryIndex === index && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(184,147,94,0.3), rgba(212,175,122,0.2))',
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Title and Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-6 pb-4 border-b"
        style={{ borderColor: 'rgba(212,175,122,0.1)' }}
      >
        <h1 className="text-2xl text-[#F5F5F0] mb-2">{name}</h1>
        <div className="flex items-center gap-4 text-sm text-[#F5F5F0]/70">
          <div className="flex items-center gap-1">
            <Star size={14} fill="#D4AF7A" style={{ color: '#D4AF7A' }} />
            <span>{rating || '—'}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{[city, country].filter(Boolean).join(', ') || '—'}</span>
          </div>
        </div>
      </motion.div>

      <div className="px-6 py-4">
        {loading && <div className="text-sm text-[#F5F5F0]/60">Loading details...</div>}
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            {error}
          </div>
        )}
      </div>

      {!loading && !error && (
        <>
          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-6 py-6 border-b"
            style={{ borderColor: 'rgba(212,175,122,0.1)' }}
          >
            <h2 className="text-xl text-[#F5F5F0] mb-4">About this hotel</h2>
            <div className="text-sm text-[#F5F5F0]/70 leading-relaxed">
              <p className={showFullDescription ? '' : 'line-clamp-4'}>
                {detail?.description || '—'}
              </p>
              <motion.button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="flex items-center gap-1 mt-3 text-[#D4AF7A]"
                whileTap={{ scale: 0.95 }}
              >
                <span className="underline">{showFullDescription ? 'Show less' : 'Show more'}</span>
                <motion.div animate={{ rotate: showFullDescription ? 180 : 0 }}>
                  <ChevronDown size={16} />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>

          {/* Amenities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-6 py-6 border-b"
            style={{ borderColor: 'rgba(212,175,122,0.1)' }}
          >
            <h2 className="text-xl text-[#F5F5F0] mb-6">Amenities</h2>
            <div className="grid grid-cols-2 gap-4">
              {(showAllAmenities ? amenities : amenities.slice(0, 8)).map((amenity) => (
                <div key={amenity} className="text-sm text-[#F5F5F0]/80">
                  {amenity}
                </div>
              ))}
              {amenities.length === 0 && (
                <div className="text-sm text-[#F5F5F0]/60">—</div>
              )}
            </div>
            {amenities.length > 8 && (
              <motion.button
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-6 px-6 py-3 rounded-xl text-sm"
                style={{
                  border: '1px solid rgba(212,175,122,0.3)',
                  color: '#F5F5F0',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {showAllAmenities ? 'Show less' : `Show all ${amenities.length} amenities`}
              </motion.button>
            )}
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-6 py-6 border-b"
            style={{ borderColor: 'rgba(212,175,122,0.1)' }}
          >
            <h2 className="text-xl text-[#F5F5F0] mb-6">Highlights</h2>
            <div className="space-y-3">
              {highlights.length > 0
                ? highlights.map((highlight) => (
                    <div key={highlight} className="text-sm text-[#F5F5F0]/80">
                      {highlight}
                    </div>
                  ))
                : (
                  <div className="text-sm text-[#F5F5F0]/60">—</div>
                )}
            </div>
          </motion.div>

          {/* Premium accommodations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="px-6 py-6 border-b"
            style={{ borderColor: 'rgba(212,175,122,0.1)' }}
          >
            <h2 className="text-xl text-[#F5F5F0] mb-6">Premium accommodations</h2>
            <div className="grid grid-cols-2 gap-4">
              {premiumAccommodations.length > 0
                ? premiumAccommodations.map((accommodation) => (
                    <div
                      key={accommodation}
                      className="rounded-xl p-4 text-sm text-[#F5F5F0]/80 border border-white/10 bg-white/5"
                    >
                      {accommodation}
                    </div>
                  ))
                : (
                  <>
                    <div className="rounded-xl p-4 text-sm text-[#F5F5F0]/60 border border-white/10 bg-white/5">
                      —
                    </div>
                    <div className="rounded-xl p-4 text-sm text-[#F5F5F0]/60 border border-white/10 bg-white/5">
                      —
                    </div>
                  </>
                )}
            </div>
          </motion.div>

          {/* Meet your concierge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-6 py-6 border-b"
            style={{ borderColor: 'rgba(212,175,122,0.1)' }}
          >
            <h2 className="text-xl text-[#F5F5F0] mb-6">Meet your concierge</h2>
            <div
              className="p-6 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(184,147,94,0.08), rgba(212,175,122,0.05))',
                border: '1px solid rgba(212,175,122,0.2)',
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A)',
                  }}
                >
                  <Sparkles size={24} style={{ color: '#000000' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-[#F5F5F0] mb-1">Alfred AI</h3>
                  <p className="text-sm text-[#F5F5F0]/60 mb-2">Elite AI Concierge</p>
                  <div className="flex items-center gap-4 text-xs text-[#F5F5F0]/70">
                    <div className="flex items-center gap-1">
                      <Star size={12} fill="#D4AF7A" style={{ color: '#D4AF7A' }} />
                      <span>Rating —</span>
                    </div>
                    <span>·</span>
                    <span>Bookings —</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#F5F5F0]/70 mb-4 leading-relaxed">
                Alfred AI is your personal luxury concierge, available 24/7 to coordinate every detail.
              </p>
              <motion.button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                style={{
                  border: '1px solid rgba(212,175,122,0.3)',
                  color: '#F5F5F0',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle size={16} style={{ color: '#D4AF7A' }} />
                <span>Message Alfred</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Book with Alfred (disabled for now) */}
          <div className="px-6 py-6">
            <button
              type="button"
              className="w-full py-3 rounded-xl text-[#000000] font-semibold"
              style={{ background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)' }}
              aria-disabled="true"
            >
              Book with Alfred
            </button>
          </div>
        </>
      )}
    </div>
  );
}
