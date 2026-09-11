# AgroGon backend

A real Express + SQLite backend for the AgroGon frontend. No mock data —
every endpoint here either does the real thing (hashes and checks OTPs,
stores rows in a database, calls a live weather API) or honestly reports
that the thing it depends on (an ML model, IoT hardware, an SMS account)
isn't connected yet.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:
- **`JWT_SECRET`** — generate a real one: `openssl rand -hex 32`. Never
  ship the example value.
- **`DEV_OTP_ECHO`** — `true` returns the OTP in the API response so you
  can test registration/login without an SMS account. **Set to `false`
  before going live** — with it `true`, anyone who can see the response
  can see the code.

```bash
npm start        # http://localhost:4000
# or, for auto-restart on file changes:
npm run dev
```

SQLite database file is created automatically at `server/data/agrogon.sqlite`
on first run — no separate database server to install. Uploaded scan images
go to `server/uploads/`.

## What's real vs. still pending

| Feature | Status |
|---|---|
| Registration / OTP login / logout | **Real.** bcrypt-hashed OTPs with expiry and attempt limits, JWT sessions, no fake login success. |
| Profile (get/update/language) | **Real.** Persisted in SQLite, scoped to the logged-in user. |
| Crops (CRUD) | **Real.** Per-user, ownership checked on every write/delete. |
| Soil analysis records | **Real** storage/retrieval. `source` stays `"manual"` — no AI/ML model connected. |
| Notifications | **Real** storage, per user, mark-as-read. Nothing seeds fake notifications for new users. |
| Weather | **Real.** Proxies to Open-Meteo (free, no API key) — updates with real live data, not a fixed snapshot. |
| Disease scan | Image upload and storage are **real**; the diagnosis itself is **not** — no model is connected, so the API returns `status: "pending_model"` instead of inventing a result. Wire a real model/service in `src/routes/scan.js` at the marked integration point. |
| Irrigation settings / Equipment | **Real** storage endpoints, but nothing to read from yet — they start empty rather than showing invented sensor/device data. Wire an IoT/device integration at the marked points. |
| Sensors, drone, market prices, community, camera feed, digital twin, mission planning | **Not connected** — the frontend still uses `src/services/mock/` for these. Each needs its own real data source (IoT sensors, drone hardware, a market-price API, a community backend, a live camera stream, etc.) before it can be wired here the same way. |

## API surface

All authenticated routes require `Authorization: Bearer <token>` and only
ever read/write the requesting user's own data.

- `POST /api/auth/register`, `/login`, `/otp/resend`, `/verify-otp`, `/logout`
- `GET/PATCH /api/profile`, `PUT /api/profile/language`
- `GET/POST/PATCH /api/farms`, `POST /api/farms/:id/boundary`
- `GET/POST/PUT/DELETE /api/crops`
- `GET/POST /api/soil-analysis`
- `POST /api/scan/crop` (multipart image upload), `GET /api/scan/history`
- `GET/PUT /api/irrigation`
- `GET/POST/PUT /api/equipment`
- `GET/PUT /api/notifications`
- `GET /api/weather?lat=&lon=` (public — no auth needed for a forecast)

## Before shipping to production

- Set a real `JWT_SECRET` and set `DEV_OTP_ECHO=false`.
- Wire a real SMS provider (Twilio, MSG91, etc.) at the "SMS PROVIDER
  INTEGRATION POINT" comment in `src/routes/auth.js` — right now OTPs are
  only logged server-side.
- Put this behind HTTPS; set `CLIENT_ORIGIN` to your real frontend URL.
- Back up `data/agrogon.sqlite` regularly, or migrate to Postgres for
  multi-instance deployment (route handlers all go through the single
  `db` export in `src/db.js`, so this is a contained change).
