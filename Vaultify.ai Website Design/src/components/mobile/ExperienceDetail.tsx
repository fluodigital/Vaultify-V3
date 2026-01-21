import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Check, 
  Sparkles,
  Star,
  Shield,
  Clock,
  Wifi,
  Coffee,
  Car,
  Plane,
  Wine,
  ChevronDown,
  Share2,
  Heart,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export interface ExperienceData {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  details: string;
  tag: string;
  description: string;
  duration: string;
  maxGuests: string;
  highlights: string[];
  inclusions: string[];
  gallery: string[];
}

interface ExperienceDetailProps {
  experience: ExperienceData;
  onBack: () => void;
  onBookWithAlfred: () => void;
}

export function ExperienceDetail({ experience, onBack, onBookWithAlfred }: ExperienceDetailProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  
  // Combine main image with gallery images
  const allImages = [experience.image, ...(experience.gallery || [])].filter(Boolean);

  // Mock data for the Airbnb-style layout
  const amenities = [
    { icon: Wifi, label: 'High-speed WiFi' },
    { icon: Car, label: 'Private chauffeur' },
    { icon: Plane, label: 'Helicopter transfers' },
    { icon: Coffee, label: 'Personal chef' },
    { icon: Wine, label: 'Premium bar' },
    { icon: Shield, label: 'Security detail' },
    { icon: Clock, label: '24/7 concierge' },
    { icon: Star, label: 'VIP access' },
  ];

  const displayedAmenities = showAllAmenities ? amenities : amenities.slice(0, 6);

  const sleepSpaces = [
    { 
      name: 'Master Suite', 
      description: 'King bed, Ocean view',
      image: 'https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGJlZHJvb218ZW58MXx8fHwxNzYxOTkxNzAyfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    { 
      name: 'Guest Suite', 
      description: '2 Queen beds, Garden view',
      image: 'https://images.unsplash.com/photo-1744974256547-cb87dd8aa126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcml2YXRlJTIwamV0JTIwY2FiaW58ZW58MXx8fHwxNzYyMDAzNzI1fDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
  ];

  const thingsToKnow = {
    checkIn: ['Flexible check-in or out', 'Check-in: After 3:00 PM', 'Check-out: Before 11:00 AM'],
    cancellation: ['Free cancellation for 48 hours', 'Cancel before Nov 8 for a partial refund'],
    houseRules: ['No smoking', 'No parties or events', 'Pets allowed']
  };

  return (
    <div className="h-full overflow-y-auto bg-[#000000] pb-24">
      {/* Header with Back Button - Fixed */}
      <div className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl border-b"
        style={{
          background: 'rgba(0,0,0,0.8)',
          borderColor: 'rgba(212,175,122,0.1)',
        }}
      >
        <motion.button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(45,45,45,0.8)',
            border: '1px solid rgba(212,175,122,0.2)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} style={{ color: '#D4AF7A' }} />
        </motion.button>

        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setIsFavorited(!isFavorited)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(45,45,45,0.8)',
              border: '1px solid rgba(212,175,122,0.2)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart 
              size={20} 
              style={{ color: '#D4AF7A' }}
              fill={isFavorited ? '#D4AF7A' : 'none'}
            />
          </motion.button>
          
          <motion.button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(45,45,45,0.8)',
              border: '1px solid rgba(212,175,122,0.2)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 size={20} style={{ color: '#D4AF7A' }} />
          </motion.button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        {/* Main Gallery Image */}
        <div className="relative h-80 bg-[#1F1F1F]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedGalleryIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <ImageWithFallback
                src={allImages[selectedGalleryIndex]}
                alt={`${experience.title} - Image ${selectedGalleryIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Tag Badge */}
          <div 
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-xl z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(184,147,94,0.95), rgba(212,175,122,0.85))',
              color: '#000000',
            }}
          >
            <span className="text-xs uppercase tracking-wider">{experience.tag}</span>
          </div>
          
          {/* Image Counter */}
          <div 
            className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full backdrop-blur-xl z-10"
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(212,175,122,0.3)',
            }}
          >
            <span className="text-xs text-[#F5F5F0]">
              {selectedGalleryIndex + 1} / {allImages.length}
            </span>
          </div>
          
          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <motion.button
                onClick={() => setSelectedGalleryIndex((prev) => 
                  prev === 0 ? allImages.length - 1 : prev - 1
                )}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  border: '1px solid rgba(212,175,122,0.3)',
                }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft size={20} style={{ color: '#D4AF7A' }} />
              </motion.button>
              
              <motion.button
                onClick={() => setSelectedGalleryIndex((prev) => 
                  prev === allImages.length - 1 ? 0 : prev + 1
                )}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  border: '1px solid rgba(212,175,122,0.3)',
                }}
                whileTap={{ scale: 0.9 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF7A" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </motion.button>
            </>
          )}
        </div>
        
        {/* Thumbnail Gallery */}
        {allImages.length > 1 && (
          <div className="px-4 py-4 overflow-x-auto">
            <div className="flex gap-2">
              {allImages.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedGalleryIndex(index)}
                  className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden"
                  style={{
                    border: selectedGalleryIndex === index 
                      ? '2px solid #D4AF7A' 
                      : '2px solid rgba(212,175,122,0.2)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedGalleryIndex === index && (
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(184,147,94,0.3), rgba(212,175,122,0.2))',
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Title and Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-6 pb-4 border-b"
        style={{ borderColor: 'rgba(212,175,122,0.1)' }}
      >
        <h1 className="text-2xl text-[#F5F5F0] mb-2">
          {experience.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-[#F5F5F0]/70">
          <div className="flex items-center gap-1">
            <Star size={14} fill="#D4AF7A" style={{ color: '#D4AF7A' }} />
            <span>4.98</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{experience.location}</span>
          </div>
        </div>
      </motion.div>

      {/* Curated by Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 py-6 border-b"
        style={{ borderColor: 'rgba(212,175,122,0.1)' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A)',
              }}
            >
              <Sparkles size={20} style={{ color: '#000000' }} />
            </div>
            <div>
              <h3 className="text-[#F5F5F0] mb-0.5">Curated by Alfred AI</h3>
              <p className="text-sm text-[#F5F5F0]/60">Elite Concierge</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-2 text-[#F5F5F0]/80 mb-1">
              <Calendar size={16} style={{ color: '#D4AF7A' }} />
              <span>{experience.duration}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[#F5F5F0]/80 mb-1">
              <Users size={16} style={{ color: '#D4AF7A' }} />
              <span>Up to {experience.maxGuests}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* About this experience */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 py-6 border-b"
        style={{ borderColor: 'rgba(212,175,122,0.1)' }}
      >
        <h2 className="text-xl text-[#F5F5F0] mb-4">About this experience</h2>
        <div className="text-sm text-[#F5F5F0]/70 leading-relaxed">
          <p className={showFullDescription ? '' : 'line-clamp-4'}>
            {experience.description}
            {' '}
            Experience unparalleled luxury with our carefully curated selection. Every detail has been meticulously planned to ensure your complete satisfaction. From private transportation to exclusive access, we handle everything so you can simply enjoy the moment.
          </p>
          <motion.button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="flex items-center gap-1 mt-3 text-[#D4AF7A]"
            whileTap={{ scale: 0.95 }}
          >
            <span className="underline">
              {showFullDescription ? 'Show less' : 'Show more'}
            </span>
            <motion.div
              animate={{ rotate: showFullDescription ? 180 : 0 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>

      {/* What this experience offers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6 py-6 border-b"
        style={{ borderColor: 'rgba(212,175,122,0.1)' }}
      >
        <h2 className="text-xl text-[#F5F5F0] mb-6">What this experience offers</h2>
        <div className="grid grid-cols-2 gap-4">
          {displayedAmenities.map((amenity, index) => {
            const Icon = amenity.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-center gap-3"
              >
                <Icon size={20} style={{ color: '#D4AF7A' }} />
                <span className="text-sm text-[#F5F5F0]/80">{amenity.label}</span>
              </motion.div>
            );
          })}
        </div>
        
        {amenities.length > 6 && (
          <motion.button
            onClick={() => setShowAllAmenities(!showAllAmenities)}
            className="mt-6 px-6 py-3 rounded-xl text-sm"
            style={{
              border: '1px solid rgba(212,175,122,0.3)',
              color: '#F5F5F0',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {showAllAmenities ? 'Show less' : `Show all ${amenities.length} amenities`}
          </motion.button>
        )}
      </motion.div>

      {/* Experience Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-6 py-6 border-b"
        style={{ borderColor: 'rgba(212,175,122,0.1)' }}
      >
        <h2 className="text-xl text-[#F5F5F0] mb-6">Experience highlights</h2>
        <div className="space-y-4">
          {experience.highlights.map((highlight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: 'linear-gradient(135deg, rgba(184,147,94,0.2), rgba(212,175,122,0.1))',
                  border: '1px solid rgba(212,175,122,0.3)',
                }}
              >
                <Check size={14} style={{ color: '#D4AF7A' }} />
              </div>
              <p className="text-sm text-[#F5F5F0]/80">{highlight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Where you'll experience */}
      {sleepSpaces.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-6 py-6 border-b"
          style={{ borderColor: 'rgba(212,175,122,0.1)' }}
        >
          <h2 className="text-xl text-[#F5F5F0] mb-6">Premium accommodations</h2>
          <div className="grid grid-cols-2 gap-4">
            {sleepSpaces.map((space, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="rounded-xl overflow-hidden"
                style={{
                  border: '1px solid rgba(212,175,122,0.15)',
                }}
              >
                <div className="aspect-square relative">
                  <ImageWithFallback
                    src={space.image}
                    alt={space.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="text-sm text-[#F5F5F0] mb-1">{space.name}</h4>
                  <p className="text-xs text-[#F5F5F0]/60">{space.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Where you'll be */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="px-6 py-6 border-b"
        style={{ borderColor: 'rgba(212,175,122,0.1)' }}
      >
        <h2 className="text-xl text-[#F5F5F0] mb-4">Where you'll be</h2>
        <div 
          className="w-full h-48 rounded-xl overflow-hidden mb-4"
          style={{
            border: '1px solid rgba(212,175,122,0.15)',
          }}
        >
          <div 
            className="w-full h-full relative"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1712508818413-76a31994b525?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMG5pZ2h0JTIwbGlnaHRzfGVufDF8fHx8MTc2MjAwMjg5M3ww&ixlib=rb-4.1.0&q=80&w=1080')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.7)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(212,175,122,0.3)',
                  border: '2px solid #D4AF7A',
                }}
              >
                <MapPin size={28} style={{ color: '#D4AF7A' }} />
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-[#F5F5F0]/70 mb-2">{experience.location}</p>
        <p className="text-xs text-[#F5F5F0]/50">
          Prime location with easy access to all major attractions and amenities
        </p>
      </motion.div>

      {/* Things to know */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="px-6 py-6 border-b"
        style={{ borderColor: 'rgba(212,175,122,0.1)' }}
      >
        <h2 className="text-xl text-[#F5F5F0] mb-6">Things to know</h2>
        <div className="grid gap-6">
          <div>
            <h3 className="text-sm text-[#F5F5F0] mb-3">Check-in</h3>
            <div className="space-y-2">
              {thingsToKnow.checkIn.map((item, index) => (
                <p key={index} className="text-sm text-[#F5F5F0]/70">{item}</p>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm text-[#F5F5F0] mb-3">Cancellation policy</h3>
            <div className="space-y-2">
              {thingsToKnow.cancellation.map((item, index) => (
                <p key={index} className="text-sm text-[#F5F5F0]/70">{item}</p>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm text-[#F5F5F0] mb-3">House rules</h3>
            <div className="space-y-2">
              {thingsToKnow.houseRules.map((item, index) => (
                <p key={index} className="text-sm text-[#F5F5F0]/70">{item}</p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Meet your concierge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="px-6 py-6 border-b"
        style={{ borderColor: 'rgba(212,175,122,0.1)' }}
      >
        <h2 className="text-xl text-[#F5F5F0] mb-6">Meet your concierge</h2>
        <div 
          className="p-6 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(184,147,94,0.08), rgba(212,175,122,0.05))',
            border: '1px solid rgba(212,175,122,0.2)',
          }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A)',
              }}
            >
              <Sparkles size={24} style={{ color: '#000000' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg text-[#F5F5F0] mb-1">Alfred AI</h3>
              <p className="text-sm text-[#F5F5F0]/60 mb-2">Elite AI Concierge</p>
              <div className="flex items-center gap-4 text-xs text-[#F5F5F0]/70">
                <div className="flex items-center gap-1">
                  <Star size={12} fill="#D4AF7A" style={{ color: '#D4AF7A' }} />
                  <span>5.0 rating</span>
                </div>
                <span>·</span>
                <span>10,000+ bookings</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-[#F5F5F0]/70 mb-4 leading-relaxed">
            Alfred AI is your personal luxury concierge, available 24/7 to coordinate every detail of your experience. With access to exclusive inventory and instant booking capabilities, Alfred ensures a seamless journey from start to finish.
          </p>
          
          <motion.button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
            style={{
              border: '1px solid rgba(212,175,122,0.3)',
              color: '#F5F5F0',
            }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle size={16} style={{ color: '#D4AF7A' }} />
            <span>Message Alfred</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="px-6 py-6"
      >
        <div 
          className="p-5 rounded-xl flex items-start gap-3"
          style={{
            background: 'rgba(45,45,45,0.4)',
            border: '1px solid rgba(212,175,122,0.15)',
          }}
        >
          <AlertCircle size={20} style={{ color: '#D4AF7A' }} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm text-[#F5F5F0] mb-1">Have a question?</h3>
            <p className="text-xs text-[#F5F5F0]/60 mb-3">
              Our concierge team is available 24/7 to assist with any inquiries
            </p>
            <motion.button
              className="text-xs underline"
              style={{ color: '#D4AF7A' }}
              whileTap={{ scale: 0.98 }}
            >
              Contact support
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Sticky Bottom Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 px-6 py-4 border-t backdrop-blur-xl z-50"
        style={{
          background: 'rgba(0,0,0,0.95)',
          borderColor: 'rgba(212,175,122,0.2)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span 
                className="text-xl"
                style={{
                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {experience.price}
              </span>
              <span className="text-xs text-[#F5F5F0]/60">/ experience</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#F5F5F0]/50 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span>Instant booking</span>
            </div>
          </div>
          
          <motion.button
            onClick={onBookWithAlfred}
            className="px-8 py-3 rounded-xl text-sm relative overflow-hidden flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              color: '#000000',
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 relative z-10">
              <Sparkles size={16} />
              <span className="uppercase tracking-wider">Book with Alfred</span>
            </div>
            
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
        </div>
      </div>
    </div>
  );
}
