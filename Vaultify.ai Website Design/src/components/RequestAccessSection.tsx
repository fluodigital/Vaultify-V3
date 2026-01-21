import { motion } from 'motion/react';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { MembershipApplicationForm } from './MembershipApplicationForm';

export function RequestAccessSection() {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  return (
    <>
      <section id="access" className="py-32 px-6 bg-gradient-to-b from-[#1a1a2e]/20 to-[#0A0A0A]">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-[#CDAF68]/60 mb-6">
              Join the Future of Luxury
            </p>
            <h2 className="text-4xl md:text-6xl text-[#E5E4E2] leading-tight mb-8">
              Exclusive <span className="text-[#CDAF68]">Membership</span>
            </h2>
            <h3 className="text-2xl md:text-3xl text-[#E5E4E2]/60 mb-8">
              By Invitation. Always.
            </h3>
            <p className="text-xl text-[#E5E4E2]/70 max-w-3xl mx-auto leading-relaxed">
              Vaultfy is built for the discerning few. Apply to become one of our 
              founding members and experience Alfred AI — your private gateway to a 
              verified world of luxury.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-[#0A0A0A]/60 border border-[#CDAF68]/10 p-12 md:p-16 backdrop-blur-sm text-center">
              <motion.div
                className="mb-8"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(184,147,94,0.2), rgba(212,175,122,0.1))',
                  border: '1px solid rgba(212,175,122,0.3)',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#CDAF68]">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                
                <h3 className="text-2xl text-[#E5E4E2] mb-4">
                  Ready to Join?
                </h3>
                <p className="text-[#E5E4E2]/60 mb-8 max-w-md mx-auto">
                  Complete our comprehensive membership application to be considered for exclusive access to Vaultfy's luxury ecosystem.
                </p>
              </motion.div>

              <motion.button
                onClick={() => setShowApplicationForm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-6 rounded-none text-lg uppercase tracking-wider overflow-hidden relative group flex items-center justify-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                  color: '#0A0A0A',
                }}
              >
                <span className="relative z-10">Join the Waitlist</span>
                <ArrowRight className="relative z-10" size={20} />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </motion.button>

              <div className="text-center pt-6">
                <p className="text-[#E5E4E2]/40 text-sm leading-relaxed">
                  Our membership committee reviews all applications. 
                  <br />Response time: 48 hours or less.
                </p>
              </div>
            </div>

            {/* Additional info */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mt-12 space-y-6"
            >
              <div className="w-24 h-px bg-[#CDAF68]/30 mx-auto"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div>
                  <div className="text-3xl text-[#CDAF68] mb-2">5 min</div>
                  <div className="text-sm text-[#E5E4E2]/60">Application Time</div>
                </div>
                <div>
                  <div className="text-3xl text-[#CDAF68] mb-2">48 hrs</div>
                  <div className="text-sm text-[#E5E4E2]/60">Review Period</div>
                </div>
                <div>
                  <div className="text-3xl text-[#CDAF68] mb-2">100%</div>
                  <div className="text-sm text-[#E5E4E2]/60">Confidential</div>
                </div>
              </div>
              <p className="text-[#CDAF68] text-sm uppercase tracking-wider">
                Invitation Only · Always Exclusive
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {showApplicationForm && (
        <MembershipApplicationForm onClose={() => setShowApplicationForm(false)} />
      )}
    </>
  );
}
