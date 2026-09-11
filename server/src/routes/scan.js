import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { db } from "../db.js";
import { newId } from "../utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => cb(null, `${newId()}${path.extname(file.originalname || "")}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpe?g|png|webp)$/.test(file.mimetype);
    cb(ok ? null : new Error("Only JPG, PNG, or WEBP images are allowed."), ok);
  },
});

export const scanRouter = Router();

// POST /api/scan/crop — image upload wired to the backend and stored per
// farmer. No disease-detection model is connected yet, so this honestly
// returns status "pending_model" instead of fabricating a diagnosis.
// Swap in a real model/service call where marked below, per API_SPEC.md §4.
scanRouter.post("/crop", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) return res.status(400).json({ error: "upload_error", message: err.message });
    if (!req.file) return res.status(400).json({ error: "validation_error", message: "image file is required." });

    const id = newId();
    db.prepare(
      `INSERT INTO disease_scans (id, farmer_id, farm_id, image_path, status) VALUES (?,?,?,?, 'pending_model')`
    ).run(id, req.farmer.id, req.body.farmId || null, req.file.filename);

    // --- MODEL INTEGRATION POINT ---
    // const result = await diseaseModelClient.predict(req.file.path);
    // db.prepare(`UPDATE disease_scans SET status='complete', result_json=? WHERE id=?`)
    //   .run(JSON.stringify(result), id);

    res.status(202).json({
      scanId: id,
      status: "pending_model",
      message: "Image received and stored. No disease-detection model is connected yet, so no diagnosis is returned.",
    });
  });
});

scanRouter.get("/history", (req, res) => {
  const rows = db.prepare("SELECT * FROM disease_scans WHERE farmer_id = ? ORDER BY created_at DESC").all(req.farmer.id);
  res.json(rows.map((r) => ({
    id: r.id, farmId: r.farm_id, status: r.status,
    result: r.result_json ? JSON.parse(r.result_json) : null,
    imageUrl: `/uploads/${r.image_path}`,
    createdAt: r.created_at,
  })));
});
