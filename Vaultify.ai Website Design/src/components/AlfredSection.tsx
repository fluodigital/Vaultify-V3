import { motion, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

// Alfred AI pulse orb component
function AlfredOrb({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      {/* Outer pulse rings */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#CDAF68]/20 border border-[#CDAF68]/40"
        animate={{
          scale: isActive ? [1, 1.8, 1] : 1,
          opacity: isActive ? [0.5, 0, 0.5] : 0.3
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-[#CDAF68]/30"
        animate={{
          scale: isActive ? [1, 1.4, 1] : 1,
          opacity: isActive ? [0.6, 0.2, 0.6] : 0.4
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      
      {/* Core orb */}
      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#CDAF68] via-[#E5E4E2] to-[#CDAF68] shadow-lg shadow-[#CDAF68]/50">
        <motion.div
          className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]"
          animate={{
            opacity: isActive ? [0.3, 0.6, 0.3] : 0.5
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: isActive 
              ? ['0 0 20px rgba(205,175,104,0.6)', '0 0 40px rgba(205,175,104,0.9)', '0 0 20px rgba(205,175,104,0.6)']
              : '0 0 20px rgba(205,175,104,0.4)'
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

// Typing indicator
function TypingIndicator() {
  return (
    <div className="flex gap-2 items-center py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 bg-[#CDAF68]/70 rounded-full"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15
          }}
        />
      ))}
    </div>
  );
}

// Chat message component
function ChatMessage({ 
  message, 
  isUser, 
  delay = 0,
  showTyping = false,
  children 
}: { 
  message?: string; 
  isUser: boolean; 
  delay?: number;
  showTyping?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-4`}
    >
      {!isUser && (
        <div className="flex-shrink-0 mt-2">
          <AlfredOrb isActive={showTyping} />
        </div>
      )}
      <div
        className={`max-w-[75%] ${
          isUser
            ? 'bg-gradient-to-br from-[#CDAF68] to-[#B39858] text-[#0A0A0A] rounded-3xl rounded-br-md px-7 py-5 shadow-lg shadow-[#CDAF68]/20'
            : 'bg-gradient-to-br from-[#1a1a2e]/90 to-[#0A0A0A]/90 text-[#E5E4E2] rounded-3xl rounded-bl-md px-7 py-5 backdrop-blur-xl border border-[#CDAF68]/20 shadow-xl'
        }`}
      >
        {showTyping ? (
          <TypingIndicator />
        ) : (
          children || <p className="leading-relaxed">{message}</p>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 mt-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E5E4E2] to-[#CDAF68] flex items-center justify-center shadow-lg">
            <div className="w-10 h-10 rounded-full bg-[#0A0A0A] flex items-center justify-center text-[#CDAF68] text-sm">
              You
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function AlfredSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [chatStep, setChatStep] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    const timings = [
      { step: 1, delay: 1000 },   // User message
      { step: 2, delay: 2500 },   // Typing indicator
      { step: 3, delay: 4000 },   // Alfred checking
      { step: 4, delay: 6500 },   // Alfred options
      { step: 5, delay: 10000 },  // User confirmation
      { step: 6, delay: 11000 },  // Typing indicator 2
      { step: 7, delay: 12500 },  // Final confirmation
    ];

    const timeouts: NodeJS.Timeout[] = [];

    timings.forEach(({ step, delay }) => {
      const timeout = setTimeout(() => {
        setChatStep(step);
        if (step === 7) {
          setTimeout(() => setShowConfirmation(true), 500);
        }
      }, delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isInView]);

  return (
    <section ref={ref} className="relative py-40 px-6 overflow-hidden bg-gradient-to-b from-[#000000] via-[#0A0A0A] to-[#000000]">
      {/* Cinematic spotlight effect */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(205,175,104,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [0.9, 1.1, 0.9]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(205, 175, 104, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(205, 175, 104, 0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Header section - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-6 py-2 mb-8 border border-[#CDAF68]/30 bg-[#CDAF68]/5 backdrop-blur-sm"
          >
            <Sparkles className="text-[#CDAF68]" size={14} />
            <span className="text-xs uppercase tracking-[0.4em] text-[#CDAF68]">
              Meet Alfred — Your Private AI Concierge
            </span>
            <Sparkles className="text-[#CDAF68]" size={14} />
          </motion.div>

          <h2 className="text-5xl md:text-7xl lg:text-8xl text-[#E5E4E2] mb-8 tracking-tight leading-[1.1]">
            Speak Once.
            <br />
            <motion.span 
              className="text-[#CDAF68]"
              animate={{
                textShadow: [
                  '0 0 30px rgba(205,175,104,0.3)',
                  '0 0 60px rgba(205,175,104,0.5)',
                  '0 0 30px rgba(205,175,104,0.3)'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Fly Private.
            </motion.span>
          </h2>
          
          <motion.p 
            className="text-xl md:text-2xl text-[#E5E4E2]/60 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            Alfred turns luxury booking into a single secure conversation.
            <br />
            <span className="text-[#E5E4E2]/40">No forms. No apps. No waiting.</span>
          </motion.p>
        </motion.div>

        {/* Main chat theater */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
          className="relative"
        >
          {/* Theater frame with premium glass effect */}
          <div className="relative bg-gradient-to-br from-[#0A0A0A]/40 via-[#1a1a2e]/30 to-[#0A0A0A]/40 backdrop-blur-3xl border border-[#CDAF68]/20 rounded-3xl overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-[#CDAF68] to-transparent"
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scaleX: [0.5, 1, 0.5]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-[#CDAF68]/40 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-[#CDAF68]/40 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-[#CDAF68]/40 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-[#CDAF68]/40 rounded-br-3xl" />

            {/* Chat content area */}
            <div className="relative p-12 md:p-16 space-y-8 min-h-[600px]">
              
              {/* Initial user message */}
              {chatStep >= 1 && (
                <ChatMessage isUser delay={0}>
                  <p>Alfred, I need a G650 from London to Dubai this Friday. 4 passengers, departing 9 AM.</p>
                </ChatMessage>
              )}

              {/* Typing indicator */}
              {chatStep === 2 && (
                <ChatMessage isUser={false} showTyping delay={0} />
              )}

              {/* Alfred checking response */}
              {chatStep >= 3 && (
                <ChatMessage isUser={false} delay={0}>
                  <div className="space-y-3">
                    <p>Got it. Let me check what's available for Friday morning...</p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.6] }}
                      transition={{ duration: 2, repeat: 2 }}
                      className="flex items-center gap-2 text-sm text-[#CDAF68]/70 italic pt-2"
                    >
                      <motion.div
                        className="w-1.5 h-1.5 bg-[#CDAF68] rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      pulling from verified network...
                    </motion.div>
                  </div>
                </ChatMessage>
              )}

              {/* Alfred detailed options */}
              {chatStep >= 4 && (
                <ChatMessage isUser={false} delay={0}>
                  <div className="space-y-5">
                    <p className="text-base">Perfect, I've got three great options for you:</p>
                    
                    <div className="space-y-4 pl-5 border-l-2 border-[#CDAF68]/20">
                      {/* Option 1 */}
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-6">
                          <span className="text-[#E5E4E2]">G650</span>
                          <span className="text-[#CDAF68] tabular-nums">£82,400</span>
                        </div>
                        <p className="text-sm text-[#E5E4E2]/50">Direct flight, just under 7 hours</p>
                      </div>

                      {/* Option 2 - Highlighted */}
                      <motion.div 
                        className="space-y-1.5 -ml-5 pl-5 pr-4 py-3 bg-[#CDAF68]/10 border-l-2 border-[#CDAF68] rounded-r-lg"
                        animate={{
                          backgroundColor: ['rgba(205,175,104,0.1)', 'rgba(205,175,104,0.15)', 'rgba(205,175,104,0.1)']
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <span className="text-[#E5E4E2]">Global 7500</span>
                          <span className="text-[#CDAF68] tabular-nums">£94,200</span>
                        </div>
                        <p className="text-sm text-[#E5E4E2]/50">My recommendation — onboard Wi-Fi & full catering included</p>
                      </motion.div>

                      {/* Option 3 */}
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-6">
                          <span className="text-[#E5E4E2]">Falcon 8X</span>
                          <span className="text-[#CDAF68] tabular-nums">£87,950</span>
                        </div>
                        <p className="text-sm text-[#E5E4E2]/50">Comes with VIP ground transfer on both ends</p>
                      </div>
                    </div>

                    <p className="text-sm text-[#E5E4E2]/60 pt-3 border-t border-[#CDAF68]/10">
                      You can pay however you'd like — card, wire, or crypto. Should I go ahead and book the Global 7500?
                    </p>
                  </div>
                </ChatMessage>
              )}

              {/* User confirmation */}
              {chatStep >= 5 && (
                <ChatMessage isUser delay={0}>
                  <p>Yes, confirm the Global 7500 and charge via USDC.</p>
                </ChatMessage>
              )}

              {/* Typing indicator 2 */}
              {chatStep === 6 && (
                <ChatMessage isUser={false} showTyping delay={0} />
              )}

              {/* Final confirmation */}
              {chatStep >= 7 && (
                <ChatMessage isUser={false} delay={0}>
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="flex items-center gap-3 text-[#CDAF68]"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="w-6 h-6 border-2 border-[#CDAF68] border-t-transparent rounded-full"
                      />
                      <span className="text-base">All Set</span>
                    </motion.div>
                    <p>You're booked on the Global 7500. Payment's secured via USDC escrow.</p>
                    <div className="text-sm text-[#E5E4E2]/60 space-y-1 pt-2">
                      <p>I'll send over your full itinerary and chauffeur details in about 90 seconds.</p>
                      <p>Have a great flight ✈️</p>
                    </div>
                  </div>
                </ChatMessage>
              )}

              {/* Confirmation badge overlay */}
              {showConfirmation && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex justify-center pt-8"
                >
                  <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#CDAF68] to-[#B39858] rounded-full shadow-2xl shadow-[#CDAF68]/40">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="text-[#0A0A0A]" size={20} />
                    </motion.div>
                    <span className="text-[#0A0A0A] uppercase tracking-wider">
                      Booking Complete
                    </span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ✓
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Ambient shimmer effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.03, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
              style={{
                background: 'linear-gradient(135deg, transparent 40%, rgba(205,175,104,0.2) 50%, transparent 60%)',
              }}
            />
          </div>

          {/* Outer premium glow */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#CDAF68]/10 via-transparent to-[#CDAF68]/5 blur-3xl rounded-3xl" />
        </motion.div>

        {/* Bottom description and features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-20 text-center space-y-8"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-lg text-[#E5E4E2]/70 leading-relaxed">
              Alfred lives inside the Vaultfy app, understanding your preferences and executing bookings with precision. 
              He verifies availability across our partner network, confirms secure payments, 
              and handles every detail — <span className="text-[#CDAF68]">in minutes, not days.</span>
            </p>
            <p className="text-base text-[#E5E4E2]/50 leading-relaxed">
              Every interaction is fully encrypted. Every payment verified. 
              Every experience executed flawlessly.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            {['Encrypted', 'Instant', 'Verified', 'Seamless'].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1.4 + i * 0.1 }}
                className="px-6 py-2 border border-[#CDAF68]/20 bg-[#CDAF68]/5 backdrop-blur-sm rounded-full"
              >
                <span className="text-sm text-[#E5E4E2]/80">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.8 }}
            className="pt-12"
          >
            <p className="text-2xl md:text-3xl text-[#CDAF68] italic">
              Luxury that listens. Intelligence that acts.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#000000] to-transparent pointer-events-none" />
    </section>
  );
}