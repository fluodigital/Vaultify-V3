import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { VaultfyLogo } from './VaultfyLogo';
import { useNavigate, useLocation } from 'react-router-dom';

interface ModernNavigationProps {
  onLoginClick: () => void;
  onMembershipClick: () => void;
}

export function ModernNavigation({ onLoginClick, onMembershipClick }: ModernNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (hash: string) => {
    setIsMenuOpen(false);
    
    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.querySelector(hash);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      // Already on home page, just scroll
      const element = document.querySelector(hash);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-[#2D2D2D]/95 backdrop-blur-xl border-b border-[#D4AF7A]/10' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.button 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#D4AF7A]/20 blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <VaultfyLogo size={32} className="relative" />
              </div>
              <div className="text-[#F5F5F0] space-y-0">
                <div className="tracking-[0.2em] text-lg uppercase leading-none">Vaultfy</div>
              </div>
            </motion.button>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-10">
              <button 
                onClick={() => handleNavClick('#about')}
                className="text-[#F5F5F0]/70 hover:text-[#D4AF7A] transition-colors text-sm uppercase tracking-wider"
              >
                Platform
              </button>
              <button 
                onClick={() => handleNavClick('#alfred')}
                className="text-[#F5F5F0]/70 hover:text-[#D4AF7A] transition-colors text-sm uppercase tracking-wider"
              >
                Alfred AI
              </button>
              <button 
                onClick={() => handleNavClick('#membership')}
                className="text-[#F5F5F0]/70 hover:text-[#D4AF7A] transition-colors text-sm uppercase tracking-wider"
              >
                Membership
              </button>
              <button 
                onClick={() => handleNavClick('#access')}
                className="text-[#F5F5F0]/70 hover:text-[#D4AF7A] transition-colors text-sm uppercase tracking-wider"
              >
                Access
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <motion.button 
                onClick={onLoginClick}
                className="relative group px-6 py-3 bg-transparent overflow-hidden transition-all duration-300"
                style={{
                  border: '1px solid rgba(212,175,122,0.4)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span 
                  className="relative z-10 text-xs uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  Log In
                </span>
                <div 
                  className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  style={{ background: 'rgba(212,175,122,0.1)' }}
                ></div>
              </motion.button>

              <motion.button 
                onClick={onMembershipClick}
                className="relative group px-6 py-3 overflow-hidden transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 text-xs uppercase tracking-wider text-[#2D2D2D]">
                  Join the Waitlist
                </span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-[#D4AF7A] p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-[#2D2D2D]/95 backdrop-blur-xl">
              <div className="flex flex-col items-center justify-center h-full gap-8">
                {[
                  { href: '#about', label: 'Platform' },
                  { href: '#alfred', label: 'Alfred AI' },
                  { href: '#membership', label: 'Membership' },
                  { href: '#access', label: 'Access' }
                ].map((item, index) => (
                  <motion.button
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleNavClick(item.href)}
                    className="text-[#F5F5F0] text-2xl uppercase tracking-wider hover:text-[#D4AF7A] transition-colors"
                  >
                    {item.label}
                  </motion.button>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex flex-col gap-3"
                >
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLoginClick();
                    }}
                    className="px-8 py-3 text-[#F5F5F0] text-sm uppercase tracking-wider border border-[#D4AF7A]/40"
                  >
                    Log In
                  </button>
                  
                  <button
                    className="px-8 py-4 text-[#2D2D2D] text-sm uppercase tracking-wider"
                    style={{
                      background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
                    }}
                    onClick={() => {
                      setIsMenuOpen(false);
                      onMembershipClick();
                    }}
                  >
                    Join the Waitlist
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}