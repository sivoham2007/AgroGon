# AgroGon — System Architecture

**Your Farm. Your Data. Your Intelligent Crop Guardian.**

This document accompanies `agrogon_prototype.html` (interactive UI/UX prototype),
`database_schema.sql`, and `API_SPEC.md`. It describes how the full production
system fits together beyond the prototype.

---

## 1. What's in this package

| File | What it is |
|---|---|
| `agrogon_prototype.html` | Fully interactive, click-through demo of every core screen (open in any browser). Runs entirely client-side with realistic demo data — this **is** the "Demo Mode" flow from the spec, judge-ready. |
| `database_schema.sql` | Complete PostgreSQL + PostGIS schema for every entity in the product. |
| `API_SPEC.md` | REST API surface the Flutter app and admin dashboard would call. |
| `ARCHITECTURE.md` | This file — system design, AI pipeline, tech stack, security model. |

The prototype is a **design and interaction artifact**, not a connected app — it
has no backend, database, or trained models behind it. Wiring it to the real
stack below is the next build phase.

---

## 2. High-level system diagram

```
┌────────────────────┐        ┌─────────────────────────┐
│   Flutter App       │  HTTPS │   FastAPI Backend        │
│  (Farmer, mobile)    │◄──────►│  (REST + WebSocket)       │
│  SQLite/Hive cache   │        │                          │
└─────────┬───────────┘        │  ┌────────────────────┐  │
          │ MQTT/HTTPS          │  │ Auth (OTP + JWT)   │  │
          ▼                     │  ├────────────────────┤  │
┌────────────────────┐        │  │ Farm/Field Service │  │
│  ESP32 Sensor Nodes  │───────►│  ├────────────────────┤  │
│  (soil, temp, humid) │        │  │ AI Inference Service│─┼──► GPU worker pool
└────────────────────┘        │  ├────────────────────┤  │    (PyTorch models)
                                │  │ Risk Engine         │  │
┌────────────────────┐        │  ├────────────────────┤  │
│  Admin Web Dashboard │◄──────►│  │ Alerts/Notifications│──┼──► FCM push
│  (React, responsive) │        │  ├────────────────────┤  │
└────────────────────┘        │  │ Drone Mission Svc   │  │
                                │  └────────────────────┘  │
                                │           │               │
                                │           ▼               │
                                │  PostgreSQL + PostGIS     │
                                └─────────────────────────┘
```

---

## 3. Technology stack (per product spec, Section 33)

- **Frontend (farmer app):** Flutter — single codebase for Android/iOS, offline-capable, good camera/GPS access.
- **Backend:** Python + FastAPI — async, OpenAPI docs generated automatically, easy to put AI inference behind the same service boundary.
- **Database:** PostgreSQL + PostGIS — relational data plus native polygon/point geometry for farm boundaries, treatment zones, and alert radii.
- **AI/ML:** PyTorch, OpenCV, Hugging Face Transformers, YOLO, scikit-learn.
- **IoT:** ESP32 nodes reporting soil moisture, temperature, humidity, pH over MQTT or HTTPS to `/sensors/readings`.
- **Notifications:** Firebase Cloud Messaging.
- **Offline storage:** SQLite/Hive on-device, synced via `/sync/push` and `/sync/pull`.
- **Deployment:** Docker containers per service, behind a reverse proxy (e.g. Nginx/Traefik) with HTTPS.
- **Admin dashboard:** Responsive React web app consuming the same REST API with an `admin` role.

---

## 4. AI pipeline (Section 32)

```
Image capture
   │
   ▼
Quality check (OpenCV: blur / exposure / framing)
   │  fail → "Image is unclear. Please move closer and try again."
   ▼
Crop identification (lightweight classifier)
   │
   ▼
Disease detection — MobileViT-class vision transformer (or similarly
   efficient on-device model for offline inference)
   │
Pest detection — YOLO-based object detector, returns bounding boxes
   │
   ▼
Confidence scoring → results always phrased as "Possible X detected",
   never a guaranteed diagnosis
   │
   ▼
Risk Engine (XGBoost / Random Forest) — combines disease/pest signal
   with weather, sensor readings, and nearby community reports into
   Disease / Pest / Water / Nutrient / Weather risk levels
   │
   ▼
Advisory — retrieves guidance from the curated `recommendation_library`
   table (approved-source agricultural guidance), never freeform
   chemical dosages
   │
   ▼
Treatment Zone generation — maps risk back onto sub-polygons of the
   farm boundary for the Precision Treatment Map and Drone module
```

**Development/demo mode:** when trained models aren't yet deployed, the
inference service returns clearly labeled mock responses matching the same
schema, so the rest of the app is fully testable end-to-end (this is what
the HTML prototype simulates client-side).

---

## 5. Offline-first design

- Farmer profile, farm data, previously downloaded crop advisories, captured
  images, and sensor readings are all written to local SQLite/Hive first.
- A lightweight on-device model (quantized, mobile-optimized) can run basic
  disease inference without connectivity; results are flagged as
  "offline estimate" and re-verified against the server model once synced.
- On reconnect, the client shows **"Syncing your farm data..."**, calls
  `/sync/push` then `/sync/pull`, and updates **"Last synced: 2 minutes ago"**.

---

## 6. Security & privacy (Section 43)

- **Auth:** phone number + OTP for farmers; JWT access/refresh tokens; OTPs
  stored hashed with short expiry.
- **Role separation:** `farmer`, `operator` (drone), `admin` — enforced at the
  API layer, not just the UI.
- **Location privacy:** exact farm boundaries and sensor coordinates are
  never returned by community-facing endpoints (`/alerts`). Only a rounded,
  radius-based `approx_location` is exposed, per the schema's
  `alerts.approx_location` design.
- **Drone safety:** `drone_missions.status` cannot move from
  `pending_approval` → `approved` without an authenticated `approved_by`
  farmer/operator — enforced server-side, not just in the UI flow.
- **Input validation & HTTPS-ready:** every write endpoint validates payload
  shape and geometry before touching PostGIS.

---

## 7. Suggested build order

1. Auth + Farmer/Farm services + schema (this package) — foundation.
2. Digital land mapping + treatment zones (PostGIS work).
3. AI inference service in **mock mode** (matches `/scan/crop` contract) so
   frontend work is unblocked while models are trained.
4. Sensor ingestion (ESP32 → `/sensors/readings`) + dashboard.
5. Risk engine + Alerts/Notifications (FCM).
6. Drone mission service + simulated telemetry (as prototyped in the HTML
   demo) before real hardware integration.
7. Admin dashboard.
8. Swap mock AI responses for trained MobileViT/YOLO/XGBoost models.

---

## 8. Configuration placeholders needed for a real deployment

- `MAPS_API_KEY` — map tile/geocoding provider
- `WEATHER_API_KEY` — weather + forecast provider
- `FCM_SERVER_KEY` / `FIREBASE_CONFIG` — push notifications
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `DATABASE_URL` (PostgreSQL + PostGIS)
- `AI_MODEL_REGISTRY_PATH` — where trained model weights are loaded from
- `SMS_OTP_PROVIDER_KEY` — OTP delivery
