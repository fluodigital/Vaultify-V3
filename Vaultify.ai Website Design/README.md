# Vaultify.ai Website Design

Marketing + authenticated app bundle generated from the Figma export. React 18 with Vite (SWC), TypeScript, compiled Tailwind CSS v4 styles, and React Router for SPA navigation. Firebase client SDK is included; Firebase Functions scaffolding lives in `src/functions`.

## Requirements
- Node 18+ (Vite 6)
- npm (package-lock.json present)

## Quick start
1) Install deps: `npm install`
2) Copy envs: `cp .env.example .env` and fill in values
3) Run dev server: `npm run dev`
4) Build: `npm run build` (outputs to `build/`)

## Environment variables
Populate `.env` (or Vercel project envs) with:
- `VITE_API_BASE_URL` (optional; points to backend base, otherwise relative /api)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GOOGLE_MAPS_API_KEY` (required for the dashboard map)
- `VITE_GOOGLE_MAPS_MAP_ID` (optional advanced markers)
- `VITE_STRIPE_PUBLISHABLE_KEY` (optional payments)
- `VITE_CIRCLE_API_KEY` (optional stablecoin payments)
- `VITE_OPENAI_API_KEY` (optional AI; prefer configuring in Firebase Functions for production)

`src/lib/config.ts` reads from the env variables above and falls back to placeholder defaults; no secrets are checked into the repo. The UI shows a friendly configuration-required state when keys are missing.

## Firebase notes
- Add your web app credentials to the env vars above.
- Enable required auth providers (Email/Password, Google, etc.) in Firebase Auth if you plan to use login flows.
- Firestore/Storage rules and indexes are included in `src/firestore.rules`, `src/storage.rules`, `src/firestore.indexes.json`.
- Backend logic scaffolding for Cloud Functions is under `src/functions/`; deploy via Firebase CLI if needed (not used by Vercel static build).

## Vercel deployment
- Build command: `npm run build`
- Output directory: `build`
- Node version: 18+
- SPA routing: `vercel.json` rewrites all routes to `/` for React Router deep links.

## Project structure (root)
- `src/` front-end source (components, pages, hooks, Firebase client)
- `src/styles/` global CSS (precompiled Tailwind v4 output)
- `src/lib/` config + Firebase helpers
- `src/functions/` Firebase Functions source
- `vercel.json` SPA rewrite + build/output settings
