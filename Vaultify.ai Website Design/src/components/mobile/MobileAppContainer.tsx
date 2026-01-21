import { useState } from 'react';
import { Home, MessageSquare, Calendar, User, Plane, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from './Dashboard';
import { AlfredChat } from './AlfredChat';
import { AlfredConversations } from './AlfredConversations';
import { MyBookings } from './MyBookings';
import { ProfileScreen } from './ProfileScreen';
import { SplashScreen } from './SplashScreen';
import { JetsScreen } from './JetsScreen';
import { HotelsScreen } from './HotelsScreen';
import { HotelDetails } from './HotelDetails';

type Screen =
  | 'home'
  | 'jets'
  | 'hotels'
  | 'hotel-detail'
  | 'alfred'
  | 'alfred-chat'
  | 'bookings'
  | 'profile';

export function MobileAppContainer() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [showAlfredFab, setShowAlfredFab] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [hotelDetailReturn, setHotelDetailReturn] = useState<Screen>('home');
  const [activeConversationId, setActiveConversationId] = useState<string>('new');
  const [isMapMarkerSelected, setIsMapMarkerSelected] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleHotelSelect = (hotel: any, returnScreen: Screen) => {
    setSelectedHotel(hotel);
    setHotelDetailReturn(returnScreen);
    setActiveScreen('hotel-detail');
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setActiveScreen('alfred-chat');
  };

  const handleNewConversation = () => {
    setActiveConversationId('new');
    setActiveScreen('alfred-chat');
  };

  const handleBackToConversations = () => {
    setActiveScreen('alfred');
  };

  const navItems = [
    { id: 'home' as Screen, icon: Home, label: 'Home' },
    { id: 'jets' as Screen, icon: Plane, label: 'Jets' },
    { id: 'hotels' as Screen, icon: Building2, label: 'Hotels' },
    { id: 'alfred' as Screen, icon: MessageSquare, label: 'Alfred' },
    { id: 'bookings' as Screen, icon: Calendar, label: 'Bookings' },
    { id: 'profile' as Screen, icon: User, label: 'Profile' },
  ];

  return (
    <div 
      className="relative w-full bg-[#1F1F1F] overflow-hidden"
      style={{
        height: '100dvh', // Dynamic viewport height for mobile
        maxHeight: '-webkit-fill-available', // Safari fix
      }}
    >
      {/* Splash screen - unveils directly to dashboard */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      {/* Screen content - now uses safe-area-inset for notch support */}
      <div 
        className="h-full overflow-hidden"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: activeScreen !== 'experience-detail' ? 'calc(4rem + env(safe-area-inset-bottom))' : '0',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeScreen === 'home' && (
              <Dashboard 
                onOpenAlfred={handleNewConversation}
                onHotelSelect={(hotel) => handleHotelSelect(hotel, 'home')}
                showMapToggle={true}
                onMapMarkerSelectionChange={setIsMapMarkerSelected}
              />
            )}
            {activeScreen === 'jets' && <JetsScreen />}
            {activeScreen === 'hotels' && (
              <HotelsScreen onSelectHotel={(hotel) => handleHotelSelect(hotel, 'hotels')} />
            )}
            {activeScreen === 'alfred' && (
              <AlfredConversations 
                onConversationSelect={handleConversationSelect}
                onNewConversation={handleNewConversation}
              />
            )}
            {activeScreen === 'alfred-chat' && (
              <AlfredChat 
                conversationId={activeConversationId}
                bookingContext={null}
                onBack={handleBackToConversations}
              />
            )}
            {activeScreen === 'bookings' && <MyBookings />}
            {activeScreen === 'profile' && <ProfileScreen />}
            {activeScreen === 'hotel-detail' && selectedHotel && (
              <HotelDetails
                hotelId={selectedHotel.hotelid}
                onBack={() => setActiveScreen(hotelDetailReturn)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Alfred FAB (when not on Alfred screens or detail screen) */}
      {activeScreen !== 'alfred' && activeScreen !== 'alfred-chat' && activeScreen !== 'experience-detail' && showAlfredFab && !isMapMarkerSelected && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-6 z-40"
          style={{
            bottom: 'calc(5rem + env(safe-area-inset-bottom))',
          }}
          onClick={handleNewConversation}
          whileTap={{ scale: 0.9 }}
        >
          <div className="relative">
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                opacity: 0.3,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Main button */}
            <div
              className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              }}
            >
              <MessageSquare className="text-[#1F1F1F]" size={24} />
            </div>
          </div>
        </motion.button>
      )}

      {/* Bottom Navigation - hide on detail screen */}
      {activeScreen !== 'experience-detail' && (
        <div 
          className="absolute bottom-0 left-0 right-0 bg-[#1F1F1F]/95 backdrop-blur-xl border-t border-[#D4AF7A]/10 z-50"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
            paddingTop: '1rem',
          }}
        >
        <div className="flex items-center justify-around px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className="flex flex-col items-center gap-1 relative"
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    }}
                  />
                )}
                
                <Icon
                  size={22}
                  style={{
                    color: isActive ? '#D4AF7A' : '#F5F5F0',
                    opacity: isActive ? 1 : 0.5,
                  }}
                />
                <span
                  className="text-[10px]"
                  style={{
                    color: isActive ? '#D4AF7A' : '#F5F5F0',
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
