import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';
import { Users, Shield, Calendar, MessageCircle } from 'lucide-react';

interface NetworkAccessProps {
  onMembershipClick: () => void;
}

export function NetworkAccess({ onMembershipClick }: NetworkAccessProps) {
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
              Exclusive Membership
            </h1>
            
            <p className="text-xl text-[#F5F5F0]/70 leading-relaxed max-w-3xl mx-auto">
              Join a curated community of high-net-worth individuals, crypto entrepreneurs, 
              and luxury enthusiasts. Vaultfy membership is by invitation only.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Members Only',
                description: 'Every member goes through our verification process. Connect with fellow entrepreneurs, investors, and luxury enthusiasts who share your values and lifestyle.'
              },
              {
                icon: Calendar,
                title: 'Exclusive Events',
                description: 'Private dinners in Monaco, yacht parties in Ibiza, supercar rallies through the Alps. Curated experiences designed for meaningful connections and unforgettable moments.'
              },
              {
                icon: MessageCircle,
                title: 'Private Community',
                description: 'Secure, encrypted channels for sharing insights, recommendations, and experiences. Discuss the best jet routes, hidden luxury destinations, and insider travel tips.'
              },
              {
                icon: Users,
                title: 'Global Network',
                description: 'Members across New York, London, Dubai, Monaco, Singapore, and beyond. Wherever you travel, you\'re part of an elite community that understands luxury without compromise.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-lg border border-[#D4AF7A]/10 bg-[#D4AF7A]/5"
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

      {/* Who's a Good Fit */}
      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl text-[#F5F5F0] mb-6">Who\'s a Good Fit?</h2>
            <p className="text-lg text-[#F5F5F0]/60">
              Vaultfy is designed for those who value time, privacy, and excellence
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                title: 'Crypto Entrepreneurs',
                description: 'You built wealth in the digital economy and want luxury experiences that accept stablecoins without friction.'
              },
              {
                title: 'High-Net-Worth Individuals',
                description: 'You\'re tired of calling brokers, waiting 72 hours for quotes, and dealing with opaque pricing. You want instant access.'
              },
              {
                title: 'Frequent Travelers',
                description: 'You fly private regularly, charter yachts, and expect five-star everything. You need a single platform that handles it all.'
              },
              {
                title: 'Privacy-Conscious',
                description: 'You value discretion. Your transactions, bookings, and travel details remain confidential. No data sharing. No compromises.'
              }
            ].map((profile, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-lg border border-[#D4AF7A]/20 bg-[#D4AF7A]/5"
              >
                <h3 
                  className="text-xl mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {profile.title}
                </h3>
                <p className="text-[#F5F5F0]/70">{profile.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl text-[#F5F5F0] mb-6">
              Membership is By Invitation Only
            </h2>
            <p className="text-lg text-[#F5F5F0]/60 mb-8 max-w-2xl mx-auto">
              We carefully curate our community to ensure every member brings value to the network. 
              Apply today and our team will review your application within 48 hours.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full text-[#000000] uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
              }}
            >
              Request Invitation
            </motion.button>
          </motion.div>
        </div>
      </section>

      <VaultFooter />
    </div>
  );
}
