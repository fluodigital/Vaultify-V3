import { motion } from 'motion/react';
import { Plane, Anchor, Calendar, HeadphonesIcon } from 'lucide-react';

const memberBenefits = [
  {
    icon: Plane,
    title: 'Priority Access',
    description: 'Private jets, yachts, hotels, and events'
  },
  {
    icon: Anchor,
    title: 'Global Availability',
    description: 'London, Dubai, Monaco, and beyond'
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 AI Concierge',
    description: 'Alfred AI always available'
  },
  {
    icon: Calendar,
    title: 'White-Glove Experiences',
    description: 'Exclusive events and curated experiences worldwide'
  }
];

interface ExclusiveMembershipSectionProps {
  onMembershipClick: () => void;
}

export function ExclusiveMembershipSection({ onMembershipClick }: ExclusiveMembershipSectionProps) {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-[#1a1a2e]/20 to-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#CDAF68]/60 mb-6">
                Exclusive Membership
              </p>
              <h2 className="text-4xl md:text-6xl text-[#E5E4E2] leading-tight mb-8">
                For Those Who
                <br />
                <span className="text-[#CDAF68]">Move the World</span>
              </h2>
              <h3 className="text-2xl md:text-3xl text-[#E5E4E2]/60 mb-8">
                Private. Curated. Verified.
              </h3>
            </div>

            <div className="space-y-6 text-lg text-[#E5E4E2]/70">
              <p>
                Vaultfy membership is not open to everyone. Access is by invitation 
                or vetting — reserved for a limited number of verified members each quarter.
              </p>
            </div>

            {/* Member Benefits */}
            <div className="space-y-6">
              <h4 className="text-[#CDAF68] text-lg uppercase tracking-wider mb-6">
                Members Enjoy:
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                {memberBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 border border-[#CDAF68]/30 bg-[#CDAF68]/5 flex items-center justify-center">
                        <Icon className="text-[#CDAF68]" size={20} />
                      </div>
                      <div>
                        <div className="text-[#E5E4E2] mb-1">{benefit.title}</div>
                        <div className="text-[#E5E4E2]/60 text-sm">{benefit.description}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              viewport={{ once: true }}
              className="pt-8"
            >
              <button 
                onClick={onMembershipClick}
                className="bg-[#CDAF68] text-[#0A0A0A] hover:bg-[#CDAF68]/90 px-10 py-4 rounded-none transition-all duration-300 text-base uppercase tracking-wider font-medium"
              >
                Join the Waitlist
              </button>
            </motion.div>
          </motion.div>

          {/* Right side - Luxury lifestyle image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1661954864180-e61dea14208a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcml2YXRlJTIwamV0JTIwaW50ZXJpb3IlMjBsdXh1cnl8ZW58MXx8fHwxNzYwOTYzMjc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Private jet luxury interior"
                className="w-full rounded-lg"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent rounded-lg"></div>
              
              {/* Bottom overlay with stats */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#CDAF68]/20 p-6 rounded">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-2xl text-[#CDAF68] mb-1">500+</div>
                      <div className="text-xs text-[#E5E4E2]/60 uppercase tracking-wider">Verified Partners</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-[#CDAF68] mb-1">150+</div>
                      <div className="text-xs text-[#E5E4E2]/60 uppercase tracking-wider">Global Cities</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top right badge */}
              <div className="absolute top-6 right-6 bg-[#CDAF68]/10 backdrop-blur-sm border border-[#CDAF68]/30 rounded px-4 py-2">
                <span className="text-[#CDAF68] text-sm uppercase tracking-wider">Members Only</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}