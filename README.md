# Aarogya Pharmacy — Full Build (Phases 1–5)

Premium online pharmacy for Telangana. Next.js 14 (App Router) + Tailwind + Zustand.
500 unique, real Indian medicines across 21 categories — generated into `src/data/medicines.json`.

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000
```
Data is pre-generated. To regenerate: `npm run generate:data`.

## What's in Phase 1
- 500-product catalog (name, salt, manufacturer, ₹ price + MRP + discount, pack, ℞ flag, stock, rating)
- Procedural animated 3D medicine boxes (no image assets needed for 500 SKUs)
- Instant search (name / salt / brand / manufacturer / category)
- Combined filters: category, OTC/℞, max price, manufacturer, in-stock — no reloads
- Sorting: popular, price ↑↓, rating, A–Z, availability
- Pagination (24/page), quick view modal
- Product detail page: uses, benefits, dosage, warnings, side effects, storage, mfg/expiry, delivery info
- Cart: add/remove, qty stepper (drawer + full page), savings math, ℞ notice, persisted in localStorage
- About page (no email/phone), Telangana-only + COD messaging throughout
- Responsive, keyboard-focus visible, `prefers-reduced-motion` respected

## Phases 2–5 (all included)
- **Phase 2** — Cinematic Three.js capsule landing at `/`: capsule drifts in → opens → tablets float; clicking Enter dives the camera through a **random tablet** into `/shop`
- **Phase 3** — AI assistant (Groq chat + Gemini vision, both free tier): multilingual (language picker first), live-synced with the site cart, prescription upload with staged progress, OCR + extraction + authenticity + AI-generation suspicion + cart-medicine matching, checkout gated until verification passes (client AND server-side)
- **Phase 4** — QR cross-device upload (desktop shows QR → phone captures → appears on desktop, via Supabase polling) + owner **Telegram bot**: instant order notifications with prescription photo & AI report, calendar navigation, Today/Yesterday, ✅/❌/🟡 filters, pending-order approve/deny (AI-denied can never be force-approved)
- **Phase 5** — Delivery ETA (Nominatim geocoding + haversine from your shop), Telangana-only + COD enforcement on the server, `.env.example`, and **SETUP.md** with every API key guide, Supabase SQL, GitHub + Vercel deployment and a full testing checklist

## Deploy (Vercel)
Push to GitHub → import in Vercel → deploy. Add the env vars from `.env.example` (full guide in **SETUP.md**).

> Note for real-world use: selling ℞ medicines online in India requires a retail drug licence and pharmacist verification. This build keeps final dispensing approval with the pharmacy owner by design.
