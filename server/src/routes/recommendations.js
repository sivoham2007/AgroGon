import { Router } from "express";
import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const recommendationsRouter = Router();

recommendationsRouter.post("/crop", (req, res) => {
    const { ph, nitrogen, phosphorus, potassium, soil_type, location, season } = req.body;
    const farmer_id = req.farmer.id;
    const farm_id = req.body.farm_id || null;

    if (ph === undefined || nitrogen === undefined || phosphorus === undefined || potassium === undefined) {
        return res.status(400).json({ error: "Missing required soil parameters (pH, N, P, K)." });
    }

    try {
        // Fetch crop suitability rules from database
        const rules = db.prepare("SELECT * FROM agricultural_rules WHERE rule_type = 'crop_suitability'").all();
        
        let candidates = [];
        
        if (rules.length > 0) {
            candidates = rules.map(r => JSON.parse(r.rule_data_json));
        } else {
            // Fallback mock data if rules are empty
            candidates = [
                { crop: "Rice", min_ph: 5.5, max_ph: 7.0, season: "Kharif", water_req: "High", soil_compat: ["Clay", "Clay Loam"] },
                { crop: "Wheat", min_ph: 6.0, max_ph: 7.5, season: "Rabi", water_req: "Medium", soil_compat: ["Loam", "Clay Loam"] },
                { crop: "Cotton", min_ph: 5.8, max_ph: 8.0, season: "Kharif", water_req: "Medium", soil_compat: ["Black Cotton", "Clay"] },
                { crop: "Maize", min_ph: 5.5, max_ph: 7.5, season: "Kharif", water_req: "Medium", soil_compat: ["Loam", "Sandy Loam"] },
                { crop: "Sugarcane", min_ph: 6.5, max_ph: 7.5, season: "Perennial", water_req: "High", soil_compat: ["Loam", "Clay Loam"] }
            ];
        }

        const recommendations = candidates.map(c => {
            let score = 100;
            let limitations = [];

            if (ph) {
                if (ph < c.min_ph) { score -= 20; limitations.push("Soil is too acidic"); }
                if (ph > c.max_ph) { score -= 20; limitations.push("Soil is too alkaline"); }
            }
            
            if (soil_type && c.soil_compat && !c.soil_compat.includes(soil_type)) {
                score -= 30;
                limitations.push(`Prefers ${c.soil_compat.join(', ')}`);
            }

            if (season && c.season !== "Perennial" && c.season !== season) {
                score -= 40;
                limitations.push(`Best suited for ${c.season} season`);
            }

            return {
                crop: c.crop,
                suitability_score: Math.max(0, score),
                expected_season: c.season,
                water_req: c.water_req,
                soil_compat: c.soil_compat ? c.soil_compat.join(", ") : "Any",
                limitations
            };
        }).sort((a, b) => b.suitability_score - a.suitability_score);

        // Save history
        const id = uuidv4();
        let validFarmId = null;
        if (farm_id) {
            const existing = db.prepare("SELECT id FROM farms WHERE id = ?").get(farm_id);
            if (existing) validFarmId = existing.id;
        }
        db.prepare(`
            INSERT INTO crop_recommendations (id, farmer_id, farm_id, recommendation_json)
            VALUES (?, ?, ?, ?)
        `).run(id, farmer_id, validFarmId, JSON.stringify(recommendations));

        res.json({ id, recommendations });

    } catch (err) {
        console.error("Crop Rec Error:", err);
        res.status(500).json({ error: "Failed to generate recommendations" });
    }
});

recommendationsRouter.get("/history", (req, res) => {
    try {
        const history = db.prepare("SELECT * FROM crop_recommendations WHERE farmer_id = ? ORDER BY created_at DESC").all(req.farmer.id);
        res.json(history.map(h => ({...h, recommendations: JSON.parse(h.recommendation_json)})));
    } catch(err) {
        res.status(500).json({error: "Failed to fetch history"});
    }
});
