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
  let validFarmId = null;
  if (farmId) {
      const existing = db.prepare("SELECT id FROM farms WHERE id = ?").get(farmId);
      if (existing) validFarmId = existing.id;
  }
  
  db.prepare(
    `INSERT INTO soil_analyses (id, farmer_id, farm_id, ph, moisture_pct, nitrogen, phosphorus, potassium, notes, source)
     VALUES (?,?,?,?,?,?,?,?,?, 'manual')`
  ).run(id, req.farmer.id, validFarmId, ph ?? null, moisturePct ?? null, nitrogen ?? null, phosphorus ?? null, potassium ?? null, notes || null);
  res.status(201).json(rowToSoil(db.prepare("SELECT * FROM soil_analyses WHERE id = ?").get(id)));
});

// ADVANCED SOIL FERTILITY ANALYSIS & DEFICIENCY DETECTION
soilRouter.get("/score/:id", (req, res) => {
    const { id } = req.params;
    try {
        const soil = db.prepare("SELECT * FROM soil_analyses WHERE id = ? AND farmer_id = ?").get(id, req.farmer.id);
        if (!soil) return res.status(404).json({ error: "Not found" });

        // Simple Rule-Based Scoring (In production, use agricultural_rules table)
        let n_score = "Moderate", p_score = "Moderate", k_score = "Moderate", ph_score = "Good";
        let score_val = 70;
        let reasons = [];
        let deficiencies = [];

        if (soil.nitrogen != null) {
            if (soil.nitrogen < 20) { n_score = "Low"; score_val -= 15; reasons.push("Nitrogen is very low."); deficiencies.push({ nutrient: 'Nitrogen', status: 'Low', possible_causes: 'Lack of organic matter or heavy leaching.', action: 'Apply N-rich fertilizer.'}); }
            else if (soil.nitrogen > 60) { n_score = "Excellent"; score_val += 10; }
            else { n_score = "Good"; }
        }

        if (soil.phosphorus != null) {
            if (soil.phosphorus < 10) { p_score = "Low"; score_val -= 15; reasons.push("Phosphorus is very low."); deficiencies.push({ nutrient: 'Phosphorus', status: 'Low', possible_causes: 'High soil pH fixing phosphorus.', action: 'Apply DAP or SSP.'}); }
            else if (soil.phosphorus > 25) { p_score = "Excellent"; score_val += 10; }
            else { p_score = "Good"; }
        }

        if (soil.potassium != null) {
            if (soil.potassium < 110) { k_score = "Low"; score_val -= 10; reasons.push("Potassium is low."); deficiencies.push({ nutrient: 'Potassium', status: 'Low', possible_causes: 'Sandy soils or continuous cropping without K application.', action: 'Apply MOP.'}); }
            else if (soil.potassium > 280) { k_score = "Excellent"; score_val += 10; }
            else { k_score = "Good"; }
        }

        if (soil.ph != null) {
            if (soil.ph < 5.5) { ph_score = "Low (Acidic)"; score_val -= 20; reasons.push("Soil is too acidic."); deficiencies.push({ nutrient: 'pH (Acidic)', status: 'Critical', possible_causes: 'Acid rain, fertilizers.', action: 'Apply agricultural lime.'}); }
            else if (soil.ph > 8.5) { ph_score = "High (Alkaline)"; score_val -= 20; reasons.push("Soil is too alkaline."); deficiencies.push({ nutrient: 'pH (Alkaline)', status: 'Critical', possible_causes: 'Low rainfall, high calcium carbonate.', action: 'Apply elemental sulfur or gypsum.'}); }
            else if (soil.ph >= 6.0 && soil.ph <= 7.5) { ph_score = "Excellent"; score_val += 10; }
        }
        
        // Clamp score between 0 and 100
        score_val = Math.max(0, Math.min(100, score_val));

        let overall_score = "Moderate";
        if (score_val >= 80) overall_score = "Excellent";
        else if (score_val >= 60) overall_score = "Good";
        else if (score_val >= 40) overall_score = "Moderate";
        else if (score_val >= 20) overall_score = "Low";
        else overall_score = "Critical";

        // Save deficiencies
        deficiencies.forEach(d => {
           // delete old ones to prevent duplicates for same test
           db.prepare("DELETE FROM nutrient_deficiencies WHERE soil_test_id = ? AND nutrient = ?").run(soil.id, d.nutrient);
           db.prepare(`
               INSERT INTO nutrient_deficiencies (id, soil_test_id, nutrient, status, possible_causes, action)
               VALUES (?, ?, ?, ?, ?, ?)
           `).run(newId(), soil.id, d.nutrient, d.status, d.possible_causes, d.action);
        });

        res.json({
            overall_score,
            score_value: score_val,
            details: {
                nitrogen: n_score,
                phosphorus: p_score,
                potassium: k_score,
                ph: ph_score
            },
            reasons,
            deficiencies
        });

    } catch (err) {
        console.error("Score Error:", err);
        res.status(500).json({ error: "Failed to score soil" });
    }
});

// ADVANCED SOIL FERTILITY ANALYSIS (V2)
soilRouter.post("/analyze", (req, res) => {
    const { farmId, crop, soilType, ph, nitrogen, phosphorus, potassium, organicMatter, sulfur, zinc, iron, boron } = req.body || {};
    const id = newId();

    if (ph === undefined || ph === null || nitrogen === undefined || nitrogen === null || phosphorus === undefined || phosphorus === null || potassium === undefined || potassium === null) {
        return res.status(400).json({ error: "Missing required soil parameters (pH, N, P, K)." });
    }

    try {
        // Calculate Fertility Score (Base: 50, modified by parameters)
        let score = 50;
        let deficiencies = [];
        let recommendations = [];
        
        // pH Logic
        if (ph < 5.5) { score -= 15; deficiencies.push({ nutrient: "pH", status: "Acidic", action: "Apply lime." }); }
        else if (ph > 8.0) { score -= 15; deficiencies.push({ nutrient: "pH", status: "Alkaline", action: "Apply gypsum or sulfur." }); }
        else if (ph >= 6.0 && ph <= 7.5) { score += 10; }

        // NPK Logic
        if (nitrogen < 25) { score -= 10; deficiencies.push({ nutrient: "Nitrogen", status: "Low", action: "Apply Urea or compost." }); }
        else if (nitrogen > 50) { score += 10; }

        if (phosphorus < 15) { score -= 10; deficiencies.push({ nutrient: "Phosphorus", status: "Low", action: "Apply DAP." }); }
        else if (phosphorus > 30) { score += 5; }

        if (potassium < 120) { score -= 10; deficiencies.push({ nutrient: "Potassium", status: "Low", action: "Apply MOP." }); }
        else if (potassium > 250) { score += 5; }

        // Organic Matter Logic
        if (organicMatter && organicMatter < 0.5) { score -= 5; deficiencies.push({ nutrient: "Organic Matter", status: "Low", action: "Add farmyard manure." }); }
        else if (organicMatter && organicMatter >= 1.0) { score += 5; }

        // Micronutrients
        if (zinc && zinc < 0.6) { deficiencies.push({ nutrient: "Zinc", status: "Low", action: "Apply Zinc Sulfate." }); }
        if (sulfur && sulfur < 10) { deficiencies.push({ nutrient: "Sulfur", status: "Low", action: "Use sulfur-coated urea." }); }

        score = Math.max(0, Math.min(100, score));

        // Check if farmId actually exists in the database to prevent FOREIGN KEY constraint failures
        let validFarmId = null;
        if (farmId) {
            const existing = db.prepare("SELECT id FROM farms WHERE id = ?").get(farmId);
            if (existing) validFarmId = existing.id;
        }

        // Save Soil Test
        db.prepare(
            `INSERT INTO soil_tests (id, farmer_id, farm_id, crop, soil_type, ph, nitrogen, phosphorus, potassium, organic_matter, sulfur, zinc, iron, boron, fertility_score)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        ).run(id, req.farmer.id, validFarmId, crop || null, soilType || null, ph, nitrogen, phosphorus, potassium, organicMatter, sulfur, zinc, iron, boron, score);

        // Generate Plan
        if (deficiencies.length === 0) {
            recommendations.push("Maintain current soil management practices. Soil is healthy.");
        } else {
            deficiencies.forEach(d => recommendations.push(`${d.nutrient} is ${d.status}. ${d.action}`));
        }

        // Save Recommendations
        recommendations.forEach(rec => {
            db.prepare(`INSERT INTO soil_recommendations (id, soil_test_id, recommendation_type, recommendation, priority) VALUES (?,?,?,?,?)`)
              .run(newId(), id, "Correction", rec, "High");
        });

        // Suitable Crops logic based on pH and Soil type
        const suitableCrops = [];
        if (ph >= 6.0 && ph <= 7.5) suitableCrops.push({ crop: "Wheat", suitability: "High", reason: "Optimal pH range" });
        if (ph >= 5.5 && ph <= 7.0) suitableCrops.push({ crop: "Rice", suitability: "High", reason: "Prefers slightly acidic soil" });
        if (soilType === "Loamy") suitableCrops.push({ crop: "Potato", suitability: "High", reason: "Excellent soil texture" });

        res.status(201).json({
            id,
            score,
            deficiencies,
            suitableCrops,
            plan: recommendations
        });

    } catch (err) {
        console.error("Soil Analysis Error:", err);
        res.status(500).json({ message: "Soil report generation failed: " + err.message, error: "analysis_failed" });
    }
});

soilRouter.get("/history", (req, res) => {
    const rows = db.prepare("SELECT * FROM soil_tests WHERE farmer_id = ? ORDER BY created_at DESC").all(req.farmer.id);
    const history = rows.map(r => {
        const recs = db.prepare("SELECT recommendation FROM soil_recommendations WHERE soil_test_id = ?").all(r.id);
        return {
            id: r.id,
            crop: r.crop,
            date: r.created_at,
            score: r.fertility_score,
            ph: r.ph,
            nitrogen: r.nitrogen,
            phosphorus: r.phosphorus,
            potassium: r.potassium,
            organicMatter: r.organic_matter,
            recommendations: recs.map(rec => rec.recommendation)
        };
    });
    res.json(history);
});
