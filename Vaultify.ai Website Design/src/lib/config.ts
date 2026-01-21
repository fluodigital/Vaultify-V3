const env = import.meta.env;

const defaults = {
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
  googleMapsMapId: 'YOUR_GOOGLE_MAPS_MAP_ID',
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
  stripePublishableKey: '',
  circleApiKey: '',
  openaiApiKey: '',
};

export const config = {
  googleMapsApiKey: env?.VITE_GOOGLE_MAPS_API_KEY || defaults.googleMapsApiKey,
  googleMapsMapId: env?.VITE_GOOGLE_MAPS_MAP_ID || defaults.googleMapsMapId,
  firebase: {
    apiKey: env?.VITE_FIREBASE_API_KEY || defaults.firebase.apiKey,
    authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN || defaults.firebase.authDomain,
    projectId: env?.VITE_FIREBASE_PROJECT_ID || defaults.firebase.projectId,
    storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET || defaults.firebase.storageBucket,
    messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID || defaults.firebase.messagingSenderId,
    appId: env?.VITE_FIREBASE_APP_ID || defaults.firebase.appId,
  },
  stripePublishableKey: env?.VITE_STRIPE_PUBLISHABLE_KEY || defaults.stripePublishableKey,
  circleApiKey: env?.VITE_CIRCLE_API_KEY || defaults.circleApiKey,
  openaiApiKey: env?.VITE_OPENAI_API_KEY || defaults.openaiApiKey,
};

export const isGoogleMapsConfigured = () =>
  Boolean(config.googleMapsApiKey && config.googleMapsApiKey !== defaults.googleMapsApiKey);

export const isFirebaseConfigured = () =>
  Boolean(config.firebase.apiKey && config.firebase.apiKey !== defaults.firebase.apiKey);
