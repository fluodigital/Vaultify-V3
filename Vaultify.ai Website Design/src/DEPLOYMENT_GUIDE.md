# Vaultify.ai Deployment Guide

## Complete Stack Overview

### **Frontend**
- React 18 + TypeScript
- Tailwind CSS v4
- Motion (Framer Motion)
- Vite build system

### **Backend (Firebase)**
- **Authentication**: Email/password, Google OAuth
- **Firestore**: NoSQL database for users, bookings, conversations
- **Cloud Functions**: Serverless Node.js/TypeScript functions
- **Hosting**: Static site hosting with CDN
- **Storage**: File uploads (profile photos, documents)

### **Payment Infrastructure**
- **Stripe**: Credit cards, wire transfers
- **Circle API**: USDC, USDT, EUROC, DAI stablecoins

### **AI & Communications**
- **OpenAI GPT-4**: Powers Alfred AI concierge
- **SendGrid/Resend**: Transactional emails

---

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Fill in your Firebase config values

# 3. Start development server
npm run dev

# 4. In another terminal, start Firebase emulators (optional)
firebase emulators:start
```

Visit: `http://localhost:5173`

---

## Firebase Setup (One-Time)

### **Step 1: Create Firebase Project**

```bash
# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
# - Storage

# Choose your project or create new one
```

### **Step 2: Configure Firebase**

1. Get your Firebase config from Firebase Console
2. Add to `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **Step 3: Enable Firebase Services**

In Firebase Console:

1. **Authentication** → Enable Email/Password and Google
2. **Firestore** → Create database (production mode)
3. **Storage** → Enable storage
4. **Billing** → Upgrade to Blaze plan (required for Cloud Functions)

### **Step 4: Deploy Security Rules**

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

### **Step 5: Set Up Cloud Functions**

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Add environment variables for functions
cd ..
firebase functions:config:set \
  stripe.secret_key="sk_test_..." \
  openai.api_key="sk-..." \
  sendgrid.api_key="SG...." \
  circle.api_key="your_circle_key"

# Deploy functions
firebase deploy --only functions
```

---

## Stripe Setup

1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from **Developers → API Keys**
3. Add to `.env`:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Add Secret Key to Functions:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_test_..."
   ```
5. Set up webhook in Stripe Dashboard:
   - **Endpoint URL**: `https://us-central1-YOUR-PROJECT.cloudfunctions.net/stripeWebhook`
   - **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret and add to Functions:
     ```bash
     firebase functions:config:set stripe.webhook_secret="whsec_..."
     ```

---

## Circle API Setup (Stablecoins)

1. Sign up at [Circle Developer Portal](https://developers.circle.com/)
2. Create API key
3. Add to Functions:
   ```bash
   firebase functions:config:set circle.api_key="your_api_key"
   ```
4. Integrate Circle SDK in `/functions/src/payments.ts`

---

## OpenAI Setup (Alfred AI)

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Create API key
3. Add to Functions:
   ```bash
   firebase functions:config:set openai.api_key="sk-..."
   ```
4. Monitor usage in OpenAI dashboard

---

## SendGrid Setup (Emails)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create API key with "Mail Send" permissions
3. Verify sender email/domain
4. Add to Functions:
   ```bash
   firebase functions:config:set \
     sendgrid.api_key="SG...." \
     sendgrid.from_email="noreply@vaultify.ai"
   ```

---

## Build for Production

```bash
# Build React app
npm run build

# Test production build locally
npm run preview

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or deploy everything
firebase deploy
```

Your site will be live at: `https://YOUR-PROJECT.web.app`

---

## Custom Domain Setup

1. In Firebase Console → Hosting → Add custom domain
2. Follow DNS configuration instructions
3. Firebase will provision SSL certificate automatically
4. Update `.env`:
   ```env
   VITE_APP_URL=https://vaultify.ai
   ```

---

## Project Structure

```
vaultify-ai/
├── src/                          # React app source
│   ├── App.tsx                   # Main app component
│   ├── components/               # React components
│   ├── lib/                      # Firebase & utilities
│   │   ├── firebase.ts          # Firebase initialization
│   │   ├── useAuth.ts           # Auth hook
│   │   └── useFirestore.ts      # Firestore hooks
│   └── styles/                   # CSS files
│
├── functions/                    # Cloud Functions
│   ├── src/
│   │   ├── index.ts             # Functions entry point
│   │   ├── auth.ts              # Auth triggers
│   │   ├── bookings.ts          # Booking logic
│   │   ├── payments.ts          # Stripe & Circle
│   │   ├── alfred.ts            # AI chat
│   │   └── emails.ts            # Email service
│   └── package.json
│
├── firestore.rules              # Database security
├── firestore.indexes.json       # Database indexes
├── storage.rules                # Storage security
├── firebase.json                # Firebase config
├── .env                         # Environment variables
└── package.json                 # Dependencies
```

---

## Testing

### **Local Testing with Emulators**

```bash
# Start all emulators
firebase emulators:start

# Access Emulator UI
open http://localhost:4000

# Test specific emulator
firebase emulators:start --only functions,firestore
```

### **Test Authentication**

1. Sign up with test email
2. Check Firebase Console → Authentication
3. Verify user created in Firestore

### **Test Bookings**

1. Create a booking in the app
2. Check Firestore → bookings collection
3. Verify function logs: `firebase functions:log`

### **Test Payments (Stripe)**

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## Monitoring & Debugging

### **Firebase Console**

- **Authentication**: View all users
- **Firestore**: Browse database
- **Functions**: View logs and metrics
- **Hosting**: Deployment history
- **Usage**: Monitor quotas

### **Cloud Function Logs**

```bash
# View all logs
firebase functions:log

# View specific function
firebase functions:log --only alfredChat

# Tail logs in real-time
firebase functions:log --follow
```

### **Performance Monitoring**

1. Enable Firebase Performance Monitoring
2. Add to your app:
   ```typescript
   import { getPerformance } from 'firebase/performance';
   const perf = getPerformance(app);
   ```

---

## Cost Estimates (Firebase Blaze Plan)

### **Free Tier Includes:**
- 50K document reads/day
- 20K document writes/day
- 20K document deletes/day
- 2M function invocations/month
- 10GB hosting/month
- 5GB storage

### **Beyond Free Tier:**
- Functions: $0.40 per million invocations
- Firestore: $0.06 per 100K reads
- Hosting: $0.15 per GB
- Storage: $0.026 per GB/month

**Estimated monthly cost for small app**: $5-20

---

## Security Best Practices

1. ✅ Never commit `.env` file (add to `.gitignore`)
2. ✅ Use Firebase Security Rules for Firestore/Storage
3. ✅ Validate all inputs in Cloud Functions
4. ✅ Use HTTPS only (enforced by Firebase)
5. ✅ Enable Firebase App Check for production
6. ✅ Rotate API keys regularly
7. ✅ Monitor logs for suspicious activity
8. ✅ Set up billing alerts in Firebase Console

---

## Scaling Considerations

### **When to optimize:**

1. **Firestore reads > 1M/day**
   - Implement caching with Redis
   - Use Firestore local persistence
   - Paginate large queries

2. **Cloud Functions slow**
   - Increase memory allocation
   - Use connection pooling
   - Cache frequently accessed data

3. **High traffic**
   - Enable CDN caching
   - Optimize images
   - Implement rate limiting

---

## Troubleshooting

### **"Permission denied" errors**
- Check `firestore.rules`
- Verify user is authenticated
- Ensure userId matches in queries

### **Functions timeout**
- Increase timeout in function config
- Optimize database queries
- Check for infinite loops

### **CORS errors**
- Add CORS handling in Cloud Functions
- Check Firebase Hosting rewrites

### **Build fails**
- Clear `node_modules` and reinstall
- Check Node version (need 18+)
- Update dependencies

---

## Production Checklist

Before launching:

- [ ] Test all user flows thoroughly
- [ ] Set up production API keys (Stripe, OpenAI, etc.)
- [ ] Configure custom domain
- [ ] Enable Firebase App Check
- [ ] Set up monitoring and alerts
- [ ] Create backup strategy for Firestore
- [ ] Write documentation for admins
- [ ] Test payment flows with real cards (small amounts)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure email templates
- [ ] Create terms of service and privacy policy
- [ ] Test on multiple devices and browsers
- [ ] Set up staging environment
- [ ] Train support team on admin dashboard

---

## Support & Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs
- **Circle Docs**: https://developers.circle.com/docs

---

## Next Steps

1. Complete Firebase setup following FIREBASE_SETUP.md
2. Test authentication flow
3. Implement payment integration
4. Build admin dashboard
5. Add analytics
6. Launch beta with select users
7. Gather feedback and iterate
8. Public launch 🚀

Good luck building Vaultify.ai! 💎✨
