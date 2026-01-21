import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export function VelocityHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#CDAF68]/10 via-[#0A0A0A] to-[#1a1a2e]/30"></div>
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(205, 175, 104, 0.03) 1px, transparent 0)`,
          backgroundSize: '60px 60px',
          opacity: 0.4
        }}></div>
      </div>

      {/* Speed lines animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#CDAF68]/20 to-transparent"
            style={{ 
              top: `${20 + (i * 8)}%`,
              width: `${200 + Math.random() * 400}px`
            }}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ 
              x: '150vw',
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="space-y-8"
        >
          {/* Brand tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-2"
          >
            <p className="text-sm uppercase tracking-[0.4em] text-[#CDAF68]/80">
              Where Luxury Meets Velocity
            </p>
            <p className="text-lg text-[#CDAF68] tracking-[0.2em] uppercase">
              Luxury. Unlocked.
            </p>
          </motion.div>
          
          {/* Main headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-5xl md:text-7xl lg:text-8xl text-[#E5E4E2] tracking-tight leading-[1.1] mb-8"
          >
            The Concierge
            <br />
            for the <span className="text-[#CDAF68]">Digital Age</span>
          </motion.h1>
          
          {/* Subtext */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <p className="text-xl md:text-2xl text-[#E5E4E2]/70 leading-relaxed">
              Vaultfy.ai is redefining luxury access for the new generation of wealth — 
              where you can book private jets, supercars, villas, yachts, and five-star hotels 
              <span className="text-[#CDAF68]"> in under two minutes</span>
            </p>
            <p className="text-lg md:text-xl text-[#E5E4E2]/60">
              using card, wire, or crypto.
            </p>
          </motion.div>

          {/* Value props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-8 text-[#E5E4E2]/60 text-sm mb-12"
          >
            <span>No brokers</span>
            <span className="text-[#CDAF68]/40">•</span>
            <span>No phone calls</span>
            <span className="text-[#CDAF68]/40">•</span>
            <span>No waiting</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="text-lg text-[#E5E4E2]/60 mb-12"
          >
            Just instant, verified luxury — powered by AI.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="space-y-4"
          >
            <Button 
              className="group relative bg-[#CDAF68] text-[#0A0A0A] hover:bg-[#CDAF68]/90 px-10 py-6 text-lg rounded-none overflow-hidden transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-3 font-medium">
                Request Invitation
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            </Button>
            
            <p className="text-sm text-[#E5E4E2]/40 italic">
              By Invitation. Always.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-12 border border-[#CDAF68]/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [4, 16, 4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-[#CDAF68]/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}