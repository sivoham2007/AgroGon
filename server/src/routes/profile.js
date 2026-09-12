import { Router } from "express";
import { db } from "../db.js";
import { publicFarmer } from "../utils.js";

export const profileRouter = Router();

profileRouter.get("/", (req, res) => {
  res.json(publicFarmer(req.farmer));
});

const EDITABLE_FIELDS = {
  name: "name", age: "age", village: "village", district: "district", state: "state",
  email: "email", primaryCrop: "primary_crop", farmAreaAcres: "farm_area_acres",
  preferredLanguage: "preferred_language", lat: "lat", lng: "lng",
};

profileRouter.patch("/", (req, res) => {
  const sets = [];
  const values = [];
  for (const [bodyKey, column] of Object.entries(EDITABLE_FIELDS)) {
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, bodyKey)) {
      sets.push(`${column} = ?`);
      values.push(req.body[bodyKey]);
    }
  }
  if (!sets.length) {
    return res.status(400).json({ error: "validation_error", message: "No editable fields provided." });
  }
  sets.push("updated_at = datetime('now')");
  values.push(req.farmer.id);
  db.prepare(`UPDATE farmers SET ${sets.join(", ")} WHERE id = ?`).run(...values);
  const updated = db.prepare("SELECT * FROM farmers WHERE id = ?").get(req.farmer.id);
  res.json(publicFarmer(updated));
});

// Convenience: language alone, used by the language switcher.
profileRouter.put("/language", (req, res) => {
  const { language } = req.body || {};
  if (!language) return res.status(400).json({ error: "validation_error", message: "language is required." });
  db.prepare("UPDATE farmers SET preferred_language = ?, updated_at = datetime('now') WHERE id = ?").run(language, req.farmer.id);
  res.json({ preferredLanguage: language });
});
