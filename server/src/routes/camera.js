import { Router } from "express";
import { db } from "../db.js";
import { newId } from "../utils.js";

export const cameraRouter = Router();

cameraRouter.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM cameras WHERE farmer_id = ?");
  const cameras = stmt.all(req.farmer.id);
  res.json(cameras);
});

cameraRouter.post("/", (req, res) => {
  const { name, stream_url, farm_id } = req.body;
  const id = newId();
  
  const stmt = db.prepare(`
    INSERT INTO cameras (id, farmer_id, farm_id, name, stream_url, status)
    VALUES (?, ?, ?, ?, ?, 'online')
  `);
  stmt.run(id, req.farmer.id, farm_id || null, name || 'New Camera', stream_url || null);
  
  const newCam = db.prepare("SELECT * FROM cameras WHERE id = ?").get(id);
  res.json(newCam);
});

cameraRouter.delete("/:id", (req, res) => {
  const stmt = db.prepare("DELETE FROM cameras WHERE id = ? AND farmer_id = ?");
  stmt.run(req.params.id, req.farmer.id);
  res.json({ success: true });
});
