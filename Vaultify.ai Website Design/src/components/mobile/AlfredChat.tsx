import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, CreditCard, Sparkles, Check, Wallet } from 'lucide-react';
import { ExperienceData } from './ExperienceDetail';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Message {
  id: number;
  isUser: boolean;
  text?: string;
  delay?: number;
  type?: 'text' | 'quick-reply' | 'payment' | 'confirmation' | 'image' | 'recommendations';
  options?: string[];
  imageUrl?: string;
  paymentData?: {
    amount: string;
    description: string;
  };
  confirmationData?: {
    title: string;
    location: string;
    image: string;
    details: string[];
  };
  recommendations?: Array<{
    id: string;
    title: string;
    description: string;
    price: string;
    image: string;
  }>;
}

interface AlfredChatProps {
  conversationId?: string;
  bookingContext?: any | null;
  onBack?: () => void;
}

export function AlfredChat({ conversationId = 'new', bookingContext, onBack }: AlfredChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isInteractive, setIsInteractive] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'crypto'>('card');

  // Different conversation threads based on conversationId
  const conversationThreads: Record<string, Message[]> = {
    'monaco-trip': [
      { id: 1, isUser: true, text: "Alfred, I'm planning a Monaco getaway next week. I need a Patek Philippe Nautilus, penthouse at Hotel de Paris, yacht charter, and private jet from London." },
      { id: 2, isUser: false, text: "Love it. Monaco next week — let me pull everything together for you.\n\nI'm checking:\n• Patek Nautilus availability through our verified dealers\n• Hotel de Paris penthouse for 3 nights\n• Yacht options in Monaco Bay\n• Private jet from London to Nice\n\nGive me just a moment..." },
      { id: 3, isUser: true, text: "Perfect. What's the Nautilus price and delivery?" },
      { id: 4, isUser: false, text: "Good news on the Nautilus. I've got two options:\n\n1. £145,000 — Brand new 2023, unworn\n2. £138,500 — Excellent condition 2022 (this one's a steal honestly)\n\nFor delivery, I can either have it couriered directly to your hotel, or we can hand-carry it on your private jet. What works better for you?" },
      { id: 5, isUser: true, text: "Dealer 2, hand-carry on the jet. Confirm the penthouse and yacht too." },
      { id: 6, isUser: false, text: "Perfect choice. Here's where we're at:\n\n✅ Patek Nautilus (2022) — £138,500 via USDT\n✅ Hotel de Paris Penthouse — £12,400/night × 3 nights\n✅ 150ft Azimut Yacht — £48,000 for 3 days\n\nThe watch will be waiting for you on the jet. Now, which day next week works for your departure?" },
      { id: 7, isUser: true, text: "Thursday morning, early departure." },
      { id: 8, isUser: false, text: "Okay, let me see what's available Thursday morning from London to Nice...\n\nI've got three solid options:\n\n• Citation Longitude — 08:00 departure, 1h 45m, £24,800\n• Global 6000 — 07:30 departure, 1h 40m, £32,400 ✦\n• Falcon 8X — 08:30 departure, 1h 50m, £28,600\n\nThe Global 6000 is my pick if you want the earliest departure. Thoughts?" },
      { id: 9, isUser: true, text: "Global 6000. Pay everything with USDC." },
      { id: 10, isUser: false, text: "Done. Everything's confirmed.\n\nGlobal 6000 — Thursday 07:30 → £32,400\nPatek Nautilus 5711 → £138,500\nHotel de Paris Penthouse (3 nights) → £37,200\nAzimut 150ft Yacht (3 days) → £48,000\n\nTotal: £256,100 (USDC payment secured in escrow)\n\nYour watch will be on the jet when you board. Penthouse check-in is at 14:00, and the yacht crew will be ready for you Friday morning at 10:00 in Port Hercules.\n\nYou're all set. Enjoy Monaco! 🇲🇨" },
    ],
    'dubai-nye': [
      { id: 1, isUser: true, text: "Alfred, I want to do something extraordinary for New Year's Eve in Dubai. Budget is flexible." },
      { id: 2, isUser: false, text: "Okay, Dubai for NYE — that's always incredible. I've got a few ideas that would be pretty special:\n\nThe Burj Khalifa Royal Suite with your own private terrace for the fireworks\n\nA 200ft+ yacht positioned perfectly by the Burj Al Arab for the show\n\nOr the new Atlantis Royal sky pool suite with VIP party access\n\nWhich one sounds more like your vibe?" },
      { id: 3, isUser: true, text: "Tell me more about the Burj Khalifa Royal Suite option." },
      { id: 4, isUser: false, text: "Ah, the Armani suite. Honestly one of the best spots in the world for NYE.\n\nYou'd have floors 38-39, about 390 square meters. Private terrace with completely unobstructed views of the fireworks — literally the best seat in Dubai. Butler service, private chef, the works.\n\nI can get you 4 nights (Dec 30 - Jan 3) for £185,000.\n\nWant me to add helicopter transfers from the airport? And I know an incredible chef who does private dining experiences if you're interested." },
    ],
    'new': [
      { id: 1, isUser: false, text: "Hey there! I'm Alfred.\n\nWhatever you need — private jets, hard-to-find watches, villa bookings, yacht charters, exclusive reservations — I'll handle it.\n\nWhat can I help you with today?" },
    ],
  };

  // Generate contextual recommendations based on the experience
  const getRecommendations = (experience: ExperienceData) => {
    const expTitle = experience.title.toLowerCase();
    const expTag = experience.tag.toLowerCase();
    
    // Yacht experiences
    if (expTitle.includes('yacht') || expTag.includes('yacht')) {
      return [
        {
          id: 'chef-upgrade',
          title: 'Michelin-Star Private Chef',
          description: 'Award-winning chef for personalized dining',
          price: '£8,500/day',
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'watersports',
          title: 'Premium Water Sports Package',
          description: 'Jet skis, diving gear, and instructor',
          price: '£3,200',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'underwater-photo',
          title: 'Professional Underwater Photography',
          description: 'Capture your memories in 4K',
          price: '£2,800',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        }
      ];
    }
    
    // Villa/Hotel experiences
    if (expTitle.includes('villa') || expTitle.includes('hotel') || expTitle.includes('suite') || expTag.includes('hotel')) {
      return [
        {
          id: 'spa-wellness',
          title: 'Private Spa & Wellness Suite',
          description: 'In-villa massages and treatments',
          price: '£4,500',
          image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'private-chef',
          title: 'Personal Chef Service',
          description: 'Customized meals for your entire stay',
          price: '£6,800',
          image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'wine-sommelier',
          title: 'Private Wine Sommelier',
          description: 'Curated tastings and rare vintages',
          price: '£3,400',
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        }
      ];
    }
    
    // Private jet experiences
    if (expTitle.includes('jet') || expTitle.includes('flight') || expTag.includes('jet')) {
      return [
        {
          id: 'lounge-access',
          title: 'Exclusive Airport Lounge',
          description: 'VIP lounge with spa and dining',
          price: '£1,200',
          image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'inflight-chef',
          title: 'In-Flight Celebrity Chef',
          description: 'Gordon Ramsay-trained chef on board',
          price: '£12,500',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'heli-transfer',
          title: 'Helicopter Ground Transfer',
          description: 'Skip traffic with private helicopter',
          price: '£8,900',
          image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        }
      ];
    }
    
    // Supercar experiences
    if (expTitle.includes('car') || expTitle.includes('ferrari') || expTitle.includes('lamborghini') || expTag.includes('supercar')) {
      return [
        {
          id: 'track-day',
          title: 'Private Track Day Experience',
          description: 'Exclusive circuit access with instructor',
          price: '£15,000',
          image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'pro-photoshoot',
          title: 'Professional Automotive Photography',
          description: 'Studio-quality photos and videos',
          price: '£3,800',
          image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'exotic-swap',
          title: 'Exotic Car Swap Program',
          description: 'Switch to different supercars daily',
          price: '£12,000',
          image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        }
      ];
    }
    
    // Monaco/Casino experiences
    if (experience.location.toLowerCase().includes('monaco') || expTitle.includes('casino')) {
      return [
        {
          id: 'poker-room',
          title: 'Private Poker Room at Casino de Monte-Carlo',
          description: 'High-stakes table with pro dealer',
          price: '£25,000',
          image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'yacht-charter',
          title: 'Monaco Bay Yacht Charter',
          description: '120ft yacht for Grand Prix weekend',
          price: '£85,000',
          image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'heli-tour',
          title: 'French Riviera Helicopter Tour',
          description: 'Aerial tour of Monaco and surrounding area',
          price: '£4,500',
          image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        }
      ];
    }
    
    // Dubai experiences
    if (experience.location.toLowerCase().includes('dubai')) {
      return [
        {
          id: 'burj-dining',
          title: 'At.mosphere Burj Khalifa Private Dining',
          description: 'Exclusive chef\'s table at 122nd floor',
          price: '£8,500',
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'desert-experience',
          title: 'Luxury Desert Safari & Falconry',
          description: 'Private camp with royal falconry display',
          price: '£12,000',
          image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        {
          id: 'shopping-concierge',
          title: 'Personal Shopping at Dubai Mall',
          description: 'VIP stylist and after-hours access',
          price: '£5,500',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        }
      ];
    }
    
    // Default recommendations for any experience
    return [
      {
        id: 'concierge-upgrade',
        title: '24/7 Personal Concierge',
        description: 'Dedicated assistant for your entire trip',
        price: '£4,200',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
      },
      {
        id: 'photographer',
        title: 'Professional Travel Photographer',
        description: 'Capture every moment in stunning detail',
        price: '£3,800/day',
        image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
      },
      {
        id: 'security-detail',
        title: 'Private Security Detail',
        description: 'Discreet protection and peace of mind',
        price: '£6,500/day',
        image: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
      }
    ];
  };

  // Build interactive booking conversation if bookingContext is provided
  const buildBookingConversation = (experience: { title?: string; location?: string; image?: string }): Message[] => {
    const userName = "Marcus"; // Could be dynamic from user profile
    const title = experience.title || 'this hotel';
    const loc = experience.location || '';
    return [
      { 
        id: 1, 
        isUser: false, 
        text: `Hey ${userName}, looks like you're interested in booking ${title.toLowerCase()}${loc ? ` in ${loc}` : ''}.\n\nWould you like me to check availability for you?`,
        type: 'quick-reply',
        options: ['Yes, check availability', 'Tell me more first']
      },
    ];
  };

  // Determine the conversation to use
  const conversation = bookingContext 
    ? buildBookingConversation(bookingContext)
    : (conversationThreads[conversationId] || conversationThreads['new']);

  // Initialize conversation based on context - only runs when bookingContext or conversationId changes
  useEffect(() => {
    setIsInteractive(!!bookingContext);
    setCurrentStep(0);
    setMessages([]);
  }, [conversationId, bookingContext]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, showTyping]);

  // Conversation playback for pre-scripted conversations
  useEffect(() => {
    if (!isInteractive && currentStep < conversation.length) {
      const msg = conversation[currentStep];
      const delay = msg.isUser ? 1000 : 2000;

      const timer = setTimeout(() => {
        if (!msg.isUser) {
          setShowTyping(true);
          setTimeout(() => {
            setShowTyping(false);
            setMessages(prev => [...prev, msg]);
            setCurrentStep(prev => prev + 1);
          }, 1500);
        } else {
          setMessages(prev => [...prev, msg]);
          setCurrentStep(prev => prev + 1);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentStep, isInteractive, conversation]);

  // Start interactive booking flow
  useEffect(() => {
    if (isInteractive && currentStep === 0) {
      const timer = setTimeout(() => {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          setMessages([conversation[0]]);
          setCurrentStep(1);
        }, 1500);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInteractive]);

  // Handle quick reply selection
  const handleQuickReply = (option: string) => {
    if (!bookingContext) return;

    // Add user's choice
    const userMessage: Message = {
      id: messages.length + 1,
      isUser: true,
      text: option,
    };
    setMessages(prev => [...prev, userMessage]);

    // Determine Alfred's response based on the option
    if (option === 'Yes, check availability' || option === 'Check availability') {
      setTimeout(() => {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          const alfredResponse: Message = {
            id: messages.length + 2,
            isUser: false,
            type: 'image',
            imageUrl: bookingContext.image,
            text: `Perfect! I'm checking real-time availability for ${bookingContext.title} now...\n\nGreat news — it's available! ✨`,
          };
          setMessages(prev => [...prev, alfredResponse]);

          // Ask for dates
          setTimeout(() => {
            setShowTyping(true);
            setTimeout(() => {
              setShowTyping(false);
              const datesMessage: Message = {
                id: messages.length + 3,
                isUser: false,
                text: `When would you like to book this experience?\n\nI can get you in as early as this weekend.`,
                type: 'quick-reply',
                options: ['This Weekend', 'Next Week', 'Choose Custom Dates']
              };
              setMessages(prev => [...prev, datesMessage]);
            }, 1000);
          }, 2000);
        }, 1500);
      }, 500);
    } else if (option === 'Tell me more first') {
      setTimeout(() => {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          const infoResponse: Message = {
            id: messages.length + 2,
            isUser: false,
            text: `${bookingContext.description}\n\nDuration: ${bookingContext.duration}\nCapacity: Up to ${bookingContext.maxGuests}\n\nWould you like to check availability?`,
            type: 'quick-reply',
            options: ['Yes, check availability', 'Not right now']
          };
          setMessages(prev => [...prev, infoResponse]);
        }, 1500);
      }, 500);
    } else if (option === 'This Weekend' || option === 'Next Week' || option === 'Choose Custom Dates') {
      setTimeout(() => {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          const durationMessage: Message = {
            id: messages.length + 2,
            isUser: false,
            text: `Perfect timing! How many days would you like to book?`,
            type: 'quick-reply',
            options: ['1 Day', '3 Days', '7 Days', 'Custom Duration']
          };
          setMessages(prev => [...prev, durationMessage]);
        }, 1200);
      }, 500);
    } else if (option === '1 Day' || option === '3 Days' || option === '7 Days' || option === 'Custom Duration') {
      setTimeout(() => {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          const guestMessage: Message = {
            id: messages.length + 2,
            isUser: false,
            text: `Great choice! How many guests will be joining you?`,
            type: 'quick-reply',
            options: ['Just Me', '2 People', '4 People', 'More than 4']
          };
          setMessages(prev => [...prev, guestMessage]);
        }, 1200);
      }, 500);
    } else if (option === 'Just Me' || option === '2 People' || option === '4 People' || option === 'More than 4') {
      setTimeout(() => {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          const preferencesMessage: Message = {
            id: messages.length + 2,
            isUser: false,
            text: `Excellent. Any special requirements or preferences I should know about?\n\n(Dietary restrictions, accessibility needs, special occasions, etc.)`,
            type: 'quick-reply',
            options: ['No special requests', 'Yes, let me type them']
          };
          setMessages(prev => [...prev, preferencesMessage]);
        }, 1200);
      }, 500);
    } else if (option === 'No special requests') {
      // Move to payment
      setTimeout(() => {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          const confirmationMessage: Message = {
            id: messages.length + 2,
            isUser: false,
            text: `Perfect! Let me confirm all the details for you...`,
          };
          setMessages(prev => [...prev, confirmationMessage]);

          // Show confirmation with payment
          setTimeout(() => {
            setShowTyping(true);
            setTimeout(() => {
              setShowTyping(false);
              const paymentMessage: Message = {
                id: messages.length + 3,
                isUser: false,
                type: 'confirmation',
                confirmationData: {
                  title: bookingContext.title,
                  location: bookingContext.location,
                  image: bookingContext.image,
                  details: [
                    'Duration: 3 Days',
                    'Guests: 2 People',
                    'Check-in: This Weekend',
                    'All amenities included'
                  ]
                },
                text: `Everything looks perfect! Ready to confirm your booking?`,
              };
              setMessages(prev => [...prev, paymentMessage]);

              // Show payment UI
              setTimeout(() => {
                const paymentUIMessage: Message = {
                  id: messages.length + 4,
                  isUser: false,
                  type: 'payment',
                  paymentData: {
                    amount: bookingContext.price,
                    description: bookingContext.title
                  },
                };
                setMessages(prev => [...prev, paymentUIMessage]);
              }, 1000);
            }, 1500);
          }, 1500);
        }, 1200);
      }, 500);
    } else if (option === 'Not right now') {
      setTimeout(() => {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          const closingMessage: Message = {
            id: messages.length + 2,
            isUser: false,
            text: `No problem at all! I'll be here whenever you're ready.\n\nFeel free to explore more experiences or reach out if you have any questions. 🌟`,
          };
          setMessages(prev => [...prev, closingMessage]);
        }, 1200);
      }, 500);
    }
  };

  // Handle payment confirmation
  const handlePaymentConfirm = () => {
    if (!bookingContext) return;

    const paymentMethodText = selectedPaymentMethod === 'crypto' ? 'USDC' : 'card';
    
    setTimeout(() => {
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        const processingMessage: Message = {
          id: messages.length + 1,
          isUser: false,
          text: `Processing your ${paymentMethodText} payment... ✨`,
        };
        setMessages(prev => [...prev, processingMessage]);

        // Final confirmation
        setTimeout(() => {
          setShowTyping(true);
          setTimeout(() => {
            setShowTyping(false);
            const userName = "Marcus";
            const finalMessage: Message = {
              id: messages.length + 2,
              isUser: false,
              text: `All set, ${userName}! Your booking is confirmed. 🎉\n\nYou'll receive the complete itinerary and confirmation details at your email within the next few minutes.\n\nA member of our concierge team will reach out 48 hours before your experience to coordinate final details.\n\nLooking forward to making this exceptional for you!`,
            };
            setMessages(prev => [...prev, finalMessage]);

            // Show personalized recommendations
            setTimeout(() => {
              setShowTyping(true);
              setTimeout(() => {
                setShowTyping(false);
                const recommendations = getRecommendations(bookingContext);
                const recMessage: Message = {
                  id: messages.length + 3,
                  isUser: false,
                  text: `I noticed you're booking ${bookingContext.title.toLowerCase()}. Based on your preferences, here are a few add-ons that might enhance your experience:`,
                  type: 'recommendations',
                  recommendations: recommendations,
                };
                setMessages(prev => [...prev, recMessage]);
              }, 1500);
            }, 2000);
          }, 2000);
        }, 2000);
      }, 1000);
    }, 300);
  };

  // Handle adding recommendation to booking
  const handleAddRecommendation = (recId: string, recTitle: string) => {
    const userMessage: Message = {
      id: messages.length + 1,
      isUser: true,
      text: `Add ${recTitle}`,
    };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        const alfredResponse: Message = {
          id: messages.length + 2,
          isUser: false,
          text: `Perfect! I've added ${recTitle} to your booking. You'll see the updated total in your confirmation email.\n\nAnything else I can help you with?`,
        };
        setMessages(prev => [...prev, alfredResponse]);
      }, 1200);
    }, 500);
  };

  // Handle declining recommendations
  const handleDeclineRecommendations = () => {
    const userMessage: Message = {
      id: messages.length + 1,
      isUser: true,
      text: "No thanks, I'm all set",
    };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        const alfredResponse: Message = {
          id: messages.length + 2,
          isUser: false,
          text: `Sounds good! You're all set then.\n\nIf you change your mind or need anything else, I'm here 24/7. Enjoy your experience! ✨`,
        };
        setMessages(prev => [...prev, alfredResponse]);
      }, 1200);
    }, 500);
  };

  // Handle manual text input
  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      isUser: true,
      text: userInput,
    };

    setMessages(prev => [...prev, newMessage]);
    setUserInput('');

    // Alfred's response to custom input
    setTimeout(() => {
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        const response: Message = {
          id: messages.length + 2,
          isUser: false,
          text: `Got it — I've noted your preferences. Let me pull everything together for you.`,
          type: 'quick-reply',
          options: ['Continue to payment', 'Make changes']
        };
        setMessages(prev => [...prev, response]);
      }, 1500);
    }, 500);
  };

  // Get conversation title based on ID
  const getConversationTitle = () => {
    if (bookingContext) {
      return 'Book with Alfred';
    }
    const titles: Record<string, string> = {
      'monaco-trip': 'Monaco Grand Prix Weekend',
      'dubai-nye': "Dubai New Year's Eve",
      'ski-aspen': 'Aspen Ski Trip Planning',
      'yacht-mediterranean': 'Mediterranean Yacht Charter',
      'art-basel': 'Art Basel Miami Access',
      'new': 'New Conversation',
    };
    return titles[conversationId] || 'Chat with Alfred';
  };

  return (
    <div className="h-full flex flex-col bg-[#000000]">
      {/* Header */}
      <div 
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl border-b"
        style={{
          background: 'rgba(0,0,0,0.9)',
          borderColor: 'rgba(212,175,122,0.15)',
        }}
      >
        {onBack && (
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
        )}

        <div className="flex-1 flex items-center gap-3 ml-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #B8935E, #D4AF7A)',
            }}
          >
            <Sparkles size={18} style={{ color: '#000000' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm text-[#F5F5F0] truncate">{getConversationTitle()}</h2>
            <div className="flex items-center gap-1.5 text-xs text-[#F5F5F0]/60">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
      >
        <AnimatePresence>
          {messages.filter(msg => msg && typeof msg === 'object').map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                {/* Image message type */}
                {message.type === 'image' && message.imageUrl && !message.isUser && (
                  <div className="mb-3">
                    <div 
                      className="w-full h-48 rounded-2xl overflow-hidden"
                      style={{
                        border: '1px solid rgba(212,175,122,0.2)',
                      }}
                    >
                      <ImageWithFallback
                        src={message.imageUrl}
                        alt="Experience preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Confirmation card */}
                {message.type === 'confirmation' && message.confirmationData && !message.isUser && (
                  <div 
                    className="mb-4 rounded-2xl overflow-hidden"
                    style={{
                      border: '1px solid rgba(212,175,122,0.3)',
                      background: 'rgba(45,45,45,0.4)',
                    }}
                  >
                    <div className="h-40 relative">
                      <ImageWithFallback
                        src={message.confirmationData.image}
                        alt={message.confirmationData.title}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
                        }}
                      />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-sm text-[#F5F5F0] mb-0.5">{message.confirmationData.title}</h3>
                        <p className="text-xs text-[#F5F5F0]/70">{message.confirmationData.location}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      {message.confirmationData.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-[#F5F5F0]/80">
                          <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: 'rgba(212,175,122,0.2)',
                              border: '1px solid rgba(212,175,122,0.3)',
                            }}
                          >
                            <Check size={10} style={{ color: '#D4AF7A' }} />
                          </div>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment UI */}
                {message.type === 'payment' && message.paymentData && !message.isUser && (
                  <div 
                    className="mb-4 p-5 rounded-2xl"
                    style={{
                      border: '1px solid rgba(212,175,122,0.3)',
                      background: 'rgba(45,45,45,0.4)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-[#F5F5F0]/60 uppercase tracking-wider">Total Amount</span>
                      <div 
                        className="text-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                        }}
                      >
                        {message.paymentData.amount}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-xs text-[#F5F5F0]/60 uppercase tracking-wider mb-3 block">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          onClick={() => setSelectedPaymentMethod('card')}
                          className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
                          style={{
                            background: selectedPaymentMethod === 'card' 
                              ? 'linear-gradient(135deg, rgba(184,147,94,0.15), rgba(212,175,122,0.1))'
                              : 'rgba(45,45,45,0.6)',
                            border: selectedPaymentMethod === 'card'
                              ? '1.5px solid rgba(212,175,122,0.5)'
                              : '1px solid rgba(212,175,122,0.2)',
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CreditCard size={24} style={{ color: '#D4AF7A' }} />
                          <span className="text-xs text-[#F5F5F0]">Card / Wire</span>
                        </motion.button>

                        <motion.button
                          onClick={() => setSelectedPaymentMethod('crypto')}
                          className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
                          style={{
                            background: selectedPaymentMethod === 'crypto' 
                              ? 'linear-gradient(135deg, rgba(184,147,94,0.15), rgba(212,175,122,0.1))'
                              : 'rgba(45,45,45,0.6)',
                            border: selectedPaymentMethod === 'crypto'
                              ? '1.5px solid rgba(212,175,122,0.5)'
                              : '1px solid rgba(212,175,122,0.2)',
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Wallet size={24} style={{ color: '#D4AF7A' }} />
                          <span className="text-xs text-[#F5F5F0]">Stablecoin</span>
                        </motion.button>
                      </div>
                    </div>

                    <motion.button
                      onClick={handlePaymentConfirm}
                      className="w-full py-4 rounded-xl text-sm relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
                        color: '#000000',
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center gap-2 relative z-10">
                        <Check size={18} />
                        <span className="uppercase tracking-wider">Confirm Booking</span>
                      </div>
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

                    <p className="text-xs text-center text-[#F5F5F0]/50 mt-3">
                      🔒 Secure payment processed via Stripe & Circle
                    </p>
                  </div>
                )}

                {/* Text message bubble */}
                {message.text && (
                  <div
                    className={`px-5 py-3 rounded-2xl ${
                      message.isUser
                        ? 'rounded-tr-sm'
                        : 'rounded-tl-sm'
                    }`}
                    style={{
                      background: message.isUser
                        ? 'linear-gradient(135deg, #B8935E, #D4AF7A)'
                        : 'rgba(45,45,45,0.8)',
                      border: message.isUser
                        ? 'none'
                        : '1px solid rgba(212,175,122,0.2)',
                      color: message.isUser ? '#000000' : '#F5F5F0',
                    }}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.text}
                    </p>
                  </div>
                )}

                {/* Recommendations cards */}
                {message.type === 'recommendations' && message.recommendations && !message.isUser && (
                  <div className="mt-4 space-y-3">
                    {message.recommendations.map((rec, idx) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          border: '1px solid rgba(212,175,122,0.3)',
                          background: 'rgba(45,45,45,0.4)',
                        }}
                      >
                        <div className="flex gap-3 p-3">
                          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                            <ImageWithFallback
                              src={rec.image}
                              alt={rec.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm text-[#F5F5F0] mb-1 line-clamp-1">{rec.title}</h4>
                            <p className="text-xs text-[#F5F5F0]/60 mb-2 line-clamp-2">{rec.description}</p>
                            <div className="flex items-center justify-between gap-2">
                              <span 
                                className="text-sm"
                                style={{
                                  background: 'linear-gradient(135deg, #B8935E, #D4AF7A)',
                                  backgroundClip: 'text',
                                  WebkitBackgroundClip: 'text',
                                  color: 'transparent',
                                }}
                              >
                                {rec.price}
                              </span>
                              <motion.button
                                onClick={() => handleAddRecommendation(rec.id, rec.title)}
                                className="px-3 py-1.5 rounded-lg text-xs"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(184,147,94,0.15), rgba(212,175,122,0.1))',
                                  border: '1px solid rgba(212,175,122,0.4)',
                                  color: '#D4AF7A',
                                }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Add
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Decline all button */}
                    <motion.button
                      onClick={handleDeclineRecommendations}
                      className="w-full py-3 rounded-xl text-xs text-center"
                      style={{
                        border: '1px solid rgba(212,175,122,0.2)',
                        color: '#F5F5F0/60',
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      No thanks, I'm all set
                    </motion.button>
                  </div>
                )}

                {/* Quick reply options */}
                {message.type === 'quick-reply' && message.options && !message.isUser && index === messages.length - 1 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleQuickReply(option)}
                        className="px-4 py-2.5 rounded-full text-xs"
                        style={{
                          background: 'rgba(45,45,45,0.8)',
                          border: '1px solid rgba(212,175,122,0.3)',
                          color: '#D4AF7A',
                        }}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ 
                          background: 'linear-gradient(135deg, rgba(184,147,94,0.2), rgba(212,175,122,0.15))',
                        }}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {showTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div
                className="px-5 py-3 rounded-2xl rounded-tl-sm"
                style={{
                  background: 'rgba(45,45,45,0.8)',
                  border: '1px solid rgba(212,175,122,0.2)',
                }}
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ background: '#D4AF7A' }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div 
        className="px-6 py-4 border-t"
        style={{
          background: 'rgba(0,0,0,0.95)',
          borderColor: 'rgba(212,175,122,0.15)',
        }}
      >
        <div 
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(45,45,45,0.6)',
            border: '1px solid rgba(212,175,122,0.2)',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-sm text-[#F5F5F0] placeholder-[#F5F5F0]/40 outline-none"
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!userInput.trim()}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: userInput.trim()
                ? 'linear-gradient(135deg, #B8935E, #D4AF7A)'
                : 'rgba(45,45,45,0.6)',
              opacity: userInput.trim() ? 1 : 0.5,
            }}
            whileTap={userInput.trim() ? { scale: 0.9 } : {}}
          >
            <Send size={16} style={{ color: userInput.trim() ? '#000000' : '#666' }} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
