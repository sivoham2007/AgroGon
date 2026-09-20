import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";

export const calculatorsRouter = Router();

// SMART FERTILIZER CALCULATOR
calculatorsRouter.post("/fertilizer", (req, res) => {
  const { crop, area_acres, soil_type, n_avail, p_avail, k_avail, stage, expected_yield } = req.body;
  const farmer_id = req.farmer.id;
  const farm_id = req.body.farm_id || null;

  if (n_avail === undefined || p_avail === undefined || k_avail === undefined) {
    return res.status(400).json({ error: "Missing soil nutrient availability data (N, P, K)." });
  }
  if (!area_acres || isNaN(area_acres) || area_acres <= 0) {
    return res.status(400).json({ error: "Invalid Land Area. Please enter a valid number greater than 0." });
  }

  try {
    // 1. Fetch Agricultural Rules for the crop
    let n_req_base = 50, p_req_base = 25, k_req_base = 25; // Default fallbacks
    const ruleStmt = db.prepare("SELECT rule_data_json FROM agricultural_rules WHERE rule_type = 'fertilizer_npk' AND crop = ?");
    const rule = ruleStmt.get(crop);
    
    if (rule) {
      const data = JSON.parse(rule.rule_data_json);
      n_req_base = data.n_req || n_req_base;
      p_req_base = data.p_req || p_req_base;
      k_req_base = data.k_req || k_req_base;
    } else {
        // Simple hardcoded fallback for demo if rules aren't populated yet
        if (crop?.toLowerCase() === 'rice') { n_req_base = 60; p_req_base = 30; k_req_base = 30; }
        if (crop?.toLowerCase() === 'wheat') { n_req_base = 50; p_req_base = 25; k_req_base = 25; }
        if (crop?.toLowerCase() === 'cotton') { n_req_base = 40; p_req_base = 20; k_req_base = 20; }
    }

    // 2. Adjust based on soil availability (simple model: subtract available from required)
    const n_adj = Math.max(0, n_req_base - (n_avail || 0));
    const p_adj = Math.max(0, p_req_base - (p_avail || 0));
    const k_adj = Math.max(0, k_req_base - (k_avail || 0));

    // 3. Scale by area
    const n_final = n_adj * (area_acres || 1);
    const p_final = p_adj * (area_acres || 1);
    const k_final = k_adj * (area_acres || 1);

    // 4. Generate application schedule
    const schedule = [
      { stage: "Basal Application", n_pct: 50, p_pct: 100, k_pct: 50, timing: "At sowing/planting" },
      { stage: "Vegetative Stage", n_pct: 25, p_pct: 0, k_pct: 0, timing: "20-30 days after planting" },
      { stage: "Reproductive Stage", n_pct: 25, p_pct: 0, k_pct: 50, timing: "Flowering/panicle initiation" }
    ];

    const recommendation = {
      n_total_kg: n_final.toFixed(2),
      p_total_kg: p_final.toFixed(2),
      k_total_kg: k_final.toFixed(2),
      schedule: schedule.map(s => ({
        ...s,
        n_amount: ((s.n_pct / 100) * n_final).toFixed(2),
        p_amount: ((s.p_pct / 100) * p_final).toFixed(2),
        k_amount: ((s.k_pct / 100) * k_final).toFixed(2),
      })),
      warnings: ["Do not over-apply Nitrogen.", "Split applications improve efficiency."]
    };

    // 5. Save to database
    const id = uuidv4();
    let validFarmId = null;
    if (farm_id) {
        const existing = db.prepare("SELECT id FROM farms WHERE id = ?").get(farm_id);
        if (existing) validFarmId = existing.id;
    }
    const insertStmt = db.prepare(`
      INSERT INTO fertilizer_plans (id, farmer_id, farm_id, crop, area_acres, soil_type, n_req, p_req, k_req, recommendation_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(id, farmer_id, validFarmId, crop, area_acres, soil_type, n_final, p_final, k_final, JSON.stringify(recommendation));

    res.json({ id, ...recommendation });
  } catch (err) {
    console.error("Fertilizer Calc Error:", err);
    res.status(500).json({ error: "Calculation failed" });
  }
});

// PESTICIDE CALIBRATION CALCULATOR
calculatorsRouter.post("/pesticide", (req, res) => {
  const { crop, pest, product, dose_per_acre, dose_unit, area_acres, tank_capacity, water_per_acre } = req.body;
  const farmer_id = req.farmer.id;
  const farm_id = req.body.farm_id || null;

  if (!area_acres || isNaN(area_acres) || area_acres <= 0) {
      return res.status(400).json({ error: "Invalid Land Area. Please enter a valid number greater than 0." });
  }
  if (!dose_per_acre || isNaN(dose_per_acre) || dose_per_acre <= 0) {
      return res.status(400).json({ error: "Invalid Dose per Acre. Please enter a valid number." });
  }
  if (!tank_capacity || isNaN(tank_capacity) || tank_capacity <= 0) {
      return res.status(400).json({ error: "Invalid Tank Capacity. Please enter a valid number." });
  }
  if (!water_per_acre || isNaN(water_per_acre) || water_per_acre <= 0) {
      return res.status(400).json({ error: "Invalid Water per Acre. Please enter a valid number." });
  }

  try {
    const total_water = water_per_acre * area_acres;
    const num_tanks = Math.ceil(total_water / tank_capacity);
    const total_product = dose_per_acre * area_acres;
    const product_per_tank = total_product / num_tanks;

    const result = {
      total_water_l: total_water.toFixed(2),
      num_tanks: num_tanks,
      total_product: total_product.toFixed(2),
      product_per_tank: product_per_tank.toFixed(2),
      unit: dose_unit || 'ml',
      safety_warnings: [
        "Follow the product label.",
        "Do not exceed the registered label rate.",
        "Wear appropriate PPE.",
        "Observe pre-harvest intervals and re-entry restrictions.",
        "Do not mix products unless the label permits it."
      ]
    };

    // Save to database
    const id = uuidv4();
    let validFarmId = null;
    if (farm_id) {
        const existing = db.prepare("SELECT id FROM farms WHERE id = ?").get(farm_id);
        if (existing) validFarmId = existing.id;
    }
    const insertStmt = db.prepare(`
      INSERT INTO pesticide_calculations (id, farmer_id, farm_id, crop, pest, product, area_acres, tank_capacity, water_req, num_tanks, product_per_tank, total_product)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(id, farmer_id, validFarmId, crop, pest, product, area_acres, tank_capacity, total_water, num_tanks, product_per_tank, total_product);

    res.json({ id, ...result });
  } catch (err) {
    console.error("Pesticide Calc Error:", err);
    res.status(500).json({ error: "Calculation failed" });
  }
});

calculatorsRouter.get("/history", (req, res) => {
    const farmer_id = req.farmer.id;
    try {
        const fertPlans = db.prepare("SELECT * FROM fertilizer_plans WHERE farmer_id = ? ORDER BY created_at DESC").all(farmer_id);
        const pestCalcs = db.prepare("SELECT * FROM pesticide_calculations WHERE farmer_id = ? ORDER BY created_at DESC").all(farmer_id);
        
        res.json({
            fertilizer: fertPlans.map(f => ({ ...f, recommendation: JSON.parse(f.recommendation_json) })),
            pesticide: pestCalcs
        });
    } catch(err) {
        res.status(500).json({error: "Failed to fetch history"});
    }
});
