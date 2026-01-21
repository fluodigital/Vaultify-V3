import { motion } from 'motion/react';
import { Lock, Shield, Zap, X } from 'lucide-react';

interface SecureChannelModalProps {
  onClose: () => void;
}

export function SecureChannelModal({ onClose }: SecureChannelModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(245,245,240,0.1)',
            border: '1px solid rgba(245,245,240,0.2)',
          }}
        >
          <X size={16} className="text-[#F5F5F0]" />
        </button>

        {/* 3D Encrypted sphere visualization */}
        <div className="relative h-64 mb-8 flex items-center justify-center">
          {/* Animated golden threads forming sphere */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                border: '1px solid',
                borderColor: `rgba(212,175,122,${0.1 + i * 0.05})`,
                transform: `rotate(${i * 22.5}deg) rotateY(60deg)`,
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20 + i * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}

          {/* Central "A" logo */}
          <motion.div
            className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-3xl"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              boxShadow: '0 0 40px rgba(212,175,122,0.6)',
            }}
            animate={{
              boxShadow: [
                '0 0 40px rgba(212,175,122,0.6)',
                '0 0 60px rgba(212,175,122,0.8)',
                '0 0 40px rgba(212,175,122,0.6)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <span className="text-[#1F1F1F]">A</span>
          </motion.div>

          {/* Orbiting particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A)',
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos((i * 30 * Math.PI) / 180) * 100],
                y: [0, Math.sin((i * 30 * Math.PI) / 180) * 100],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.25,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2
            className="text-2xl mb-3"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Secure Channel Active
          </h2>
          <p className="text-sm text-[#F5F5F0]/60">
            Military-grade encryption protecting your conversations
          </p>
        </motion.div>

        {/* Security features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-8"
        >
          {[
            {
              icon: Lock,
              title: 'End-to-end encrypted',
              description: 'Only you and Alfred can read messages',
            },
            {
              icon: Shield,
              title: 'Smart escrow protection',
              description: 'Card, wire, or crypto — all secured',
            },
            {
              icon: Zap,
              title: 'Private by design',
              description: 'Your intent and identity remain confidential',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{
                  background: 'rgba(212,175,122,0.05)',
                  border: '1px solid rgba(212,175,122,0.15)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(212,175,122,0.1)',
                    border: '1px solid rgba(212,175,122,0.2)',
                  }}
                >
                  <Icon size={18} style={{ color: '#D4AF7A' }} />
                </div>
                <div>
                  <h3 className="text-[#F5F5F0] mb-1">{feature.title}</h3>
                  <p className="text-sm text-[#F5F5F0]/60">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onClose}
          className="w-full py-4 rounded-xl text-[#1F1F1F]"
          style={{
            background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
          }}
        >
          Continue Securely
        </motion.button>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-[#F5F5F0]/40 mt-4"
        >
          SOC 2 Type II Certified • Zero-knowledge architecture
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
