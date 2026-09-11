import { Router } from "express";
import { db } from "../db.js";
import { newId } from "../utils.js";

export const irrigationRouter = Router();

function rowToIrrigation(r) {
  return { id: r.id, farmId: r.farm_id, mode: r.mode, schedule: r.schedule, status: r.status, source: r.source, updatedAt: r.updated_at };
}

// One settings row per farmer for now (matches the current single-farm UI).
irrigationRouter.get("/", (req, res) => {
  const row = db.prepare("SELECT * FROM irrigation_settings WHERE farmer_id = ? ORDER BY updated_at DESC LIMIT 1").get(req.farmer.id);
  if (!row) return res.json(null); // honest "nothing configured yet", not fake sensor data
  res.json(rowToIrrigation(row));
});

irrigationRouter.put("/", (req, res) => {
  const { mode, schedule, status, farmId } = req.body || {};
  const existing = db.prepare("SELECT * FROM irrigation_settings WHERE farmer_id = ? ORDER BY updated_at DESC LIMIT 1").get(req.farmer.id);
  if (existing) {
    db.prepare(
      `UPDATE irrigation_settings SET mode = ?, schedule = ?, status = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(mode ?? existing.mode, schedule ?? existing.schedule, status ?? existing.status, existing.id);
    return res.json(rowToIrrigation(db.prepare("SELECT * FROM irrigation_settings WHERE id = ?").get(existing.id)));
  }
  const id = newId();
  db.prepare(
    `INSERT INTO irrigation_settings (id, farmer_id, farm_id, mode, schedule, status) VALUES (?,?,?,?,?,?)`
  ).run(id, req.farmer.id, farmId || null, mode || "manual", schedule || null, status || "off");
  res.status(201).json(rowToIrrigation(db.prepare("SELECT * FROM irrigation_settings WHERE id = ?").get(id)));
});
