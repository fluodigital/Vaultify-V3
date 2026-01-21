import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { VaultfyLogo } from './VaultfyLogo';

export function LuxuryNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#CD AF68]/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#CDAF68]/20 blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <VaultfyLogo size={32} className="relative" />
              </div>
              <span className="text-[#E5E4E2] tracking-[0.2em] text-sm uppercase">Vaultfy</span>
            </a>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-12">
              <a href="#manifesto" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm uppercase tracking-wider">
                Philosophy
              </a>
              <a href="#experience" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm uppercase tracking-wider">
                Platform
              </a>
              <a href="#membership" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm uppercase tracking-wider">
                Membership
              </a>
              <a href="#contact" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm uppercase tracking-wider">
                Contact
              </a>
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <button className="relative group px-8 py-3 bg-transparent border border-[#CDAF68]/40 text-[#CDAF68] hover:border-[#CDAF68] transition-all duration-500 overflow-hidden">
                <span className="relative z-10 text-xs uppercase tracking-wider">Apply</span>
                <div className="absolute inset-0 bg-[#CDAF68]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-[#CDAF68]"
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
            <div className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl">
              <div className="flex flex-col items-center justify-center h-full gap-8">
                <motion.a
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  href="#manifesto"
                  className="text-[#E5E4E2] text-2xl uppercase tracking-wider hover:text-[#CDAF68] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Philosophy
                </motion.a>
                <motion.a
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  href="#experience"
                  className="text-[#E5E4E2] text-2xl uppercase tracking-wider hover:text-[#CDAF68] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Platform
                </motion.a>
                <motion.a
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  href="#membership"
                  className="text-[#E5E4E2] text-2xl uppercase tracking-wider hover:text-[#CDAF68] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Membership
                </motion.a>
                <motion.a
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  href="#contact"
                  className="text-[#E5E4E2] text-2xl uppercase tracking-wider hover:text-[#CDAF68] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </motion.a>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 px-12 py-4 bg-transparent border border-[#CDAF68] text-[#CDAF68] text-sm uppercase tracking-wider"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Apply for Access
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
