import { motion } from 'motion/react';
import { TrendingUp, Zap, Shield, Clock } from 'lucide-react';

const stats = [
  { from: '72 hours', to: 'Instant', icon: Clock },
  { from: '15–30% hidden markup', to: '0% transparency gap', icon: TrendingUp },
  { from: '3–5 days settlement', to: 'Same day', icon: Zap },
  { from: 'Industry standard', to: 'Verified supply', icon: Shield }
];

export function DigitalWealthSection() {
  return (
    <section className="py-32 px-6 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[#CDAF68]/60 mb-6">
            The Future of Luxury Commerce
          </p>
          <h2 className="text-4xl md:text-6xl text-[#E5E4E2] leading-tight mb-8">
            Where <span className="text-[#CDAF68]">Digital Wealth</span>
            <br />
            Meets Physical Luxury
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-xl text-[#E5E4E2]/70 leading-relaxed">
              Vaultfy bridges the gap between new digital wealth and timeless luxury.
            </p>
            <p className="text-lg text-[#E5E4E2]/60">
              <span className="text-[#CDAF68]">10 million crypto millionaires</span> exist today — 
              but the luxury world still runs on slow wires and middlemen.
            </p>
            <p className="text-lg text-[#E5E4E2]/60">
              We make that world accessible: verified inventory, instant settlement, AI precision.
            </p>
            <p className="text-xl text-[#CDAF68] italic">
              From G650s to Pateks — the future of luxury runs on Vaultfy.
            </p>
          </motion.div>

          {/* Right side - Crypto visualization */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1584232992172-29cead8e5230?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG9jdXJyZW5jeSUyMGJpdGNvaW58ZW58MXx8fHwxNzYwOTQzNTA2fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Digital wealth meets luxury"
              className="w-full rounded-lg opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/20 rounded-lg"></div>
            <div className="absolute top-4 left-4 bg-[#CDAF68]/10 backdrop-blur-sm border border-[#CDAF68]/20 rounded px-3 py-1">
              <span className="text-[#CDAF68] text-sm">10M+ Crypto Millionaires</span>
            </div>
          </motion.div>
        </div>

        {/* Stats comparison */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h3 className="text-2xl text-[#CDAF68] text-center mb-12 uppercase tracking-wider">
            The Transformation
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="group relative p-6 border border-[#CDAF68]/10 bg-[#0A0A0A]/60 hover:border-[#CDAF68]/30 transition-all duration-500"
                >
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-[#CDAF68]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <Icon className="text-[#CDAF68]/60 mb-4" size={24} />
                    
                    {/* Before */}
                    <div className="mb-4">
                      <div className="text-red-400/60 text-sm mb-1 line-through">
                        {stat.from}
                      </div>
                      <div className="text-xs text-[#E5E4E2]/40 uppercase tracking-wider">
                        Traditional
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-px bg-[#CDAF68]/40"></div>
                      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] border-b-[#CDAF68]/40 rotate-90"></div>
                    </div>
                    
                    {/* After */}
                    <div>
                      <div className="text-[#CDAF68] text-sm mb-1 font-medium">
                        {stat.to}
                      </div>
                      <div className="text-xs text-[#E5E4E2]/60 uppercase tracking-wider">
                        Vaultfy
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}