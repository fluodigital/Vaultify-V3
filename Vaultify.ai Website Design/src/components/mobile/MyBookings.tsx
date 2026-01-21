import { motion } from 'motion/react';
import { Plane, Home, Car, ChevronRight, MessageSquare, Anchor } from 'lucide-react';

const bookings = [
  {
    id: 1,
    type: 'Private Jet',
    icon: Plane,
    name: 'Global 6000',
    route: 'London → Monaco (Nice)',
    date: 'Thu, Jan 30 • 07:30',
    status: 'Active',
    statusColor: '#D4AF7A',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=250&fit=crop',
  },
  {
    id: 2,
    type: 'Penthouse',
    icon: Home,
    name: 'Hotel de Paris Monaco',
    route: 'Monte Carlo, Monaco',
    date: 'Jan 30 - Feb 2 • 3 nights',
    status: 'Confirmed',
    statusColor: '#4ade80',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=250&fit=crop',
  },
  {
    id: 3,
    type: 'Yacht Charter',
    icon: Anchor,
    name: 'Azimut 150ft',
    route: 'Port Hercules, Monaco Bay',
    date: 'Jan 31 - Feb 3 • 3 days',
    status: 'Ready',
    statusColor: '#60a5fa',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&h=250&fit=crop',
  },
];

export function MyBookings() {
  return (
    <div className="h-full overflow-y-auto bg-[#000000]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl text-[#F5F5F0] mb-2"
        >
          My Bookings
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-sm text-[#F5F5F0]/60"
        >
          {bookings.length} active reservations
        </motion.p>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex gap-2">
          {['Active', 'Upcoming', 'Past'].map((tab, index) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                index === 0
                  ? 'text-[#000000]'
                  : 'text-[#F5F5F0]/60'
              }`}
              style={{
                background: index === 0
                  ? 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
                  : 'transparent',
                border: index === 0 ? 'none' : '1px solid rgba(212,175,122,0.2)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="px-6 space-y-4 pb-8">
        {bookings.map((booking, index) => {
          const Icon = booking.icon;
          
          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(45,45,45,0.8)',
                border: '1px solid rgba(212,175,122,0.15)',
              }}
            >
              {/* Image */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={booking.image}
                  alt={booking.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/50 to-transparent" />
                
                {/* Status badge */}
                <div
                  className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs backdrop-blur-xl"
                  style={{
                    background: `${booking.statusColor}20`,
                    border: `1px solid ${booking.statusColor}40`,
                    color: booking.statusColor,
                  }}
                >
                  {booking.status}
                </div>

                {/* Icon */}
                <div
                  className="absolute bottom-3 left-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl"
                  style={{
                    background: 'rgba(212,175,122,0.2)',
                    border: '1px solid rgba(212,175,122,0.3)',
                  }}
                >
                  <Icon size={20} style={{ color: '#D4AF7A' }} />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-[#F5F5F0]/50 mb-1">{booking.type}</p>
                    <h3 className="text-[#F5F5F0] mb-1">{booking.name}</h3>
                    <p className="text-sm text-[#F5F5F0]/70">{booking.route}</p>
                  </div>
                  <button className="text-[#D4AF7A]">
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#D4AF7A]/10">
                  <p className="text-xs text-[#F5F5F0]/60">{booking.date}</p>
                  
                  <button
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(212,175,122,0.1)',
                      border: '1px solid rgba(212,175,122,0.2)',
                      color: '#D4AF7A',
                    }}
                  >
                    <MessageSquare size={12} />
                    <span>Alfred</span>
                  </button>
                </div>
              </div>

              {/* Swipe actions hint */}
              <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-l-full"
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                  opacity: 0.3,
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Empty state message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="px-6 py-8 text-center"
      >
        <p className="text-sm text-[#F5F5F0]/40">
          Swipe left on any booking to extend or modify
        </p>
      </motion.div>
    </div>
  );
}

function MessageSquare({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
