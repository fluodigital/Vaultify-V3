import { motion } from 'motion/react';
import { ChevronRight, Shield, Wallet, Bell, Lock, CreditCard, Globe, LogOut } from 'lucide-react';

export function ProfileScreen() {
  return (
    <div className="h-full overflow-y-auto bg-[#000000]">
      {/* Header with member info */}
      <div className="px-6 pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-6"
        >
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
            }}
          >
            <span className="text-[#000000]">M</span>
          </div>

          <div className="flex-1">
            <h1 className="text-xl text-[#F5F5F0] mb-1">Marcus Reynolds</h1>
            <p className="text-sm text-[#F5F5F0]/60 mb-2">marcus@vaultfy.com</p>
            
            {/* Member badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF7A]/10 border border-[#D4AF7A]/20">
              <div className="w-2 h-2 rounded-full bg-[#D4AF7A]" />
              <span className="text-xs" style={{ color: '#D4AF7A' }}>
                Founding Member • Circle 1
              </span>
            </div>
          </div>
        </motion.div>

        {/* Membership card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-2xl p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(184,147,94,0.2), rgba(212,175,122,0.1))',
            border: '1px solid rgba(212,175,122,0.3)',
          }}
        >
          {/* Decorative pattern */}
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: 'radial-gradient(circle, #E6D5B8 0%, transparent 70%)',
            }}
          />

          <div className="relative">
            <p className="text-xs text-[#F5F5F0]/60 mb-2">Member Since</p>
            <p className="text-2xl text-[#F5F5F0] mb-4">January 2024</p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#F5F5F0]/60 mb-1">Lifetime Spend</p>
                <p
                  className="text-xl"
                  style={{
                    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  £1.2M
                </p>
              </div>
              
              <button
                className="px-4 py-2 rounded-full text-xs"
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                  color: '#000000',
                }}
              >
                Upgrade to Circle 2
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Settings sections */}
      <div className="px-6 pb-8 space-y-6">
        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-sm uppercase tracking-wider text-[#F5F5F0]/60 mb-3">
            Account
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'rgba(45,45,45,0.6)',
              border: '1px solid rgba(212,175,122,0.1)',
            }}
          >
            {[
              { icon: Wallet, label: 'Payment Methods', value: '3 linked' },
              { icon: CreditCard, label: 'Wallets', value: 'USDC, USDT' },
              { icon: Globe, label: 'Preferences', value: 'Travel habits' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className={`w-full flex items-center justify-between p-4 ${
                    index !== 2 ? 'border-b border-[#D4AF7A]/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} style={{ color: '#D4AF7A' }} />
                    <span className="text-[#F5F5F0]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#F5F5F0]/50">{item.value}</span>
                    <ChevronRight size={16} className="text-[#F5F5F0]/30" />
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-sm uppercase tracking-wider text-[#F5F5F0]/60 mb-3">
            Privacy & Security
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'rgba(45,45,45,0.6)',
              border: '1px solid rgba(212,175,122,0.1)',
            }}
          >
            {[
              { icon: Lock, label: 'Encrypted chat backups', enabled: true },
              { icon: Shield, label: 'Hide activity from feed', enabled: true },
              { icon: Bell, label: 'Booking notifications', enabled: false },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 ${
                    index !== 2 ? 'border-b border-[#D4AF7A]/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} style={{ color: '#D4AF7A' }} />
                    <span className="text-[#F5F5F0]">{item.label}</span>
                  </div>
                  <button
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      item.enabled ? '' : 'opacity-50'
                    }`}
                    style={{
                      background: item.enabled
                        ? 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
                        : 'rgba(245,245,240,0.2)',
                    }}
                  >
                    <div
                      className={`absolute top-0.5 ${
                        item.enabled ? 'right-0.5' : 'left-0.5'
                      } w-5 h-5 bg-[#F5F5F0] rounded-full transition-all shadow-lg`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>



        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-[#F5F5F0]/70"
          style={{
            border: '1px solid rgba(212,175,122,0.2)',
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center pt-4"
        >
          <p className="text-xs text-[#F5F5F0]/40">
            Vaultfy • Version 1.2.0
          </p>
          <p className="text-xs text-[#F5F5F0]/40 mt-1">
            End-to-end encrypted • SOC 2 Compliant
          </p>
        </motion.div>
      </div>
    </div>
  );
}
