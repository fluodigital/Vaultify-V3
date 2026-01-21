import { motion } from 'motion/react';
import { VaultfyLogo } from '../VaultfyLogo';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<'scale-in' | 'rotate' | 'unveil'>('scale-in');

  useEffect(() => {
    // Scale in: 0-800ms
    const scaleInTimer = setTimeout(() => {
      setStage('rotate');
    }, 800);

    // Rotate: 800-2500ms (1.7s of rotation)
    const rotateTimer = setTimeout(() => {
      setStage('unveil');
    }, 2500);

    // Unveil and complete: 2500-3300ms
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3300);

    return () => {
      clearTimeout(scaleInTimer);
      clearTimeout(rotateTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000000]"
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: stage === 'unveil' ? 0 : 1 
      }}
      transition={{ 
        duration: stage === 'unveil' ? 0.8 : 0,
        ease: 'easeInOut'
      }}
    >
      {/* Animated background gradient with radial pulse */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: stage === 'unveil' 
            ? 'radial-gradient(circle at 50% 50%, rgba(212,175,122,0) 0%, rgba(0,0,0,0) 100%)'
            : [
                'radial-gradient(circle at 50% 50%, rgba(212,175,122,0.05) 0%, rgba(0,0,0,1) 60%)',
                'radial-gradient(circle at 50% 50%, rgba(212,175,122,0.08) 0%, rgba(0,0,0,1) 50%)',
                'radial-gradient(circle at 50% 50%, rgba(212,175,122,0.05) 0%, rgba(0,0,0,1) 60%)',
              ]
        }}
        transition={{
          duration: stage === 'unveil' ? 0.8 : 2.5,
          repeat: stage === 'unveil' ? 0 : Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Expanding golden rings on unveil */}
      {stage === 'unveil' && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{
                borderColor: 'rgba(212,175,122,0.3)',
                borderWidth: '2px',
              }}
              initial={{ 
                width: 200,
                height: 200,
                opacity: 0.6
              }}
              animate={{
                width: 2000,
                height: 2000,
                opacity: 0,
              }}
              transition={{
                duration: 1.2,
                delay: i * 0.15,
                ease: 'easeOut'
              }}
            />
          ))}
        </>
      )}

      {/* Main glow effect */}
      <motion.div
        className="absolute"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: stage === 'unveil' ? [0.6, 0] : [0, 0.5, 0.7, 0.5],
          scale: stage === 'unveil' ? [1, 4] : [0.5, 1.3, 1, 1.3]
        }}
        transition={{
          duration: stage === 'unveil' ? 0.8 : 3,
          repeat: stage === 'unveil' ? 0 : Infinity,
          ease: stage === 'unveil' ? 'easeOut' : 'easeInOut'
        }}
      >
        <div className="w-80 h-80 bg-[#D4AF7A]/20 rounded-full blur-[120px]" />
      </motion.div>

      {/* Logo container */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: stage === 'scale-in' 
            ? 1 
            : stage === 'rotate' 
              ? 1 
              : 1.5,
          opacity: stage === 'unveil' ? 0 : 1,
        }}
        transition={{
          scale: {
            duration: stage === 'scale-in' ? 0.8 : stage === 'unveil' ? 0.8 : 0,
            ease: stage === 'scale-in' ? [0.34, 1.56, 0.64, 1] : 'easeOut',
          },
          opacity: {
            duration: stage === 'unveil' ? 0.6 : 0.8,
            ease: 'easeOut'
          }
        }}
      >
        {/* Multiple rotating orbital rings */}
        <motion.div
          className="absolute inset-0 -m-16"
          animate={{
            rotate: stage === 'rotate' ? 360 : 0,
            scale: stage === 'unveil' ? 2 : 1,
            opacity: stage === 'unveil' ? 0 : [0.4, 0.7, 0.4]
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: stage === 'rotate' ? Infinity : 0,
              ease: 'linear'
            },
            scale: {
              duration: 0.8,
              ease: 'easeOut'
            },
            opacity: {
              duration: stage === 'unveil' ? 0.6 : 2,
              repeat: stage === 'unveil' ? 0 : Infinity,
              ease: 'easeInOut'
            }
          }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              border: '1px solid transparent',
              borderTopColor: '#D4AF7A',
              borderRightColor: 'rgba(212,175,122,0.3)',
            }}
          />
        </motion.div>

        {/* Second counter-rotating ring */}
        <motion.div
          className="absolute inset-0 -m-20"
          animate={{
            rotate: stage === 'rotate' ? -360 : 0,
            scale: stage === 'unveil' ? 2.2 : 1,
            opacity: stage === 'unveil' ? 0 : [0.3, 0.6, 0.3]
          }}
          transition={{
            rotate: {
              duration: 3,
              repeat: stage === 'rotate' ? Infinity : 0,
              ease: 'linear'
            },
            scale: {
              duration: 0.8,
              ease: 'easeOut'
            },
            opacity: {
              duration: stage === 'unveil' ? 0.6 : 2.5,
              repeat: stage === 'unveil' ? 0 : Infinity,
              ease: 'easeInOut'
            }
          }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              border: '1px solid transparent',
              borderBottomColor: '#D4AF7A',
              borderLeftColor: 'rgba(212,175,122,0.2)',
            }}
          />
        </motion.div>

        {/* Logo - with its own rotation */}
        <motion.div
          animate={{
            rotate: stage === 'rotate' ? 360 : 0,
          }}
          transition={{
            rotate: {
              duration: 1.7,
              ease: 'easeInOut'
            }
          }}
        >
          <VaultfyLogo size={90} />
        </motion.div>
        
        {/* Brand name - NO ROTATION */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: stage === 'unveil' ? 0 : stage === 'scale-in' ? 0 : 1,
            y: stage === 'unveil' ? -30 : 0
          }}
          transition={{
            delay: stage === 'scale-in' ? 0.6 : 0,
            duration: stage === 'unveil' ? 0.6 : 0.8,
            ease: 'easeOut'
          }}
        >
          <div 
            className="text-4xl tracking-[0.3em] uppercase"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontWeight: 300,
              letterSpacing: '0.3em',
            }}
          >
            Vaultfy
          </div>
          <motion.div 
            className="text-xs text-[#F5F5F0]/50 tracking-[0.5em] uppercase mt-3"
            animate={{
              opacity: stage === 'unveil' ? 0 : [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: stage === 'unveil' ? 0.4 : 2.5,
              repeat: stage === 'unveil' ? 0 : Infinity,
              ease: 'easeInOut'
            }}
          >
            Luxury AI Concierge
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Elegant loading progress bar */}
      <motion.div
        className="absolute bottom-24 left-0 right-0 flex justify-center px-12"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: stage === 'unveil' ? 0 : stage === 'scale-in' ? 0 : 1
        }}
        transition={{
          delay: 0.8,
          duration: stage === 'unveil' ? 0.4 : 0.6,
          ease: 'easeOut'
        }}
      >
        <div className="w-full max-w-xs h-[1px] bg-[#D4AF7A]/20 relative overflow-hidden rounded-full">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #D4AF7A, #E6D5B8, transparent)',
            }}
            initial={{ x: '-100%', width: '50%' }}
            animate={{
              x: stage === 'unveil' ? '200%' : ['−100%', '200%'],
            }}
            transition={{
              duration: stage === 'unveil' ? 0.4 : 1.5,
              repeat: stage === 'unveil' ? 0 : Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>
      </motion.div>

      {/* Shimmer particles on unveil */}
      {stage === 'unveil' && (
        <>
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #D4AF7A, #E6D5B8)',
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -100 - Math.random() * 100],
                x: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: 0.8,
                delay: Math.random() * 0.3,
                ease: 'easeOut'
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
