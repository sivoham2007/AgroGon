import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { db } from "../db.js";
import { newId } from "../utils.js";
import { GoogleGenAI } from "@google/genai";

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

export const diseaseRouter = Router();

diseaseRouter.post("/analyze", (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: "upload_error", message: err.message });
    if (!req.file) return res.status(400).json({ error: "validation_error", message: "image file is required." });

    const crop = req.body.crop || "Unknown";
    const scanId = newId();

    try {
      if (!process.env.GEMINI_API_KEY) {
        // Fallback for development if no API key is present
        const mockResult = {
          possible_disease: "Mock Early Blight",
          confidence: 85,
          severity: "Moderate",
          symptoms: ["Dark concentric spots on lower leaves", "Yellowing around spots"],
          causes: ["Warm, humid conditions", "Fungal spores from soil"],
          recommendations: ["Remove affected leaves", "Improve airflow", "Apply copper-based fungicide"]
        };
        
        db.prepare(
          `INSERT INTO disease_scans (id, farmer_id, farm_id, image_path, status, crop, possible_disease, confidence, severity, symptoms, causes, recommendations) 
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
        ).run(
          scanId, req.farmer.id, req.body.farmId || null, req.file.filename, 'complete', 
          crop, mockResult.possible_disease, mockResult.confidence, mockResult.severity,
          JSON.stringify(mockResult.symptoms), JSON.stringify(mockResult.causes), JSON.stringify(mockResult.recommendations)
        );

        return res.status(200).json({ scanId, ...mockResult });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `You are an expert agricultural AI. Analyze the uploaded image. The farmer indicated the crop is: ${crop}.
      If the image is not a plant/crop, respond exactly with: {"error": "Please upload a clear image of a crop or plant."}
      If it is a crop, provide a JSON response analyzing the disease/health. Use "Possible disease" language, never claim 100% certainty from an image.
      JSON Format required:
      {
        "possible_disease": "Name of disease or 'Healthy'",
        "confidence": 75,
        "severity": "Low" | "Moderate" | "High" | "Critical",
        "symptoms": ["symptom 1", "symptom 2"],
        "causes": ["cause 1", "cause 2"],
        "recommendations": ["Immediate step", "Biological control", "Chemical control (always say 'Follow product label')"]
      }`;

      // Convert image to base64 for Gemini
      const fileData = fs.readFileSync(req.file.path);
      const base64Data = fileData.toString("base64");
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { inlineData: { data: base64Data, mimeType: req.file.mimetype } },
            "Analyze this crop image and return the required JSON."
        ],
        config: {
            systemInstruction,
            responseMimeType: "application/json"
        }
      });

      const resultText = response.text;
      const parsed = JSON.parse(resultText);

      if (parsed.error) {
        return res.status(400).json({ error: "invalid_image", message: parsed.error });
      }

      db.prepare(
        `INSERT INTO disease_scans (id, farmer_id, farm_id, image_path, status, crop, possible_disease, confidence, severity, symptoms, causes, recommendations) 
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
      ).run(
        scanId, req.farmer.id, req.body.farmId || null, req.file.filename, 'complete', 
        crop, parsed.possible_disease, parsed.confidence, parsed.severity,
        JSON.stringify(parsed.symptoms), JSON.stringify(parsed.causes), JSON.stringify(parsed.recommendations)
      );

      res.status(200).json({ scanId, ...parsed });

    } catch (error) {
      console.error("Disease Scan AI Error:", error);
      res.status(500).json({ error: "analysis_failed", message: "Failed to analyze the image." });
    }
  });
});

diseaseRouter.get("/history", (req, res) => {
  const rows = db.prepare("SELECT * FROM disease_scans WHERE farmer_id = ? AND status = 'complete' ORDER BY created_at DESC").all(req.farmer.id);
  res.json(rows.map((r) => ({
    id: r.id, 
    farmId: r.farm_id, 
    crop: r.crop,
    possibleDisease: r.possible_disease,
    confidence: r.confidence,
    severity: r.severity,
    symptoms: r.symptoms ? JSON.parse(r.symptoms) : [],
    causes: r.causes ? JSON.parse(r.causes) : [],
    recommendations: r.recommendations ? JSON.parse(r.recommendations) : [],
    imageUrl: `/uploads/${r.image_path}`,
    createdAt: r.created_at,
  })));
});
