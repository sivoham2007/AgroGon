import { Router } from "express";
import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const calendarRouter = Router();

calendarRouter.get("/", (req, res) => {
    const { farm_id } = req.query;
    try {
        let events;
        if (farm_id) {
            events = db.prepare("SELECT * FROM crop_calendar_events WHERE farmer_id = ? AND farm_id = ? ORDER BY date(event_date) ASC").all(req.farmer.id, farm_id);
        } else {
            events = db.prepare("SELECT * FROM crop_calendar_events WHERE farmer_id = ? ORDER BY date(event_date) ASC").all(req.farmer.id);
        }
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch calendar events" });
    }
});

calendarRouter.post("/generate", (req, res) => {
    const { farm_id, crop, planting_date } = req.body;
    const farmer_id = req.farmer.id;
    
    if (!crop || !planting_date) {
        return res.status(400).json({ error: "Crop and planting date are required to generate a calendar." });
    }

    try {
        // Fetch rules
        const ruleStmt = db.prepare("SELECT rule_data_json FROM agricultural_rules WHERE rule_type = 'crop_calendar' AND crop = ?");
        const rule = ruleStmt.get(crop);
        
        let template = [
            { day_offset: 0, title: "Planting", type: "planting" },
            { day_offset: 7, title: "Germination monitoring", type: "monitoring" },
            { day_offset: 20, title: "Vegetative monitoring", type: "monitoring" },
            { day_offset: 40, title: "Irrigation check", type: "irrigation" },
            { day_offset: 60, title: "Nutrient check", type: "fertilization" },
            { day_offset: 120, title: "Harvest preparation", type: "harvest" }
        ];

        if (rule) {
            template = JSON.parse(rule.rule_data_json);
        } else if (crop?.toLowerCase() === 'rice') {
            template = [
               { day_offset: 0, title: "Transplanting", type: "planting" },
               { day_offset: 15, title: "First Weed Management", type: "monitoring" },
               { day_offset: 25, title: "Top Dressing (Urea)", type: "fertilization" },
               { day_offset: 50, title: "Panicle Initiation Check", type: "monitoring" },
               { day_offset: 70, title: "Disease Monitoring", type: "monitoring" },
               { day_offset: 130, title: "Harvest", type: "harvest" }
            ];
        }
        
        let validFarmId = null;
        if (farm_id) {
            const existing = db.prepare("SELECT id FROM farms WHERE id = ?").get(farm_id);
            if (existing) validFarmId = existing.id;
        }

        const baseDate = new Date(planting_date);
        const events = template.map(t => {
            const eventDate = new Date(baseDate);
            eventDate.setDate(baseDate.getDate() + t.day_offset);
            return {
                id: uuidv4(),
                farmer_id,
                farm_id: validFarmId,
                crop,
                title: t.title,
                description: t.description || "",
                event_date: eventDate.toISOString().split('T')[0],
                event_type: t.type,
                status: 'pending'
            };
        });

        const insertStmt = db.prepare(`
            INSERT INTO crop_calendar_events (id, farmer_id, farm_id, crop, title, description, event_date, event_type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        db.exec("BEGIN TRANSACTION");
        for (const e of events) {
            insertStmt.run(e.id, e.farmer_id, e.farm_id, e.crop, e.title, e.description, e.event_date, e.event_type, e.status);
        }
        db.exec("COMMIT");

        res.json({ message: "Calendar generated", events });
    } catch (err) {
        db.exec("ROLLBACK");
        console.error("Calendar gen error:", err);
        res.status(500).json({ error: "Failed to generate calendar" });
    }
});

calendarRouter.put("/:id", (req, res) => {
    const { status } = req.body;
    try {
        db.prepare("UPDATE crop_calendar_events SET status = ?, updated_at = datetime('now') WHERE id = ? AND farmer_id = ?").run(status, req.params.id, req.farmer.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to update event" });
    }
});
