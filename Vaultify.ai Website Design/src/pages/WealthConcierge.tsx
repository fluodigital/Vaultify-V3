import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';
import { Car, Hotel, Sparkles, Zap } from 'lucide-react';

interface WealthConciergeProps {
  onMembershipClick: () => void;
}

export function WealthConcierge({ onMembershipClick }: WealthConciergeProps) {
  return (
    <div className="bg-[#000000] min-h-screen">
      <ModernNavigation onLoginClick={() => {}} onMembershipClick={onMembershipClick} />
      
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6 px-4 py-2 rounded-full border border-[#D4AF7A]/20 bg-[#D4AF7A]/5">
              <span 
                className="text-sm uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Platform
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl text-[#F5F5F0] mb-6 tracking-tight">
              Supercars & Hotels
            </h1>
            
            <p className="text-xl text-[#F5F5F0]/70 leading-relaxed max-w-3xl mx-auto">
              Exotic automobiles and five-star accommodations at your fingertips. 
              Book a Lamborghini Huracán or the penthouse suite at The Ritz—all through Alfred.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Supercars */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="p-8 rounded-lg border border-[#D4AF7A]/10 bg-[#D4AF7A]/5"
            >
              <Car className="w-12 h-12 mb-4" style={{ color: '#D4AF7A' }} />
              <h2 className="text-3xl text-[#F5F5F0] mb-4">Exotic Automobiles</h2>
              <p className="text-[#F5F5F0]/70 mb-6 leading-relaxed">
                Ferrari SF90, Lamborghini Aventador SVJ, Rolls-Royce Cullinan, McLaren 720S. 
                Daily rentals or week-long arrangements in Monaco, Dubai, London, Los Angeles, and beyond.
              </p>
              
              <div className="space-y-3 text-[#F5F5F0]/60">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} style={{ color: '#D4AF7A' }} />
                  <span>Verified fleet across major cities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} style={{ color: '#D4AF7A' }} />
                  <span>White-glove delivery to your location</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} style={{ color: '#D4AF7A' }} />
                  <span>Insurance and concierge included</span>
                </div>
              </div>
            </motion.div>

            {/* Hotels */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="p-8 rounded-lg border border-[#D4AF7A]/10 bg-[#D4AF7A]/5"
            >
              <Hotel className="w-12 h-12 mb-4" style={{ color: '#D4AF7A' }} />
              <h2 className="text-3xl text-[#F5F5F0] mb-4">Five-Star Hotels & Villas</h2>
              <p className="text-[#F5F5F0]/70 mb-6 leading-relaxed">
                The Ritz Paris, Aman Tokyo, Burj Al Arab, One&Only Palmilla. Private villas in Bali, Tuscany, or the Maldives. 
                Preferred rates and guaranteed room upgrades for Vaultfy members.
              </p>
              
              <div className="space-y-3 text-[#F5F5F0]/60">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} style={{ color: '#D4AF7A' }} />
                  <span>Access to fully-booked properties</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} style={{ color: '#D4AF7A' }} />
                  <span>Suite upgrades and VIP treatment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} style={{ color: '#D4AF7A' }} />
                  <span>Late checkout and special amenities</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl text-[#F5F5F0] mb-6">Alfred Makes It Effortless</h2>
            <p className="text-lg text-[#F5F5F0]/60">
              No browsing dozens of sites. No calling multiple vendors. Just ask Alfred.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Request',
                description: '"Lamborghini Urus, Monaco, this weekend" or "Penthouse suite, Burj Al Arab, next month"'
              },
              {
                step: '02',
                title: 'Review',
                description: 'Alfred presents verified options with transparent pricing and availability'
              },
              {
                step: '03',
                title: 'Confirm',
                description: 'Pay instantly with card, wire, or crypto. Your booking is confirmed.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div 
                  className="text-5xl mb-4 opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl text-[#F5F5F0] mb-3">{item.title}</h3>
                <p className="text-[#F5F5F0]/60 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Zap className="w-12 h-12 mx-auto mb-6" style={{ color: '#D4AF7A' }} />
            <h2 className="text-3xl md:text-4xl text-[#F5F5F0] mb-6">
              Pay Your Way
            </h2>
            <p className="text-lg text-[#F5F5F0]/60 mb-8 max-w-2xl mx-auto">
              Card, wire transfer, or stablecoins (USDC, USDT, EUROC, DAI). 
              Instant payment processing with transparent fees. No surprises.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full text-[#000000] uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
              }}
            >
              Apply Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      <VaultFooter />
    </div>
  );
}
