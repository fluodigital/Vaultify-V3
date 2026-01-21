import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Youtube } from 'lucide-react';
import { VaultfyLogo } from './VaultfyLogo';

interface ModernFooterProps {
  onMembershipClick?: () => void;
}

const footerLinks = {
  Platform: [
    { name: 'Private Aviation', href: '/platform/deal-flow' },
    { name: 'Luxury Yachts', href: '/platform/portfolio-intelligence' },
    { name: 'Supercars & Hotels', href: '/platform/wealth-concierge' },
    { name: 'Membership', href: '/platform/network-access' }
  ],
  Company: [
    { name: 'About Vaultfy', href: '/company/about' },
    { name: 'Our Philosophy', href: '/company/philosophy' },
    { name: 'Membership', href: '/company/membership' },
    { name: 'Contact', href: '/company/contact' }
  ],
  Legal: [
    { name: 'Privacy Policy', href: '/legal/privacy' },
    { name: 'Terms of Service', href: '/legal/terms' },
    { name: 'Disclosures', href: '/legal/disclosures' },
    { name: 'Security', href: '/legal/security' }
  ]
};

export function ModernFooter({ onMembershipClick }: ModernFooterProps = {}) {
  return (
    <footer className="relative bg-[#0A0A0A] border-t border-[#CDAF68]/10">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Top section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#CDAF68]/20 blur-lg"></div>
                <VaultfyLogo size={40} className="relative" />
              </div>
              <div className="text-[#E5E4E2] space-y-1">
                <div className="tracking-[0.2em] text-lg uppercase leading-none">Vaultfy</div>
                <div className="text-[#CDAF68]/60 text-sm tracking-[0.3em] uppercase leading-none">AI</div>
              </div>
            </motion.div>
            
            <div className="space-y-4">
              <p className="text-[#CDAF68] text-lg tracking-[0.2em] uppercase">
                Luxury. Unlocked.
              </p>
              <p className="text-[#E5E4E2]/60 leading-relaxed max-w-md">
                Infrastructure for the Crypto Age. Where digital wealth meets physical luxury through AI-powered concierge services.
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {[
                { Icon: Linkedin, href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Youtube, href: '#' }
              ].map((social, index) => {
                const { Icon } = social;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 border border-[#CDAF68]/20 bg-[#CDAF68]/5 flex items-center justify-center hover:border-[#CDAF68]/40 hover:bg-[#CDAF68]/10 transition-all duration-300"
                  >
                    <Icon className="text-[#CDAF68]/70 hover:text-[#CDAF68]" size={18} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h4 className="text-[#CDAF68] text-sm uppercase tracking-wider mb-6">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-[#E5E4E2]/60 hover:text-[#CDAF68] transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-[#CDAF68]/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[#E5E4E2]/40 text-sm">
              © 2025 Vaultfy.ai Inc. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-[#E5E4E2]/40 text-sm">
              <span>Luxury that listens. Intelligence that acts.</span>
              <span className="text-[#CDAF68]/40">•</span>
              <span>Infrastructure for the Crypto Age</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-[#CDAF68]/20 to-transparent"></div>
    </footer>
  );
}