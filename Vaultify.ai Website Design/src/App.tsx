import './styles/globals.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { LoginModal } from './components/LoginModal';
import { MobileAppContainer } from './components/mobile/MobileAppContainer';
import { MembershipApplicationForm } from './components/MembershipApplicationForm';
import firebaseApp from './lib/firebase';

// Pages
import { Home } from './pages/Home';
import { PrivateDealFlow } from './pages/PrivateDealFlow';
import { PortfolioIntelligence } from './pages/PortfolioIntelligence';
import { WealthConcierge } from './pages/WealthConcierge';
import { NetworkAccess } from './pages/NetworkAccess';
import { About } from './pages/About';
import { Philosophy } from './pages/Philosophy';
import { Membership } from './pages/Membership';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Disclosures } from './pages/Disclosures';
import { Security } from './pages/Security';
import { WanderbedsSearch } from './pages/WanderbedsSearch';
import { WanderbedsHotelDetail } from './pages/WanderbedsHotelDetail';
import HotelsList from './pages/HotelsList';
import { HotelsListing } from './pages/HotelsListing';
import HotelsListDebug from './pages/HotelsListDebug';
import WanderbedsSearchDebug from './pages/WanderbedsSearchDebug';
import DebugCuratedHotels from './pages/DebugCuratedHotels';

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [functionsReady, setFunctionsReady] = useState(false);
  const [functionsError, setFunctionsError] = useState<string | null>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const openMembershipForm = () => {
    setShowMembershipForm(true);
    setShowLoginModal(false);
  };

  /**
   * Incident report (root cause + fix):
   * - Failing call: homepage readiness checks via non-callable wiring.
   * - Observed: callable threw functions/internal.
   * - Root cause: global fetch monkeypatch interfered with Firebase SDK internals,
   *   plus readiness check not consistently called as a callable in us-central1.
   * - Fix: remove fetch override and use httpsCallable(getFunctions(app,'us-central1'), 'healthPing') only.
   */
  useEffect(() => {
    const run = async () => {
      try {
        const functions = getFunctions(firebaseApp, 'us-central1');
        const ping = httpsCallable(functions, 'healthPing');
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('[fn]', { name: 'healthPing', region: 'us-central1' });
        }
        const res = await ping({ source: 'homepage' });
        setFunctionsReady(true);
        setFunctionsError(null);
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('[healthPing OK]', res.data);
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('[healthPing FAIL]', err?.code, err?.message);
        setFunctionsReady(false);
        setFunctionsError(err?.message || 'healthPing failed');
      }
    };
    run();
  }, []);

  return (
    <Router>
      {import.meta.env.DEV && !functionsReady && (
        <div
          className="fixed bottom-3 left-3 z-[100] text-[10px] text-[#F5F5F0]/70 px-2 py-1 rounded-lg"
          style={{ background: 'rgba(31, 31, 31, 0.75)', border: '1px solid rgba(212, 175, 122, 0.2)' }}
        >
          {functionsError ? `healthPing: ${functionsError}` : 'healthPing: pending'}
        </div>
      )}
      <AnimatePresence mode="wait">
        {isLoggedIn ? (
          // Mobile app view - Full screen web app
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mobile-app-view"
          >
            {/* Logout button - positioned absolutely in top-right */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleLogout}
              className="absolute top-4 right-4 z-[60] px-4 py-2 rounded-full text-xs backdrop-blur-xl"
              style={{
                background: 'rgba(31, 31, 31, 0.8)',
                border: '1px solid rgba(212, 175, 122, 0.2)',
                color: '#F5F5F0',
                top: 'max(env(safe-area-inset-top), 1rem)',
              }}
            >
              ← Marketing
            </motion.button>
            
            {/* Mobile app - full screen */}
            <MobileAppContainer />
          </motion.div>
        ) : (
          // Marketing pages with routing
          <motion.div
            key="marketing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<Home onLoginClick={() => setShowLoginModal(true)} onMembershipClick={openMembershipForm} />} />
              
              {/* Platform Routes */}
              <Route path="/platform/deal-flow" element={<PrivateDealFlow onMembershipClick={openMembershipForm} />} />
              <Route path="/platform/portfolio-intelligence" element={<PortfolioIntelligence onMembershipClick={openMembershipForm} />} />
              <Route path="/platform/wealth-concierge" element={<WealthConcierge onMembershipClick={openMembershipForm} />} />
              <Route path="/platform/network-access" element={<NetworkAccess onMembershipClick={openMembershipForm} />} />
              
              {/* Company Routes */}
              <Route path="/company/about" element={<About onMembershipClick={openMembershipForm} />} />
              <Route path="/company/philosophy" element={<Philosophy onMembershipClick={openMembershipForm} />} />
              <Route path="/company/membership" element={<Membership onMembershipClick={openMembershipForm} />} />
              <Route path="/company/contact" element={<Contact onMembershipClick={openMembershipForm} />} />
              
              {/* Legal Routes */}
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/disclosures" element={<Disclosures />} />
              <Route path="/legal/security" element={<Security />} />
              
              {/* Wanderbeds Search */}
              <Route path="/wanderbeds/search" element={<WanderbedsSearch onMembershipClick={openMembershipForm} />} />
              <Route path="/wanderbeds/hotel/:id" element={<WanderbedsHotelDetail />} />
              
              {/* Hotels Listing Page */}
              <Route path="/hotels" element={<HotelsListing />} />
              
              {/* Debug: Hotels List */}
              <Route path="/hotels-list" element={<HotelsList />} />
              
              {/* Debug: Hotels List Peek */}
              <Route path="/debug/hotels-list" element={<HotelsListDebug />} />
              
              {/* Debug: Wanderbeds Search */}
              <Route path="/debug/wanderbeds-search" element={<WanderbedsSearchDebug />} />
              
              {/* Debug: Curated Hotels */}
              <Route path="/debug/hotels-curated" element={<DebugCuratedHotels />} />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Login Modal */}
            <AnimatePresence>
              {showLoginModal && (
                <LoginModal 
                  onClose={() => setShowLoginModal(false)} 
                  onLogin={handleLogin}
                />
              )}
            </AnimatePresence>

            {/* Membership Application Form */}
            <AnimatePresence>
              {showMembershipForm && (
                <MembershipApplicationForm 
                  onClose={() => setShowMembershipForm(false)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </Router>
  );
}
