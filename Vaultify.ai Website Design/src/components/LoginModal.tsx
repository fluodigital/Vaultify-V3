import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { VaultfyLogo } from './VaultfyLogo';
import { MembershipApplicationForm } from './MembershipApplicationForm';

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
}

export function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <>
      {showMembershipForm && (
        <MembershipApplicationForm onClose={() => setShowMembershipForm(false)} />
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
        onClick={onClose}
      >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: 'rgba(245,245,240,0.1)',
            border: '1px solid rgba(245,245,240,0.2)',
          }}
        >
          <X size={18} className="text-[#F5F5F0]" />
        </button>

        {/* Login card */}
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(45,45,45,0.95), rgba(31,31,31,0.95))',
            border: '1px solid rgba(212,175,122,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4"
            >
              <div className="inline-flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl opacity-60" style={{ background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)' }}></div>
                  <VaultfyLogo size={50} className="relative" />
                </div>
                <div className="text-[#F5F5F0]">
                  <div className="tracking-[0.2em] text-2xl uppercase leading-none">Vaultfy</div>
                </div>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl text-[#F5F5F0] mb-2"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-[#F5F5F0]/60"
            >
              Access your Alfred AI experience
            </motion.p>
          </div>

          {/* Login form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email input */}
            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail 
                  size={18} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF7A]/50"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] placeholder:text-[#F5F5F0]/30 outline-none transition-all"
                  style={{
                    border: '1px solid rgba(212,175,122,0.2)',
                  }}
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm text-[#F5F5F0]/80 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock 
                  size={18} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF7A]/50"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-[#2D2D2D]/60 text-[#F5F5F0] placeholder:text-[#F5F5F0]/30 outline-none transition-all"
                  style={{
                    border: '1px solid rgba(212,175,122,0.2)',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF7A]/50 hover:text-[#D4AF7A] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded accent-[#D4AF7A]"
                />
                <span className="text-[#F5F5F0]/60">Remember me</span>
              </label>
              <button 
                type="button"
                className="text-[#D4AF7A] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-lg text-[#2D2D2D] flex items-center justify-center gap-2 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#2D2D2D]"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#2D2D2D]"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#2D2D2D]"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              ) : (
                <>
                  <span className="uppercase tracking-wider text-sm">
                    Sign In
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
              
              {/* Shimmer effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-200%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                  repeatDelay: 1
                }}
              />
            </motion.button>
          </motion.form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'rgba(212,175,122,0.1)' }}></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#2D2D2D] px-4 text-[#F5F5F0]/40">
                Or
              </span>
            </div>
          </div>

          {/* Demo login */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => {
              setEmail('demo@vaultfy.com');
              setPassword('••••••••');
              setTimeout(() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  onLogin();
                }, 1500);
              }, 300);
            }}
            className="w-full py-3 rounded-lg text-[#F5F5F0] text-sm text-center transition-all"
            style={{
              border: '1px solid rgba(212,175,122,0.3)',
              background: 'rgba(212,175,122,0.05)',
            }}
          >
            Continue with Demo Account
          </motion.button>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-[#F5F5F0]/40 mt-6"
          >
            Don't have an account?{' '}
            <button 
              onClick={() => {
                onClose();
                setShowMembershipForm(true);
              }}
              className="text-[#D4AF7A] hover:underline"
            >
              Join the Waitlist
            </button>
          </motion.p>

          {/* Security badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 mt-6 text-xs text-[#F5F5F0]/40"
          >
            <Lock size={12} />
            <span>Secured with 256-bit encryption</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
    </>
  );
}
