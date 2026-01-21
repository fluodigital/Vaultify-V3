import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { VaultfyLogo } from './VaultfyLogo';

export function VaultFooter() {
  return (
    <footer className="relative bg-[#0A0A0A] border-t border-[#CDAF68]/10">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Top section with monogram */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="inline-flex flex-col items-center gap-6"
          >
            {/* Glowing logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#CDAF68]/20 blur-2xl"></div>
              <VaultfyLogo size={80} className="relative" />
            </div>
            
            <div className="h-px w-24 bg-[#CDAF68]/30"></div>
            
            <p className="text-[#E5E4E2]/60 text-sm tracking-[0.3em] uppercase">
              Vaultfy
            </p>
            <p className="text-[#E5E4E2]/40 max-w-md">
              Luxury that listens. Intelligence that acts.
            </p>
          </motion.div>
        </div>

        {/* Links */}
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-4">
            <h4 className="text-[#CDAF68] text-sm uppercase tracking-wider mb-6">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/platform/deal-flow" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  Private Aviation
                </Link>
              </li>
              <li>
                <Link to="/platform/portfolio-intelligence" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  Luxury Yachts
                </Link>
              </li>
              <li>
                <Link to="/platform/wealth-concierge" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  Supercars & Hotels
                </Link>
              </li>
              <li>
                <Link to="/platform/network-access" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  Membership
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[#CDAF68] text-sm uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/company/about" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  About Vaultfy
                </Link>
              </li>
              <li>
                <Link to="/company/philosophy" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link to="/company/membership" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  Membership
                </Link>
              </li>
              <li>
                <Link to="/company/contact" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[#CDAF68] text-sm uppercase tracking-wider mb-6">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/legal/privacy" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/disclosures" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  Disclosures
                </Link>
              </li>
              <li>
                <Link to="/legal/security" className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#CDAF68]/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#E5E4E2]/40 text-xs">
              © 2025 Vaultfy Inc. All rights reserved.
            </p>
            
            <div className="flex items-center gap-8">
              <a href="#" className="text-[#E5E4E2]/40 hover:text-[#CDAF68] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-[#E5E4E2]/40 hover:text-[#CDAF68] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle glow at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#CDAF68]/20 to-transparent"></div>
    </footer>
  );
}
