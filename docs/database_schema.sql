-- =====================================================================
-- AGROGON — Database Schema (PostgreSQL 15+ with PostGIS extension)
-- "Your Farm. Your Data. Your Intelligent Crop Guardian."
-- =====================================================================
-- Notes:
--  * Farm boundaries and precise coordinates are geospatial (PostGIS)
--    and are treated as sensitive — never exposed publicly (see
--    hyperlocal_alerts, which stores only an approximate radius zone).
--  * All tables use UUID primary keys for safe client-side generation
--    (useful for offline-first sync).
--  * `synced_at` / `created_offline` support the offline-first client.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ---------------------------------------------------------------------
-- FARMERS
-- ---------------------------------------------------------------------
CREATE TABLE farmers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_code         VARCHAR(20) UNIQUE NOT NULL,      -- e.g. AGG-KA-000124
    name                VARCHAR(120) NOT NULL,
    phone               VARCHAR(20) UNIQUE NOT NULL,
    preferred_language  VARCHAR(20) NOT NULL DEFAULT 'en', -- en, kn, te, hi, ...
    state               VARCHAR(80),
    district            VARCHAR(80),
    village             VARCHAR(80),
    role                VARCHAR(20) NOT NULL DEFAULT 'farmer', -- farmer | admin | operator
    phone_verified      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OTP challenges (short-lived, never store raw OTP long-term in prod — hash it)
CREATE TABLE otp_challenges (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone           VARCHAR(20) NOT NULL,
    otp_hash        VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    attempts        SMALLINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- FARMS  (boundary as PostGIS polygon, precise — access-controlled)
-- ---------------------------------------------------------------------
CREATE TABLE farms (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id           UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    farm_name           VARCHAR(120) NOT NULL,
    boundary            GEOMETRY(Polygon, 4326),          -- exact polygon, private
    centroid            GEOMETRY(Point, 4326),             -- derived, used for distance calc
    area_acres          NUMERIC(8,2),
    crop                VARCHAR(80),
    crop_variety        VARCHAR(80),
    sowing_date         DATE,
    growth_stage        VARCHAR(40),                       -- Sowing, Vegetative, Flowering, Fruiting, Harvest
    irrigation_type     VARCHAR(40),                        -- Drip, Sprinkler, Flood, Rainfed
    created_offline     BOOLEAN NOT NULL DEFAULT FALSE,
    synced_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_farms_boundary ON farms USING GIST (boundary);
CREATE INDEX idx_farms_centroid ON farms USING GIST (centroid);
CREATE INDEX idx_farms_farmer   ON farms (farmer_id);

-- ---------------------------------------------------------------------
-- CROP SCANS / DISEASE & PEST REPORTS
-- ---------------------------------------------------------------------
CREATE TABLE disease_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    image_url       TEXT NOT NULL,
    crop            VARCHAR(80),
    disease_label   VARCHAR(120),          -- model class label, e.g. "early_blight"
    confidence      NUMERIC(5,2),          -- 0-100
    severity        VARCHAR(20),           -- Low | Moderate | High
    model_version   VARCHAR(40),           -- e.g. "mobilevit-disease-v1.2"
    location        GEOMETRY(Point, 4326),
    reported_to_community BOOLEAN NOT NULL DEFAULT FALSE,
    created_offline BOOLEAN NOT NULL DEFAULT FALSE,
    synced_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_disease_farm ON disease_reports (farm_id);
CREATE INDEX idx_disease_location ON disease_reports USING GIST (location);

CREATE TABLE pest_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    image_url       TEXT NOT NULL,
    pest_label      VARCHAR(120),
    confidence      NUMERIC(5,2),
    detected_count  INTEGER,
    infestation_level VARCHAR(20),         -- Low | Medium | High
    bounding_boxes  JSONB,                 -- [{x,y,w,h,label,score}, ...]
    model_version   VARCHAR(40),
    location        GEOMETRY(Point, 4326),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- SENSOR READINGS (from ESP32 field nodes)
-- ---------------------------------------------------------------------
CREATE TABLE sensor_devices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    device_code     VARCHAR(40) UNIQUE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'offline', -- online | offline
    last_seen_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sensor_readings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id       UUID NOT NULL REFERENCES sensor_devices(id) ON DELETE CASCADE,
    farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    temperature_c   NUMERIC(5,2),
    humidity_pct    NUMERIC(5,2),
    soil_moisture_pct NUMERIC(5,2),
    soil_ph         NUMERIC(4,2),
    light_level     VARCHAR(20),           -- Low | Normal | High
    created_offline BOOLEAN NOT NULL DEFAULT FALSE,
    synced_at       TIMESTAMPTZ,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sensor_farm_time ON sensor_readings (farm_id, recorded_at DESC);

-- ---------------------------------------------------------------------
-- RISK PREDICTION SNAPSHOTS (output of the XGBoost/RF risk engine)
-- ---------------------------------------------------------------------
CREATE TABLE risk_snapshots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    disease_risk    VARCHAR(10),   -- LOW | MEDIUM | HIGH
    pest_risk       VARCHAR(10),
    water_stress    VARCHAR(10),
    nutrient_risk   VARCHAR(10),
    weather_risk    VARCHAR(10),
    overall_health_pct SMALLINT,
    contributing_factors JSONB,    -- ["High humidity","Recent rainfall",...]
    model_version   VARCHAR(40),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_risk_farm_time ON risk_snapshots (farm_id, created_at DESC);

-- ---------------------------------------------------------------------
-- HYPERLOCAL ALERTS  (community-visible, privacy-preserving radius only)
-- ---------------------------------------------------------------------
CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_report_id UUID REFERENCES disease_reports(id),
    type            VARCHAR(30) NOT NULL,   -- disease | pest | weather | sensor | drone
    severity        VARCHAR(10) NOT NULL,   -- low | medium | high
    message         TEXT NOT NULL,
    approx_location GEOMETRY(Point, 4326),  -- fuzzed/rounded, never the exact farm point
    radius_m        INTEGER NOT NULL DEFAULT 2000,
    district        VARCHAR(80),
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_alerts_location ON alerts USING GIST (approx_location);

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id       UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    alert_id        UUID REFERENCES alerts(id),
    title           VARCHAR(160) NOT NULL,
    body            TEXT,
    priority        VARCHAR(10) NOT NULL DEFAULT 'info', -- critical | warning | info
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_farmer ON notifications (farmer_id, created_at DESC);

-- ---------------------------------------------------------------------
-- PRECISION TREATMENT ZONES  (sub-polygons of a farm's boundary)
-- ---------------------------------------------------------------------
CREATE TABLE treatment_zones (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id             UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    zone_label          VARCHAR(10) NOT NULL,   -- A, B, C, D...
    geometry            GEOMETRY(Polygon, 4326),
    condition           VARCHAR(60),             -- Healthy, Water stress, Nutrient concern, Disease risk
    severity            VARCHAR(10),
    confidence          NUMERIC(5,2),
    recommended_action  TEXT,
    area_acres          NUMERIC(6,2),
    last_detected_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_zones_geom ON treatment_zones USING GIST (geometry);

-- ---------------------------------------------------------------------
-- DRONE MISSIONS
-- ---------------------------------------------------------------------
CREATE TABLE drone_missions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_code        VARCHAR(20) UNIQUE NOT NULL,  -- e.g. AG-1024
    farm_id             UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    target_zone_id      UUID REFERENCES treatment_zones(id),
    operation_type      VARCHAR(40),         -- Water | Liquid fertilizer | Crop-protection treatment
    estimated_area_acres NUMERIC(6,2),
    route                GEOMETRY(LineString, 4326),
    status               VARCHAR(30) NOT NULL DEFAULT 'planned',
                          -- planned | pending_approval | approved | in_flight | applying | completed | cancelled
    requires_approval    BOOLEAN NOT NULL DEFAULT TRUE,
    approved_by          UUID REFERENCES farmers(id),
    approved_at          TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at         TIMESTAMPTZ
);

CREATE TABLE drone_telemetry (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id      UUID NOT NULL REFERENCES drone_missions(id) ON DELETE CASCADE,
    battery_pct     SMALLINT,
    tank_pct        SMALLINT,
    gps_status      VARCHAR(20),
    position        GEOMETRY(Point, 4326),
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- ADVISORY / CHAT LOG (for the multilingual AI assistant)
-- ---------------------------------------------------------------------
CREATE TABLE advisory_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id       UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL,   -- user | assistant
    language        VARCHAR(10) NOT NULL DEFAULT 'en',
    content         TEXT NOT NULL,
    intent_tag      VARCHAR(40),            -- disease_help | pest_help | water | fertilizer | weather
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Structured, pre-approved recommendation library the assistant must
-- draw from for crop-protection guidance (never freeform chemical advice).
CREATE TABLE recommendation_library (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop            VARCHAR(80),
    condition_label VARCHAR(120),           -- matches disease_label / pest_label
    region          VARCHAR(80),            -- guidance can vary by state/KVK
    recommendation_text TEXT NOT NULL,
    source           VARCHAR(160),           -- e.g. "ICAR / State Agriculture Dept guideline"
    approved_by      VARCHAR(120),
    last_reviewed_at DATE
);

-- ---------------------------------------------------------------------
-- SYNC LOG (offline-first bookkeeping)
-- ---------------------------------------------------------------------
CREATE TABLE sync_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id       UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    entity_type     VARCHAR(40),   -- disease_reports | sensor_readings | farms ...
    entity_id       UUID,
    direction       VARCHAR(10),   -- push | pull
    status          VARCHAR(20),   -- success | failed
    synced_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- End of schema
-- =====================================================================
