import { motion } from 'motion/react';
import { MessageSquare, Shield, Zap, CreditCard, Brain, Network } from 'lucide-react';

const infrastructureStack = [
  {
    icon: Brain,
    title: 'AI Orchestration',
    description: 'Natural language chat via the Vaultfy app — powered by Alfred AI. Say it, see it, book it.',
    color: 'from-blue-500/20 to-purple-500/20'
  },
  {
    icon: Shield,
    title: 'Verified Supply Network',
    description: 'Private APIs with top-tier aviation, transport, and luxury hotels — real-time verification and availability.',
    color: 'from-green-500/20 to-emerald-500/20'
  },
  {
    icon: CreditCard,
    title: 'Hybrid Payments',
    description: 'Card, wire, or stablecoins (USDC, USDT, EUROC, DAI) — instant escrow and transparent settlement.',
    color: 'from-[#D4AF7A]/20 to-yellow-500/20'
  }
];

export function InfrastructureSection() {
  return (
    <section className="py-32 px-6 bg-[#2D2D2D]">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p 
            className="text-sm uppercase tracking-[0.3em] mb-6"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Infrastructure for Ultra-Luxury
          </p>
          <h2 className="text-4xl md:text-6xl text-[#F5F5F0] leading-tight mb-8">
            Luxury,{' '}
            <span 
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Without Friction
            </span>
          </h2>
          <h3 className="text-2xl md:text-3xl text-[#F5F5F0]/60 mb-8">
            We Don't Aggregate. We Verify.
          </h3>
          <p className="text-xl text-[#F5F5F0]/70 max-w-4xl mx-auto">
            Vaultfy isn't another marketplace — it's infrastructure for the ultra-luxury economy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {infrastructureStack.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div 
                  className="h-full p-8 backdrop-blur-sm transition-all duration-500"
                  style={{
                    border: '1px solid rgba(212,175,122,0.1)',
                    background: 'rgba(45,45,45,0.6)'
                  }}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <div className="relative">
                    {/* Icon with gradient border on hover */}
                    <div className="mb-8">
                      <div 
                        className="inline-flex items-center justify-center w-16 h-16 transition-all duration-500"
                        style={{
                          border: '1px solid rgba(212,175,122,0.2)',
                          background: 'rgba(212,175,122,0.05)'
                        }}
                      >
                        <Icon 
                          size={32}
                          style={{
                            color: '#D4AF7A'
                          }}
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl text-[#F5F5F0] mb-4">
                      {item.title}
                    </h3>
                    
                    <div 
                      className="h-px mb-6 group-hover:w-20 transition-all duration-500"
                      style={{
                        width: '48px',
                        background: 'linear-gradient(90deg, #B8935E, #D4AF7A, #E6D5B8)'
                      }}
                    ></div>
                    
                    <p className="text-[#F5F5F0]/70 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Three-Layer Stack Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h4 
            className="text-xl mb-8 uppercase tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Our Three-Layer Stack
          </h4>
          
          <div className="relative max-w-2xl mx-auto">
            {/* Connecting lines */}
            <div 
              className="absolute left-1/2 top-0 bottom-0 w-px transform -translate-x-1/2"
              style={{
                background: 'linear-gradient(180deg, rgba(212,175,122,0.4) 0%, rgba(212,175,122,0.2) 50%, rgba(212,175,122,0.4) 100%)'
              }}
            ></div>
            
            {/* Stack layers */}
            <div className="space-y-12">
              {infrastructureStack.map((layer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="flex items-center justify-center">
                    <div 
                      className="bg-[#2D2D2D] rounded-full p-4"
                      style={{
                        border: '2px solid rgba(212,175,122,0.3)'
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-[#F5F5F0]/60 mt-2 uppercase tracking-wider">
                    {layer.title}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <button 
              className="bg-transparent px-8 py-3 rounded-none transition-all duration-300 text-sm uppercase tracking-wider"
              style={{
                border: '1px solid rgba(212,175,122,0.4)',
                color: '#D4AF7A'
              }}
            >
              See How It Works
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}