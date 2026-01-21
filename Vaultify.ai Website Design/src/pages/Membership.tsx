import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';
import { Check } from 'lucide-react';

interface MembershipProps {
  onMembershipClick: () => void;
}

export function Membership({ onMembershipClick }: MembershipProps) {
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
                Company
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl text-[#F5F5F0] mb-6 tracking-tight">
              Membership
            </h1>
            
            <p className="text-xl text-[#F5F5F0]/70 leading-relaxed max-w-3xl mx-auto">
              Vaultfy membership is by invitation only. We curate our community carefully to ensure 
              every member brings value to the network.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="p-12 rounded-lg border border-[#D4AF7A]/20 bg-[#D4AF7A]/5"
          >
            <h2 className="text-3xl text-[#F5F5F0] mb-8 text-center">What's Included</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                'Access to exclusive deal flow and investment opportunities',
                'AI-powered portfolio intelligence and analytics',
                'Instant booking for private jets, yachts, and luxury experiences',
                'Priority access to Alfred, your personal AI concierge',
                'Verified network of high-net-worth individuals',
                'Exclusive events in major cities worldwide',
                'Private forums and knowledge sharing',
                'Stablecoin payment support (USDC, USDT, DAI)',
                'Dedicated relationship manager',
                'Preferred rates on all luxury bookings',
                '24/7 white-glove support',
                'Complete privacy and discretion'
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: '#D4AF7A' }} />
                  <span className="text-[#F5F5F0]/80">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl text-[#F5F5F0] mb-6">Application Process</h2>
            <p className="text-lg text-[#F5F5F0]/60 mb-12 max-w-2xl mx-auto">
              Our application process is designed to be simple yet thorough. We typically respond within 48 hours.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { step: '01', title: 'Apply', description: 'Submit your application with basic information about your background and interests' },
                { step: '02', title: 'Review', description: 'Our team reviews your application and may request additional information' },
                { step: '03', title: 'Welcome', description: 'Upon approval, you receive immediate access to the full Vaultfy platform' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
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
                  <h3 className="text-xl text-[#F5F5F0] mb-2">{item.title}</h3>
                  <p className="text-[#F5F5F0]/60 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full text-[#000000] uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
              }}
            >
              Start Application
            </motion.button>
          </motion.div>
        </div>
      </section>

      <VaultFooter />
    </div>
  );
}
