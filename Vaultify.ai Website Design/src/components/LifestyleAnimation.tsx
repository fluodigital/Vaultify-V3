import { motion } from 'motion/react';
import { Plane, Ship, Car, CarFront } from 'lucide-react';

export function LifestyleAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {/* Private Jet - Top left to right */}
      <motion.div
        className="absolute top-[15%] left-0"
        initial={{ x: '-10%', opacity: 0 }}
        animate={{ 
          x: '110%', 
          opacity: [0, 0.6, 0.6, 0],
          rotate: [-5, 0, 0, 5]
        }}
        transition={{ 
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
          delay: 2
        }}
      >
        <Plane 
          size={48} 
          className="text-[#D4AF7A] drop-shadow-lg"
          style={{ transform: 'rotate(-45deg)' }}
        />
      </motion.div>

      {/* Yacht - Middle right to left */}
      <motion.div
        className="absolute top-[40%] right-0"
        initial={{ x: '10%', opacity: 0 }}
        animate={{ 
          x: '-110%', 
          opacity: [0, 0.5, 0.5, 0],
          y: [0, -10, 10, 0]
        }}
        transition={{ 
          duration: 35,
          repeat: Infinity,
          ease: 'linear',
          delay: 8
        }}
      >
        <Ship 
          size={56} 
          className="text-[#D4AF7A] drop-shadow-lg"
        />
      </motion.div>

      {/* Supercar - Bottom left to right */}
      <motion.div
        className="absolute bottom-[25%] left-0"
        initial={{ x: '-10%', opacity: 0 }}
        animate={{ 
          x: '110%', 
          opacity: [0, 0.7, 0.7, 0]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5
        }}
      >
        <Car 
          size={44} 
          className="text-[#D4AF7A] drop-shadow-lg"
        />
      </motion.div>

      {/* Chauffeur Car - Top right to left */}
      <motion.div
        className="absolute top-[60%] right-0"
        initial={{ x: '10%', opacity: 0 }}
        animate={{ 
          x: '-110%', 
          opacity: [0, 0.6, 0.6, 0]
        }}
        transition={{ 
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 12
        }}
      >
        <CarFront 
          size={40} 
          className="text-[#D4AF7A] drop-shadow-lg"
        />
      </motion.div>

      {/* Additional Private Jet - Different trajectory */}
      <motion.div
        className="absolute top-[70%] left-0"
        initial={{ x: '-10%', y: 0, opacity: 0 }}
        animate={{ 
          x: '110%', 
          y: [0, -30, -60, -30, 0],
          opacity: [0, 0.5, 0.5, 0],
          rotate: [-10, 0, 0, 10]
        }}
        transition={{ 
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
          delay: 15
        }}
      >
        <Plane 
          size={42} 
          className="text-[#D4AF7A] drop-shadow-lg"
          style={{ transform: 'rotate(-45deg)' }}
        />
      </motion.div>

      {/* Luxury Sedan - Bottom right to left */}
      <motion.div
        className="absolute bottom-[45%] right-0"
        initial={{ x: '10%', opacity: 0 }}
        animate={{ 
          x: '-110%', 
          opacity: [0, 0.5, 0.5, 0]
        }}
        transition={{ 
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 18
        }}
      >
        <Car 
          size={38} 
          className="text-[#D4AF7A] drop-shadow-lg"
        />
      </motion.div>
    </div>
  );
}
