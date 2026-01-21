import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { config } from '../../lib/config';

interface MapMarker {
  id: string;
  itemId: string;
  lat: number;
  lng: number;
  city: string;
  label?: string;
}

interface MapCardData {
  id: string;
  title: string;
  location: string;
  image?: string;
  priceLabel?: string;
  tag?: string;
  description?: string;
  details?: string;
  secondaryLabel?: string;
}

interface InteractiveMapProps {
  markers: MapMarker[];
  items: MapCardData[];
  onItemSelect?: (item: MapCardData) => void;
  onMarkerSelectionChange?: (isSelected: boolean) => void;
}

// Get Google Maps API key and Map ID from config
const GOOGLE_MAPS_API_KEY = config.googleMapsApiKey;
const GOOGLE_MAPS_MAP_ID = config.googleMapsMapId;

// Luxury dark map styles with visible country borders
const luxuryMapStyles = [
  // Base map - dark luxury
  { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  
  // Country borders - visible with champagne gold (thinner)
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#D4AF7A" }, { weight: 1 }],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry.fill",
    stylers: [{ visibility: "off" }],
  },
  
  // Province/State borders - visible with lighter gold (thinner)
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#8a7552" }, { weight: 0.8 }],
  },
  
  // Land mass / Continent borders - subtle champagne gold
  {
    featureType: "landscape.natural.landcover",
    elementType: "geometry.stroke",
    stylers: [{ color: "#D4AF7A" }, { weight: 1.2 }],
  },
  
  // Terrain land areas - continent distinction
  {
    featureType: "landscape.natural.terrain",
    elementType: "geometry.stroke",
    stylers: [{ color: "#B8935E" }, { weight: 1 }],
  },
  
  // Land areas - subtle distinction
  {
    featureType: "administrative.land_parcel",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2a2a2a" }],
  },
  
  // Localities with champagne gold
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#D4AF7A" }],
  },
  
  // POI
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1a1a1a" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b6b6b" }],
  },
  
  // Roads
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a1a1a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2a2a2a" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  
  // Highways with champagne gold
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2a2a2a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#3a3a3a" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#B8935E" }],
  },
  
  // Transit
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1a1a1a" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  
  // Water - dark with subtle distinction
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0d0d0d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515151" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0a0a0a" }],
  },
];

export function InteractiveMap({ markers, items, onItemSelect, onMarkerSelectionChange }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Notify parent when marker selection changes
  useEffect(() => {
    onMarkerSelectionChange?.(selectedMarker !== null);
  }, [selectedMarker, onMarkerSelectionChange]);

  // Load Google Maps script with proper async pattern
  useEffect(() => {
    // Check if API key is configured
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      console.error('🗺️ Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in your .env (or update /lib/config.ts defaults).');
      return;
    }

    if (window.google?.maps) {
      setScriptLoaded(true);
      return;
    }

    // Set up callback function for Google Maps
    (window as any).initMap = () => {
      setScriptLoaded(true);
    };

    // Listen for Google Maps errors
    (window as any).gm_authFailure = () => {
      setLoadError('referer');
      console.error('🚨 Google Maps RefererNotAllowedMapError - See FIX_NOW.md for quick fix');
    };

    // Load script with loading=async parameter
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker&loading=async&callback=initMap&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      setLoadError('general');
      console.error('Failed to load Google Maps. Please check your API key in /lib/config.ts');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup callback
      delete (window as any).initMap;
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || googleMapRef.current) return;

    const mapOptions: google.maps.MapOptions = {
      center: { lat: 20, lng: 0 }, // Center of world
      zoom: 2,
      styles: luxuryMapStyles,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      gestureHandling: 'greedy',
      backgroundColor: '#000000',
    };

    // Add Map ID if configured (required for Advanced Markers)
    if (GOOGLE_MAPS_MAP_ID && GOOGLE_MAPS_MAP_ID !== 'YOUR_GOOGLE_MAPS_MAP_ID') {
      mapOptions.mapId = GOOGLE_MAPS_MAP_ID;
    }

    const map = new google.maps.Map(mapRef.current, mapOptions);

    googleMapRef.current = map;
  }, [scriptLoaded]);

  // Add markers
  useEffect(() => {
    if (!scriptLoaded || !googleMapRef.current) return;

    // Check if we can use Advanced Markers (requires Map ID)
    const useAdvancedMarkers = GOOGLE_MAPS_MAP_ID && 
                               GOOGLE_MAPS_MAP_ID !== 'YOUR_GOOGLE_MAPS_MAP_ID' && 
                               window.google?.maps?.marker?.AdvancedMarkerElement;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    markers.forEach((markerData, index) => {
      // Create custom marker element with location pin icon
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-map-marker';
      markerElement.innerHTML = `
        <div class="marker-container" data-marker-id="${markerData.id}">
          <div class="marker-pin">
            <svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 40 14 40C14 40 28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="url(#pinGradient)"/>
              <circle cx="14" cy="14" r="5" fill="#000000"/>
              <defs>
                <linearGradient id="pinGradient" x1="14" y1="0" x2="14" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#E6D5B8"/>
                  <stop offset="50%" stop-color="#D4AF7A"/>
                  <stop offset="100%" stop-color="#B8935E"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      `;

      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .custom-map-marker {
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: bottom center;
        }
        
        .custom-map-marker:hover {
          transform: scale(1.2) translateY(-4px);
          z-index: 1000 !important;
          filter: drop-shadow(0 8px 16px rgba(212, 175, 122, 0.4));
        }
        
        .marker-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .marker-pin {
          position: relative;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
          transition: all 0.3s ease;
        }
        
        .marker-pin svg {
          display: block;
          width: 28px;
          height: 40px;
        }
        
        .custom-map-marker:hover .marker-pin {
          filter: drop-shadow(0 8px 16px rgba(212, 175, 122, 0.6));
        }
      `;
      document.head.appendChild(style);

      // Create marker (Advanced or Standard based on Map ID availability)
      let marker: any;
      
      if (useAdvancedMarkers) {
        // Use Advanced Markers with custom HTML
        marker = new google.maps.marker.AdvancedMarkerElement({
          map: googleMapRef.current,
          position: { lat: markerData.lat, lng: markerData.lng },
          content: markerElement,
          title: markerData.label || markerData.city,
        });
      } else {
        // Fallback to standard markers with location pin icon
        marker = new google.maps.Marker({
          map: googleMapRef.current,
          position: { lat: markerData.lat, lng: markerData.lng },
          title: markerData.label || markerData.city,
          icon: {
            path: 'M 12 2 C 8.13 2 5 5.13 5 9 c 0 5.25 7 13 7 13 s 7 -7.75 7 -13 c 0 -3.87 -3.13 -7 -7 -7 z m 0 9.5 c -1.38 0 -2.5 -1.12 -2.5 -2.5 s 1.12 -2.5 2.5 -2.5 s 2.5 1.12 2.5 2.5 s -1.12 2.5 -2.5 2.5 z',
            fillColor: '#D4AF7A',
            fillOpacity: 1,
            strokeColor: '#000000',
            strokeWeight: 1.5,
            scale: 1.8,
            anchor: new google.maps.Point(12, 22),
          },
        });
        
        // Add click listener for standard markers
        marker.addListener('click', () => {
          setSelectedMarker(markerData.id);
        });
        
        // Add hover effect for standard markers
        marker.addListener('mouseover', () => {
          setHoveredMarker(markerData.id);
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#B8935E',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          });
        });
        
        marker.addListener('mouseout', () => {
          setHoveredMarker(null);
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#D4AF7A',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          });
        });
      }

      // Add events only for Advanced Markers
      if (useAdvancedMarkers) {
        markerElement.addEventListener('click', () => {
          setSelectedMarker(markerData.id);
        });

        markerElement.addEventListener('mouseenter', () => {
          setHoveredMarker(markerData.id);
        });

        markerElement.addEventListener('mouseleave', () => {
          setHoveredMarker(null);
        });

        // Animate marker appearance
        setTimeout(() => {
          markerElement.style.animation = `markerBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        }, index * 100);
      }

      markersRef.current.push(marker);
    });

    // Add bounce animation
    const animStyle = document.createElement('style');
    animStyle.textContent = `
      @keyframes markerBounce {
        0% { transform: translateY(-100px) scale(0); opacity: 0; }
        50% { transform: translateY(10px) scale(1.1); }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(2); opacity: 0; }
      }
    `;
    document.head.appendChild(animStyle);

  }, [scriptLoaded, markers, items]);

  // Render hover card outside map
  const hoveredMarkerData = markers.find((marker) => marker.id === hoveredMarker);
  const hoveredItem = hoveredMarkerData ? items.find((entry) => entry.id === hoveredMarkerData.itemId) : null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
      {/* Google Map Container */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {/* Error State - Referer Not Allowed */}
      {loadError === 'referer' && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-black">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg"
          >
            <div 
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.2))',
                border: '2px solid rgba(239,68,68,0.4)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="text-xl text-[#F5F5F0] mb-3">Domain Not Authorized</h3>
            <p className="text-sm text-[#F5F5F0]/70 mb-6">
              Your Google Maps API key needs to authorize Figma Make's domain.
            </p>
            
            <div 
              className="p-4 rounded-lg mb-6 text-left"
              style={{
                background: 'rgba(212,175,122,0.1)',
                border: '1px solid rgba(212,175,122,0.3)',
              }}
            >
              <p className="text-xs text-[#D4AF7A] mb-2">Quick Fix (2 minutes):</p>
              <ol className="text-xs text-[#F5F5F0]/80 space-y-2">
                <li>1. Go to <span className="text-[#D4AF7A]">Google Cloud Console</span></li>
                <li>2. Click your API key</li>
                <li>3. Add <code className="px-1 py-0.5 rounded bg-black/30 text-[#D4AF7A]">*.figma.site/*</code></li>
                <li>4. Save and refresh this page</li>
              </ol>
            </div>

            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-full mb-3"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A)',
                color: '#000000',
                textDecoration: 'none',
              }}
            >
              Fix in Google Cloud Console →
            </a>

            <p className="text-xs text-[#F5F5F0]/50">
              See <span className="text-[#D4AF7A]">FIX_NOW.md</span> for detailed instructions
            </p>
          </motion.div>
        </div>
      )}

      {/* Loading State or Configuration Required */}
      {!scriptLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center max-w-md"
          >
            {GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' || !GOOGLE_MAPS_API_KEY ? (
              <>
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,175,122,0.2), rgba(184,147,94,0.2))',
                    border: '2px solid rgba(212,175,122,0.3)',
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4AF7A" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h3 className="text-lg text-[#F5F5F0] mb-2">Map Configuration Required</h3>
                <p className="text-sm text-[#F5F5F0]/60 mb-4">
                  To enable the interactive map view, set VITE_GOOGLE_MAPS_API_KEY (and optionally VITE_GOOGLE_MAPS_MAP_ID) in your .env or update defaults in /lib/config.ts.
                </p>
                <code 
                  className="inline-block px-4 py-2 rounded-lg text-xs mb-4"
                  style={{
                    background: 'rgba(212,175,122,0.1)',
                    border: '1px solid rgba(212,175,122,0.3)',
                    color: '#D4AF7A',
                  }}
                >
                  .env
                </code>
                <p className="text-xs text-[#F5F5F0]/40 mb-2">
                  See GOOGLE_MAPS_SETUP.md for detailed instructions
                </p>
                {(!GOOGLE_MAPS_MAP_ID || GOOGLE_MAPS_MAP_ID === 'YOUR_GOOGLE_MAPS_MAP_ID') && (
                  <p className="text-xs text-[#F5F5F0]/30 italic">
                    Note: Map will use standard markers until Map ID is configured
                  </p>
                )}
              </>
            ) : (
              <>
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full"
                  style={{
                    border: '3px solid rgba(212,175,122,0.2)',
                    borderTopColor: '#D4AF7A',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="text-sm text-[#D4AF7A]">Loading luxury map...</p>
                {(!GOOGLE_MAPS_MAP_ID || GOOGLE_MAPS_MAP_ID === 'YOUR_GOOGLE_MAPS_MAP_ID') && (
                  <p className="text-xs text-[#F5F5F0]/40 mt-2">
                    Using standard markers (Map ID not configured)
                  </p>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Hover Card Overlay */}
      <AnimatePresence>
        {hoveredMarker && hoveredItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 w-72 z-50 pointer-events-none"
          >
            <div
              className="rounded-xl overflow-hidden backdrop-blur-xl shadow-2xl"
              style={{
                background: 'rgba(0,0,0,0.95)',
                border: '1px solid rgba(212,175,122,0.4)',
              }}
            >
              <div className="relative h-32 overflow-hidden">
                {hoveredItem.image ? (
                  <ImageWithFallback
                    src={hoveredItem.image}
                    alt={hoveredItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#F5F5F0]/40 bg-[#111]">
                    No image
                  </div>
                )}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-xs text-[#D4AF7A] mb-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{hoveredItem.location || hoveredMarkerData?.city || '—'}</span>
                </div>
                <h4 className="text-sm text-[#F5F5F0] mb-2 leading-tight">{hoveredItem.title}</h4>
                <div className="flex items-center justify-between">
                  <p 
                    className="text-sm font-medium"
                    style={{
                      background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {hoveredItem.priceLabel || '—'}
                  </p>
                  <span className="text-xs text-[#F5F5F0]/50">{hoveredItem.secondaryLabel || '—'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls Overlay */}
      <div className="absolute top-6 right-6 z-40 flex flex-col gap-3">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => {
            if (googleMapRef.current) {
              const currentZoom = googleMapRef.current.getZoom() || 2;
              googleMapRef.current.setZoom(currentZoom + 1);
            }
          }}
          className="w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center"
          style={{
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(212,175,122,0.3)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF7A" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </motion.button>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => {
            if (googleMapRef.current) {
              const currentZoom = googleMapRef.current.getZoom() || 2;
              googleMapRef.current.setZoom(Math.max(currentZoom - 1, 1));
            }
          }}
          className="w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center"
          style={{
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(212,175,122,0.3)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF7A" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </motion.button>
      </div>

      {/* Selected Marker Preview Card - Mobile Friendly Bottom Sheet */}
      <AnimatePresence>
        {selectedMarker && (() => {
          const selectedMarkerData = markers.find((marker) => marker.id === selectedMarker);
          const selectedItem = selectedMarkerData ? items.find((entry) => entry.id === selectedMarkerData.itemId) : null;
          
          if (!selectedItem || !selectedMarkerData) return null;
          
          return (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-50"
            >
              <div
                className="mx-4 mb-4 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl"
                style={{
                  background: 'rgba(0,0,0,0.95)',
                  border: '1px solid rgba(212,175,122,0.4)',
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedMarker(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center z-10"
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(212,175,122,0.3)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5F5F0" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>

                <div className="relative h-48 overflow-hidden">
                  {selectedItem.image ? (
                    <ImageWithFallback
                      src={selectedItem.image}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-[#F5F5F0]/40 bg-[#111]">
                      No image
                    </div>
                  )}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
                    }}
                  />
                </div>
                
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-[#D4AF7A] mb-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{selectedItem.location || selectedMarkerData.city}</span>
                    {selectedItem.tag && (
                      <>
                        <span className="text-[#F5F5F0]/30">•</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider"
                          style={{
                            background: 'rgba(212,175,122,0.15)',
                            border: '1px solid rgba(212,175,122,0.3)',
                          }}
                        >
                          {selectedItem.tag}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <h3 className="text-lg text-[#F5F5F0] mb-2">{selectedItem.title}</h3>
                  
                  <p className="text-sm text-[#F5F5F0]/60 mb-3 line-clamp-2">
                    {selectedItem.description || '—'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p 
                        className="text-xl font-medium"
                        style={{
                          background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                        }}
                      >
                        {selectedItem.priceLabel || '—'}
                      </p>
                      <p className="text-xs text-[#F5F5F0]/50">{selectedItem.secondaryLabel || '—'}</p>
                    </div>
                    <div className="text-right text-xs text-[#F5F5F0]/60">
                      <p>{selectedItem.details || '—'}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      onItemSelect?.(selectedItem);
                      setSelectedMarker(null);
                    }}
                    className="w-full py-3 rounded-full transition-all flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                      color: '#000000',
                    }}
                  >
                    <span className="text-sm font-medium">View Details</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Map Legend - Only show when no marker selected */}
      {!selectedMarker && (
        <div className="absolute bottom-6 left-6 right-6 z-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl backdrop-blur-xl"
          style={{
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(212,175,122,0.3)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#F5F5F0]/60">
              Showing {markers.length} luxury stays worldwide
            </p>
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-2 h-2 rounded-full bg-[#D4AF7A]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-[#D4AF7A]">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#F5F5F0]/70">
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(212,175,122,0.6)" stroke="rgba(212,175,122,0.8)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              <span>Tap to preview</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,122,0.6)" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v4m0 6v4a2 2 0 0 1-2 2h-4m-6 0H5a2 2 0 0 1-2-2v-4m0-6V5a2 2 0 0 1 2-2h4"/>
              </svg>
              <span>View details</span>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </div>
  );
}
