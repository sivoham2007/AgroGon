# AgroGon — Project Plan (Lead Engineer Notes)

## 1. Requirements analysis (summary)

AgroGon is an offline-first, AI-assisted smart-agriculture platform. Stripped
to its core, the product has five subsystems:

1. **Identity** — farmer registration, OTP auth, Farmer ID.
2. **Farm data** — digital land mapping (geometry), crop/field metadata.
3. **Perception** — AI crop/pest scanning, sensor ingestion, weather.
4. **Intelligence** — risk prediction, hyperlocal alerts, treatment zones.
5. **Action** — drone missions (human-approved), advisory chat, history.

Everything else (dashboard, notifications, profile, admin) is a view over
these five subsystems. That's the ordering Phases 2–8 follow.

## 2. Reality check on tooling (stated up front, not buried)

This sandbox has Node/npm but **no Flutter SDK, no Android/iOS toolchain, no
GPU, no persistent server, and no real device/drone hardware**. So:

- **UI/UX (Phase 1):** built in **React + TypeScript + Vite + Tailwind**,
  not Flutter. It's mobile-first, phone-framed, and structured so that
  porting the verified screens/flows to Flutter later is a translation
  exercise, not a redesign. This is a deliberate substitution so you get
  something you can actually run and click through today.
- **Backend/DB (Phase 4):** FastAPI + PostgreSQL/PostGIS code is written
  and runnable *in principle*, but this environment can't host a
  long-lived server for you to hit from a browser session. I'll build it
  as a real, tested local service (runnable with `docker compose up` /
  `uvicorn`) rather than a hosted one.
- **AI models (Phase 5):** no GPU, no training data. I'll build the
  **inference service contract** and a **mock model** that returns
  realistic, schema-correct responses, clearly isolated behind an
  interface so a trained MobileViT/YOLO/XGBoost model can be swapped in
  without touching any calling code.
- **Hardware (ESP32, drones):** simulated against the same API contract
  the real hardware would call.

Nothing below is faked as "done" when it isn't — mock pieces are isolated
in `services/mock/` and flagged in code and in this doc.

## 3. Folder structure (frontend)

```
agrogon-app/
├─ src/
│  ├─ app/                 # app shell: router, providers, global state
│  │   ├─ App.tsx
│  │   ├─ router.tsx
│  │   └─ AppState.tsx     # lightweight global store (auth, demo mode, farm)
│  ├─ components/
│  │   ├─ ui/              # PrimaryButton, SecondaryButton, Field, Pill,
│  │   │                   # LoadingState, EmptyState, ErrorState, BottomNav...
│  │   ├─ cards/           # FarmCard, HealthScore, RiskCard, WeatherCard,
│  │   │                   # AlertCard, DiseaseResultCard, SensorCard,
│  │   │                   # TreatmentZoneCard, DroneStatusCard...
│  │   └─ layout/          # PhoneFrame, ScreenHeader, DemoModeBanner
│  ├─ features/            # one folder per product module (screens + local state)
│  │   ├─ onboarding/  auth/  dashboard/  farm/  scanner/  riskAlerts/
│  │   ├─ advisory/  sensors/  treatment/  drone/  history/  profile/
│  ├─ services/
│  │   ├─ contracts/       # TypeScript interfaces = the API contract (Phase 4+)
│  │   └─ mock/            # DEMO MODE implementations of every contract
│  ├─ data/                 # static demo data (Section 40 of product spec)
│  ├─ types/                 # shared domain types (Farmer, Farm, Zone, Mission…)
│  ├─ hooks/                 # useAuth, useFarm, useMission, etc.
│  └─ styles/                 # tailwind entry, design tokens
├─ tailwind.config / postcss.config
└─ vite.config.ts
```

Backend, when built in Phase 4, lands in a sibling `agrogon-backend/`
following the layered structure in `ARCHITECTURE.md` (api / services /
repositories / models).

## 4. Database schema & API contracts

Already specified and reviewed:
- `agrogon_database_schema.sql` — PostgreSQL + PostGIS schema.
- `agrogon_API_SPEC.md` — REST contract.

Both carry forward unchanged into Phase 4; Phase 1's `services/contracts/`
TypeScript interfaces are typed mirrors of that same API spec, so the mock
layer and the real backend are interchangeable behind one interface.

## 5. UI component system

Design tokens (colors, type, radius, shadow) match the approved brand spec.
Component inventory: `PrimaryButton`, `SecondaryButton`, `GhostButton`,
`Field` (input/select), `Pill` (risk level), `Gauge` (leaf-ring health
score — signature element), `FarmCard`, `HealthScoreCard`, `RiskCard`,
`WeatherCard`, `AlertCard`, `DiseaseResultCard`, `SensorCard`, `MapZone`,
`TreatmentZoneCard`, `DroneStatusCard`, `RecommendationCard`, `BottomNav`,
`LoadingState`, `EmptyState`, `ErrorState`, `Toast`, `Stepper`.

## 6. Navigation flow

```
Splash → Onboarding(3) → Login ⇄ Register → OTP → Dashboard
Dashboard ⇄ [Farm, Scanner, Alerts, Profile]  (bottom nav)
Farm → Digital Land Map
Dashboard → Scanner → Analyzing → Disease Result → { Advisory | Treatment Map }
Dashboard → Risk Prediction → Treatment Map
Treatment Map → Zone Detail → Drone Mission → Mission Simulation → Dashboard
Profile → History / Notifications / Settings
```
Full diagram retained in `ARCHITECTURE.md`.

## 7. External dependencies (needed before Phases 5–9 go from mock → real)

| Need | Used by | Placeholder env var |
|---|---|---|
| Maps/geocoding provider | Land mapping, alerts map | `MAPS_API_KEY` |
| Weather provider | Weather card, risk engine | `WEATHER_API_KEY` |
| SMS/OTP provider | Auth | `SMS_OTP_PROVIDER_KEY` |
| Push notifications | Alerts, mission status | `FCM_SERVER_KEY` |
| Trained disease model (MobileViT-class) | Crop scanner | `AI_MODEL_REGISTRY_PATH` |
| Trained pest model (YOLO) | Pest scanner | same registry |
| ESP32 firmware + device provisioning | Sensors | `SENSOR_DEVICE_SECRET` |
| Drone flight controller SDK | Drone module | vendor SDK key (TBD) |
| PostgreSQL + PostGIS instance | Backend | `DATABASE_URL` |

Until these are supplied, every one of these features runs against the
mock service layer, and the UI never claims a real reading it doesn't have.

## 8. Phase checklist

- [x] Phase 0 — Analysis, architecture, schema, API contracts, component
      system, nav flow, dependency list (this document + prior deliverables).
- [ ] Phase 1 — Mobile UI/UX + navigation, demo data only. **← building now**
- [ ] Phase 2 — Auth, registration, Farmer ID (against mock, then real API).
- [ ] Phase 3 — Digital farm mapping.
- [ ] Phase 4 — Backend + database.
- [ ] Phase 5 — AI crop/disease detection.
- [ ] Phase 6 — Weather + sensor data.
- [ ] Phase 7 — Risk prediction + hyperlocal alerts.
- [ ] Phase 8 — Treatment zones + drone simulation.
- [ ] Phase 9 — Offline-first sync.
- [ ] Phase 10 — End-to-end test of the full farmer workflow.

Each phase ends with a build/run check before the next starts — see the
"Phase gate" note at the bottom of each phase's summary once delivered.
