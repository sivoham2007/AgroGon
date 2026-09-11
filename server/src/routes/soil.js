import { Router } from "express";
import { db } from "../db.js";
import { newId } from "../utils.js";

export const soilRouter = Router();

function rowToSoil(r) {
  return {
    id: r.id, farmId: r.farm_id, ph: r.ph, moisturePct: r.moisture_pct,
    nitrogen: r.nitrogen, phosphorus: r.phosphorus, potassium: r.potassium,
    notes: r.notes, source: r.source, createdAt: r.created_at,
  };
}

soilRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM soil_analyses WHERE farmer_id = ? ORDER BY created_at DESC").all(req.farmer.id);
  res.json(rows.map(rowToSoil));
});

// Record a soil analysis result. `source` stays "manual" until a real
// AI/ML model or lab-integration API is connected server-side — see
// docs/API_SPEC.md §7. This endpoint never fabricates a model prediction.
soilRouter.post("/", (req, res) => {
  const { ph, moisturePct, nitrogen, phosphorus, potassium, notes, farmId } = req.body || {};
  const id = newId();
  db.prepare(
    `INSERT INTO soil_analyses (id, farmer_id, farm_id, ph, moisture_pct, nitrogen, phosphorus, potassium, notes, source)
     VALUES (?,?,?,?,?,?,?,?,?, 'manual')`
  ).run(id, req.farmer.id, farmId || null, ph ?? null, moisturePct ?? null, nitrogen ?? null, phosphorus ?? null, potassium ?? null, notes || null);
  res.status(201).json(rowToSoil(db.prepare("SELECT * FROM soil_analyses WHERE id = ?").get(id)));
});
