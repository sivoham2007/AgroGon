# AgroGon REST API Specification

Base URL: `https://api.agrogon.app/v1`
Auth: `Authorization: Bearer <JWT>` on every route except `/auth/*`.
Content type: `application/json` unless uploading images (`multipart/form-data`).

All list endpoints support `?page=&limit=` pagination and return:
```json
{ "data": [...], "page": 1, "limit": 20, "total": 132 }
```

---

## 1. Authentication

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create farmer profile → returns `farmer_code` (e.g. `AGG-KA-000124`) |
| POST | `/auth/login` | Request login with phone number → triggers OTP send |
| POST | `/auth/verify-otp` | Verify OTP → returns JWT access + refresh token |
| POST | `/auth/refresh` | Exchange refresh token for a new access token |
| POST | `/auth/logout` | Revoke refresh token |

**POST /auth/register**
```json
{
  "name": "Ravi Kumar",
  "phone": "+919845012345",
  "preferred_language": "en",
  "state": "Karnataka", "district": "Chikkaballapur", "village": "Hosahalli",
  "primary_crop": "Tomato", "farm_area_acres": 2.7
}
```
→ `201 { "farmer_id": "uuid", "farmer_code": "AGG-KA-000124" }`

---

## 2. Farmer Profile

| Method | Route | Description |
|---|---|---|
| GET | `/farmer/profile` | Current farmer's profile |
| PATCH | `/farmer/profile` | Update name, language, location |
| DELETE | `/farmer/profile` | Request account deletion (GDPR/DPDP-style) |

---

## 3. Farms & Digital Land Mapping

| Method | Route | Description |
|---|---|---|
| GET | `/farms` | List the farmer's farms |
| POST | `/farms` | Create a farm (boundary as GeoJSON polygon or GPS point list) |
| GET | `/farms/{id}` | Farm detail |
| PATCH | `/farms/{id}` | Update crop, stage, irrigation, etc. |
| DELETE | `/farms/{id}` | Remove a farm |
| POST | `/farms/{id}/boundary` | Save/replace boundary geometry, returns computed `area_acres` |

**POST /farms**
```json
{
  "farm_name": "Green Valley Farm",
  "crop": "Tomato", "crop_variety": "Arka Rakshak",
  "sowing_date": "2026-06-12", "irrigation_type": "Drip",
  "boundary": { "type": "Polygon", "coordinates": [[[77.71,13.43],[77.712,13.43],[77.712,13.428],[77.71,13.428],[77.71,13.43]]] }
}
```

---

## 4. AI Crop Scanner

| Method | Route | Description |
|---|---|---|
| POST | `/scan/crop` | Upload leaf/plant image → runs quality check + disease model |
| POST | `/scan/pest` | Upload image → runs pest object-detection model |
| GET | `/scan/history` | Past scans for a farm |

**POST /scan/crop** (multipart: `image`, `farm_id`)
```json
{
  "quality_ok": true,
  "crop": "Tomato",
  "disease_label": "early_blight",
  "disease_display_name": "Early Blight",
  "confidence": 94.2,
  "severity": "Moderate",
  "model_version": "mobilevit-disease-v1.2",
  "disclaimer": "Possible Early Blight detected — not a guaranteed diagnosis."
}
```
If `quality_ok` is `false`, no inference is run and the response instructs the client to retake the photo ("Image is unclear. Please move closer and try again.").

---

## 5. Crop Health & Risk

| Method | Route | Description |
|---|---|---|
| GET | `/crop-health?farm_id=` | Current health score + sub-scores, plus 7/30-day trend |
| GET | `/risk?farm_id=` | Disease/pest/water/weather risk levels + contributing factors |
| GET | `/weather?farm_id=` | Current + forecast weather, agriculture-framed |

---

## 6. Alerts (Hyperlocal)

| Method | Route | Description |
|---|---|---|
| GET | `/alerts?lat=&lng=&radius_km=` | Nearby community alerts (approximate locations only) |
| POST | `/alerts` | Publish an alert from a confirmed/suspected farmer report |
| POST | `/alerts/{id}/notify-nearby` | Fan out a push notification to farmers within radius |

Farm coordinates are never returned in `/alerts` responses — only a rounded/fuzzed `approx_location` and `radius_m`, per the privacy rules in Section 43 of the product spec.

---

## 7. AI Advisory (Assistant)

| Method | Route | Description |
|---|---|---|
| POST | `/advisory/message` | Send a farmer message, get an assistant reply |
| GET | `/advisory/history` | Past conversation |
| GET | `/advisory/quick-topics` | Localized quick-reply topics (Disease/Pest/Water/Fertilizer/Weather) |

**POST /advisory/message**
```json
{ "text": "My tomato leaves are turning yellow", "language": "kn" }
```
The assistant is constrained to the `recommendation_library` table for any crop-protection or dosage guidance — it does not freely generate chemical instructions (see Section 45 product rules).

---

## 8. Sensors (IoT / ESP32)

| Method | Route | Description |
|---|---|---|
| GET | `/sensors?farm_id=` | Device list + online/offline status |
| GET | `/sensors/readings?farm_id=&since=` | Time-series readings |
| POST | `/sensors/readings` | Device ingestion endpoint (device auth via device key) |

---

## 9. Precision Treatment Map

| Method | Route | Description |
|---|---|---|
| GET | `/treatment-zones?farm_id=` | Zones with condition, severity, confidence |
| POST | `/treatment-plan` | Create a treatment plan from one or more zones |

---

## 10. Drone Operations

| Method | Route | Description |
|---|---|---|
| GET | `/drone/status?farm_id=` | Battery, GPS, tank, current mission |
| POST | `/drone/mission` | Create a mission (target zone, operation type) → status `pending_approval` |
| POST | `/drone/approve` | Farmer/operator approves a mission → unlocks flight |
| GET | `/drone/mission/{id}` | Mission detail + live telemetry |
| GET | `/drone/history?farm_id=` | Past missions |

**Rule enforced server-side:** a mission cannot transition from `pending_approval` to `approved` without an authenticated `approved_by` farmer/operator id — there is no autonomous-spray path.

---

## 11. Farm History & Notifications

| Method | Route | Description |
|---|---|---|
| GET | `/history?farm_id=` | Combined timeline (scans, sensor events, missions) |
| GET | `/notifications` | Farmer's notification feed |
| PATCH | `/notifications/{id}/read` | Mark as read |

---

## 12. Sync (Offline-First)

| Method | Route | Description |
|---|---|---|
| POST | `/sync/push` | Upload queued offline records (scans, sensor readings, farm edits) |
| GET | `/sync/pull?since=` | Pull server changes since last sync timestamp |

Response includes `last_synced_at` so the client can show "Last synced: 2 minutes ago".

---

## 13. Admin (role=admin only)

| Method | Route | Description |
|---|---|---|
| GET | `/admin/stats` | Totals: farmers, farms, disease reports, active alerts, high-risk farms |
| GET | `/admin/heatmap` | Hyperlocal disease heatmap (aggregated, privacy-safe) |
| GET | `/admin/drone-missions` | All missions across the region |

---

## Error format

```json
{ "error": { "code": "IMAGE_QUALITY_LOW", "message": "Image is unclear. Please move closer and try again." } }
```

Standard codes: `UNAUTHORIZED`, `OTP_EXPIRED`, `IMAGE_QUALITY_LOW`, `VALIDATION_ERROR`, `NOT_FOUND`, `APPROVAL_REQUIRED`, `RATE_LIMITED`.
