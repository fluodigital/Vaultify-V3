import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Star, MapPin, Building2, Calendar, Users, Loader2, AlertCircle, Check } from 'lucide-react';
import { ModernNavigation } from '../components/ModernNavigation';
import { ModernFooter } from '../components/ModernFooter';
import {
  checkWanderbedsAvailability,
  isWanderbedsSuccess,
  getWanderbedsError,
  searchWanderbedsHotels,
  type WanderbedsHotel,
  type WanderbedsAvailabilityProduct,
  type WanderbedsRoom,
} from '../lib/wanderbeds';
import { fetchHotelDetails, type HotelDetail } from '../lib/hotels';
import { fetchCuratedHotels } from '../lib/hotels';

interface LocationState {
  hotel: WanderbedsHotel;
  searchToken: string | null;
  checkin: string;
  checkout: string;
}

export function WanderbedsHotelDetail() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [hotel, setHotel] = useState<WanderbedsHotel | null>(state?.hotel || null);
  const [loading, setLoading] = useState(!state?.hotel);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<WanderbedsAvailabilityProduct | null>(null);
  const [searchToken, setSearchToken] = useState<string | null>(state?.searchToken || null);
  const [hotelDetail, setHotelDetail] = useState<HotelDetail | null>(null);
  const [rooms, setRooms] = useState<WanderbedsRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [requiredFlags, setRequiredFlags] = useState<{ nationality?: boolean; chdbirthdate?: boolean }>({});
  
  // Default dates: Match competitor's working example (Feb 2-7, 2026)
  // Competitor (destinowonders.com) successfully searches with Feb 2-7, 2026 (5 nights)
  // This is ~2 weeks away, not 90 days - availability might be better closer to travel date
  const getDefaultDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check-in: Feb 2, 2026 (matches competitor's working search exactly)
    const checkin = new Date('2026-02-02');
    
    // Check-out: Feb 7, 2026 (5 nights - matches competitor)
    const checkout = new Date('2026-02-07');
    
    // If those dates are in the past, use 14 days from today instead
    if (checkin < today) {
      const checkinDate = new Date(today);
      checkinDate.setDate(checkinDate.getDate() + 14); // 2 weeks ahead
      const checkoutDate = new Date(checkinDate);
      checkoutDate.setDate(checkoutDate.getDate() + 5); // 5 nights
      return {
        checkin: checkinDate.toISOString().split('T')[0],
        checkout: checkoutDate.toISOString().split('T')[0],
      };
    }
    
    return {
      checkin: checkin.toISOString().split('T')[0],
      checkout: checkout.toISOString().split('T')[0],
    };
  };
  
  const [dates, setDates] = useState(getDefaultDates());
  
  // Calculate minimum check-in date (5 days from today as per user requirement)
  const getMinCheckinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 5);
    return minDate.toISOString().split('T')[0];
  };
  
  // Calculate recommended check-in date (90 days from today for better availability)
  const getRecommendedCheckinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recommendedDate = new Date(today);
    recommendedDate.setDate(recommendedDate.getDate() + 90);
    return recommendedDate.toISOString().split('T')[0];
  };

  // Fetch hotel data if not in state
  useEffect(() => {
    const loadHotelData = async () => {
      if (state?.hotel) {
        setHotel(state.hotel);
        setSearchToken(state.searchToken);
        setLoading(false);
        return;
      }

      // If no hotel in state, fetch from curated hotels or hotel details API
      if (params.id) {
        try {
          setLoading(true);
          setError(null);

          // First try to find in curated hotels
          const curatedResp = await fetchCuratedHotels({ limit: 500 });
          const foundHotel = curatedResp.items.find(
            (h) => String(h.hotelid || (h as any).hotelId) === params.id,
          );

          if (foundHotel) {
            // Convert HotelListItem to WanderbedsHotel format
            const hotelData: WanderbedsHotel = {
              id: String(foundHotel.hotelid || (foundHotel as any).hotelId),
              name: foundHotel.name || 'Hotel',
              stars: foundHotel.starrating || (foundHotel as any).starRating || 0,
              city: foundHotel.city || '',
              country: foundHotel.country || '',
              address: foundHotel.address || '',
              lat: typeof foundHotel.lat === 'number' ? foundHotel.lat : typeof foundHotel.lat === 'string' ? parseFloat(foundHotel.lat) : undefined,
              lon: typeof foundHotel.lng === 'number' ? foundHotel.lng : typeof foundHotel.lng === 'string' ? parseFloat(foundHotel.lng) : undefined,
            };
            setHotel(hotelData);

            // Fetch detailed hotel information
            try {
              console.log('[HotelDetail] Fetching details for hotel ID:', params.id);
              const details = await fetchHotelDetails([params.id]);
              console.log('[HotelDetail] Fetched details:', details);
              if (details.length > 0) {
                const detail = details[0];
                console.log('[HotelDetail] Setting detail:', {
                  hasImages: !!detail.images?.length,
                  imageCount: detail.images?.length || 0,
                  hasDescription: !!detail.description,
                  descriptionLength: detail.description?.length || 0,
                });
                setHotelDetail(detail);
                // Update hotel with detail info
                setHotel((prev) => ({
                  ...prev!,
                  name: detail.hotel?.name || prev?.name || 'Hotel',
                  stars: detail.starrating || prev?.stars || 0,
                  city: detail.city?.name || prev?.city || '',
                  address: detail.address || prev?.address || '',
                  lat: detail.lat || prev?.lat,
                  lon: detail.lng || prev?.lon,
                }));
              } else {
                console.warn('[HotelDetail] No details returned for hotel ID:', params.id);
              }
            } catch (detailErr) {
              // Detail fetch failed, but we have basic hotel data
              console.error('[HotelDetail] Failed to fetch hotel details:', detailErr);
            }
          } else {
            // Not found in curated, try hotel details API directly
            try {
              console.log('[HotelDetail] Hotel not in curated, fetching from API for ID:', params.id);
              const details = await fetchHotelDetails([params.id]);
              console.log('[HotelDetail] API details response:', details);
              if (details.length > 0) {
                const detail = details[0];
                console.log('[HotelDetail] Setting detail from API:', {
                  hasImages: !!detail.images?.length,
                  imageCount: detail.images?.length || 0,
                  hasDescription: !!detail.description,
                });
                const hotelData: WanderbedsHotel = {
                  id: String(detail.hotel?.hotelid || params.id),
                  name: detail.hotel?.name || 'Hotel',
                  stars: detail.starrating || 0,
                  city: detail.city?.name || '',
                  country: detail.country || '',
                  address: detail.address || '',
                  lat: detail.lat,
                  lon: detail.lng,
                };
                setHotel(hotelData);
                setHotelDetail(detail);
              } else {
                console.warn('[HotelDetail] No details found for hotel ID:', params.id);
                setError('Hotel not found');
              }
            } catch (detailErr: any) {
              console.error('[HotelDetail] Error fetching hotel details:', detailErr);
              setError(detailErr?.message || 'Failed to load hotel');
            }
          }
        } catch (err: any) {
          setError(err?.message || 'Failed to load hotel');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Hotel ID is missing');
        setLoading(false);
      }
    };

    loadHotelData();
  }, [params.id, state, navigate]);

  // Fetch pricing and rooms when hotel is loaded or dates change
  useEffect(() => {
    const fetchPricing = async () => {
      if (!hotel || pricingLoading) return;
      
      // Validate dates
      if (!dates.checkin || !dates.checkout) {
        return;
      }
      
      const checkinDate = new Date(dates.checkin + 'T00:00:00');
      const checkoutDate = new Date(dates.checkout + 'T00:00:00');
      
      // Ensure checkout is after checkin (at least 1 day difference)
      if (checkoutDate <= checkinDate) {
        console.warn('[HotelDetail] Invalid dates - checkout must be after checkin', { checkin: dates.checkin, checkout: dates.checkout });
        setError('Check-out date must be after check-in date');
        setPricingLoading(false);
        return;
      }
      
      // Ensure at least 1 night stay (checkout must be at least 1 day after checkin)
      const nights = Math.floor((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
      if (nights < 1) {
        console.warn('[HotelDetail] Invalid dates - minimum 1 night stay required', { checkin: dates.checkin, checkout: dates.checkout, nights });
        setError('Minimum 1 night stay required');
        setPricingLoading(false);
        return;
      }
      
      // Per requirements: Remove artificial lead-time rules
      // Only validate that dates are in the future and checkout > checkin
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkinDate < today) {
        console.warn('[HotelDetail] Invalid dates - checkin must be today or in the future', { 
          checkin: dates.checkin,
        });
        setError('Check-in date must be today or in the future.');
        setPricingLoading(false);
        return;
      }
      
      try {
        setPricingLoading(true);
        setError(null);
        
        const hotelId = parseInt(hotel.id, 10);
        if (isNaN(hotelId)) {
          console.warn('[HotelDetail] Invalid hotel ID for pricing:', hotel.id);
          setPricingLoading(false);
          return;
        }
        
        console.log('[HotelDetail] Fetching pricing for hotel:', hotelId, 'dates:', dates);
        
        // Per Wanderbeds API docs (Search.txt): rooms must include adt, chd, and age
        // Backend will normalize, but we send proper format here too
        const searchResp = await searchWanderbedsHotels({
          hotels: [hotelId],
          checkin: dates.checkin,
          checkout: dates.checkout,
          rooms: [{ 
            adt: 1, // 1 adult (matches competitor's working search)
            chd: 0, // Always include chd, even if 0
            age: [], // Always include age array, empty when chd=0
          }],
          nationality: hotel.country || 'FR', // Default to FR (per competitor example)
          timout: '20', // Note: typo in vendor API, must be "timout" not "timeout"
        });
        
        console.log('[HotelDetail] Search response:', searchResp);
        console.log('[HotelDetail] Search response details:', {
          ok: searchResp.ok,
          hasData: !!searchResp.data,
          error: searchResp.data?.error,
          count: searchResp.data?.count,
          hotelsLength: searchResp.data?.hotels?.length,
          hotels: searchResp.data?.hotels,
        });
        
        if (searchResp.ok && searchResp.data) {
          // Store token from search response (required for avail/book requests per Wanderbeds docs)
          if (searchResp.data?.token) {
            setSearchToken(searchResp.data.token);
          }
          
          // Use availability structure: data.data.products[] (from transformSearchToAvailabilityFormat)
          // Fallback to legacy hotels array for backward compatibility
          const availabilityData = searchResp.data?.data;
          const products = availabilityData?.products || [];
          const legacyHotels = searchResp.data?.hotels || [];
          
          // Find the product/hotel matching our hotel ID
          const foundProduct = products.find((p: any) => 
            String(p.hotelid || p.hotelId) === String(hotel.id)
          ) || legacyHotels.find((h: any) => 
            String(h.hotelId || h.id) === String(hotel.id)
          );
          
          // Handle "No results" case
          const hasError = searchResp.data.error?.code === 100;
          const hasNoProducts = (!availabilityData?.success && products.length === 0 && legacyHotels.length === 0);
          const hasNoRooms = foundProduct && (!foundProduct.rooms || foundProduct.rooms.length === 0);
          
          if (hasError || hasNoProducts || hasNoRooms) {
            console.warn('[HotelDetail] No rooms available for these dates', {
              errorCode: searchResp.data.error?.code,
              errorMessage: searchResp.data.error?.message,
              hasAvailabilityData: !!availabilityData,
              productsCount: products.length,
              legacyHotelsCount: legacyHotels.length,
              foundProduct: !!foundProduct,
              roomsCount: foundProduct?.rooms?.length || 0,
              hotelId: hotel.id,
              dates: dates,
            });
            setRooms([]);
            
            // Per requirements: Remove 30-day advance messaging
            // Show clear message based on upstream response only
            let errorMsg = `No rooms available for the selected dates (${dates.checkin} to ${dates.checkout}).`;
            if (searchResp.meta?.nationalityUsed && searchResp.meta.nationalityUsed !== (hotel.country || 'FR')) {
              errorMsg += ` Note: Availability may vary by nationality. Try a different nationality.`;
            } else {
              errorMsg += ` This hotel may not have availability through Wanderbeds for these dates, or all rooms are booked. Try different dates or another hotel.`;
            }
            
            setError(errorMsg);
            setPricingLoading(false);
            return;
          }
          
          if (foundProduct) {
            // Extract rooms from product (availability structure) or legacy hotel
            const roomsList = (foundProduct.rooms || []) as any[];
            
            // Store required flags from availability response
            const required = availabilityData?.required || {};
            setRequiredFlags({
              nationality: required.nationality === 1 || required.nationality === '1' || required.nationality === true,
              chdbirthdate: required.chdbirthdate === 1 || required.chdbirthdate === '1' || required.chdbirthdate === true,
            });
            
            // Calculate lowest price from rooms
            const prices = roomsList
              .map((r) => r.price?.total || (r.price?.baseprice || 0))
              .filter((p): p is number => typeof p === 'number' && p > 0);
            const lowestPrice = prices.length > 0 ? Math.min(...prices) : undefined;
            const currency = roomsList[0]?.price?.currency || roomsList[0]?.price?.currency;
            
            setHotel((prev) => ({
              ...prev!,
              lowestPriceTotal: lowestPrice,
              currency: currency,
              roomOffersCount: roomsList.length,
              refundableAny: roomsList.some((r) => r.refundable),
            }));
            setSearchToken(searchResp.data.token);
            
            // Map rooms to frontend format (using offerid as primary key)
            const mappedRooms: WanderbedsRoom[] = roomsList.map((r: any) => ({
              offerId: r.offerId || r.offerid, // Primary key - must be present
              name: r.name || 'Room',
              refundable: Boolean(r.refundable),
              package: Boolean(r.package),
              roomType: r.roomType || r.roomtype ? {
                code: (r.roomType || r.roomtype)?.code || '',
                name: (r.roomType || r.roomtype)?.name || '',
              } : undefined,
              meal: r.meal ? {
                code: r.meal.code || '',
                name: r.meal.name || '',
              } : undefined,
              view: r.view ? {
                code: r.view.code || '',
                name: r.view.name || '',
              } : undefined,
              price: {
                base: r.price?.base || r.price?.baseprice || 0,
                tax: r.price?.tax || 0,
                margin: r.price?.margin || 0,
                total: r.price?.total || 0,
                currency: r.price?.currency || 'USD',
              },
              cancelPolicy: r.cancelPolicy || r.cancelpolicy,
              additionalFees: r.additionalFees || r.additionalfees,
              remarks: Array.isArray(r.remarks) ? r.remarks : (r.remarks ? [r.remarks] : []),
              roomIndex: r.roomIndex || r.roomindex,
              group: r.group,
            }));
            
            setRooms(mappedRooms);
            console.log('[HotelDetail] Found rooms:', mappedRooms.length, 'from availability structure', {
              requiredFlags: {
                nationality: requiredFlags.nationality,
                chdbirthdate: requiredFlags.chdbirthdate,
              },
            });
          } else {
            console.warn('[HotelDetail] Hotel not found in search response products/hotels');
          }
        } else {
          console.warn('[HotelDetail] Search failed:', searchResp.error);
          // Don't collapse this into a generic pricing failure; surface the actual backend error
          setError(searchResp.error?.message || 'Search failed. Please try again.');
        }
      } catch (err: any) {
        console.error('[HotelDetail] Error fetching pricing:', err);
        setError(err?.message || 'Search failed. Please try again.');
      } finally {
        setPricingLoading(false);
      }
    };
    
    fetchPricing();
  }, [hotel?.id, dates.checkin, dates.checkout]);

  const handleCheckAvailability = async () => {
    if (!hotel || !searchToken) {
      setError('Please wait for pricing to load, or try refreshing the page');
      return;
    }

    if (selectedRoom) {
      // Check availability for selected room
      try {
        setAvailabilityLoading(true);
        const availResp = await checkWanderbedsAvailability({
          token: searchToken,
          rooms: [selectedRoom],
        });
        
        if (isWanderbedsSuccess(availResp)) {
          setAvailability(availResp.data.products?.[0] || null);
        } else {
          setError(getWanderbedsError(availResp) || 'Failed to check availability');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to check availability');
      } finally {
        setAvailabilityLoading(false);
      }
    } else {
      setError('Please select a room type first');
    }
  };

  if (loading || !hotel) {
    return (
      <div className="bg-[#000000] min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-[#D4AF7A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#000000] min-h-screen">
      <ModernNavigation onLoginClick={() => {}} onMembershipClick={() => {}} />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#F5F5F0]/70 hover:text-[#D4AF7A] transition"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </motion.button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Hotel Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-[#F5F5F0] mb-2">{hotel.name}</h1>
              <div className="flex items-center gap-4 text-[#F5F5F0]/70">
                {hotel.stars > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={18} className="text-[#D4AF7A] fill-[#D4AF7A]" />
                    <span className="font-semibold">{hotel.stars} Star{hotel.stars !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>
                    {[hotel.city, hotel.country].filter(Boolean).join(', ') || 'Location not specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {hotel.address && (
            <div className="flex items-start gap-2 text-[#F5F5F0]/60 mb-4">
              <Building2 size={16} className="mt-0.5 flex-shrink-0" />
              <p>{hotel.address}</p>
            </div>
          )}

          {hotel.lat && hotel.lon && (
            <div className="text-xs text-[#F5F5F0]/40 mb-4">
              Coordinates: {hotel.lat.toFixed(4)}, {hotel.lon.toFixed(4)}
            </div>
          )}
        </motion.div>

        {/* Hotel Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 rounded-2xl overflow-hidden border border-white/10"
        >
          {hotelDetail?.images && hotelDetail.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {hotelDetail.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="h-64 md:h-96 bg-[#111] relative overflow-hidden group">
                  <img
                    src={img.url}
                    alt={`${hotel.name} - Image ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      console.error('[HotelDetail] Image load error:', img.url);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="flex items-center justify-center h-full text-[#F5F5F0]/40">Image unavailable</div>';
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          ) : hotel.lat && hotel.lon ? (
            <div className="h-96 bg-[#111] flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin size={48} className="mx-auto mb-4 text-[#F5F5F0]/30" />
                <p className="text-sm text-[#F5F5F0]/50">Map view coming soon</p>
                <p className="text-xs text-[#F5F5F0]/30 mt-2">{hotel.lat.toFixed(4)}, {hotel.lon.toFixed(4)}</p>
              </div>
            </div>
          ) : (
            <div className="h-96 bg-[#111] flex items-center justify-center">
              <div className="text-[#F5F5F0]/40">No image available</div>
            </div>
          )}
        </motion.div>

        {/* Booking Details */}
        {state?.checkin && state?.checkout && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-4">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-[#D4AF7A]" />
                <div>
                  <p className="text-xs text-[#F5F5F0]/50">Check-in</p>
                  <p className="text-[#F5F5F0] font-semibold">{new Date(state.checkin).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-[#D4AF7A]" />
                <div>
                  <p className="text-xs text-[#F5F5F0]/50">Check-out</p>
                  <p className="text-[#F5F5F0] font-semibold">{new Date(state.checkout).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Date Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <h2 className="text-xl font-semibold text-[#F5F5F0] mb-4">Select Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#F5F5F0]/60 mb-2">Check-in</label>
              <input
                type="date"
                value={dates.checkin}
                min={getMinCheckinDate()}
                onChange={(e) => setDates((prev) => ({ ...prev, checkin: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-[#F5F5F0] focus:border-[#D4AF7A] focus:outline-none"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-[#F5F5F0]/50">Minimum 5 days in advance</p>
                <button
                  onClick={() => {
                    const recommended = getRecommendedCheckinDate();
                    const recommendedCheckout = new Date(recommended);
                    recommendedCheckout.setDate(recommendedCheckout.getDate() + 2);
                    setDates({
                      checkin: recommended,
                      checkout: recommendedCheckout.toISOString().split('T')[0],
                    });
                  }}
                  className="text-xs text-[#D4AF7A] hover:text-[#D4AF7A]/80 underline"
                >
                  Use 90 days (recommended)
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F0]/60 mb-2">Check-out</label>
              <input
                type="date"
                value={dates.checkout}
                min={dates.checkin || new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const newCheckout = e.target.value;
                  // Ensure checkout is after checkin
                  if (newCheckout >= dates.checkin) {
                    setDates((prev) => ({ ...prev, checkout: newCheckout }));
                  }
                }}
                className="w-full px-4 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-[#F5F5F0] focus:border-[#D4AF7A] focus:outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Room Types & Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <h2 className="text-xl font-semibold text-[#F5F5F0] mb-4">Room Types & Pricing</h2>
          
          {pricingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-[#D4AF7A] animate-spin mr-3" />
              <span className="text-[#F5F5F0]/60">Loading pricing and room types...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 border border-yellow-500/30 rounded-lg bg-yellow-500/10 p-6">
              <p className="text-[#F5F5F0] mb-2 font-semibold">
                {hotelDetail ? 'Rooms not available for these dates' : 'Unable to load pricing'}
              </p>
              <p className="text-[#F5F5F0]/70 mb-4 text-sm">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={() => {
                    setPricingLoading(true);
                    setError(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#D4AF7A]/20 text-[#D4AF7A] hover:bg-[#D4AF7A]/30 transition"
                >
                  Retry
                </button>
                {hotelDetail && (
                  <p className="text-xs text-[#F5F5F0]/50">
                    Hotel details loaded. Please adjust dates, occupancy, or nationality above.
                  </p>
                )}
              </div>
            </div>
          ) : rooms.length > 0 ? (
            <div className="space-y-3">
              {rooms.map((room) => (
                <motion.button
                  key={room.offerId}
                  onClick={() => setSelectedRoom(selectedRoom === room.offerId ? null : room.offerId)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedRoom === room.offerId
                      ? 'border-[#D4AF7A] bg-[#D4AF7A]/10'
                      : 'border-white/10 bg-white/5 hover:border-[#D4AF7A]/30'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {selectedRoom === room.offerId && (
                          <Check size={18} className="text-[#D4AF7A]" />
                        )}
                        <h3 className="text-lg font-semibold text-[#F5F5F0]">{room.name}</h3>
                      </div>
                      <div className="space-y-1.5 text-sm text-[#F5F5F0]/70">
                        {room.roomType && (
                          <div className="flex items-center gap-2">
                            <span className="text-[#F5F5F0]/50">Room:</span>
                            <span>{room.roomType.name}</span>
                          </div>
                        )}
                        {room.meal && (
                          <div className="flex items-center gap-2">
                            <span className="text-[#F5F5F0]/50">Meal:</span>
                            <span>{room.meal.name}</span>
                          </div>
                        )}
                        {room.view && (
                          <div className="flex items-center gap-2">
                            <span className="text-[#F5F5F0]/50">View:</span>
                            <span>{room.view.name}</span>
                          </div>
                        )}
                        {room.cancelPolicy && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#F5F5F0]/50">Cancellation:</span>
                            <span className="text-yellow-400">
                              {room.cancelPolicy.from 
                                ? `From ${new Date(room.cancelPolicy.from).toLocaleDateString()}: ${room.cancelPolicy.currency} ${room.cancelPolicy.amount.toFixed(2)}`
                                : 'Non-refundable'}
                            </span>
                          </div>
                        )}
                        {room.additionalFees && room.additionalFees.total && room.additionalFees.total > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/5">
                            <div className="text-[#F5F5F0]/50 text-xs mb-1">Payable at property:</div>
                            <div className="text-[#F5F5F0] font-semibold">
                              {room.additionalFees.currency} {room.additionalFees.total.toFixed(2)}
                            </div>
                            {room.additionalFees.breakdown && room.additionalFees.breakdown.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {room.additionalFees.breakdown.map((fee: any, idx: number) => (
                                  <div key={idx} className="text-xs text-[#F5F5F0]/60">
                                    • {fee.name}: {fee.currency} {fee.amount.toFixed(2)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {room.remarks && room.remarks.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/5">
                            <div className="text-[#F5F5F0]/50 text-xs mb-1">Important information:</div>
                            <div className="space-y-0.5 max-h-20 overflow-y-auto">
                              {room.remarks.slice(0, 3).map((remark: string, idx: number) => (
                                <div key={idx} className="text-xs text-[#F5F5F0]/70">
                                  • {remark.length > 100 ? `${remark.substring(0, 100)}...` : remark}
                                </div>
                              ))}
                              {room.remarks.length > 3 && (
                                <div className="text-xs text-[#D4AF7A] cursor-pointer hover:underline">
                                  +{room.remarks.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                          {room.refundable && (
                            <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                              Refundable
                            </span>
                          )}
                          {room.package && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                              Package
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#D4AF7A] mb-1">
                        {room.price.currency} {room.price.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-[#F5F5F0]/50">Total</div>
                      {room.price.base !== room.price.total && (
                        <div className="text-xs text-[#F5F5F0]/40 mt-1">
                          Base: {room.price.currency} {room.price.base.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : hotel.lowestPriceTotal && hotel.currency ? (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-[#D4AF7A]">
                  {hotel.currency} {hotel.lowestPriceTotal.toFixed(2)}
                </span>
                <span className="text-sm text-[#F5F5F0]/50">total</span>
              </div>
              <p className="text-xs text-[#F5F5F0]/40">Lowest price from available rooms</p>
            </div>
          ) : (
            <p className="text-[#F5F5F0]/70">No pricing available. Please select dates above.</p>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
          >
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4"
        >
          <button
            onClick={handleCheckAvailability}
            disabled={availabilityLoading || !searchToken || !selectedRoom}
            className="flex-1 px-6 py-4 rounded-xl font-semibold text-[#000000] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
            }}
          >
            {availabilityLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Checking...
              </>
            ) : selectedRoom ? (
              'Confirm Selection'
            ) : (
              'Select a Room Type Above'
            )}
          </button>
          <button
            onClick={() => navigate('/wanderbeds/search')}
            className="px-6 py-4 rounded-xl border border-white/20 text-[#F5F5F0] hover:bg-white/5 transition"
          >
            New Search
          </button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <h2 className="text-xl font-semibold text-[#F5F5F0] mb-4">Hotel Information</h2>
          <div className="space-y-3 text-sm text-[#F5F5F0]/70">
            <div>
              <span className="font-semibold text-[#F5F5F0]">Hotel ID:</span> {hotel.id}
            </div>
            {hotel.country && (
              <div>
                <span className="font-semibold text-[#F5F5F0]">Country:</span> {hotel.country}
              </div>
            )}
            {hotel.city && (
              <div>
                <span className="font-semibold text-[#F5F5F0]">City:</span> {hotel.city}
              </div>
            )}
            {hotelDetail?.description ? (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="font-semibold text-[#F5F5F0] mb-2">Description</h3>
                <p className="text-[#F5F5F0]/80 leading-relaxed whitespace-pre-wrap">{hotelDetail.description}</p>
              </div>
            ) : hotelDetail?.remarks && hotelDetail.remarks.length > 0 ? (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="font-semibold text-[#F5F5F0] mb-2">Information</h3>
                <div className="space-y-2">
                  {hotelDetail.remarks.map((remark, idx) => (
                    <p key={idx} className="text-[#F5F5F0]/80 leading-relaxed">{remark}</p>
                  ))}
                </div>
              </div>
            ) : null}
            {hotelDetail?.facilities && hotelDetail.facilities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="font-semibold text-[#F5F5F0] mb-3">Facilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {hotelDetail.facilities.map((facility, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-[#F5F5F0]/80">
                      <span className="text-[#D4AF7A] mt-0.5">•</span>
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <ModernFooter onMembershipClick={() => {}} />
    </div>
  );
}
