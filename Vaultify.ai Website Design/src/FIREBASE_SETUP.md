# Firebase Setup Guide for Vaultify.ai

## Overview

This guide will help you set up Firebase for your Vaultify.ai luxury concierge platform, including authentication, database, hosting, and serverless functions.

---

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier works for development)
- Firebase CLI installed: `npm install -g firebase-tools`

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it: `vaultify-ai` (or your preferred name)
4. Disable Google Analytics (optional for now)
5. Click "Create Project"

---

## Step 2: Set Up Firebase Services

### **Authentication**

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Enable these sign-in methods:
   - ✅ Email/Password
   - ✅ Google (optional but recommended)
   - ✅ Phone (optional for SMS verification)

### **Firestore Database**

1. Go to **Firestore Database** → **Create Database**
2. Start in **Production Mode** (we have custom rules)
3. Choose your region (e.g., `us-central1`)
4. Click **Enable**

### **Storage**

1. Go to **Storage** → **Get Started**
2. Start in **Production Mode**
3. Use the same region as Firestore
4. Click **Done**

### **Hosting**

1. Go to **Hosting** → **Get Started**
2. Follow the CLI instructions (we'll do this in Step 4)

---

## Step 3: Get Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" → Click **Web** icon (`</>`)
3. Register app: Name it `Vaultify Web App`
4. Copy the `firebaseConfig` object
5. Create `.env` file in your project root:

```bash
cp .env.example .env
```

6. Fill in your Firebase config values in `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=vaultify-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vaultify-ai
VITE_FIREBASE_STORAGE_BUCKET=vaultify-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Step 4: Initialize Firebase in Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase (select your project)
firebase use --add
# Choose your project from the list
# Give it an alias: "default"

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage
```

---

## Step 5: Set Up Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Install additional packages
npm install firebase-admin firebase-functions stripe openai @sendgrid/mail

# Go back to root
cd ..
```

### **Set Environment Variables for Functions**

```bash
# Set Stripe keys
firebase functions:config:set stripe.secret_key="sk_test_..."

# Set OpenAI key (for Alfred AI)
firebase functions:config:set openai.api_key="sk-..."

# Set SendGrid key (for emails)
firebase functions:config:set sendgrid.api_key="SG...."

# Set Circle API key (for crypto payments)
firebase functions:config:set circle.api_key="your_circle_key"
```

---

## Step 6: Deploy Functions

```bash
# Build and deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:alfredChat
```

---

## Step 7: Build and Deploy Website

```bash
# Build your React app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or deploy everything at once
firebase deploy
```

Your site will be live at: `https://vaultify-ai.web.app`

---

## Step 8: Set Up Payment Integrations

### **Stripe Setup**

1. Create account at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Developers** → **API Keys**
3. Copy **Publishable Key** and **Secret Key**
4. Add to `.env`:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
5. Add Secret Key to Firebase Functions (done in Step 5)
6. Set up webhook endpoint:
   - URL: `https://us-central1-vaultify-ai.cloudfunctions.net/stripeWebhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### **Circle (Stablecoins) Setup**

1. Sign up at [Circle Developer Portal](https://developers.circle.com/)
2. Get API key from dashboard
3. Add to Firebase Functions config (done in Step 5)
4. Implement Circle SDK integration in `/functions/src/payments.ts`

---

## Step 9: Test Everything

### **Test Authentication**

```bash
# Run locally
npm run dev

# Try signing up and logging in
# Check Firebase Console → Authentication to see new users
```

### **Test Firestore**

```bash
# Check Firebase Console → Firestore
# You should see collections: users, bookings, conversations
```

### **Test Functions Locally**

```bash
# Install Firebase emulators
firebase init emulators
# Select: Functions, Firestore, Authentication

# Start emulators
firebase emulators:start

# Your app will connect to local emulators
# Check: http://localhost:4000 for Emulator UI
```

---

## Step 10: Production Checklist

Before going live:

- [ ] Update all `.env` values to production keys
- [ ] Enable Firebase billing (required for Cloud Functions)
- [ ] Set up custom domain in Firebase Hosting
- [ ] Configure Stripe production keys
- [ ] Set up real email service (SendGrid/Resend)
- [ ] Test all payment flows thoroughly
- [ ] Enable Firebase App Check for security
- [ ] Set up monitoring and alerts
- [ ] Create admin dashboard for managing users/bookings
- [ ] Configure backup strategy for Firestore

---

## Firestore Data Structure

```
users/
  {userId}/
    - uid: string
    - email: string
    - displayName: string
    - membershipTier: 'standard' | 'elite' | 'sovereign'
    - createdAt: timestamp
    - phone: string (optional)
    - photoURL: string (optional)

bookings/
  {bookingId}/
    - userId: string
    - type: 'jet' | 'yacht' | 'hotel' | 'villa' | 'experience' | 'watch' | 'car'
    - title: string
    - description: string
    - price: number
    - currency: string
    - paymentMethod: 'card' | 'wire' | 'crypto'
    - status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    - createdAt: timestamp
    - bookingDate: string (optional)
    - details: object

conversations/
  {conversationId}/
    - userId: string
    - title: string
    - lastMessage: string
    - status: 'active' | 'completed' | 'pending'
    - createdAt: timestamp
    - updatedAt: timestamp
    - messages: array
      - id: string
      - conversationId: string
      - userId: string
      - isUser: boolean
      - text: string
      - timestamp: timestamp

accessRequests/
  {requestId}/
    - name: string
    - email: string
    - phone: string (optional)
    - company: string (optional)
    - reason: string (optional)
    - status: 'pending' | 'approved' | 'rejected'
    - createdAt: timestamp
```

---

## Useful Commands

```bash
# View logs
firebase functions:log

# Open Firestore in console
firebase firestore:indexes

# List projects
firebase projects:list

# Switch project
firebase use project-name

# Deploy specific function
firebase deploy --only functions:functionName

# Deploy with debug info
firebase deploy --debug
```

---

## Troubleshooting

### Functions not deploying?
- Check Node version: `node --version` (need 18+)
- Check billing is enabled
- Check function logs: `firebase functions:log`

### CORS errors?
- Add CORS handling in Cloud Functions
- Check Firebase Hosting rewrites in `firebase.json`

### Database permission errors?
- Check `firestore.rules`
- Verify user is authenticated
- Check userId matches in security rules

### Payment integration issues?
- Verify all API keys are set correctly
- Check webhook endpoints are configured
- Test with Stripe test mode first

---

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Circle API Docs](https://developers.circle.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

## Next Steps

1. ✅ Complete Firebase setup
2. ✅ Deploy initial version
3. Build admin dashboard for managing requests
4. Implement real Alfred AI with OpenAI
5. Add proper email templates
6. Integrate Circle for crypto payments
7. Add analytics and monitoring
8. Set up staging environment
9. Create comprehensive testing suite
10. Launch! 🚀
