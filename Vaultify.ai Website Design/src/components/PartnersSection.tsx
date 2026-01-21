import { motion } from 'motion/react';

export function PartnersSection() {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-[#2D2D2D] to-[#3A3A3A]/10">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF7A]/60 mb-6">
            Trust & Recognition
          </p>
          <h2 className="text-4xl md:text-6xl text-[#F5F5F0] leading-tight mb-8">
            Trusted By <span className="text-[#D4AF7A]">Industry Leaders</span>
          </h2>
          <p className="text-xl text-[#F5F5F0]/70 max-w-3xl mx-auto">
            Vaultfy partners directly with elite providers across luxury travel and hospitality.
          </p>
        </motion.div>

        {/* Partnership tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-[#D4AF7A] text-lg uppercase tracking-wider text-center mb-8">
            Verified Network
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Private Aviation', 'Luxury Transport', 'Premium Hotels', 'Exclusive Villas'].map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative p-6 border border-[#D4AF7A]/10 bg-[#2D2D2D]/30 hover:border-[#D4AF7A]/30 hover:bg-[#D4AF7A]/5 transition-all duration-500 text-center"
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-[#D4AF7A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <span className="text-[#F5F5F0]/80 group-hover:text-[#F5F5F0] text-sm tracking-wide transition-colors duration-300">
                    {category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Closing statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xl text-[#F5F5F0]/70 italic max-w-2xl mx-auto">
            From private jets to private clubs — 
            <span className="text-[#D4AF7A]"> Vaultfy is the new definition of access</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}