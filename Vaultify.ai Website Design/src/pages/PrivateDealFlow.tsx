import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';
import { Plane, Zap, Shield, Clock } from 'lucide-react';

interface PrivateDealFlowProps {
  onMembershipClick: () => void;
}

export function PrivateDealFlow({ onMembershipClick }: PrivateDealFlowProps) {
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
              Private Aviation
            </h1>
            
            <p className="text-xl text-[#F5F5F0]/70 leading-relaxed max-w-3xl mx-auto">
              Access to 5,000+ verified private aircraft worldwide. Book jets from London to Monaco, 
              New York to Dubai, or anywhere in between—instantly with transparent pricing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant Availability',
                description: 'Alfred AI connects to real-time inventory across our verified aviation network. See what\'s available now—not what might be available after 12 phone calls.'
              },
              {
                icon: Shield,
                title: 'Verified Aircraft Only',
                description: 'Every aircraft in our network is pre-vetted for safety, certification, and quality. Real-time verification of availability and specifications—no surprises.'
              },
              {
                icon: Clock,
                title: 'Book Instantly',
                description: 'Tell Alfred where and when. Review your options with transparent pricing. Pay instantly with card, wire, or stablecoins. Your jet is confirmed.'
              },
              {
                icon: Plane,
                title: 'From Light Jets to Ultra-Long Range',
                description: 'Citation CJ3 for quick hops. G650ER for transoceanic luxury. Bombardier Global 7500 for the ultimate experience. Whatever you need, whenever you need it.'
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

      {/* Example Booking */}
      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl text-[#F5F5F0] mb-6">How It Works</h2>
            <p className="text-lg text-[#F5F5F0]/60">
              From request to confirmation instantly
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'You',
                content: '"G650 London → Dubai, Friday afternoon"',
                type: 'user'
              },
              {
                step: '02',
                title: 'Alfred',
                content: 'Found 3 available G650s. Presenting options with transparent pricing...',
                type: 'alfred'
              },
              {
                step: '03',
                title: 'You',
                content: 'Option 2. Pay with USDC',
                type: 'user'
              },
              {
                step: '04',
                title: 'Alfred',
                content: 'Confirmed. G650ER departing London Luton 2:30 PM Friday. Payment processed. Confirmation sent.',
                type: 'alfred'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: item.type === 'user' ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className={`flex ${item.type === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-lg p-6 rounded-lg ${
                    item.type === 'user' 
                      ? 'bg-[#F5F5F0]/5 border border-[#F5F5F0]/10' 
                      : 'bg-[#D4AF7A]/10 border border-[#D4AF7A]/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#F5F5F0]/40">{item.step}</span>
                    <span 
                      className="text-sm"
                      style={{ color: item.type === 'user' ? '#F5F5F0' : '#D4AF7A' }}
                    >
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[#F5F5F0]/80">{item.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Transparency */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl text-[#F5F5F0] mb-6">
              Transparent Pricing. Always.
            </h2>
            <p className="text-lg text-[#F5F5F0]/60 mb-8 max-w-2xl mx-auto">
              No hidden fees. No markup games. No surprises. See the full cost upfront—fuel, crew, positioning, everything. 
              What you see is what you pay.
            </p>
            <motion.button
              onClick={onMembershipClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full text-[#000000] uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
              }}
            >
              Join the Waitlist
            </motion.button>
          </motion.div>
        </div>
      </section>

      <VaultFooter />
    </div>
  );
}
