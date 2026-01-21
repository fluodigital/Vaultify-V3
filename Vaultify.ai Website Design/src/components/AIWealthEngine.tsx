import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function AIWealthEngine() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setParticles(newParticles);
  }, []);

  return (
    <section className="relative py-32 px-6 bg-[#0A0A0A] overflow-hidden">
      {/* Neural network visualization */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="particleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#CDAF68" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#CDAF68" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Connecting lines */}
          {particles.map((particle, i) => 
            particles.slice(i + 1, i + 4).map((target, j) => (
              <motion.line
                key={`line-${i}-${j}`}
                x1={`${particle.x}%`}
                y1={`${particle.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke="#CDAF68"
                strokeWidth="0.5"
                strokeOpacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.05,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  repeatDelay: 1
                }}
              />
            ))
          )}
          
          {/* Particles */}
          {particles.map((particle) => (
            <motion.circle
              key={particle.id}
              cx={`${particle.x}%`}
              cy={`${particle.y}%`}
              r="2"
              fill="url(#particleGlow)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0.8, 1],
                opacity: [0, 1, 0.6, 1]
              }}
              transition={{
                duration: 3,
                delay: particle.id * 0.05,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          ))}
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-[#CDAF68]/60 mb-6">
              AI Wealth Engine
            </p>
            <h2 className="text-4xl md:text-6xl text-[#E5E4E2] mb-8 leading-tight">
              Every decision,
              <br />
              <span className="text-[#CDAF68]">data-backed</span>
            </h2>
            <h3 className="text-3xl md:text-4xl text-[#E5E4E2] mb-8 leading-tight">
              Every move,
              <br />
              <span className="text-[#CDAF68]">orchestrated</span>
            </h3>
            
            <div className="space-y-6">
              <p className="text-lg text-[#E5E4E2]/70 leading-relaxed">
                Our proprietary AI analyzes global markets in real-time, 
                identifying opportunities invisible to conventional analysis.
              </p>
              <p className="text-lg text-[#E5E4E2]/70 leading-relaxed">
                Machine learning models trained on decades of wealth management 
                excellence, combined with quantum-speed processing to deliver 
                insights that matter.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative p-12 border border-[#CDAF68]/20 bg-[#0A0A0A]/60 backdrop-blur-sm">
              {/* Animated diagram */}
              <div className="space-y-12">
                <motion.div 
                  className="flex items-center gap-8"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 w-16 h-16 border border-[#CDAF68]/40 bg-[#CDAF68]/5 flex items-center justify-center">
                    <span className="text-[#CDAF68] text-xl">$</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-px bg-gradient-to-r from-[#CDAF68]/40 to-transparent"></div>
                  </div>
                  <div className="text-[#E5E4E2]/60 text-sm uppercase tracking-wider">Capital</div>
                </motion.div>

                <motion.div 
                  className="flex items-center gap-8"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 w-16 h-16 border border-[#CDAF68]/40 bg-[#CDAF68]/5 flex items-center justify-center">
                    <span className="text-[#CDAF68] text-xl">∞</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-px bg-gradient-to-r from-[#CDAF68]/40 to-transparent"></div>
                  </div>
                  <div className="text-[#E5E4E2]/60 text-sm uppercase tracking-wider">Intelligence</div>
                </motion.div>

                <motion.div 
                  className="flex items-center gap-8"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 w-16 h-16 border border-[#CDAF68] bg-[#CDAF68]/10 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[#CDAF68]/20 blur-lg"></div>
                    <span className="text-[#CDAF68] text-xl relative z-10">↑</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-px bg-gradient-to-r from-[#CDAF68] to-transparent"></div>
                  </div>
                  <div className="text-[#CDAF68] text-sm uppercase tracking-wider">Growth</div>
                </motion.div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#CDAF68]/40"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#CDAF68]/40"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#CDAF68]/40"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#CDAF68]/40"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
