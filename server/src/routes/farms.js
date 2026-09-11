import { Router } from "express";
import { db } from "../db.js";
import { newId } from "../utils.js";

export const farmsRouter = Router();

function rowToFarm(r) {
  return {
    id: r.id, farmName: r.farm_name, crop: r.crop, cropVariety: r.crop_variety,
    sowingDate: r.sowing_date, growthStage: r.growth_stage, irrigationType: r.irrigation_type,
    areaAcres: r.area_acres, boundary: r.boundary_json ? JSON.parse(r.boundary_json) : null,
    lat: r.lat, lng: r.lng,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

farmsRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM farms WHERE farmer_id = ? ORDER BY created_at ASC").all(req.farmer.id);
  res.json(rows.map(rowToFarm));
});

farmsRouter.post("/", (req, res) => {
  const { farmName, crop, cropVariety, sowingDate, growthStage, irrigationType, areaAcres, lat, lng } = req.body || {};
  if (!farmName) return res.status(400).json({ error: "validation_error", message: "farmName is required." });
  const id = newId();
  db.prepare(
    `INSERT INTO farms (id, farmer_id, farm_name, crop, crop_variety, sowing_date, growth_stage, irrigation_type, area_acres, lat, lng)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).run(id, req.farmer.id, farmName, crop || null, cropVariety || null, sowingDate || null, growthStage || null, irrigationType || null, areaAcres || null, lat || null, lng || null);
  res.status(201).json(rowToFarm(db.prepare("SELECT * FROM farms WHERE id = ?").get(id)));
});

farmsRouter.patch("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM farms WHERE id = ?").get(req.params.id);
  if (!row || row.farmer_id !== req.farmer.id) return res.status(404).json({ error: "not_found", message: "Farm not found." });
  const { farmName, crop, cropVariety, sowingDate, growthStage, irrigationType, areaAcres, lat, lng } = req.body || {};
  db.prepare(
    `UPDATE farms SET farm_name=?, crop=?, crop_variety=?, sowing_date=?, growth_stage=?, irrigation_type=?, area_acres=?, lat=?, lng=?, updated_at=datetime('now') WHERE id=?`
  ).run(
    farmName ?? row.farm_name, crop ?? row.crop, cropVariety ?? row.crop_variety,
    sowingDate ?? row.sowing_date, growthStage ?? row.growth_stage, irrigationType ?? row.irrigation_type,
    areaAcres ?? row.area_acres, lat ?? row.lat, lng ?? row.lng, row.id
  );
  res.json(rowToFarm(db.prepare("SELECT * FROM farms WHERE id = ?").get(row.id)));
});

farmsRouter.post("/:id/boundary", (req, res) => {
  const row = db.prepare("SELECT * FROM farms WHERE id = ?").get(req.params.id);
  if (!row || row.farmer_id !== req.farmer.id) return res.status(404).json({ error: "not_found", message: "Farm not found." });
  const { boundary, areaAcres } = req.body || {};
  db.prepare("UPDATE farms SET boundary_json=?, area_acres=?, updated_at=datetime('now') WHERE id=?")
    .run(JSON.stringify(boundary || null), areaAcres ?? row.area_acres, row.id);
  res.json({ areaAcres: areaAcres ?? row.area_acres });
});
