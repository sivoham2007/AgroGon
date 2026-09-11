import { Router } from "express";
import { db } from "../db.js";
import { newId } from "../utils.js";

export const cropsRouter = Router();

function rowToCrop(r) {
  return {
    id: r.id, farmId: r.farm_id, name: r.name, variety: r.variety, stage: r.stage,
    areaAcres: r.area_acres, sowingDate: r.sowing_date, notes: r.notes,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// GET /api/crops — only this farmer's crops
cropsRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM crops WHERE farmer_id = ? ORDER BY created_at DESC").all(req.farmer.id);
  res.json(rows.map(rowToCrop));
});

cropsRouter.post("/", (req, res) => {
  const { name, variety, stage, areaAcres, sowingDate, notes, farmId } = req.body || {};
  if (!name) return res.status(400).json({ error: "validation_error", message: "name is required." });
  const id = newId();
  db.prepare(
    `INSERT INTO crops (id, farmer_id, farm_id, name, variety, stage, area_acres, sowing_date, notes)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(id, req.farmer.id, farmId || null, name, variety || null, stage || null, areaAcres || null, sowingDate || null, notes || null);
  const row = db.prepare("SELECT * FROM crops WHERE id = ?").get(id);
  res.status(201).json(rowToCrop(row));
});

function ownedCropOr404(req, res) {
  const row = db.prepare("SELECT * FROM crops WHERE id = ?").get(req.params.id);
  if (!row || row.farmer_id !== req.farmer.id) {
    res.status(404).json({ error: "not_found", message: "Crop not found." });
    return null;
  }
  return row;
}

cropsRouter.put("/:id", (req, res) => {
  const row = ownedCropOr404(req, res);
  if (!row) return;
  const { name, variety, stage, areaAcres, sowingDate, notes } = req.body || {};
  db.prepare(
    `UPDATE crops SET name = ?, variety = ?, stage = ?, area_acres = ?, sowing_date = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(
    name ?? row.name, variety ?? row.variety, stage ?? row.stage,
    areaAcres ?? row.area_acres, sowingDate ?? row.sowing_date, notes ?? row.notes, row.id
  );
  res.json(rowToCrop(db.prepare("SELECT * FROM crops WHERE id = ?").get(row.id)));
});

cropsRouter.delete("/:id", (req, res) => {
  const row = ownedCropOr404(req, res);
  if (!row) return;
  db.prepare("DELETE FROM crops WHERE id = ?").run(row.id);
  res.status(204).end();
});
