import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';

interface PhilosophyProps {
  onMembershipClick: () => void;
}

export function Philosophy({ onMembershipClick }: PhilosophyProps) {
  return (
    <div className="bg-[#000000] min-h-screen">
      <ModernNavigation onLoginClick={() => {}} onMembershipClick={onMembershipClick} />
      
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
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
                Company
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl text-[#F5F5F0] mb-8 tracking-tight">
              Our Philosophy
            </h1>
            
            <p className="text-2xl text-[#F5F5F0]/80 mb-12 leading-relaxed">
              Luxury that listens. Intelligence that acts.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {[
            {
              title: 'Time is the Ultimate Luxury',
              content: 'You\'re worth millions, but you still waste 72 hours booking a private jet. That\'s broken. Vaultfy eliminates friction from luxury travel. What used to take weeks now happens instantly. No brokers. No phone calls. No waiting.'
            },
            {
              title: 'We Don\'t Aggregate. We Verify.',
              content: 'Most platforms scrape listings and pray they\'re accurate. We don\'t. Every aircraft, yacht, supercar, and hotel in our network is verified for availability and quality. Real-time verification. If Alfred shows it, it\'s real.'
            },
            {
              title: 'Transparent Pricing. Always.',
              content: 'No hidden fees. No markup games. No "call for pricing." You see the full cost upfront—fuel, crew, positioning, everything. What you see is what you pay. Simple. Honest. Transparent.'
            },
            {
              title: 'AI That Actually Works',
              content: 'Alfred isn\'t a chatbot reading FAQs. It\'s an AI concierge connected to verified supply networks, payment rails, and booking systems. Say "G650 to Dubai, Friday." Alfred handles the rest. Instantly.'
            },
            {
              title: 'Pay Your Way',
              content: 'Card. Wire. Stablecoins (USDC, USDT, EUROC, DAI). We built Vaultfy for the crypto economy. If you earned your wealth digitally, you shouldn\'t have to convert to fiat to enjoy it. Pay how you want.'
            },
            {
              title: 'Privacy Without Compromise',
              content: 'Your bookings, transactions, and travel details remain confidential. Bank-grade encryption. No data sharing. No tracking. We exist to serve our members—not sell their data.'
            },
            {
              title: 'Membership Means Something',
              content: 'Vaultfy isn\'t for everyone. Membership is by invitation only. We curate our community to ensure every member values time, demands excellence, and respects privacy. Quality over quantity. Always.'
            },
            {
              title: 'Infrastructure, Not Marketplace',
              content: 'We\'re not another booking site. We\'re infrastructure for the ultra-luxury economy. Verified supply networks. AI orchestration. Hybrid payment rails. Built for those who refuse to compromise.'
            }
          ].map((principle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="border-l-2 border-[#D4AF7A]/30 pl-8"
            >
              <h2 
                className="text-3xl mb-4"
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                {principle.title}
              </h2>
              <p className="text-lg text-[#F5F5F0]/70 leading-relaxed">
                {principle.content}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl text-[#F5F5F0] mb-6">
              Join a Community That Gets It
            </h2>
            <p className="text-lg text-[#F5F5F0]/60 mb-8">
              Vaultfy membership is by invitation only
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
