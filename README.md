# AgroGon

**Your Farm. Your Data. Your Intelligent Crop Guardian.**

A responsive web application for crop monitoring, AI-assisted disease
detection, risk prediction, and precision treatment planning — built for
real use, not a demo. React + TypeScript + Vite + Tailwind.

## Run it

This is now two pieces: the React frontend (this folder) and a real backend
in `server/`. Both need to be running for login, profile, crops, soil
analysis, weather, and notifications to work.

**1. Backend** (in one terminal):

```bash
cd server
npm install
cp .env.example .env    # then edit JWT_SECRET to a long random string
npm start                # http://localhost:4000
```

This creates `server/data/agrogon.sqlite` on first run (SQLite, no separate
database server to install). See `server/README.md` for the full API list,
what's real vs. still pending, and production notes (JWT secret, SMS
provider, HTTPS).

**2. Frontend** (in another terminal):

```bash
npm install
npm run dev        # http://localhost:5173
```

If the backend runs somewhere other than `http://localhost:4000`, set
`VITE_API_URL` (e.g. in a `.env` file at the project root):
`VITE_API_URL=https://your-api-host/api`.

Production build:

```bash
npm run build       # outputs to dist/, tsc type-checks first (currently passes clean)
npm run preview      # serve the production build locally
```

**Deployment note:** this app uses `BrowserRouter`, so routes like
`/dashboard` only resolve correctly when the server rewrites unknown paths
to `index.html` (standard "SPA fallback" — Vercel, Netlify, and most static
hosts do this by default or with one config line). Opening `dist/index.html`
directly via `file://` will not route correctly; use `npm run preview` or a
real static host.

## What changed in this pass

The previous build was a hackathon-style prototype with a phone-frame
mockup, a "Demo Mode" toggle, and a Judge Presentation Mode with a guided
walkthrough. This pass converted it into a real product shell:

**Removed:**
- Demo Mode toggle and its "DEMO MODE" ribbon.
- Judge Presentation Mode and the guided 12-step journey bar.
- The phone-frame mockup shell (`PhoneFrame`/`StatusBar`) — replaced with a
  responsive `AppShell` (real top navbar, mobile bottom nav, desktop footer).
- Every "demo"-framed UI string (OTP screen, drone status, mission
  completion, mock-service comments) — reworded into honest, production
  language. Where something genuinely isn't connected yet (SMS delivery,
  drone hardware, live AI models), that's now stated plainly instead of
  labeled "demo."

**Added:**
- **Working i18n** — `src/i18n/translations.ts` + `useT()` hook, covering
  navigation, common actions, and landing/dashboard copy in English, Hindi,
  Telugu, Tamil, Kannada, Marathi, and Bengali. The language switcher
  (`LanguageSwitcher.tsx`) actually swaps rendered text and persists the
  choice in `localStorage` across reloads.
- **A real navigation architecture** — top navbar (desktop) / bottom nav
  (mobile) organized into Dashboard, Crop Intelligence, Disease Detection,
  Soil Analysis, Weather & Alerts, Field Monitoring, Market Intelligence,
  Government Schemes, AI Assistant, and Community & Support.
- **A real landing page** (`/`) — hero, feature grid, two content sections —
  using original SVG illustrations rather than hotlinked stock photography.
- **Three new sections** for Market Intelligence, Government Schemes, and
  Community & Support. Market and Schemes are genuinely not connected to a
  live data source yet, so instead of fabricating numbers they show a clear
  "what this needs to go live" panel (`IntegrationPending.tsx`). Community
  ships a real, working FAQ + link to the AI Assistant, with only the
  forum piece marked pending.
- Real online/offline detection (`navigator.onLine` + browser events)
  replacing the old manual demo toggle.

## Latest pass — official logo, left sidebar, dashboard redesign

- **Real AgroGon logo integrated.** Extracted directly from the reference
  screenshot (cropped + background-keyed with a luminance threshold, not
  redrawn) into `public/images/agrogon-emblem.png` (icon, used in a small
  dark badge chip so it reads well on light backgrounds) and
  `public/images/agrogon-splash-logo.png` (full lockup, used on the dark
  splash where it's a near-exact match to the source). Also rebuilt
  `favicon.png` from the same source. Placed on: splash, landing header +
  footer, login, OTP, register, and the sidebar (`src/components/ui/Brand.tsx`
  is the single shared component every placement uses).
- **Splash screen rebuilt** with the real logo, a pulsing glow animation,
  and the tagline — shown once per browser session via `sessionStorage`,
  not on every page navigation (a deliberate choice: re-showing it on every
  accidental refresh would annoy a real farmer more than it looks premium).
- **Left sidebar navigation** replaces the top navbar, matching the
  reference layout: logo at top, then Dashboard / My Farm / Crop Health /
  Disease Detection / Weather & Alerts / Alerts / AI Recommendations /
  Tasks / Camera Monitoring / Reports, with Settings / Profile / Logout
  pinned below. Collapses to a mobile drawer under `lg:`.
- **Dashboard rebuilt** to match the reference: welcome banner with a
  subtle field-illustration background, 5 stat cards (Farm Health Score,
  Total Land Area, Active Crops, AI Recommendations, Active Alerts), a
  Live Farm View panel, Weather Today, Soil & Env. Conditions, AI
  Recommendations preview, Recent Alerts preview, and a Farm Map preview
  — each "View All" links through to a full page.
- **New screens, genuinely functional, not fake:** AI Recommendations
  (full list), Tasks (real add/complete/delete, in-memory), Reports
  (drawn from real timeline data), Farm Map (zones + zoom + map/satellite
  toggle). Camera Monitoring is clearly labeled as a mock feed — see below.
- **Camera Monitoring** shows a simulated feed (an original SVG "field from
  above" illustration, not a real stream) with camera selection, refresh/
  reconnect controls, and a simulated detection-event log. The screen and
  its underlying data shape are structured so a real RTSP/WebRTC stream or
  backend video service can be dropped in later — this is stated on-screen,
  not hidden behind a realistic-looking fake.
- **Profile and Settings split** into two real screens: Profile (editable
  personal info) and Settings (language, notification toggles, camera
  settings link, change-password form, logout).

## Known gaps — stated plainly, not hidden

- **No multi-step registration wizard yet.** Registration is still the
  original single-step form (name/phone/language/location/crop). The
  4-step flow (Personal → Location → Farm → Account) with a progress
  indicator, phone/age/pincode validation, and a password-strength meter
  hasn't been built yet.
- **Login is OTP-only** — no username/password sign-in, no show/hide
  password toggle, no "Remember me" persistence, no "Forgot password" flow.
  The current login only collects a phone number and sends to OTP.
- **No document upload system** — the drag-and-drop file upload
  (select/preview/remove/replace, progress bar, format validation) hasn't
  been built.
- **Background imagery is applied to the Dashboard banner and auth pages
  only** — My Farm and other pages mentioned in the brief don't have the
  background treatment yet.
- **Translation coverage is partial.** Shell/nav/common-action strings are
  translated; long-form generated content (AI explanations, dynamic
  recommendation text, disease descriptions) is still English-only. Machine
  translation risks giving a farmer wrong agronomic advice in their own
  language, so I didn't fake that coverage — real coverage needs either a
  reviewed translation service or agronomist-checked copy per language.
- **Feature interconnection is partial.** Some of the connections the
  product should have (disease detection → recommendation, weather → crop
  suggestion, soil → fertilizer suggestion) exist for the Zone D story on
  Dashboard/Risk/Treatment/Drone; they are not yet wired for every feature
  pairing described in the brief.
- **Backend is now real for some features, still mock for others.**
  `server/` is a real Express + SQLite backend — see `server/README.md`.
  Connected to it: registration, OTP login (hashed + expiring, real DB
  storage — no fake login success), profile (get/update, persisted),
  crops (full CRUD, per-user), soil analysis records, notifications, and
  weather (real live data from Open-Meteo, updates daily — no more static
  numbers). Disease scanning uploads and stores the image for real but
  honestly returns "no model connected yet" rather than a fake diagnosis
  (see `server/src/routes/scan.js`). Irrigation and equipment have real
  storage endpoints but no hardware/IoT to pull from yet, so they start
  empty instead of showing invented sensor readings. Sensors, drone,
  market, community, camera monitoring, digital twin, and mission planning
  are still on the mock service layer in `src/services/mock/` pending a
  real data source, model, or hardware for each — see `docs/API_SPEC.md`
  and `docs/database_schema.sql` for the contract they're built against.
- **Translation coverage is unchanged from before this backend pass** —
  see the "Translation coverage is partial" bullet above. Only ~3 of the
  ~38 screen/component files call `useT()`; the rest still render
  hardcoded English regardless of the language switcher. This is a
  frontend content task independent of the backend work in this pass.
- **No automated tests / no ESLint config scaffolded** — `tsc -b` is the
  enforced type-safety gate; there's no `npm run lint` script yet.
- **Non-logo images are original SVG illustrations, not photography** — a
  deliberate choice (explained above), not an oversight.

## Architecture

- `src/i18n/` — translation dictionaries + `useT()` hook.
- `src/components/layout/AppShell.tsx` — the responsive shell (navbar,
  mobile tabs, footer, offline indicator).
- `src/components/ui/IntegrationPending.tsx` — the honest "not connected
  yet" state used by Market/Schemes/Community instead of fake data.
- `src/services/contracts/` — TypeScript interfaces = the API contract.
- `src/services/mock/` — mock implementations of every contract, isolated
  so they're a one-file swap once a real backend exists.
- `src/features/*` — one folder per screen/module.
- `docs/` — database schema, API spec, and system architecture notes.
