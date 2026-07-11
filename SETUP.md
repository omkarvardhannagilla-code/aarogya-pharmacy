# Aarogya Pharmacy — Complete Setup & Deployment Guide

Everything here is **free tier**. Total setup time ≈ 30–40 minutes.

---

## 1. What each service does

| Service | Used for | Free tier | Env vars |
|---|---|---|---|
| **Groq** | AI assistant chat (Llama 3.3 70B) | Yes, generous | `GROQ_API_KEY` |
| **Google Gemini** | Prescription OCR (multilingual, handwriting), extraction, authenticity + AI-generation checks — all in one vision call | Yes (Gemini 2.0 Flash) | `GEMINI_API_KEY` |
| **Supabase** | Orders DB, verification records, QR cross-device upload sessions | Yes (500MB) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Telegram Bot** | Owner order notifications + calendar/filter management bot | Free forever | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET` |
| **OpenStreetMap Nominatim** | Geocoding for delivery ETA | Free, **no key needed** | `PHARMACY_LAT`, `PHARMACY_LNG` (your shop coords) |
| **QR codes** | Generated locally by the `qrcode` npm package | No service needed | — |

All keys are consumed **server-side only** (`src/app/api/*` routes + `src/lib/supabase.js`). Nothing sensitive ever reaches the browser.

---

## 2. Get the keys

### Groq (chat AI)
1. Go to `console.groq.com` → sign up (Google login works).
2. **API Keys** → *Create API Key* → copy it → `GROQ_API_KEY`.
3. Rate limits (free): ~30 req/min on `llama-3.3-70b-versatile` — plenty for a demo/small client.
4. If you outgrow it: swap the model string in `src/app/api/chat/route.js`, or move to a paid tier.

### Google Gemini (prescription verification)
1. Go to `aistudio.google.com` → *Get API key* → create in a new project → `GEMINI_API_KEY`.
2. Free tier of `gemini-2.0-flash`: ~15 req/min, 1500/day — fine for prescriptions.
3. Consumed by `src/app/api/verify-prescription/route.js`.

### Supabase (database)
1. `supabase.com` → New project (choose the Mumbai region for lowest latency).
2. **Project Settings → API**: copy *Project URL* → `SUPABASE_URL`, and the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ service key = server-only, never expose).
3. **SQL Editor** → run this schema:

```sql
create table rx_sessions (
  id text primary key,
  image text,
  mime text,
  created_at timestamptz default now()
);

create table verifications (
  id uuid primary key default gen_random_uuid(),
  decision text,
  needs_review boolean default false,
  report jsonb,
  image text,
  mime text,
  created_at timestamptz default now()
);

create table orders (
  id text primary key,
  created_at timestamptz default now(),
  date date,
  status text,                -- approved | pending | denied
  customer jsonb,
  items jsonb,
  totals jsonb,
  language text,
  eta jsonb,
  verification_id uuid,
  report jsonb
);

-- housekeeping: auto-clean QR sessions older than 1 hour (optional)
-- (run manually or via Supabase scheduled function)
-- delete from rx_sessions where created_at < now() - interval '1 hour';
```

### Telegram bot (owner side)
1. In Telegram, message **@BotFather** → `/newbot` → pick a name → copy the token → `TELEGRAM_BOT_TOKEN`.
2. Get your chat id: message **@userinfobot** → it replies with your id → `TELEGRAM_CHAT_ID`.
3. Send your new bot any message once (bots can't message you first).
4. Set `TELEGRAM_WEBHOOK_SECRET` to any random string (e.g. from `openssl rand -hex 16`).
5. **After deploying to Vercel**, register the webhook (one time, paste in browser):
```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-app>.vercel.app/api/telegram-webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
```
6. Now send `/start` to your bot → you get the order menu (Today / Yesterday / 📅 calendar / ✅❌🟡 filters).

### Pharmacy location (ETA)
Set `PHARMACY_LAT` / `PHARMACY_LNG` to your shop's coordinates (right-click in Google Maps → copy). Defaults to central Hyderabad. Nominatim needs no key; the code already sends the required User-Agent. Keep volumes low (1 req/order) per their fair-use policy — for production scale, switch to Ola Maps / Google Maps APIs.

---

## 3. `.env.local` (local development)

Create `.env.local` in the project root (never commit it — already in `.gitignore`):

```
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=123456789
TELEGRAM_WEBHOOK_SECRET=some-random-string
PHARMACY_LAT=17.3850
PHARMACY_LNG=78.4867
```

Run:
```bash
npm install
npm run dev
```

Everything degrades gracefully: with no keys, the site + cart still work; AI features show a clear "not configured" message instead of crashing.

---

## 4. Push to GitHub (secure)

```bash
cd aarogya-pharmacy
git init
git add .
git status        # confirm .env.local is NOT listed (it's gitignored)
git commit -m "Aarogya Pharmacy: full build (phases 1-5)"
```
Create an empty repo on github.com (no README), then:
```bash
git remote add origin https://github.com/NagillaOmkar/aarogya-pharmacy.git
git branch -M main
git push -u origin main
```

Security checklist before pushing:
- `.gitignore` covers `.env*`, `node_modules`, `.next` ✔ (already done)
- `grep -rn "gsk_\|AIza\|eyJ" src/` returns nothing ✔ (no hardcoded keys)
- All keys only referenced via `process.env.*` in `src/app/api/**` and `src/lib/supabase.js` ✔

---

## 5. Deploy on Vercel

1. `vercel.com` → **Add New → Project** → *Import* your GitHub repo.
2. Framework auto-detects **Next.js** — leave build settings default.
3. Before first deploy, open **Environment Variables** and add ALL variables from section 3 (Production + Preview).
4. Click **Deploy**.
5. After deploy: **register the Telegram webhook** (section 2, step 5) using your live URL.
6. Optional custom domain: Project → Settings → Domains → add `pharmacy.web-in.live` → in Name.com add the CNAME record Vercel shows → wait for the ✅.
7. If you add/change env vars later: **Deployments → ⋯ → Redeploy** (env changes need a redeploy).

---

## 6. Post-deploy test checklist

Landing & transition
- [ ] `/` shows capsule → opens → tablets float; reduced-motion users get the opened state directly
- [ ] "Enter the pharmacy" dives into a tablet → `/shop`; repeat 3× and confirm a *different* tablet
Shop
- [ ] Search "dolo", filter ℞-only + price slider + manufacturer together, all 6 sorts, pagination
- [ ] Quick view, product page fields, related products
Cart & assistant
- [ ] Add items on site → open assistant → Order tab shows the same items instantly; qty changes reflect both ways
- [ ] Language picker; chat replies in Telugu/Hindi when chosen
Prescription (use a real-looking prescription photo)
- [ ] OTC-only cart skips verification; ℞ cart demands it
- [ ] Blurry photo → rejected with quality reason
- [ ] Valid photo → progress messages → approved → details step
- [ ] QR flow: desktop shows QR → scan on phone → capture → appears on desktop without refresh
Order
- [ ] Non-Telangana pincode (e.g. 110001) → blocked with clear message
- [ ] Valid order → success + order ID; Telegram receives summary + prescription photo
- [ ] Bot `/start` → Today shows the order; filters + calendar + detail view; pending orders can be approved/denied
General
- [ ] Mobile / tablet / desktop layout; keyboard navigation; no console errors

---

## 7. Production upgrade paths (when free tiers pinch)

- Chat: Groq paid tier or any OpenAI-compatible endpoint (one URL/model change)
- OCR: Google Cloud Vision (higher accuracy SLAs) behind the same route
- Maps: Ola Maps (India-friendly free tier) or Google Distance Matrix for road-accurate ETAs
- Images in DB: move prescription images from the table to Supabase Storage buckets
- Cron: Supabase scheduled function to purge old `rx_sessions`

## 8. Compliance note (for a real client)

Selling Schedule H/H1 medicines online in India requires a retail drug licence and dispensing under a **registered pharmacist**. This build is designed accordingly: the AI only pre-screens; anything it can't fully verify lands as **Pending** in the owner's Telegram for human approval, and AI-rejected prescriptions can never be force-approved. Keep it that way.
