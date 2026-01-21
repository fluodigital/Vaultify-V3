import { motion } from 'motion/react';
import { useState } from 'react';
import { TrendingUp, Brain, Shield, Users } from 'lucide-react';

const experiences = [
  {
    icon: TrendingUp,
    title: 'Private Deal Flow',
    description: 'Exclusive opportunities screened by AI. Access pre-IPO investments, private equity, and curated ventures unavailable to traditional markets.',
    image: 'https://images.unsplash.com/photo-1592698765727-387c9464cd7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcml2YXRlJTIwd2VhbHRoJTIwYmFua2luZ3xlbnwxfHx8fDE3NjA5OTgxMTN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    icon: Brain,
    title: 'Portfolio Intelligence',
    description: 'Live analytics for the global elite. AI-powered insights that anticipate market movements and optimize your wealth architecture.',
    image: 'https://images.unsplash.com/photo-1645839078449-124db8a049fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyYWwlMjBuZXR3b3JrJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjA5Nzc4NzB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    icon: Shield,
    title: 'Wealth Concierge',
    description: 'Personalized, on-demand strategy. From tax optimization to succession planning, your dedicated AI-enhanced team orchestrates every detail.',
    image: 'https://images.unsplash.com/photo-1718752773195-c19c1c329156?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2YXVsdCUyMGdvbGR8ZW58MXx8fHwxNzYwOTk0NjU5fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    icon: Users,
    title: 'Discreet Network Access',
    description: 'Private introductions, intelligently curated. Connect with fellow visionaries, thought leaders, and decision-makers in absolute confidence.',
    image: 'https://images.unsplash.com/photo-1613186145425-5bb4eca455d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBib2FyZHJvb218ZW58MXx8fHwxNzYwOTc2MDUzfDA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

export function ExperienceCarousel() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-[#0A0A0A] to-[#1a1a2e]/20">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[#CDAF68]/60 mb-4">
            The Experience
          </p>
          <h2 className="text-4xl md:text-6xl text-[#E5E4E2] mb-6">
            Orchestrated Excellence
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {experiences.map((experience, index) => {
            const Icon = experience.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative group cursor-pointer"
              >
                <div className="relative h-[500px] overflow-hidden bg-[#0A0A0A] border border-[#CDAF68]/10">
                  {/* Image */}
                  <motion.img
                    src={experience.image}
                    alt={experience.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-700"
                    animate={{
                      scale: hoveredIndex === index ? 1.05 : 1
                    }}
                    transition={{ duration: 0.7 }}
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent"></div>
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-10 flex flex-col justify-end">
                    <motion.div
                      animate={{
                        y: hoveredIndex === index ? -10 : 0
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 border border-[#CDAF68]/30 bg-[#0A0A0A]/80 backdrop-blur-sm group-hover:border-[#CDAF68]/60 transition-colors duration-500">
                          <Icon className="text-[#CDAF68]" size={24} />
                        </div>
                      </div>
                      
                      <h3 className="text-3xl text-[#E5E4E2] mb-4 tracking-tight">
                        {experience.title}
                      </h3>
                      
                      <div className="w-16 h-px bg-[#CDAF68]/40 mb-4 group-hover:w-24 transition-all duration-500"></div>
                      
                      <p className="text-[#E5E4E2]/70 leading-relaxed max-w-md">
                        {experience.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Hover glow */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                  >
                    <div className="absolute inset-0 bg-[#CDAF68]/5"></div>
                    <div className="absolute inset-0 border border-[#CDAF68]/20"></div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
