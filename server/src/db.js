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

