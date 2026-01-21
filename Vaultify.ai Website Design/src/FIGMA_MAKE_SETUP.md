# 🔧 Vaultify.ai - Figma Make Setup Guide

Since your app is published via Figma Make, API keys need to be added directly in the code.

## Quick Setup (3 Steps)

### Step 1: Add Google Maps API Key

1. **Get your API key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project or select existing
   - Enable **Maps JavaScript API** and **Maps Marker API**
   - Create an API key

2. **Add the key to your project:**
   - Open `/lib/config.ts`
   - Find this line:
     ```typescript
     googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
     ```
   - Replace with your actual key:
     ```typescript
     googleMapsApiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX',
     ```

3. **Secure your key (Important!):**
   - In Google Cloud Console, restrict the API key
   - Under "Application restrictions" → "HTTP referrers"
   - Add: `https://*.figma.com/*` and your custom domain if any
   - Under "API restrictions" → Select "Maps JavaScript API" and "Maps Marker API"

### Step 2: Add Firebase Configuration

1. **Get your Firebase config:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings (⚙️ icon)
   - Scroll to "Your apps" section
   - Copy the configuration object

2. **Add to your project:**
   - Open `/lib/config.ts`
   - Replace the firebase section with your values:
     ```typescript
     firebase: {
       apiKey: 'AIzaXXXXXXXXXXXXXXXXXXXX',
       authDomain: 'vaultify-ai.firebaseapp.com',
       projectId: 'vaultify-ai',
       storageBucket: 'vaultify-ai.appspot.com',
       messagingSenderId: '123456789012',
       appId: '1:123456789012:web:abcdef123456',
     },
     ```

### Step 3: Add Payment Keys (Optional)

**For Stripe (Credit Card Payments):**
```typescript
stripePublishableKey: 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX',
```
Get from: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

**For Circle (Crypto Payments):**
```typescript
circleApiKey: 'XXXXXXXXXXXXXXXXXXXXXXXX',
```
Get from: [Circle Console](https://console.circle.com)

## 📁 Where to Edit

**All API keys go in one place:**
```
/lib/config.ts
```

This file has clear comments for each key and is designed to be edited directly.

## 🔍 How to Verify Setup

### Google Maps
1. Navigate to the Dashboard in your app
2. Click the "Map" button (next to the tabs)
3. ✅ You should see a dark luxury map with champagne gold markers
4. ❌ If you see "Map Configuration Required", check `/lib/config.ts`

### Firebase
1. Try to log in to the app
2. ✅ Login modal should work and authenticate
3. ❌ If login fails, check Firebase config in `/lib/config.ts`

### Payments
1. Try to book an experience
2. ✅ Payment options should appear
3. ❌ If payment fails, check payment keys in `/lib/config.ts`

## 🛡️ Security Best Practices

### ✅ DO:
- Restrict API keys in their respective consoles (Google Cloud, Firebase)
- Use test keys during development
- Monitor usage in your dashboards
- Set up billing alerts

### ❌ DON'T:
- Share your config.ts file publicly
- Use production keys for testing
- Skip API key restrictions
- Ignore unusual usage patterns

## 📊 Free Tier Limits

**Google Maps:**
- $200/month free credit
- ~28,000 map loads included
- After that: $7 per 1,000 loads

**Firebase:**
- 50,000 reads/day (Firestore)
- 20,000 writes/day (Firestore)
- 10GB storage
- Authentication: Unlimited

**Stripe:**
- No monthly fees
- 2.9% + 30¢ per transaction

**Circle (Crypto):**
- Contact for pricing
- May have transaction fees

## 🔄 Updating Keys

If you need to change any API key:

1. Update the value in `/lib/config.ts`
2. Save the file
3. Figma Make will automatically rebuild
4. Refresh your browser to see changes

## 🚨 Troubleshooting

### Map not loading?
```
Error: "Map Configuration Required"
Solution: Check googleMapsApiKey in /lib/config.ts
```

### Login not working?
```
Error: Firebase authentication failed
Solution: Check firebase config in /lib/config.ts
```

### Console errors about API keys?
```
Error: "API key not valid"
Solution: 
1. Verify the key is correct in /lib/config.ts
2. Check key restrictions in Google Cloud Console
3. Ensure API is enabled
```

## 📞 Support Resources

- **Google Maps Issues:** [Google Maps Support](https://developers.google.com/maps/support)
- **Firebase Issues:** [Firebase Support](https://firebase.google.com/support)
- **Stripe Issues:** [Stripe Support](https://support.stripe.com/)
- **Circle Issues:** [Circle Support](https://www.circle.com/support)

## 🎯 Quick Checklist

Before going live, ensure:

- [ ] Google Maps API key added to `/lib/config.ts`
- [ ] Google Maps API key restricted in Google Cloud Console
- [ ] Firebase config added to `/lib/config.ts`
- [ ] Firebase authentication enabled in Firebase Console
- [ ] Firestore database created
- [ ] Cloud Functions deployed (see FIREBASE_SETUP.md)
- [ ] Stripe key added (if using card payments)
- [ ] Circle key added (if using crypto payments)
- [ ] Test booking flow end-to-end
- [ ] Test Alfred AI chat
- [ ] Test map interactions
- [ ] Monitor usage in dashboards

## 💡 Pro Tips

1. **Start with Google Maps** - It's the most visible feature
2. **Use test mode** - Keep Stripe in test mode until you're ready
3. **Monitor costs** - Set up billing alerts in all platforms
4. **Test thoroughly** - Use the app as a user would
5. **Keep backups** - Save your config.ts somewhere safe

---

Need help? Check the other guides:
- `GOOGLE_MAPS_SETUP.md` - Detailed Google Maps setup
- `FIREBASE_SETUP.md` - Complete Firebase configuration
- `DEPLOYMENT_GUIDE.md` - Production deployment tips
