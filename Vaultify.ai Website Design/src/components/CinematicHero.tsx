import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

export function CinematicHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-[#CDAF68]/20 via-transparent to-[#1a1a2e]/40 animate-pulse" 
             style={{ animationDuration: '8s' }}></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `linear-gradient(rgba(205, 175, 104, 0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(205, 175, 104, 0.1) 1px, transparent 1px)`,
               backgroundSize: '100px 100px'
             }}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#CDAF68]/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{
              y: [null, -100, -200],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="space-y-8"
        >
          {/* Monogram */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#CDAF68]/20 blur-xl rounded-full"></div>
              <div className="relative text-5xl text-[#CDAF68] font-serif">V</div>
            </div>
          </div>

          <div className="space-y-4">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-sm uppercase tracking-[0.3em] text-[#CDAF68]/60"
            >
              For the Visionary Few
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-5xl md:text-7xl lg:text-8xl text-[#E5E4E2] tracking-tight leading-[1.1]"
            >
              Access the Future
              <br />
              <span className="text-[#CDAF68]">of Private Wealth</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-lg md:text-xl text-[#E5E4E2]/60 max-w-3xl mx-auto leading-relaxed"
            >
              Where AI curates opportunity for those who already have everything.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 1 }}
            className="pt-8"
          >
            <Button 
              className="relative group bg-transparent border border-[#CDAF68]/40 text-[#CDAF68] hover:bg-[#CDAF68]/10 px-12 py-7 rounded-none overflow-hidden transition-all duration-500"
            >
              <span className="relative z-10 text-base tracking-wider uppercase">Request Private Access</span>
              <div className="absolute inset-0 bg-[#CDAF68]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CDAF68]/10 to-transparent animate-shimmer"></div>
              </div>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#CDAF68]/40 to-transparent"></div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="text-[#CDAF68]/40" size={20} />
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </section>
  );
}
