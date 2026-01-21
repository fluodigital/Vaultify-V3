import { motion } from 'motion/react';
import { Button } from './ui/button';

export function MembershipSection() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-[#1a1a2e]/20 to-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#CDAF68]/60 mb-6">
                Membership
              </p>
              <h2 className="text-5xl md:text-7xl text-[#E5E4E2] mb-6 leading-tight">
                Not for
                <br />
                <span className="text-[#CDAF68]">Everyone</span>
              </h2>
            </div>

            <div className="space-y-6 text-lg text-[#E5E4E2]/70 leading-relaxed">
              <p>
                Vaultfy accepts a limited cohort each quarter. Applications 
                undergo multi-layer evaluation ensuring alignment with our ethos 
                of responsible power.
              </p>
              <p>
                We seek visionaries who understand that true wealth isn't merely 
                accumulated—it's orchestrated, protected, and multiplied through 
                intelligence.
              </p>
              <p>
                Membership begins at an annual commitment reflecting the 
                extraordinary value and discretion we provide.
              </p>
            </div>

            <div className="pt-8">
              <Button className="relative group bg-[#CDAF68] text-[#0A0A0A] hover:bg-[#CDAF68]/90 px-12 py-7 rounded-none overflow-hidden transition-all duration-500">
                <span className="relative z-10 text-base tracking-wider uppercase">Apply for Access</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Button>
              
              <p className="mt-6 text-sm text-[#E5E4E2]/40">
                Invitation-only. Discretion guaranteed.
              </p>
            </div>
          </motion.div>

          {/* Right side - Silhouette/Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              {/* Minimalist portrait silhouette effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e]/50 to-[#0A0A0A]">
                <img 
                  src="https://images.unsplash.com/photo-1545401792-fc780684d94b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwbHV4dXJ5JTIwc3BhY2V8ZW58MXx8fHwxNzYwOTk4MTE1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Exclusive membership"
                  className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
                />
              </div>

              {/* Geometric overlays */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#CDAF68]/40"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#CDAF68]/40"></div>
              </div>

              {/* Centered monogram */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-[#CDAF68]/10 blur-3xl"></div>
                  <div className="relative text-9xl text-[#CDAF68]/30 font-serif">V</div>
                </motion.div>
              </div>

              {/* Scan line effect */}
              <motion.div
                className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#CDAF68]/40 to-transparent"
                animate={{
                  top: ['0%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </div>

            {/* Stats overlay */}
            <div className="absolute -bottom-8 -left-8 bg-[#0A0A0A]/90 backdrop-blur-sm border border-[#CDAF68]/20 p-8">
              <div className="text-4xl text-[#CDAF68] mb-2">0.1%</div>
              <div className="text-sm text-[#E5E4E2]/60 uppercase tracking-wider">Acceptance Rate</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
