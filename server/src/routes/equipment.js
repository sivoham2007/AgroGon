import { Router } from "express";
import { db } from "../db.js";
import { newId } from "../utils.js";

export const equipmentRouter = Router();

function rowToEquip(r) {
  return { id: r.id, name: r.name, type: r.type, status: r.status, lastService: r.last_service, source: r.source, createdAt: r.created_at, updatedAt: r.updated_at };
}

equipmentRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM equipment WHERE farmer_id = ? ORDER BY created_at DESC").all(req.farmer.id);
  res.json(rows.map(rowToEquip));
});

equipmentRouter.post("/", (req, res) => {
  const { name, type, status, lastService } = req.body || {};
  if (!name) return res.status(400).json({ error: "validation_error", message: "name is required." });
  const id = newId();
  db.prepare(
    `INSERT INTO equipment (id, farmer_id, name, type, status, last_service) VALUES (?,?,?,?,?,?)`
  ).run(id, req.farmer.id, name, type || null, status || "unknown", lastService || null);
  res.status(201).json(rowToEquip(db.prepare("SELECT * FROM equipment WHERE id = ?").get(id)));
});

equipmentRouter.put("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM equipment WHERE id = ?").get(req.params.id);
  if (!row || row.farmer_id !== req.farmer.id) return res.status(404).json({ error: "not_found", message: "Equipment not found." });
  const { name, type, status, lastService } = req.body || {};
  db.prepare(
    `UPDATE equipment SET name = ?, type = ?, status = ?, last_service = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(name ?? row.name, type ?? row.type, status ?? row.status, lastService ?? row.last_service, row.id);
  res.json(rowToEquip(db.prepare("SELECT * FROM equipment WHERE id = ?").get(row.id)));
});
