import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';
import { Anchor, MapPin, Waves, Sun } from 'lucide-react';

interface PortfolioIntelligenceProps {
  onMembershipClick: () => void;
}

export function PortfolioIntelligence({ onMembershipClick }: PortfolioIntelligenceProps) {
  return (
    <div className="bg-[#000000] min-h-screen">
      <ModernNavigation onLoginClick={() => {}} onMembershipClick={onMembershipClick} />
      
      {/* Hero Section */}
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
              Luxury Yachts
            </h1>
            
            <p className="text-xl text-[#F5F5F0]/70 leading-relaxed max-w-3xl mx-auto">
              Charter superyachts from 50 to 300 feet across the Mediterranean, Caribbean, and beyond. 
              Fully crewed, verified vessels with transparent pricing—booked in minutes via Alfred.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Anchor,
                title: 'Superyacht Fleet',
                description: 'Access to verified yachts from 50 to 300 feet. Motor yachts, sailing yachts, and expedition vessels. Each vetted for safety, luxury, and crew excellence.'
              },
              {
                icon: MapPin,
                title: 'Global Destinations',
                description: 'Mediterranean summer season, Caribbean winter getaways, Southeast Asia explorations, or Pacific island hopping. Your yacht, your itinerary.'
              },
              {
                icon: Waves,
                title: 'Fully Crewed Experience',
                description: 'Professional captain and crew included. Private chef for gourmet dining. Water toys, tenders, and equipment onboard. Everything handled for you.'
              },
              {
                icon: Sun,
                title: 'Book Instantly',
                description: 'Tell Alfred your dates and destination. Review available yachts with full specs and transparent pricing. Confirm and pay instantly with card, wire, or crypto.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-lg border border-[#D4AF7A]/10 bg-[#D4AF7A]/5 backdrop-blur-sm"
              >
                <feature.icon 
                  className="w-12 h-12 mb-4"
                  style={{ color: '#D4AF7A' }}
                />
                <h3 className="text-2xl text-[#F5F5F0] mb-3">{feature.title}</h3>
                <p className="text-[#F5F5F0]/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-[#F5F5F0] mb-6">Popular Destinations</h2>
            <p className="text-xl text-[#F5F5F0]/60 max-w-2xl mx-auto">
              Where luxury meets the sea
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                region: 'French Riviera',
                spots: ['Monaco', 'Cannes', 'Saint-Tropez', 'Antibes']
              },
              {
                region: 'Caribbean',
                spots: ['St. Barts', 'Anguilla', 'BVI', 'St. Martin']
              },
              {
                region: 'Greek Islands',
                spots: ['Mykonos', 'Santorini', 'Paros', 'Crete']
              }
            ].map((destination, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-lg border border-[#D4AF7A]/10"
              >
                <h3 
                  className="text-xl mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {destination.region}
                </h3>
                <ul className="space-y-2">
                  {destination.spots.map((spot, i) => (
                    <li key={i} className="text-[#F5F5F0]/60 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF7A]" />
                      {spot}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Booking */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl text-[#F5F5F0] mb-4">It\'s This Simple</h2>
            <p className="text-[#F5F5F0]/60">
              "120ft motor yacht, Monaco to Portofino, next week"
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="p-8 rounded-lg border border-[#D4AF7A]/20 bg-[#D4AF7A]/5"
          >
            <p className="text-[#F5F5F0]/80 leading-relaxed">
              Alfred searches the verified fleet, presents 3 options with full specifications, pricing, and crew details. 
              You choose, confirm, and pay. Your yacht is ready—concierge contacts you within the hour to finalize your itinerary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl text-[#F5F5F0] mb-6">
              Ready to Set Sail?
            </h2>
            <p className="text-lg text-[#F5F5F0]/60 mb-8">
              Join Vaultfy and access the world\'s finest yachts
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full text-[#000000] uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
              }}
            >
              Request Access
            </motion.button>
          </motion.div>
        </div>
      </section>

      <VaultFooter />
    </div>
  );
}
