# Vaultfy Frontend Architecture Guide

## Project Overview

**Vaultfy** is a luxury AI-powered exclusive club platform targeting high-net-worth individuals and crypto millionaires. The platform features a seamless transition from marketing website to native mobile app experience, with the tagline "Luxury that listens. Intelligence that acts."

**Brand Identity:**
- **Color Scheme:** Black (#000000) backgrounds with Champagne Gold (#D4AF7A) accents
- **Typography:** Custom font system defined in `styles/globals.css` - DO NOT override with Tailwind classes unless explicitly requested
- **Design Philosophy:** Elegant gradients on all gold elements, thin line icons (mobile app only), no emojis

---

## Technology Stack

### Core
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4.0** - Utility-first styling (no config file needed)
- **Vite** - Build tool

### Animation & Motion
- **Motion (motion/react)** - Primary animation library (formerly Framer Motion)
- Import syntax: `import { motion } from 'motion/react'`

### Routing
- **React Router v6** - Client-side routing
- All routes defined in `App.tsx`

### Backend & Database
- **Firebase** - Complete production stack
  - Authentication (Email/Password)
  - Firestore Database
  - Cloud Functions
  - Hosting
- API keys are embedded directly in code (Figma Make requirement - no environment variables)

### UI Components
- **shadcn/ui** - Component library located in `/components/ui`
- **Lucide React** - Icon library (thin line icons for mobile)
- **Recharts** - Chart library for data visualization

### Maps
- **Google Maps JavaScript API** - Interactive map view with custom markers

---

## Architecture Overview

### Application Structure

```
Vaultfy
├── Marketing Website (Desktop-first, responsive)
│   ├── Hero & Features
│   ├── Services Showcase
│   ├── Alfred AI Introduction
│   └── Membership Application
│
└── Mobile App Experience (Post-login)
    ├── Splash Screen
    ├── Dashboard (Monaco demo)
    ├── Alfred Chat (Multi-threaded)
    ├── Interactive Map View
    ├── Booking Flow
    ├── My Bookings
    └── Profile
```

### Key Design Patterns

1. **Props-based Communication**
   - Components receive handlers as props (e.g., `onMembershipClick`, `onLoginClick`)
   - Global state managed at App.tsx level
   - No Redux/Context - keeping it simple

2. **Conditional Rendering**
   - Marketing site shown when `!isLoggedIn`
   - Mobile app experience shown when `isLoggedIn`
   - Smooth transitions with Motion animations

3. **Responsive Design**
   - Mobile-first for app experience
   - Desktop-first for marketing site
   - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

---

## Styling System

### Color Palette

**Defined in `/styles/globals.css`:**

```css
--color-black: #000000;           /* Primary background */
--color-dark-gray: #0A0A0A;       /* Secondary background */
--color-medium-gray: #2D2D2D;     /* Cards/containers */
--color-light-gray: #F5F5F0;      /* Primary text */

--color-gold-dark: #B8935E;       /* Gradient start */
--color-gold-mid: #D4AF7A;        /* Primary gold */
--color-gold-light: #E6D5B8;      /* Gradient end */
```

**Important:** Champagne gold should ALWAYS use gradients:
```css
background: linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8);
```

### Typography Rules

**CRITICAL - DO NOT OVERRIDE:**
- Never use Tailwind font-size classes (text-xl, text-2xl, etc.)
- Never use Tailwind font-weight classes (font-bold, font-semibold, etc.)
- Never use Tailwind line-height classes (leading-tight, etc.)

Default typography is configured in `globals.css` for each HTML element (h1, h2, p, etc.). Only override when user explicitly requests font changes.

### Tailwind Usage

**Safe to use:**
- Layout (flex, grid, gap, etc.)
- Spacing (p-, m-, px-, py-, etc.)
- Colors (bg-[#000000], text-[#D4AF7A], etc.)
- Borders (border, rounded-, etc.)
- Positioning (absolute, relative, fixed, etc.)
- Transforms (translate, rotate, scale, etc.)

**Avoid:**
- Typography utilities (unless requested)
- Complex animations (use Motion instead)

---

## Component Organization

### `/components` - Shared Components

#### Navigation Components
- **`ModernNavigation.tsx`** - Main desktop/mobile navigation with hamburger menu
  - Props: `onLoginClick`, `onMembershipClick`
  - Features: Transparent-to-solid scroll effect, responsive menu
  
- **`LuxuryNavigation.tsx`** - Alternative navigation style (legacy)
- **`Navigation.tsx`** - Original navigation (legacy)

#### Hero Sections
- **`StunningHero.tsx`** - Primary hero with lifestyle animations
  - Props: `onMembershipClick`
  - Features: Animated gradient orbs, floating particles, jet/yacht/car animations
  
- **`VelocityHero.tsx`** - Alternative hero style
- **`CinematicHero.tsx`** - Video-style hero
- **`HeroSection.tsx`** - Original hero (legacy)

#### Feature Sections
- **`AlfredSection.tsx`** - Alfred AI introduction
- **`ExclusiveMembershipSection.tsx`** - Membership benefits
  - Props: `onMembershipClick`
- **`PartnersSection.tsx`** - Trust indicators (logo placeholders removed)
- **`InfrastructureSection.tsx`** - Platform capabilities
- **`DigitalWealthSection.tsx`** - Crypto/Web3 positioning

#### Forms & Modals
- **`MembershipApplicationForm.tsx`** - Typeform-style application (7 steps)
  - Features: Progress bar, step validation, gradient buttons
  - Streamlined fields (removed liquid assets, annual income, professional background)
  
- **`LoginModal.tsx`** - Email/password authentication
  - Props: `onClose`, `onSuccess`, `onMembershipClick`
  - Features: Firebase auth, error handling, forgot password link

- **`RequestAccessSection.tsx`** - Email capture CTA
  - Props: `onMembershipClick`

#### Footer Components
- **`ModernFooter.tsx`** - Main footer with links
  - Props: `onMembershipClick` (optional)
- **`VaultFooter.tsx`** - Alternative footer style

#### Brand Elements
- **`VaultfyLogo.tsx`** - SVG logo component
- **`VisaLogo.tsx`** - Visa logo for payment section
- **`LifestyleAnimation.tsx`** - Animated jets/yachts/cars in hero

### `/components/mobile` - Mobile App Components

#### Core App Screens
- **`MobileAppContainer.tsx`** - Main mobile app wrapper
  - Bottom navigation bar (Dashboard, Map, Alfred, Bookings, Profile)
  - Manages active screen state
  
- **`SplashScreen.tsx`** - Initial loading screen with logo animation
  - Auto-transitions to Dashboard after 2 seconds

- **`Dashboard.tsx`** - Main dashboard with Monaco demo
  - 10 interactive luxury experiences
  - Quick action cards
  - Stats overview
  
- **`InteractiveMap.tsx`** - Google Maps integration
  - 10 custom markers (jets, yachts, villas, hotels)
  - InfoWindow with booking CTAs
  - Real-time marker clustering

#### Alfred AI System
- **`AlfredChat.tsx`** - Multi-threaded chat interface
  - Props: `conversationId`, `onBack`
  - Features: Streaming responses, attachments, booking suggestions
  - Mock AI responses (replace with OpenAI/Claude API)

- **`AlfredConversations.tsx`** - Conversation list
  - Features: New conversation, conversation history, search
  - Shows last message preview with timestamps

- **`SecureChannelModal.tsx`** - Sensitive payment info modal
  - Blur background, crypto wallet address display

#### Booking System
- **`ExperienceDetail.tsx`** - Booking flow (5 steps)
  - Step 1: Experience details
  - Step 2: Date & time selection
  - Step 3: Guest details
  - Step 4: Payment method (Card/Wire/Stablecoin)
  - Step 5: Confirmation
  
- **`MyBookings.tsx`** - Booking history
  - Tabs: Upcoming, Past, Cancelled
  - Status badges, booking details

- **`BookingConfirmation.tsx`** - Post-booking success screen
  - Animated checkmark, booking summary, next steps

- **`ProfileScreen.tsx`** - User profile & settings
  - Personal info, payment methods, preferences
  - Logout functionality

### `/components/ui` - shadcn/ui Components

**DO NOT MODIFY OR RECREATE** these components. They are from shadcn/ui library.

Available components:
- Form elements: `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`
- Layout: `card`, `separator`, `tabs`, `accordion`, `collapsible`
- Overlays: `dialog`, `sheet`, `drawer`, `popover`, `tooltip`, `alert-dialog`
- Navigation: `navigation-menu`, `menubar`, `breadcrumb`, `pagination`
- Feedback: `alert`, `progress`, `skeleton`, `sonner` (toasts)
- Data: `table`, `calendar`, `chart`, `carousel`
- Specialized: `avatar`, `badge`, `aspect-ratio`, `scroll-area`, `command`

Import syntax: `import { Button } from './components/ui/button'`

### `/pages` - Route Components

#### Marketing Pages
- **`Home.tsx`** - Main landing page
  - Composition: StunningHero + Feature sections + Testimonials + CTA
  - Props: `onLoginClick`, `onMembershipClick`

#### Platform Pages (Footer links)
- **`PrivateDealFlow.tsx`** - Private Aviation info
- **`PortfolioIntelligence.tsx`** - Luxury Yachts info
- **`WealthConcierge.tsx`** - Supercars & Hotels info
- **`NetworkAccess.tsx`** - Membership benefits info

#### Company Pages
- **`About.tsx`** - Company information
- **`Philosophy.tsx`** - Brand philosophy
- **`Membership.tsx`** - Membership details
- **`Contact.tsx`** - Contact information

#### Legal Pages
- **`PrivacyPolicy.tsx`** - Privacy policy
- **`TermsOfService.tsx`** - Terms of service
- **`Disclosures.tsx`** - Legal disclosures
- **`Security.tsx`** - Security information

**All pages accept:** `onMembershipClick` prop to open waitlist form

---

## State Management

### Global State (App.tsx)

```typescript
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [showLogin, setShowLogin] = useState(false);
const [showMembership, setShowMembership] = useState(false);
const [showSplash, setShowSplash] = useState(false);
```

### Firebase Auth State

Located in `/lib/useAuth.ts`:
```typescript
const { user, loading } = useAuth();
```

Returns:
- `user` - Current Firebase user object or null
- `loading` - Boolean for auth state loading

### Firestore Hooks

Located in `/lib/useFirestore.ts`:
```typescript
const { data, loading, error } = useFirestore('collection', 'docId');
```

---

## Routing Structure

### Marketing Site Routes (Pre-login)

```
/                          → Home
/platform/deal-flow        → PrivateDealFlow
/platform/portfolio-intelligence → PortfolioIntelligence
/platform/wealth-concierge → WealthConcierge
/platform/network-access   → NetworkAccess
/company/about             → About
/company/philosophy        → Philosophy
/company/membership        → Membership
/company/contact           → Contact
/legal/privacy             → PrivacyPolicy
/legal/terms               → TermsOfService
/legal/disclosures         → Disclosures
/legal/security            → Security
```

### Mobile App Screens (Post-login)

**Note:** These are not routes, but conditional renders within MobileAppContainer:
- Dashboard (default)
- Map View
- Alfred Chat
- My Bookings
- Profile

---

## Firebase Integration

### Configuration (`/lib/firebase.ts`)

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "vaultfy-ai.firebaseapp.com",
  projectId: "vaultfy-ai",
  storageBucket: "vaultfy-ai.firebasestorage.app",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};
```

**IMPORTANT:** API keys are embedded in code (Figma Make requirement).

### Firestore Collections

```
users/
  {uid}/
    - email
    - displayName
    - createdAt
    - membershipStatus

conversations/
  {conversationId}/
    - userId
    - title
    - lastMessage
    - createdAt
    - updatedAt

messages/
  {messageId}/
    - conversationId
    - userId
    - content
    - role (user|assistant)
    - timestamp

bookings/
  {bookingId}/
    - userId
    - experienceId
    - experienceName
    - date
    - time
    - guests
    - paymentMethod
    - status
    - totalPrice
    - createdAt
```

### Cloud Functions (`/functions/src`)

- **`auth.ts`** - User creation triggers
- **`alfred.ts`** - AI chat processing (stub - needs OpenAI integration)
- **`bookings.ts`** - Booking validation & processing
- **`payments.ts`** - Payment processing (stub - needs Stripe integration)
- **`emails.ts`** - Email notifications (stub - needs SendGrid/Mailgun)

---

## Key Features & Implementation

### 1. Membership Application Flow

**Trigger Points:**
- "Join the Waitlist" button in hero
- "Join the Waitlist" in navigation
- "Join the Waitlist" in footer sections
- All page CTAs

**Form Steps:**
1. Welcome (intro)
2. Personal Information (name, email, phone)
3. Location (residence)
4. Financial Profile (net worth only)
5. Investment Interests (multi-select)
6. Lifestyle Preferences (multi-select + travel frequency buttons)
7. How Did You Find Us?
8. Review & Submit

**Features:**
- Progress bar with percentage
- Step validation before proceeding
- Animated transitions between steps
- Success screen with auto-close
- Form data logged to console (needs Firebase integration)

### 2. Login & Authentication Flow

**Process:**
1. User clicks "Sign In" in navigation
2. LoginModal opens with email/password fields
3. Firebase Authentication validates credentials
4. On success: 
   - SplashScreen shows for 2 seconds
   - Transitions to MobileAppContainer
   - Bottom nav becomes active
5. On error: Display error message

**Test Credentials:**
```
Email: demo@vaultfy.ai
Password: Demo123!
```

### 3. Alfred AI Chat System

**Architecture:**
- Multi-threaded conversations (separate conversation list)
- Each conversation has unique ID
- Messages stored in Firestore
- Real-time updates with Firestore listeners

**Current Implementation:**
- Mock responses (needs OpenAI/Claude API integration)
- Simulated typing indicator
- Attachment support (UI only)
- Booking suggestions (links to ExperienceDetail)

**TODO for Production:**
```typescript
// Replace mock responses in AlfredChat.tsx
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: conversationHistory,
    stream: true,
  }),
});
```

### 4. Interactive Map System

**Implementation:**
- Google Maps JavaScript API
- 10 hardcoded markers (Monaco area)
- Custom marker icons
- InfoWindow with booking CTAs
- Smooth animations on marker click

**Marker Types:**
- Private Jets (2 markers)
- Luxury Yachts (2 markers)
- Exclusive Villas (2 markers)
- Five-Star Hotels (2 markers)
- Supercar Collections (2 markers)

**Configuration:**
```typescript
// Google Maps API Key in index.html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>

// Map ID for custom styling (optional)
mapId: "YOUR_MAP_ID"
```

### 5. Booking Flow

**5-Step Process:**
1. **Experience Selection** - From Dashboard or Map
2. **Date & Time** - Calendar picker, time slots
3. **Guest Details** - Number of guests, special requests
4. **Payment Method** - Card/Wire/Stablecoin selection
5. **Confirmation** - Booking summary, next steps

**Payment Methods:**
- Credit Card (Stripe integration needed)
- Wire Transfer (manual processing)
- Stablecoin (USDC/USDT - crypto integration needed)

**TODO for Production:**
- Integrate Stripe for card payments
- Set up crypto payment processor (Coinbase Commerce, etc.)
- Implement email confirmations
- Add booking to Firestore
- Send notification to admin dashboard

### 6. Dashboard Experience

**Monaco Luxury Demo:**
- 10 interactive experience cards:
  - Private Jet to Saint-Tropez ($28,000)
  - Superyacht Mediterranean ($45,000/day)
  - Villa Overlooking Monte Carlo ($15,000/night)
  - Ferrari F8 Tributo Experience ($3,500/day)
  - Hôtel de Paris Suite ($8,000/night)
  - Helicopter Tour Monaco ($2,500)
  - Private Beach Club Day ($1,200)
  - Michelin Star Dining ($850/person)
  - Casino Royale VIP Access ($5,000)
  - Formula 1 Paddock Pass ($12,000)

**Features:**
- Quick action cards (Book Trip, Message Alfred, etc.)
- Stats overview (Active Bookings, Total Spent, etc.)
- Smooth animations with Motion
- Card hover effects

---

## Mobile vs Desktop Experience

### Desktop (Marketing Site)
- Full navigation bar with dropdown menus
- Large hero sections with animations
- Multi-column layouts
- Hover effects on cards
- Desktop-optimized typography

### Mobile (App Experience)
- Bottom navigation bar (5 icons)
- Single-column layouts
- Swipe gestures (where applicable)
- Touch-optimized buttons (min 44px)
- Mobile-optimized spacing
- **Thin line icons only** (from Lucide)
- **No emojis** (brand guideline)

### Responsive Breakpoints

```css
/* Mobile first */
default: < 640px

sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Laptops */
2xl: 1536px /* Large screens */
```

**Example Usage:**
```tsx
<div className="px-4 md:px-8 lg:px-12">
  <h1 className="text-3xl md:text-5xl lg:text-6xl">
    <!-- Responsive without font utilities -->
  </h1>
</div>
```

---

## Animation System

### Motion (Framer Motion)

**Import:**
```typescript
import { motion, AnimatePresence } from 'motion/react';
```

**Common Patterns:**

1. **Fade In on Mount:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  Content
</motion.div>
```

2. **Scroll-triggered Animations:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 1 }}
  viewport={{ once: true }}
>
  Content
</motion.div>
```

3. **Hover/Tap Effects:**
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

4. **Gradient Shimmer Effect:**
```tsx
<motion.div 
  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
  animate={{ x: ['-200%', '200%'] }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: 'linear'
  }}
/>
```

5. **Modal/Dialog Transitions:**
```tsx
<AnimatePresence>
  {showModal && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      Modal Content
    </motion.div>
  )}
</AnimatePresence>
```

---

## Important Development Notes

### DO NOT:
1. ❌ Override typography with Tailwind classes (text-*, font-*, leading-*)
2. ❌ Modify or recreate shadcn/ui components in `/components/ui`
3. ❌ Use emojis anywhere in the UI (brand guideline)
4. ❌ Use filled icons in mobile app (thin line icons only)
5. ❌ Create `tailwind.config.js` file (using Tailwind v4.0)
6. ❌ Modify `/components/figma/ImageWithFallback.tsx` (protected file)
7. ❌ Use environment variables for API keys (Figma Make limitation)

### DO:
1. ✅ Use champagne gold gradients: `linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)`
2. ✅ Import images with: `import { ImageWithFallback } from './components/figma/ImageWithFallback'`
3. ✅ Use Motion for complex animations
4. ✅ Keep components modular and reusable
5. ✅ Pass handlers as props (onLoginClick, onMembershipClick)
6. ✅ Use Lucide React for icons: `import { IconName } from 'lucide-react'`
7. ✅ Test on mobile and desktop breakpoints
8. ✅ Validate forms before submission
9. ✅ Show loading states during async operations
10. ✅ Handle errors gracefully with user-friendly messages

### Terminology Guidelines

**Always use:**
- "Alfred AI" or "Alfred" (NOT "AI Concierge")
- "Join the Waitlist" (NOT "Apply for Membership")
- "Personal Assistant" (NOT "Concierge")
- "Members" (NOT "Users" or "Clients")

### API Integration Stubs

**Replace these with real APIs in production:**

1. **OpenAI/Claude for Alfred AI:**
   - Location: `AlfredChat.tsx` mock responses
   - Needed: API key, conversation context management

2. **Stripe for Payments:**
   - Location: `ExperienceDetail.tsx` payment step
   - Needed: Publishable key, backend webhook handler

3. **Crypto Payment Processor:**
   - Location: `SecureChannelModal.tsx`
   - Options: Coinbase Commerce, Circle, BitPay

4. **Email Service:**
   - Location: `/functions/src/emails.ts`
   - Options: SendGrid, Mailgun, AWS SES

5. **SMS Service (optional):**
   - For booking confirmations
   - Options: Twilio, AWS SNS

### Testing Guidelines

**Test Credentials:**
```
Demo Account:
Email: demo@vaultfy.ai
Password: Demo123!
```

**Test Flow:**
1. ✅ Marketing site loads on all breakpoints
2. ✅ "Join the Waitlist" button opens membership form
3. ✅ Membership form submits successfully
4. ✅ Login modal authenticates test user
5. ✅ Splash screen shows for 2 seconds
6. ✅ Dashboard loads with 10 experiences
7. ✅ Map view shows 10 markers
8. ✅ Alfred chat creates new conversation
9. ✅ Booking flow completes all 5 steps
10. ✅ Profile screen shows user info
11. ✅ Logout returns to marketing site

### Performance Considerations

1. **Image Optimization:**
   - Use ImageWithFallback for all dynamic images
   - Lazy load images below the fold
   - Consider using WebP format

2. **Code Splitting:**
   - Mobile components only load when logged in
   - Route-based code splitting with React Router

3. **Animation Performance:**
   - Use `transform` and `opacity` for animations (GPU accelerated)
   - Avoid animating `width`, `height`, `top`, `left`
   - Use `will-change` sparingly

4. **Firestore Optimization:**
   - Use `.limit()` on queries
   - Index frequently queried fields
   - Implement pagination for large lists

### Security Considerations

1. **Firestore Rules:**
   - Users can only read/write their own data
   - Bookings require authentication
   - Messages tied to conversation ownership

2. **Authentication:**
   - Email verification (optional but recommended)
   - Password reset flow implemented
   - Session persistence handled by Firebase

3. **API Keys:**
   - Google Maps key restricted by domain
   - Firebase keys restricted by app identifier
   - Rotate keys if exposed

---

## Deployment Checklist

### Before Production:

- [ ] Replace all API keys with production keys
- [ ] Set up Firebase production project
- [ ] Integrate real payment processors (Stripe, crypto)
- [ ] Implement email notification service
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Test all booking flows end-to-end
- [ ] Review Firestore security rules
- [ ] Enable Firebase Analytics
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Optimize images and assets
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Test on real devices (iOS, Android)
- [ ] Review GDPR compliance (if applicable)
- [ ] Set up backup strategy for Firestore
- [ ] Configure CORS for cloud functions

---

## File Structure Quick Reference

```
/components              # Shared marketing components
  /mobile               # Mobile app components (post-login)
  /ui                   # shadcn/ui components (DO NOT MODIFY)
  /figma                # Protected Figma components

/pages                  # Route components (React Router)

/lib                    # Utilities & Firebase integration
  firebase.ts           # Firebase configuration
  useAuth.ts            # Authentication hook
  useFirestore.ts       # Firestore data hook
  config.ts             # App configuration

/functions              # Firebase Cloud Functions
  /src
    index.ts            # Functions entry point
    auth.ts             # User management
    alfred.ts           # AI chat (needs OpenAI)
    bookings.ts         # Booking logic
    payments.ts         # Payment processing (needs Stripe)
    emails.ts           # Email service (needs SendGrid)

/styles
  globals.css           # Global styles, color tokens, typography

/*.md                   # Documentation files
```

---

## Common Component Patterns

### Pattern 1: Page Component with Navigation

```tsx
interface PageNameProps {
  onMembershipClick: () => void;
}

export function PageName({ onMembershipClick }: PageNameProps) {
  return (
    <div className="bg-[#000000] min-h-screen">
      <ModernNavigation 
        onLoginClick={() => {}} 
        onMembershipClick={onMembershipClick} 
      />
      
      {/* Page content */}
      
      <VaultFooter />
    </div>
  );
}
```

### Pattern 2: Animated Section with Scroll Trigger

```tsx
<section className="py-32 px-6 bg-[#000000]">
  <div className="max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <h2 className="text-[#F5F5F0]">Heading</h2>
      <p className="text-[#F5F5F0]/70">Description</p>
    </motion.div>
  </div>
</section>
```

### Pattern 3: Gold Gradient Button

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-8 py-4 rounded-full text-[#000000] uppercase tracking-wider"
  style={{
    background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)'
  }}
  onClick={onAction}
>
  Button Text
</motion.button>
```

### Pattern 4: Card with Hover Effect

```tsx
<motion.div
  whileHover={{ y: -8 }}
  className="p-6 rounded-lg"
  style={{
    background: 'rgba(45,45,45,0.8)',
    border: '1px solid rgba(212,175,122,0.2)'
  }}
>
  {/* Card content */}
</motion.div>
```

---

## Getting Help

**Documentation Files:**
- `README.md` - Project setup
- `FIREBASE_SETUP.md` - Firebase configuration
- `LOGIN_FLOW_README.md` - Authentication flow
- `MOBILE_APP_README.md` - Mobile app details
- `GOOGLE_MAPS_SETUP.md` - Maps integration
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

**Key Contacts:**
- Design Questions: Refer to brand guidelines (Black + Champagne Gold)
- Technical Issues: Check relevant .md files in root
- Feature Requests: Document in new .md file

---

## Version History

- **v1.0** - Initial marketing website + login flow
- **v1.1** - Mobile app experience added
- **v1.2** - Alfred chat multi-threading
- **v1.3** - Interactive map with markers
- **v1.4** - Complete booking flow
- **v1.5** - Membership form streamlined (7 steps)
- **Current** - All "Apply for Membership" renamed to "Join the Waitlist"

---

## Next Steps for Development Team

### Immediate TODOs:
1. Replace mock AI responses with OpenAI/Claude API
2. Integrate Stripe for card payments
3. Set up crypto payment processor for stablecoins
4. Implement email notification service
5. Add Firebase Analytics tracking
6. Set up Sentry for error monitoring

### Feature Enhancements:
1. Add calendar view for bookings
2. Implement real-time availability checking
3. Add favorites/wishlist functionality
4. Create admin dashboard for managing bookings
5. Add push notifications (PWA)
6. Implement referral program
7. Add multi-language support
8. Create onboarding tutorial for first-time users

### Performance Optimizations:
1. Implement image CDN
2. Add service worker for offline support
3. Optimize bundle size with code splitting
4. Implement virtual scrolling for long lists
5. Add loading skeletons for better UX

---

**Last Updated:** January 2025
**Maintained By:** Vaultfy Development Team
**Platform:** Figma Make + Firebase
