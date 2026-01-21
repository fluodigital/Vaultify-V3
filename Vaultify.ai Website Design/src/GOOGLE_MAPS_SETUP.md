# Google Maps API Setup Guide

## Overview
The InteractiveMap component uses Google Maps JavaScript API with advanced markers to display luxury experiences across the globe with a custom dark theme.

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Maps Marker API** (for Advanced Markers)
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > API Key**
6. Copy your API key

### 2. Secure Your API Key (REQUIRED for Figma Make)

1. In the API key settings, click **Edit API key**
2. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add these domains (REQUIRED):
     - `*.figma.site/*` ← **REQUIRED for Figma Make**
     - `*.figma.com/*` ← **REQUIRED for Figma Make**
     - `http://localhost:*` (for local development)
     - `https://localhost:*` (for local development)
     - `https://yourdomain.com/*` (for production, if applicable)
3. Under **API restrictions**:
   - Select **Restrict key**
   - Choose:
     - Maps JavaScript API ✓

**⚠️ IMPORTANT:** Without the `*.figma.site/*` domain, you'll get a `RefererNotAllowedMapError` in Figma Make!

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Google Maps API key to `.env.local`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. For Production Deployment

Add the environment variable to your hosting platform:

**Vercel:**
```bash
vercel env add VITE_GOOGLE_MAPS_API_KEY
```

**Netlify:**
- Go to Site Settings > Environment Variables
- Add `VITE_GOOGLE_MAPS_API_KEY` with your API key

**Firebase Hosting:**
Add to your build environment or use Firebase Functions config.

## Features Implemented

### Custom Dark Luxury Theme
- Pure black backgrounds (#0a0a0a)
- Champagne gold accents (#D4AF7A, #B8935E)
- Dark roads and minimal labels
- Water bodies in deep black (#0d0d0d)

### Advanced Markers
- Custom HTML markers with champagne gold styling
- Hover effects with gradient backgrounds
- Pulse animations on load
- Click-to-navigate functionality
- Price display bubbles

### Interactive Features
- Hover preview cards showing experience details
- Zoom controls with champagne gold icons
- Live status indicator
- Smooth animations and transitions
- Mobile-optimized touch gestures

### Map Controls
- Custom zoom in/out buttons
- Gesture handling for smooth panning
- No default Google UI (fully custom design)
- Dark theme throughout

## Customization

### Modify Map Styles
Edit the `luxuryMapStyles` array in `/components/mobile/InteractiveMap.tsx`:

```typescript
const luxuryMapStyles = [
  // Add or modify style rules
  { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
  // ...
];
```

### Adjust Initial Map Position
Modify the map initialization in the component:

```typescript
const map = new google.maps.Map(mapRef.current, {
  center: { lat: 20, lng: 0 }, // Change center coordinates
  zoom: 2, // Adjust zoom level (1-20)
  // ...
});
```

### Custom Marker Styles
The markers are styled using inline CSS in the component. Look for the `markerElement.innerHTML` section to customize the marker appearance.

## Pricing

Google Maps offers:
- **$200 free credit per month**
- Map loads: $7 per 1,000 loads (after free tier)
- Advanced Markers: Included in Map loads

For most applications, the free tier is sufficient.

## Troubleshooting

### Map Not Loading
1. Check console for errors
2. Verify API key is correct in `.env.local`
3. Ensure Maps JavaScript API is enabled in Google Cloud Console
4. Check domain restrictions match your current domain

### Markers Not Appearing
1. Verify marker data has valid lat/lng coordinates
2. Check console for marker-related errors
3. Ensure Maps Marker API is enabled

### Styling Issues
1. Clear browser cache
2. Check that custom styles are being applied
3. Verify `luxuryMapStyles` array is properly formatted

## Support Resources

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Advanced Markers Guide](https://developers.google.com/maps/documentation/javascript/advanced-markers)
- [Map Styling Wizard](https://mapstyle.withgoogle.com/)
- [Pricing Calculator](https://mapsplatformtransition.withgoogle.com/calculator)

## Security Best Practices

1. ✅ Always use environment variables for API keys
2. ✅ Set up domain restrictions on your API key
3. ✅ Enable only required APIs
4. ✅ Monitor usage in Google Cloud Console
5. ✅ Set up billing alerts
6. ❌ Never commit API keys to git
7. ❌ Never expose keys in client-side code directly
