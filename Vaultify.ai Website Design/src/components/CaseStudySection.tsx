import { motion } from 'motion/react';
import { Clock, Phone, Mail, CreditCard, Zap } from 'lucide-react';

export function CaseStudySection() {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-[#0A0A0A] to-[#1a1a2e]/10">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[#CDAF68]/60 mb-6">
            The Problem with Traditional Luxury
          </p>
          <h2 className="text-4xl md:text-6xl text-[#E5E4E2] leading-tight mb-8">
            "The <span className="text-[#CDAF68]">£82K Booking</span>
            <br />
            That Took <span className="text-[#CDAF68]">72 Hours</span>"
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-stretch">
          {/* Left side - The Old Way */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="border border-red-900/20 bg-red-950/10 p-8 rounded-lg h-full">
              <h3 className="text-2xl text-[#E5E4E2] mb-6">The Old Way</h3>
              
              <div className="space-y-6">
                <p className="text-[#E5E4E2]/70 text-lg leading-relaxed">
                  You're worth £35M. You want a G650 to Dubai this Friday.
                </p>
                
                <div className="space-y-4 text-[#E5E4E2]/60">
                  <div className="flex items-center gap-4">
                    <Phone className="text-red-400 flex-shrink-0" size={20} />
                    <span>You call your broker</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Clock className="text-red-400 flex-shrink-0" size={20} />
                    <span>You wait 72 hours</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="text-red-400 flex-shrink-0" size={20} />
                    <span>Make 12 calls</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="text-red-400 flex-shrink-0" size={20} />
                    <span>Send 5 emails</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <CreditCard className="text-red-400 flex-shrink-0" size={20} />
                    <span>Wire £82,000 — hoping it all works out</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - The Vaultfy Way */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="border border-[#CDAF68]/20 bg-[#CDAF68]/5 p-8 rounded-lg h-full">
              <h3 className="text-2xl text-[#CDAF68] mb-6">The Vaultfy Way</h3>
              
              <div className="space-y-6">
                <div className="bg-[#0A0A0A]/60 p-4 rounded border-l-4 border-[#CDAF68]">
                  <p className="text-[#E5E4E2] font-mono">
                    "G650 London → Dubai, Friday."
                  </p>
                </div>
                
                <div className="space-y-4 text-[#E5E4E2]/90">
                  <div className="flex items-center gap-4">
                    <Zap className="text-[#CDAF68] flex-shrink-0" size={20} />
                    <span>AI verifies availability instantly</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Zap className="text-[#CDAF68] flex-shrink-0" size={20} />
                    <span>Presents 3 options with transparent pricing</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Zap className="text-[#CDAF68] flex-shrink-0" size={20} />
                    <span>Pay instantly via card or crypto</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Centered CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="bg-transparent border border-[#CDAF68]/40 text-[#CDAF68] hover:bg-[#CDAF68]/10 px-8 py-3 rounded-none transition-all duration-300 text-sm uppercase tracking-wider">
            Experience the Difference
          </button>
        </motion.div>
      </div>
    </section>
  );
}