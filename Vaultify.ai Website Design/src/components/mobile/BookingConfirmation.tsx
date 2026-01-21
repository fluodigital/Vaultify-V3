import { motion } from 'motion/react';
import { CheckCircle, Plane, Calendar, Users, MapPin, CreditCard } from 'lucide-react';

export function BookingConfirmation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[#0A0A0A]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-sm"
      >
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            
            {/* Check icon */}
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              }}
            >
              <CheckCircle size={40} className="text-[#1F1F1F]" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl text-[#F5F5F0] mb-2">
            Monaco Experience Confirmed ✦
          </h2>
          <p className="text-sm text-[#F5F5F0]/60">
            Jet, Watch, Penthouse & Yacht secured
          </p>
        </motion.div>

        {/* Booking details card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'rgba(45,45,45,0.8)',
            border: '1px solid rgba(212,175,122,0.2)',
          }}
        >
          {/* Flight path visualization */}
          <div className="mb-6">
            <svg width="100%" height="80" viewBox="0 0 300 80">
              {/* Arc path */}
              <motion.path
                d="M 20 60 Q 150 10, 280 60"
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.6 }}
              />
              
              {/* Animated plane */}
              <motion.g
                initial={{ offsetDistance: '0%' }}
                animate={{ offsetDistance: '100%' }}
                transition={{ duration: 2, delay: 0.6, ease: 'easeInOut' }}
                style={{ offsetPath: 'path("M 20 60 Q 150 10, 280 60")' }}
              >
                <Plane size={16} fill="#D4AF7A" stroke="none" />
              </motion.g>

              {/* Start point */}
              <circle cx="20" cy="60" r="4" fill="#D4AF7A" />
              <text x="20" y="75" fontSize="10" fill="#F5F5F0" opacity="0.6" textAnchor="middle">LHR</text>
              
              {/* End point */}
              <circle cx="280" cy="60" r="4" fill="#D4AF7A" />
              <text x="280" y="75" fontSize="10" fill="#F5F5F0" opacity="0.6" textAnchor="middle">NCE</text>

              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B8935E" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#D4AF7A" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#E6D5B8" stopOpacity="0.5" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Plane size={16} style={{ color: '#D4AF7A' }} />
              <div className="flex-1">
                <p className="text-sm text-[#F5F5F0]/60">Aircraft</p>
                <p className="text-[#F5F5F0]">Global 6000</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar size={16} style={{ color: '#D4AF7A' }} />
              <div className="flex-1">
                <p className="text-sm text-[#F5F5F0]/60">Departure</p>
                <p className="text-[#F5F5F0]">Thu, Jan 30 • 07:30 AM</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={16} style={{ color: '#D4AF7A' }} />
              <div className="flex-1">
                <p className="text-sm text-[#F5F5F0]/60">Destination</p>
                <p className="text-[#F5F5F0]">London → Monaco (Nice)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard size={16} style={{ color: '#D4AF7A' }} />
              <div className="flex-1">
                <p className="text-sm text-[#F5F5F0]/60">Total Experience</p>
                <p className="text-[#F5F5F0]">USDC • £256,100</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <button
            className="w-full py-4 rounded-xl text-[#1F1F1F]"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
            }}
          >
            View Full Itinerary
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="py-3 rounded-xl text-[#F5F5F0] text-sm"
              style={{
                border: '1px solid rgba(212,175,122,0.3)',
              }}
            >
              Add Chauffeur
            </button>
            <button
              className="py-3 rounded-xl text-[#F5F5F0] text-sm"
              style={{
                border: '1px solid rgba(212,175,122,0.3)',
              }}
            >
              Message Alfred
            </button>
          </div>
        </motion.div>

        {/* Subtle confirmation note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-[#F5F5F0]/40 mt-6"
        >
          Complete itinerary with watch delivery details arriving in 90 seconds
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
