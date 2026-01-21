import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const manifestoWords = [
  { word: 'Discretion', description: 'Privacy is paramount. Your wealth, your terms.' },
  { word: 'Precision', description: 'Every decision backed by intelligence.' },
  { word: 'Performance', description: 'Consistent growth, exceptional returns.' },
  { word: 'Legacy', description: 'Building generational prosperity.' }
];

export function ManifestoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  return (
    <section ref={containerRef} className="relative py-32 px-6 bg-[#0A0A0A] overflow-hidden">
      {/* Background morphing gradient */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{
          background: useTransform(
            scrollYProgress,
            [0, 0.5, 1],
            [
              'radial-gradient(circle at 20% 50%, #CDAF68 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, #1a1a2e 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, #CDAF68 0%, transparent 50%)'
            ]
          )
        }}
      />

      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[#CDAF68]/60 mb-6">
            Intelligence is the New Luxury
          </p>
          <h2 className="text-3xl md:text-5xl text-[#E5E4E2]/90 max-w-4xl mx-auto leading-relaxed">
            Vaultfy blends generative intelligence with private markets, 
            guiding the next era of asset growth and preservation.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {manifestoWords.map((item, index) => (
            <motion.div
              key={item.word}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="relative p-8 border border-[#CDAF68]/10 bg-[#0A0A0A]/80 backdrop-blur-sm hover:border-[#CDAF68]/30 transition-all duration-500">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-[#CDAF68]/5 blur-xl"></div>
                </div>
                
                <div className="relative">
                  <div className="text-6xl md:text-7xl text-[#CDAF68]/20 mb-4 font-serif">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                  <h3 className="text-3xl md:text-4xl text-[#E5E4E2] mb-4 tracking-tight">
                    {item.word}
                  </h3>
                  <div className="w-12 h-px bg-[#CDAF68]/40 mb-4"></div>
                  <p className="text-[#E5E4E2]/60 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
