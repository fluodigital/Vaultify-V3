import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Star, MapPin, Calendar, Users, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { ModernNavigation } from '../components/ModernNavigation';
import { ModernFooter } from '../components/ModernFooter';
import { apiGet } from '../lib/api';
import {
  searchWanderbedsHotels,
  isWanderbedsSuccess,
  getWanderbedsError,
  type WanderbedsHotel,
  type WanderbedsSearchRequest,
} from '../lib/wanderbeds';

interface WanderbedsSearchProps {
  onMembershipClick: () => void;
}

interface CountryOption {
  code: string;
  name: string;
}

interface CityOption {
  code: string;
  name: string;
  country: string;
}

interface HotelOption {
  hotelId: string | number;
  name: string;
  city: string;
  country: string;
  starRating: number;
}

export function WanderbedsSearch({ onMembershipClick }: WanderbedsSearchProps) {
  const navigate = useNavigate();
  
  const [searchParams, setSearchParams] = useState<WanderbedsSearchRequest>({
    hotels: [],
    checkin: '',
    checkout: '',
    rooms: [{ adt: 2, chd: 0, age: [] }],
    nationality: 'AE', // Hidden - required by API for pricing
    timout: '20',
  });

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [availableHotels, setAvailableHotels] = useState<HotelOption[]>([]);
  const [hotels, setHotels] = useState<WanderbedsHotel[]>([]);
  const [searchToken, setSearchToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true);
        const data = await apiGet<{ data?: { countries?: Array<{ code: string; name: string }> } }>('/hotels/static/countries');
        const countriesList = data?.data?.countries || [];
        setCountries(countriesList.map((c: any) => ({ code: c.code, name: c.name })));
      } catch (err: any) {
        setError('Failed to load countries');
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  // Load cities when country changes
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      setAvailableHotels([]);
      setSelectedCity('');
      return;
    }

    const loadCities = async () => {
      try {
        setLoadingCities(true);
        const data = await apiGet<{ data?: { cities?: Array<{ code: string; name: string; country: string }> } }>(`/hotels/static/cities/${selectedCountry}`);
        const citiesList = data?.data?.cities || [];
        setCities(citiesList.map((c: any) => ({ code: c.code, name: c.name, country: c.country || selectedCountry })));
      } catch (err: any) {
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, [selectedCountry]);

  // Load hotels when location changes
  useEffect(() => {
    if (!selectedCountry) {
      setAvailableHotels([]);
      setSearchParams((prev) => ({ ...prev, hotels: [] }));
      return;
    }

    const loadHotels = async () => {
      try {
        setLoadingHotels(true);
        setError(null);
        const params: Record<string, string | number> = { country: selectedCountry };
        if (selectedCity) {
          params.city = selectedCity;
        }
        params.minStars = 4; // Minimum 4 stars

        const data = await apiGet<{ hotels?: HotelOption[]; total?: number; source?: string; message?: string; error?: string }>('/hotels/static/hotels-by-location', params);
        const hotelsList = data?.hotels || [];
        
        if (import.meta.env.DEV) {
          console.log('[loadHotels]', { 
            params, 
            responseCount: hotelsList.length, 
            total: data?.total,
            source: data?.source,
            message: data?.message,
            error: data?.error,
            sample: hotelsList[0],
            fullResponse: data,
          });
        }
        
        setAvailableHotels(hotelsList);
        
        // Auto-select hotel IDs for search - handle different ID formats
        const hotelIds = hotelsList.map((h) => {
          const id = h.hotelId;
          if (typeof id === 'string') {
            const parsed = parseInt(id, 10);
            return Number.isNaN(parsed) ? null : parsed;
          }
          const numId = Number(id);
          return Number.isNaN(numId) ? null : numId;
        }).filter((id): id is number => id !== null && id > 0);
        
        if (import.meta.env.DEV) {
          console.log('[loadHotels] parsed IDs', { hotelIds, count: hotelIds.length });
        }
        
        if (hotelIds.length === 0) {
          const locationName = countries.find((c) => c.code === selectedCountry)?.name || selectedCountry;
          setError(`No hotels found in ${locationName}${selectedCity ? `, ${selectedCity}` : ''}. Try a different location.`);
        } else {
          setError(null);
        }
        
        setSearchParams((prev) => ({ ...prev, hotels: hotelIds }));
      } catch (err: any) {
        console.error('[loadHotels]', err);
        setAvailableHotels([]);
        setSearchParams((prev) => ({ ...prev, hotels: [] }));
        setError(err?.message || 'Failed to load hotels for this location');
      } finally {
        setLoadingHotels(false);
      }
    };

    // Debounce to avoid too many requests
    const timer = setTimeout(loadHotels, 500);
    return () => clearTimeout(timer);
  }, [selectedCountry, selectedCity]);

  const handleSearch = useCallback(async () => {
    if (!searchParams.checkin || !searchParams.checkout) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (searchParams.hotels.length === 0) {
      setError('Please select a location to search for hotels');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await searchWanderbedsHotels(searchParams);

      if (isWanderbedsSuccess(response)) {
        setHotels(response.data.hotels);
        setSearchToken(response.data.token);
        setError(null);
      } else {
        const errorMsg = getWanderbedsError(response);
        setError(errorMsg || 'Search failed');
        setHotels([]);
        setSearchToken(null);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
      setHotels([]);
      setSearchToken(null);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const handleHotelClick = (hotel: WanderbedsHotel) => {
    navigate(`/wanderbeds/hotel/${hotel.id}`, {
      state: {
        hotel,
        searchToken,
        checkin: searchParams.checkin,
        checkout: searchParams.checkout,
      },
    });
  };

  const addRoom = () => {
    setSearchParams({
      ...searchParams,
      rooms: [...searchParams.rooms, { adt: 2, chd: 0, age: [] }],
    });
  };

  const removeRoom = (index: number) => {
    if (searchParams.rooms.length > 1) {
      setSearchParams({
        ...searchParams,
        rooms: searchParams.rooms.filter((_, i) => i !== index),
      });
    }
  };

  const updateRoom = (index: number, field: 'adt' | 'chd', value: number) => {
    const updatedRooms = [...searchParams.rooms];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    setSearchParams({ ...searchParams, rooms: updatedRooms });
  };

  const selectedLocationText = useMemo(() => {
    const parts = [];
    if (selectedCountry) {
      const countryName = countries.find((c) => c.code === selectedCountry)?.name || selectedCountry;
      parts.push(countryName);
    }
    if (selectedCity) {
      const cityName = cities.find((c) => c.code === selectedCity)?.name || selectedCity;
      parts.push(cityName);
    }
    return parts.join(', ') || 'Select location';
  }, [selectedCountry, selectedCity, countries, cities]);

  return (
    <div className="bg-[#000000] min-h-screen">
      <ModernNavigation onLoginClick={() => {}} onMembershipClick={onMembershipClick} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#F5F5F0] mb-4">
            Search Hotels
          </h1>
          <p className="text-[#F5F5F0]/70 text-lg">
            Find the perfect accommodation with real-time availability
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Location - Country */}
            <div>
              <label className="flex items-center gap-2 text-sm text-[#F5F5F0]/70 mb-2">
                <MapPin size={16} />
                Country
              </label>
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedCity('');
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#F5F5F0] focus:border-[#D4AF7A]/50 focus:outline-none transition appearance-none cursor-pointer"
                >
                  <option value="">Select country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F5F5F0]/40 pointer-events-none" />
              </div>
              {loadingCountries && (
                <p className="text-xs text-[#F5F5F0]/40 mt-1">Loading countries...</p>
              )}
            </div>

            {/* Location - City */}
            <div>
              <label className="flex items-center gap-2 text-sm text-[#F5F5F0]/70 mb-2">
                <MapPin size={16} />
                City (optional)
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedCountry || loadingCities}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#F5F5F0] focus:border-[#D4AF7A]/50 focus:outline-none transition appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All cities</option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F5F5F0]/40 pointer-events-none" />
              </div>
              {loadingCities && (
                <p className="text-xs text-[#F5F5F0]/40 mt-1">Loading cities...</p>
              )}
              {availableHotels.length > 0 && (
                <p className="text-xs text-[#D4AF7A] mt-1">{availableHotels.length} hotels found</p>
              )}
            </div>

            {/* Placeholder for alignment */}
            <div></div>
          </div>

          {/* Selected Location Info */}
          {availableHotels.length > 0 && (
            <div className="mb-6 p-3 rounded-xl bg-[#D4AF7A]/10 border border-[#D4AF7A]/20">
              <p className="text-sm text-[#F5F5F0]/70">
                <span className="font-semibold text-[#D4AF7A]">{availableHotels.length}</span> hotel{availableHotels.length !== 1 ? 's' : ''} in {selectedLocationText} will be searched
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Check-in */}
            <div>
              <label className="flex items-center gap-2 text-sm text-[#F5F5F0]/70 mb-2">
                <Calendar size={16} />
                Check-in
              </label>
              <input
                type="date"
                value={searchParams.checkin}
                onChange={(e) => setSearchParams({ ...searchParams, checkin: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#F5F5F0] focus:border-[#D4AF7A]/50 focus:outline-none transition"
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="flex items-center gap-2 text-sm text-[#F5F5F0]/70 mb-2">
                <Calendar size={16} />
                Check-out
              </label>
              <input
                type="date"
                value={searchParams.checkout}
                onChange={(e) => setSearchParams({ ...searchParams, checkout: e.target.value })}
                min={searchParams.checkin}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#F5F5F0] focus:border-[#D4AF7A]/50 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Rooms */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-sm text-[#F5F5F0]/70">
                <Users size={16} />
                Rooms
              </label>
              <button
                onClick={addRoom}
                className="text-xs px-3 py-1 rounded-lg border border-[#D4AF7A]/30 text-[#D4AF7A] hover:bg-[#D4AF7A]/10 transition"
              >
                + Add Room
              </button>
            </div>
            <div className="space-y-3">
              {searchParams.rooms.map((room, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex-1">
                    <label className="text-xs text-[#F5F5F0]/50 mb-1 block">Adults</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={room.adt}
                      onChange={(e) => updateRoom(index, 'adt', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#F5F5F0] focus:border-[#D4AF7A]/50 focus:outline-none transition text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[#F5F5F0]/50 mb-1 block">Children</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={room.chd || 0}
                      onChange={(e) => updateRoom(index, 'chd', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#F5F5F0] focus:border-[#D4AF7A]/50 focus:outline-none transition text-sm"
                    />
                  </div>
                  {searchParams.rooms.length > 1 && (
                    <button
                      onClick={() => removeRoom(index)}
                      className="text-xs px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading || !searchParams.checkin || !searchParams.checkout || searchParams.hotels.length === 0 || loadingHotels}
            className="w-full md:w-auto px-8 py-4 rounded-xl font-semibold text-[#000000] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
            }}
          >
            {loading || loadingHotels ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {loadingHotels ? 'Loading hotels...' : 'Searching...'}
              </>
            ) : (
              <>
                <Search size={20} />
                Search Hotels {searchParams.hotels.length > 0 && `(${searchParams.hotels.length})`}
              </>
            )}
          </button>
          {/* Debug info in dev */}
          {import.meta.env.DEV && (
            <div className="mt-2 text-xs text-[#F5F5F0]/40">
              Debug: Hotels={searchParams.hotels.length}, Checkin={searchParams.checkin ? '✓' : '✗'}, Checkout={searchParams.checkout ? '✓' : '✗'}, Loading={loadingHotels ? 'yes' : 'no'}
            </div>
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

        {/* Results */}
        {hasSearched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {hotels.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-[#F5F5F0] mb-2">
                    Found {hotels.length} hotel{hotels.length !== 1 ? 's' : ''}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map((hotel, index) => (
                    <motion.button
                      key={hotel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleHotelClick(hotel)}
                      className="text-left rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-[#D4AF7A]/40 transition cursor-pointer"
                    >
                      <div className="h-48 bg-[#111] flex items-center justify-center">
                        {hotel.lat && hotel.lon ? (
                          <div className="text-xs text-[#F5F5F0]/30 text-center p-4">
                            <MapPin size={24} className="mx-auto mb-2 opacity-30" />
                            Location: {hotel.lat.toFixed(4)}, {hotel.lon.toFixed(4)}
                          </div>
                        ) : (
                          <div className="text-xs text-[#F5F5F0]/30">No image available</div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-[#F5F5F0] flex-1">{hotel.name}</h3>
                          {hotel.stars > 0 && (
                            <div className="flex items-center gap-1 ml-2">
                              <Star size={14} className="text-[#D4AF7A] fill-[#D4AF7A]" />
                              <span className="text-sm text-[#F5F5F0]/70">{hotel.stars}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#F5F5F0]/60 mb-3">
                          <MapPin size={14} />
                          <span>
                            {[hotel.city, hotel.country].filter(Boolean).join(', ') || 'Location not specified'}
                          </span>
                        </div>

                        {hotel.address && (
                          <p className="text-xs text-[#F5F5F0]/50 mb-3 line-clamp-2">{hotel.address}</p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <div>
                            {hotel.lowestPriceTotal && hotel.currency ? (
                              <>
                                <p className="text-2xl font-bold text-[#D4AF7A]">
                                  {hotel.currency} {hotel.lowestPriceTotal.toFixed(2)}
                                </p>
                                <p className="text-xs text-[#F5F5F0]/50">Total price</p>
                              </>
                            ) : (
                              <p className="text-sm text-[#F5F5F0]/50">Price on request</p>
                            )}
                          </div>
                          <div className="text-right">
                            {hotel.roomOffersCount !== undefined && (
                              <>
                                <p className="text-sm font-semibold text-[#F5F5F0]">{hotel.roomOffersCount}</p>
                                <p className="text-xs text-[#F5F5F0]/50">room{hotel.roomOffersCount !== 1 ? 's' : ''}</p>
                              </>
                            )}
                          </div>
                        </div>

                        {hotel.refundableAny && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <span className="text-xs px-2 py-1 rounded-full bg-[#D4AF7A]/20 text-[#D4AF7A]">
                              Refundable options available
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#F5F5F0]/70">No hotels found. Try adjusting your search criteria.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <ModernFooter onMembershipClick={onMembershipClick} />
    </div>
  );
}
