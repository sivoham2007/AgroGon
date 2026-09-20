import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "agrogon.sqlite"));
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// ---------------------------------------------------------------------
// Schema — pragmatic SQLite version of docs/database_schema.sql, extended
// per the client's backend-integration request (crops, soil analyses,
// equipment, irrigation settings tables that didn't exist yet).
// Swap this file for a Postgres/PostGIS client later without touching
// route handlers, since all queries go through the exported `db` object.
// ---------------------------------------------------------------------
db.exec(`
CREATE TABLE IF NOT EXISTS farmers (
  id                 TEXT PRIMARY KEY,
  farmer_code        TEXT UNIQUE NOT NULL,
  name               TEXT NOT NULL,
  phone              TEXT UNIQUE NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  state              TEXT,
  district           TEXT,
  village            TEXT,
  primary_crop       TEXT,
  farm_area_acres    REAL,
  age                INTEGER,
  phone_verified     INTEGER NOT NULL DEFAULT 0,
  lat                REAL,
  lng                REAL,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS otp_challenges (
  id         TEXT PRIMARY KEY,
  phone      TEXT NOT NULL,
  otp_hash   TEXT NOT NULL,
  purpose    TEXT NOT NULL DEFAULT 'login', -- login | register
  expires_at TEXT NOT NULL,
  attempts   INTEGER NOT NULL DEFAULT 0,
  consumed   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS farms (
  id               TEXT PRIMARY KEY,
  farmer_id        TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farm_name        TEXT NOT NULL,
  crop             TEXT,
  crop_variety     TEXT,
  sowing_date      TEXT,
  growth_stage     TEXT,
  irrigation_type  TEXT,
  area_acres       REAL,
  boundary_json    TEXT, -- GeoJSON polygon, stored as text (no PostGIS in SQLite)
  lat              REAL,
  lng              REAL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS crops (
  id          TEXT PRIMARY KEY,
  farmer_id   TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farm_id     TEXT REFERENCES farms(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  variety     TEXT,
  stage       TEXT,
  area_acres  REAL,
  sowing_date TEXT,
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS soil_analyses (
  id          TEXT PRIMARY KEY,
  farmer_id   TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farm_id     TEXT REFERENCES farms(id) ON DELETE SET NULL,
  ph          REAL,
  moisture_pct REAL,
  nitrogen    REAL,
  phosphorus  REAL,
  potassium   REAL,
  notes       TEXT,
  source      TEXT NOT NULL DEFAULT 'manual', -- manual | model (once an ML model is wired in)
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS disease_scans (
  id           TEXT PRIMARY KEY,
  farmer_id    TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farm_id      TEXT REFERENCES farms(id) ON DELETE SET NULL,
  image_path   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending_model', -- pending_model | complete
  result_json  TEXT, -- filled in once a real model/service is connected
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS irrigation_settings (
  id           TEXT PRIMARY KEY,
  farmer_id    TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farm_id      TEXT REFERENCES farms(id) ON DELETE SET NULL,
  mode         TEXT NOT NULL DEFAULT 'manual', -- manual | scheduled | sensor
  schedule     TEXT, -- free text / JSON, e.g. days+times
  status       TEXT NOT NULL DEFAULT 'off', -- off | on
  source       TEXT NOT NULL DEFAULT 'none', -- none | iot (once a device is paired)
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS equipment (
  id           TEXT PRIMARY KEY,
  farmer_id    TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT,
  status       TEXT NOT NULL DEFAULT 'unknown', -- unknown | active | idle | maintenance | offline
  last_service TEXT,
  source       TEXT NOT NULL DEFAULT 'manual', -- manual | iot
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  farmer_id  TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT,
  category   TEXT NOT NULL DEFAULT 'general',
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_farms_farmer ON farms(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_farmer ON crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_soil_farmer ON soil_analyses(farmer_id);
CREATE INDEX IF NOT EXISTS idx_scans_farmer ON disease_scans(farmer_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_farmer ON irrigation_settings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_equipment_farmer ON equipment(farmer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_farmer ON notifications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_challenges(phone);

CREATE TABLE IF NOT EXISTS farmer_connections (
  id                 TEXT PRIMARY KEY,
  farmer_id_1        TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farmer_id_2        TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  status             TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | rejected
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(farmer_id_1, farmer_id_2)
);
CREATE INDEX IF NOT EXISTS idx_connections_f1 ON farmer_connections(farmer_id_1);
CREATE INDEX IF NOT EXISTS idx_connections_f2 ON farmer_connections(farmer_id_2);

CREATE TABLE IF NOT EXISTS cameras (
  id           TEXT PRIMARY KEY,
  farmer_id    TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farm_id      TEXT REFERENCES farms(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'offline', -- online | offline
  stream_url   TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cameras_farmer ON cameras(farmer_id);
`);

// Try to alter tables to add new columns if they exist but don't have them yet.
try { db.exec("ALTER TABLE farmers ADD COLUMN lat REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE farmers ADD COLUMN lng REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE farms ADD COLUMN lat REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE farms ADD COLUMN lng REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE farmers ADD COLUMN email TEXT;"); } catch (e) {}

// ADVANCED AGRICULTURAL DECISION-SUPPORT TABLES
db.exec(`
CREATE TABLE IF NOT EXISTS agricultural_rules (
  id             TEXT PRIMARY KEY,
  rule_type      TEXT NOT NULL, -- 'fertilizer_npk', 'pesticide_dosage', 'crop_calendar', 'soil_threshold', 'crop_suitability'
  crop           TEXT,
  region         TEXT DEFAULT 'All',
  rule_data_json TEXT NOT NULL,
  source         TEXT,
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fertilizer_plans (
  id             TEXT PRIMARY KEY,
  farmer_id      TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farm_id        TEXT REFERENCES farms(id) ON DELETE SET NULL,
  crop           TEXT NOT NULL,
  area_acres     REAL NOT NULL,
  soil_type      TEXT,
  n_req          REAL,
  p_req          REAL,
  k_req          REAL,
  recommendation_json TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pesticide_calculations (
  id             TEXT PRIMARY KEY,
  farmer_id      TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farm_id        TEXT REFERENCES farms(id) ON DELETE SET NULL,
  crop           TEXT,
  pest           TEXT,
  product        TEXT,
  area_acres     REAL,
  tank_capacity  REAL,
  water_req      REAL,
  num_tanks      REAL,
  product_per_tank REAL,
  total_product  REAL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS crop_calendar_events (
  id             TEXT PRIMARY KEY,
  farmer_id      TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farm_id        TEXT REFERENCES farms(id) ON DELETE CASCADE,
  crop           TEXT NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  event_date     TEXT NOT NULL,
  event_type     TEXT, -- planting, fertilization, irrigation, harvest, monitoring
  status         TEXT NOT NULL DEFAULT 'pending', -- pending, completed, skipped
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS nutrient_deficiencies (
  id             TEXT PRIMARY KEY,
  soil_test_id   TEXT NOT NULL REFERENCES soil_analyses(id) ON DELETE CASCADE,
  nutrient       TEXT NOT NULL,
  status         TEXT,
  possible_causes TEXT,
  action         TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS crop_recommendations (
  id             TEXT PRIMARY KEY,
  farmer_id      TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farm_id        TEXT REFERENCES farms(id) ON DELETE SET NULL,
  recommendation_json TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rules_type ON agricultural_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_fert_farmer ON fertilizer_plans(farmer_id);
CREATE INDEX IF NOT EXISTS idx_pest_farmer ON pesticide_calculations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_calendar_farmer ON crop_calendar_events(farmer_id);
CREATE INDEX IF NOT EXISTS idx_calendar_farm ON crop_calendar_events(farm_id);

INSERT OR IGNORE INTO agricultural_rules (id, rule_type, crop, region, rule_data_json, source) VALUES 
('rule_fert_rice', 'fertilizer_npk', 'Rice', 'All', '{"n_req":60, "p_req":30, "k_req":30}', 'ICAR'),
('rule_fert_wheat', 'fertilizer_npk', 'Wheat', 'All', '{"n_req":50, "p_req":25, "k_req":25}', 'ICAR'),
('rule_fert_cotton', 'fertilizer_npk', 'Cotton', 'All', '{"n_req":40, "p_req":20, "k_req":20}', 'ICAR'),
('rule_fert_maize', 'fertilizer_npk', 'Maize', 'All', '{"n_req":70, "p_req":30, "k_req":30}', 'ICAR'),

('rule_cal_rice', 'crop_calendar', 'Rice', 'All', '[{"day_offset":0,"title":"Transplanting","type":"planting"},{"day_offset":15,"title":"First Weed Management","type":"monitoring"},{"day_offset":25,"title":"Top Dressing (Urea)","type":"fertilization"},{"day_offset":50,"title":"Panicle Initiation Check","type":"monitoring"},{"day_offset":70,"title":"Disease Monitoring","type":"monitoring"},{"day_offset":130,"title":"Harvest","type":"harvest"}]', 'ICAR'),
('rule_cal_wheat', 'crop_calendar', 'Wheat', 'All', '[{"day_offset":0,"title":"Sowing","type":"planting"},{"day_offset":21,"title":"Crown Root Initiation (Irrigation)","type":"irrigation"},{"day_offset":45,"title":"Tillering (Fertilizer)","type":"fertilization"},{"day_offset":85,"title":"Flowering Check","type":"monitoring"},{"day_offset":140,"title":"Harvest","type":"harvest"}]', 'ICAR'),

('rule_suit_rice', 'crop_suitability', 'Rice', 'All', '{"crop":"Rice","min_ph":5.5,"max_ph":7.0,"season":"Kharif","water_req":"High","soil_compat":["Clay","Clay Loam"]}', 'ICAR'),
('rule_suit_wheat', 'crop_suitability', 'Wheat', 'All', '{"crop":"Wheat","min_ph":6.0,"max_ph":7.5,"season":"Rabi","water_req":"Medium","soil_compat":["Loam","Clay Loam"]}', 'ICAR'),
('rule_suit_cotton', 'crop_suitability', 'Cotton', 'All', '{"crop":"Cotton","min_ph":5.8,"max_ph":8.0,"season":"Kharif","water_req":"Medium","soil_compat":["Black Cotton","Clay"]}', 'ICAR'),
('rule_suit_maize', 'crop_suitability', 'Maize', 'All', '{"crop":"Maize","min_ph":5.5,"max_ph":7.5,"season":"Kharif","water_req":"Medium","soil_compat":["Loam","Sandy Loam"]}', 'ICAR');
`);

// Try to alter tables to add new columns if they exist but don't have them yet.
// For disease_scans
try { db.exec("ALTER TABLE disease_scans ADD COLUMN crop TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE disease_scans ADD COLUMN possible_disease TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE disease_scans ADD COLUMN confidence REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE disease_scans ADD COLUMN severity TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE disease_scans ADD COLUMN symptoms TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE disease_scans ADD COLUMN causes TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE disease_scans ADD COLUMN recommendations TEXT;"); } catch (e) {}

// ADVANCED SOIL & DISEASE TABLES
db.exec(`
CREATE TABLE IF NOT EXISTS soil_tests (
  id             TEXT PRIMARY KEY,
  farmer_id      TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farm_id        TEXT REFERENCES farms(id) ON DELETE SET NULL,
  crop           TEXT,
  soil_type      TEXT,
  ph             REAL,
  nitrogen       REAL,
  phosphorus     REAL,
  potassium      REAL,
  organic_matter REAL,
  sulfur         REAL,
  zinc           REAL,
  iron           REAL,
  boron          REAL,
  fertility_score REAL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS soil_recommendations (
  id                  TEXT PRIMARY KEY,
  soil_test_id        TEXT NOT NULL REFERENCES soil_tests(id) ON DELETE CASCADE,
  recommendation_type TEXT,
  recommendation      TEXT,
  priority            TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS crop_suitability (
  id             TEXT PRIMARY KEY,
  crop           TEXT NOT NULL,
  soil_type      TEXT,
  ph_min         REAL,
  ph_max         REAL,
  nutrient_rules TEXT,
  region         TEXT,
  season         TEXT
);

CREATE INDEX IF NOT EXISTS idx_soil_tests_farmer ON soil_tests(farmer_id);
`);

try { db.exec("ALTER TABLE soil_tests ADD COLUMN organic_matter REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE soil_tests ADD COLUMN sulfur REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE soil_tests ADD COLUMN zinc REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE soil_tests ADD COLUMN iron REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE soil_tests ADD COLUMN boron REAL;"); } catch (e) {}


