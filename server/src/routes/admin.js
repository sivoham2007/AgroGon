import { Router } from "express";
import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const adminRouter = Router();

// In a real app, you would have admin middleware here
// e.g. adminRouter.use(requireAdmin);

adminRouter.get("/rules", (req, res) => {
    try {
        const rules = db.prepare("SELECT * FROM agricultural_rules").all();
        res.json(rules.map(r => ({ ...r, rule_data: JSON.parse(r.rule_data_json) })));
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch rules" });
    }
});

adminRouter.post("/rules", (req, res) => {
    const { rule_type, crop, region, rule_data, source } = req.body;
    try {
        const id = uuidv4();
        db.prepare(`
            INSERT INTO agricultural_rules (id, rule_type, crop, region, rule_data_json, source)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, rule_type, crop, region || 'All', JSON.stringify(rule_data), source);
        res.status(201).json({ id, success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to add rule" });
    }
});

adminRouter.put("/rules/:id", (req, res) => {
    const { rule_data } = req.body;
    try {
        db.prepare(`
            UPDATE agricultural_rules 
            SET rule_data_json = ?, updated_at = datetime('now')
            WHERE id = ?
        `).run(JSON.stringify(rule_data), req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to update rule" });
    }
});

adminRouter.delete("/rules/:id", (req, res) => {
    try {
        db.prepare("DELETE FROM agricultural_rules WHERE id = ?").run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete rule" });
    }
});
