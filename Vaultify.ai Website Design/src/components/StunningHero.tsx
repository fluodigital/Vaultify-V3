import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useRef } from 'react';
import { LifestyleAnimation } from './LifestyleAnimation';
import { VaultfyLogo } from './VaultfyLogo';
import { VisaLogo } from './VisaLogo';

// Floating particle component
function FloatingParticle({ delay, duration, x, y }: { delay: number; duration: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full"
      style={{ 
        left: x, 
        top: y,
        background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        y: [0, -100, -200],
        x: [0, Math.random() * 50 - 25, Math.random() * 100 - 50]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: 'easeOut'
      }}
    />
  );
}

// Animated gradient orb
function GradientOrb({ color, size, left, top, delay }: { color: string; size: string; left: string; top: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-20"
      style={{
        background: color,
        width: size,
        height: size,
        left: left,
        top: top
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.3, 0.2],
        x: [0, 30, 0],
        y: [0, -20, 0]
      }}
      transition={{
        duration: 8,
        delay: delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}

// 3D Credit Card Component
function AnimatedCreditCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div ref={cardRef} className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-[420px] h-[260px]"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        animate={{
          y: [0, -20, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Card shine effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ transform: 'translateZ(1px)' }}
        >
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{
              background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)'
            }}
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 1
            }}
          />
        </motion.div>

        {/* Main card */}
        <div
          className="relative w-full h-full rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0D0D0D 0%, #000000 50%, #0D0D0D 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(212,175,122,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            border: '1px solid rgba(212,175,122,0.2)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Metallic texture overlay */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              mixBlendMode: 'overlay'
            }}
          />

          {/* Gold accents with gradient */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 opacity-20 blur-3xl rounded-full transform translate-x-20 -translate-y-20"
            style={{ background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)' }}
          />
          <div 
            className="absolute bottom-0 left-0 w-48 h-48 opacity-10 blur-3xl rounded-full transform -translate-x-10 translate-y-10"
            style={{ background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)' }}
          />

          {/* Card content */}
          <div className="relative w-full h-full p-8 flex flex-col justify-between" style={{ transform: 'translateZ(10px)' }}>
            {/* Top section */}
            <div className="flex items-start justify-between">
              {/* Chip */}
              <motion.div
                className="w-12 h-10 rounded-lg relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #D4AF7A 0%, #B8935E 100%)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.2)'
                }}
                animate={{
                  boxShadow: [
                    'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.2)',
                    'inset 0 1px 2px rgba(0,0,0,0.5), 0 2px 8px rgba(212,175,122,0.4)',
                    'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.2)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute inset-1 grid grid-cols-2 gap-0.5">
                  <div className="bg-black/20 rounded-sm" />
                  <div className="bg-black/20 rounded-sm" />
                  <div className="bg-black/20 rounded-sm" />
                  <div className="bg-black/20 rounded-sm" />
                </div>
              </motion.div>

              {/* Vaultfy Logo */}
              <motion.div
                animate={{ 
                  opacity: [0.8, 1, 0.8],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <VaultfyLogo size={50} />
              </motion.div>
            </div>

            {/* Middle section - Card number */}
            <div>
              <motion.div
                className="flex gap-4 text-xl tracking-[0.3em] mb-2"
                style={{
                  background: 'linear-gradient(135deg, #F5F5F0 0%, #D4AF7A 50%, #F5F5F0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '0 0 20px rgba(212,175,122,0.5)'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <span>••••</span>
                <span>••••</span>
                <span>•••••</span>
                <span>0028</span>
              </motion.div>
            </div>

            {/* Bottom section */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[#F5F5F0]/40 text-[10px] uppercase tracking-wider mb-1">Cardholder</div>
                <div className="text-[#F5F5F0] text-sm tracking-widest uppercase">Vaultfy Member</div>
              </div>
              <div>
                <div className="text-[#F5F5F0]/40 text-[10px] uppercase tracking-wider mb-1">Expires</div>
                <div className="text-[#F5F5F0] text-sm tracking-wider">02/28</div>
              </div>
              <motion.div
                animate={{ 
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <VisaLogo size={55} color="gold" />
              </motion.div>
            </div>
          </div>

          {/* Holographic overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,122,0.1) 0%, transparent 30%, rgba(212,175,122,0.05) 60%, transparent 100%)',
              mixBlendMode: 'overlay'
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        {/* Card shadow */}
        <div
          className="absolute inset-0 rounded-2xl -z-10"
          style={{
            transform: 'translateZ(-20px)',
            background: 'rgba(0,0,0,0.5)',
            filter: 'blur(30px)'
          }}
        />
      </motion.div>

      {/* Floating stablecoin badges with gradient borders */}
      <motion.div
        className="absolute top-20 right-10 text-sm px-3 py-1 backdrop-blur-sm bg-[#000000]/60"
        style={{ 
          color: 'rgba(212,175,122,0.6)',
          border: '1px solid',
          borderImage: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8) 1'
        }}
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      >
        USDC
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-20 text-sm px-3 py-1 backdrop-blur-sm bg-[#000000]/60"
        style={{ 
          color: 'rgba(212,175,122,0.5)',
          border: '1px solid rgba(212,175,122,0.2)'
        }}
        animate={{
          y: [0, 15, 0],
          rotate: [0, -5, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      >
        USDT
      </motion.div>
      <motion.div
        className="absolute top-1/2 left-10 text-sm px-3 py-1 backdrop-blur-sm bg-[#000000]/60"
        style={{ 
          color: 'rgba(212,175,122,0.55)',
          border: '1px solid rgba(212,175,122,0.25)'
        }}
        animate={{
          y: [0, -10, 0],
          rotate: [0, 3, 0],
          opacity: [0.35, 0.65, 0.35]
        }}
        transition={{ duration: 4.5, repeat: Infinity, delay: 0.75 }}
      >
        EUROC
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 right-16 text-sm px-3 py-1 backdrop-blur-sm bg-[#000000]/60"
        style={{ 
          color: 'rgba(212,175,122,0.45)',
          border: '1px solid rgba(212,175,122,0.15)'
        }}
        animate={{
          y: [0, 12, 0],
          rotate: [0, -4, 0],
          opacity: [0.25, 0.55, 0.25]
        }}
        transition={{ duration: 5.5, repeat: Infinity, delay: 1.25 }}
      >
        DAI
      </motion.div>
    </div>
  );
}

interface StunningHeroProps {
  onMembershipClick: () => void;
}

export function StunningHero({ onMembershipClick }: StunningHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#000000]">
      {/* Animated gradient orbs */}
      <GradientOrb color="linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)" size="600px" left="-10%" top="20%" delay={0} />
      <GradientOrb color="#0D0D0D" size="500px" left="70%" top="60%" delay={2} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(212, 175, 122, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 122, 0.03) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Lifestyle Animation - Jets, Yachts, Supercars */}
      <LifestyleAnimation />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={Math.random() * 5}
            duration={3 + Math.random() * 3}
            x={`${Math.random() * 100}%`}
            y={`${50 + Math.random() * 50}%`}
          />
        ))}
      </div>

      {/* Main content - Responsive layout with mobile-first reordering */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-5 sm:px-6 lg:px-12">
        {/* Mobile Layout: Title → Card → Description */}
        <div className="lg:hidden flex flex-col items-center gap-10 min-h-screen py-20">
          {/* Mobile: Title First */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center space-y-6"
          >
            <h1 className="text-[2.5rem] leading-[0.95] sm:text-5xl text-[#F5F5F0] tracking-tight">
              The Exclusive Club
              <br />
              <span className="relative inline-block mt-2">
                <motion.span
                  className="relative z-10"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(212, 175, 122, 0.3)',
                      '0 0 40px rgba(212, 175, 122, 0.5)',
                      '0 0 20px rgba(212, 175, 122, 0.3)'
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  Powered by AI
                </motion.span>
              </span>
            </h1>
          </motion.div>

          {/* Mobile: Card Second */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative h-[350px] sm:h-[400px] w-full max-w-[380px] sm:max-w-[420px]"
          >
            <AnimatedCreditCard />
          </motion.div>

          {/* Mobile: Description and All Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center px-4 space-y-8 w-full max-w-lg"
          >
            <p className="text-lg sm:text-xl text-[#F5F5F0]/90 leading-relaxed">
              An exclusive members club where AI meets luxury. Book private jets, supercars, yachts and five-star hotels{' '}
              <span 
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                instantly
              </span> using card, wire, or crypto.
            </p>

            {/* Value props */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-4 text-[#F5F5F0]/60"
            >
              <span className="text-sm">No brokers</span>
              <span style={{ color: 'rgba(212,175,122,0.4)' }}>•</span>
              <span className="text-sm">No phone calls</span>
              <span style={{ color: 'rgba(212,175,122,0.4)' }}>•</span>
              <span className="text-sm">No waiting</span>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="flex flex-col items-center gap-3 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={onMembershipClick}
                  className="group relative text-[#000000] px-10 py-6 text-base rounded-none overflow-hidden border-0"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-3 uppercase tracking-wider">
                    Join the Waitlist
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChevronRight size={18} />
                    </motion.div>
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-200%', '200%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </Button>
              </motion.div>

              <p className="text-sm text-[#F5F5F0]/40 italic">
                By Invitation. Always.
              </p>
            </motion.div>


          </motion.div>
        </div>

        {/* Desktop Layout: Side-by-side */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          
          {/* Desktop Left side - Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-10 lg:pr-12"
          >
            {/* Luxury badge with gradient */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2 backdrop-blur-sm"
              style={{
                border: '1px solid rgba(212,175,122,0.2)',
                background: 'rgba(212,175,122,0.05)'
              }}
            >
              <Sparkles size={14} style={{ color: '#D4AF7A' }} />
              <span 
                className="text-xs uppercase tracking-[0.3em]"
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Luxury that listens. Intelligence that acts.
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-[#F5F5F0] tracking-tight leading-[0.95]">
                The Exclusive Club
                <br />
                <span className="relative inline-block">
                  <motion.span
                    className="relative z-10"
                    style={{
                      background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    }}
                    animate={{
                      textShadow: [
                        '0 0 20px rgba(212, 175, 122, 0.3)',
                        '0 0 40px rgba(212, 175, 122, 0.5)',
                        '0 0 20px rgba(212, 175, 122, 0.3)'
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    Powered by AI
                  </motion.span>
                </span>
              </h1>
            </motion.div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-xl md:text-2xl text-[#F5F5F0]/90 leading-relaxed max-w-2xl"
            >
              An exclusive members club where AI meets luxury. Book private jets, supercars, yachts and five-star hotels{' '}
              <span 
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                instantly
              </span> using card, wire, or crypto.
            </motion.p>

            {/* Value props */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex flex-wrap gap-6 text-[#F5F5F0]/60"
            >
              <span className="text-sm">No brokers</span>
              <span style={{ color: 'rgba(212,175,122,0.4)' }}>•</span>
              <span className="text-sm">No phone calls</span>
              <span style={{ color: 'rgba(212,175,122,0.4)' }}>•</span>
              <span className="text-sm">No waiting</span>
            </motion.div>

            {/* CTA with gradient */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={onMembershipClick}
                  className="group relative text-[#000000] px-10 py-6 text-base rounded-none overflow-hidden border-0"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-3 uppercase tracking-wider">
                    Join the Waitlist
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChevronRight size={18} />
                    </motion.div>
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-200%', '200%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </Button>
              </motion.div>

              <p className="text-sm text-[#F5F5F0]/40 italic">
                By Invitation. Always.
              </p>
            </motion.div>


          </motion.div>

          {/* Desktop Right side - 3D Credit Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative h-[600px] lg:h-[700px]"
          >
            <AnimatedCreditCard />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#000000] to-transparent pointer-events-none" />

      {/* Corner accents with gradient */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2" style={{ borderColor: 'rgba(212,175,122,0.1)' }} />
      <div className="absolute top-0 right-0 w-24 h-24 border-r-2 border-t-2" style={{ borderColor: 'rgba(212,175,122,0.1)' }} />
    </section>
  );
}