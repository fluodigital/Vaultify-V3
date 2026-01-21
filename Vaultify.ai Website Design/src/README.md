# 🏰 Vaultify.ai - Luxury AI Concierge Platform

> "Luxury that listens. Intelligence that acts."

A premium concierge platform for high net-worth individuals and crypto millionaires. Book private jets, supercars, yachts, villas, and five-star hotels in under two minutes using card, wire, or stablecoin payments.

## 🚀 Quick Start (Figma Make)

Your app is published via Figma Make. To enable all features:

### 1️⃣ Add Your API Keys

**Open this file:** `/lib/config.ts`

```typescript
export const config = {
  // 🗺️ Add your Google Maps API key here (for map view)
  googleMapsApiKey: 'YOUR_KEY_HERE',
  
  // 🔥 Add your Firebase config here (for authentication)
  firebase: {
    apiKey: 'YOUR_KEY_HERE',
    // ... rest of config
  },
}
```

### 2️⃣ Get Your API Keys

**Google Maps** (Required for map feature):
- Visit: https://console.cloud.google.com/google/maps-apis
- Enable: Maps JavaScript API + Maps Marker API
- Copy your API key → Paste in `/lib/config.ts`

**Firebase** (Required for authentication):
- Visit: https://console.firebase.google.com
- Go to Project Settings → Your apps
- Copy config object → Paste in `/lib/config.ts`

**Stripe** (Optional - for payments):
- Visit: https://dashboard.stripe.com/apikeys
- Copy publishable key → Paste in `/lib/config.ts`

### 3️⃣ Test Your Setup

1. Open your app in the browser
2. Click "Request Access" → Login with email
3. Navigate to Dashboard → Click "Map" button
4. ✅ Map should load with champagne gold markers

## 📚 Documentation

- **[FIGMA_MAKE_SETUP.md](FIGMA_MAKE_SETUP.md)** - Complete setup guide for Figma Make
- **[GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md)** - Detailed Google Maps configuration
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Firebase backend setup
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment tips

## 🎨 Features

### Marketing Website
- ✨ Cinematic hero with luxury animations
- 🤖 Alfred AI introduction
- 💎 Exclusive membership section
- 📸 Lifestyle gallery
- 🌟 Testimonials and case studies
- 🔒 Smooth login flow

### Mobile App Experience
- 📱 Native mobile app interface
- 🗺️ Interactive luxury map with Google Maps
- 🎯 Curated experiences (Monaco GP, Aspen, Maldives)
- 💬 Alfred AI chat with natural conversations
- 📅 Booking management
- 👤 Profile and settings

### Technology Stack
- **Frontend:** React + TypeScript + Tailwind CSS
- **Maps:** Google Maps API with custom luxury styling
- **Backend:** Firebase (Auth, Firestore, Functions)
- **Payments:** Stripe (cards) + Circle (crypto)
- **AI:** OpenAI GPT-4 for Alfred concierge
- **Hosting:** Figma Make

## 🎨 Design System

**Color Palette:**
- Background: `#000000` (Pure Black)
- Primary: `#D4AF7A` (Champagne Gold)
- Secondary: `#B8935E` (Rich Gold)
- Text: `#F5F5F0` (Off-white)

**Typography:**
- Luxury sans-serif with elegant spacing
- Italic styling for names and emphasis
- Gradient gold for premium content

**Components:**
- Shadcn/ui library in `/components/ui`
- Custom mobile components in `/components/mobile`
- Figma-safe images with fallbacks

## 🗂️ Project Structure

```
├── /lib                    # Core utilities
│   ├── config.ts          # 🔑 ADD YOUR API KEYS HERE
│   ├── firebase.ts        # Firebase initialization
│   └── useAuth.ts         # Authentication hooks
│
├── /components            # React components
│   ├── /mobile           # Mobile app screens
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── InteractiveMap.tsx   # Google Maps integration
│   │   ├── AlfredChat.tsx       # AI concierge
│   │   └── ExperienceDetail.tsx # Booking details
│   ├── /ui               # Shadcn UI components
│   └── ...marketing      # Landing page sections
│
├── /functions            # Firebase Cloud Functions
│   └── /src
│       ├── alfred.ts     # AI responses
│       ├── payments.ts   # Payment processing
│       └── bookings.ts   # Booking management
│
└── /styles
    └── globals.css       # Global styles + Tailwind
```

## 🔐 Security

### API Key Security
- ✅ All keys in `/lib/config.ts` (single source of truth)
- ✅ Restrict keys in respective consoles (Google Cloud, Firebase)
- ✅ Use test keys during development
- ✅ Monitor usage and set billing alerts

### Best Practices
- Never commit sensitive keys to version control
- Use domain restrictions for all API keys
- Enable only required APIs
- Rotate keys periodically

## 💰 Cost Estimates (Free Tier)

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| **Google Maps** | $200/month (~28K loads) | $7 per 1K loads |
| **Firebase Auth** | Unlimited | Unlimited |
| **Firestore** | 50K reads/day | $0.06 per 100K reads |
| **Firebase Storage** | 5GB | $0.026 per GB |
| **Stripe** | No monthly fee | 2.9% + 30¢ per transaction |

## 🧪 Testing

### Test Login Flow
1. Click "Request Access"
2. Enter email: test@vaultify.ai
3. Click "Continue with Email"
4. Check console for magic link (in dev)

### Test Map View
1. Login to app
2. Navigate to Dashboard
3. Click "Map" button (next to tabs)
4. Should see interactive world map

### Test Alfred AI
1. Click Alfred chat button (bottom navigation)
2. Ask: "I want to book a private jet to Monaco"
3. Alfred should respond with natural conversation

### Test Booking Flow
1. Select an experience (e.g., Monaco Grand Prix)
2. View details and amenities
3. Click "Book Now"
4. Choose payment method
5. Complete booking (test mode)

## 🐛 Troubleshooting

### Map not loading?
```
❌ Shows: "Map Configuration Required"
✅ Fix: Add Google Maps API key in /lib/config.ts
```

### Login not working?
```
❌ Error: Firebase authentication failed
✅ Fix: Add Firebase config in /lib/config.ts
```

### Console errors?
```
❌ Error: "API key not valid"
✅ Fix: 
   1. Check key is correct in /lib/config.ts
   2. Verify API is enabled in console
   3. Check domain restrictions
```

## 📞 Support

For detailed setup help, see:
- **Quick Start:** [FIGMA_MAKE_SETUP.md](FIGMA_MAKE_SETUP.md)
- **Maps Issues:** [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md)
- **Backend Setup:** [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

## 🎯 Deployment Checklist

Before going live:

- [ ] Google Maps API key added
- [ ] Firebase configuration added
- [ ] API keys restricted in consoles
- [ ] Test login flow
- [ ] Test map interactions
- [ ] Test Alfred AI chat
- [ ] Test booking creation
- [ ] Test payment flows
- [ ] Monitor console for errors
- [ ] Set up billing alerts

## 🌟 Brand Guidelines

**Positioning:** "Luxury that listens. Intelligence that acts."

**Target Audience:**
- High net-worth individuals
- Crypto millionaires
- Luxury lifestyle enthusiasts

**Key Differentiators:**
- Under 2-minute booking time
- Alfred AI with human-like conversation
- Crypto payment options (USDC, USDT, EUROC, DAI)
- Real-time verified inventory
- Exclusive membership access

**Tone of Voice:**
- Sophisticated but approachable
- Confident, not arrogant
- Personal and attentive
- Natural, not robotic

---

**Built with ❤️ for those who demand excellence**

*Luxury that listens. Intelligence that acts.*
