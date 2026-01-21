import { motion } from 'motion/react';
import { ModernNavigation } from '../components/ModernNavigation';
import { VaultFooter } from '../components/VaultFooter';

interface AboutProps {
  onMembershipClick: () => void;
}

export function About({ onMembershipClick }: AboutProps) {
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
              About Vaultfy
            </h1>
            
            <div className="space-y-6 text-lg text-[#F5F5F0]/70 leading-relaxed">
              <p>
                Vaultfy is the exclusive club where AI meets ultra-luxury. We built the platform we wished existed—where 
                booking a G650 to Dubai or chartering a superyacht in Monaco is instant, not 72 hours of calls and emails.
              </p>

              <p>
                For too long, luxury travel has meant phone calls, opaque pricing, and waiting. You're worth millions, 
                yet you still call brokers, send wires, and hope everything works out. That's broken. We fixed it.
              </p>

              <p>
                Our platform combines verified supply networks, AI orchestration via Alfred, and hybrid payments (card, 
                wire, or stablecoins). No aggregators. No middlemen. Just instant access to the world's finest experiences 
                with transparent pricing and real-time verification.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-[#F5F5F0] mb-6">What We Do</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Private Aviation',
                description: 'Access 5,000+ verified aircraft worldwide. Book light jets, heavy jets, or ultra-long range—instantly.'
              },
              {
                title: 'Luxury Yachts',
                description: 'Charter superyachts from 50 to 300 feet across the Mediterranean, Caribbean, and beyond.'
              },
              {
                title: 'Supercars & Hotels',
                description: 'Ferrari, Lamborghini, Rolls-Royce. Five-star hotels and private villas with VIP treatment.'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-lg border border-[#D4AF7A]/10 text-center"
              >
                <h3 
                  className="text-2xl mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {value.title}
                </h3>
                <p className="text-[#F5F5F0]/60">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl text-[#F5F5F0] mb-8 text-center">Who We Serve</h2>
            
            <div className="space-y-6 text-lg text-[#F5F5F0]/70 leading-relaxed">
              <p>
                We serve high-net-worth individuals, crypto entrepreneurs, and frequent luxury travelers who value 
                their time above all else. You've built wealth in the digital economy. You expect technology that 
                matches your lifestyle—instant, transparent, and frictionless.
              </p>

              <p>
                Our members include crypto millionaires who want to pay with stablecoins, family office principals 
                who charter jets regularly, and entrepreneurs who demand excellence. If you're tired of calling 
                brokers and waiting 72 hours for quotes, Vaultfy is for you.
              </p>

              <p>
                Membership is by invitation only. We carefully curate our community to ensure every member brings 
                value. If you're ready to experience luxury without friction, apply today.
              </p>
            </div>
          </motion.div>
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
              Infrastructure for Ultra-Luxury
            </h2>
            <p className="text-lg text-[#F5F5F0]/60 mb-8 max-w-2xl mx-auto">
              Vaultfy isn't another marketplace—it's infrastructure for the ultra-luxury economy. 
              Verified supply. AI orchestration. Hybrid payments. No compromises.
            </p>
          </motion.div>
        </div>
      </section>

      <VaultFooter />
    </div>
  );
}
