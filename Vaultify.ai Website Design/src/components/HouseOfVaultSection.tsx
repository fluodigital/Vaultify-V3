import { motion } from 'motion/react';
import { MapPin, Users, Utensils, Calendar } from 'lucide-react';

const vaultFeatures = [
  {
    icon: Utensils,
    title: 'Private Dining',
    description: 'Exclusive culinary experiences'
  },
  {
    icon: Calendar,
    title: 'Bespoke Experiences',
    description: 'Curated member events'
  },
  {
    icon: Users,
    title: 'Private Networking',
    description: 'Connect with global leaders'
  },
  {
    icon: MapPin,
    title: 'Global Access',
    description: 'London, Dubai, and beyond'
  }
];

export function HouseOfVaultSection() {
  return (
    <section className="py-32 px-6 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Architecture image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1634412114581-6376e49ef8e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBtb2Rlcm4lMjBnbGFzc3xlbnwxfHx8fDE3NjA5OTk4ODB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Modern architecture for House of Vault"
                className="w-full rounded-lg"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#CDAF68]/10 via-transparent to-[#0A0A0A]/60 rounded-lg"></div>
              
              {/* Coming 2026 badge */}
              <div className="absolute top-6 left-6 bg-[#CDAF68] text-[#0A0A0A] px-4 py-2 rounded text-sm font-medium uppercase tracking-wider">
                Opening 2026
              </div>
              
              {/* Bottom info */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-[#0A0A0A]/90 backdrop-blur-sm border border-[#CDAF68]/20 p-4 rounded">
                  <div className="text-[#CDAF68] text-lg mb-1">House of Vault</div>
                  <div className="text-[#E5E4E2]/60 text-sm">Member-Only Spaces</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#CDAF68]/60 mb-6">
                House of Vault
              </p>
              <h2 className="text-4xl md:text-6xl text-[#E5E4E2] leading-tight mb-8">
                Where the Digital
                <br />
                <span className="text-[#CDAF68]">Meets the Physical</span>
              </h2>
            </div>

            <div className="space-y-6 text-lg text-[#E5E4E2]/70 leading-relaxed">
              <p>
                Every detail of House of Vault is designed for discretion, privacy, and connection.
              </p>
              <p>
                Exclusive member-only spaces in London, Dubai, and global hubs — 
                curated for business leaders, athletes, creators, and founders shaping 
                the next era of luxury.
              </p>
              <p>
                Private dining, bespoke experiences, and one-touch access to Alfred AI.
              </p>
              <p className="text-[#CDAF68] italic">
                Memberships are limited. Always will be.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {vaultFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 p-4 border border-[#CDAF68]/10 bg-[#CDAF68]/5 hover:border-[#CDAF68]/30 hover:bg-[#CDAF68]/10 transition-all duration-500"
                  >
                    <div className="flex-shrink-0 w-10 h-10 border border-[#CDAF68]/30 bg-[#0A0A0A] flex items-center justify-center">
                      <Icon className="text-[#CDAF68]" size={20} />
                    </div>
                    <div>
                      <div className="text-[#E5E4E2] mb-1">{feature.title}</div>
                      <div className="text-[#E5E4E2]/60 text-sm">{feature.description}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              viewport={{ once: true }}
              className="pt-8"
            >
              <button className="bg-transparent border border-[#CDAF68]/40 text-[#CDAF68] hover:bg-[#CDAF68]/10 px-8 py-4 rounded-none transition-all duration-300 text-sm uppercase tracking-wider">
                Discover House of Vault
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}