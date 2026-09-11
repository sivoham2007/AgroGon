import { Router } from "express";
import { db } from "../db.js";
import { newId } from "../utils.js";

export const connectionsRouter = Router();

// Search farmers by phone or farmer_code
connectionsRouter.get("/search", (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);
  
  const stmt = db.prepare(`
    SELECT id, name, farmer_code, village, district 
    FROM farmers 
    WHERE (phone = ? OR farmer_code = ?) AND id != ?
  `);
  const farmers = stmt.all(query, query, req.farmer.id);
  
  // Get connection status for the searched farmers
  const result = farmers.map(f => {
    const connStmt = db.prepare(`
      SELECT * FROM farmer_connections 
      WHERE (farmer_id_1 = ? AND farmer_id_2 = ?) 
         OR (farmer_id_1 = ? AND farmer_id_2 = ?)
    `);
    const conn = connStmt.get(req.farmer.id, f.id, f.id, req.farmer.id);
    
    return {
      ...f,
      connectionStatus: conn ? conn.status : null,
      isSender: conn ? conn.farmer_id_1 === req.farmer.id : false
    };
  });
  
  res.json(result);
});

// List connections for the current farmer
connectionsRouter.get("/", (req, res) => {
  const stmt = db.prepare(`
    SELECT c.id as connection_id, c.status, c.farmer_id_1, c.farmer_id_2,
           f.id, f.name, f.farmer_code, f.village, f.district
    FROM farmer_connections c
    JOIN farmers f ON (f.id = c.farmer_id_1 OR f.id = c.farmer_id_2)
    WHERE (c.farmer_id_1 = ? OR c.farmer_id_2 = ?) AND f.id != ?
  `);
  const connections = stmt.all(req.farmer.id, req.farmer.id, req.farmer.id);
  
  const formatted = connections.map(c => ({
    connection_id: c.connection_id,
    status: c.status,
    isSender: c.farmer_id_1 === req.farmer.id,
    farmer: {
      id: c.id,
      name: c.name,
      farmer_code: c.farmer_code,
      village: c.village,
      district: c.district
    }
  }));
  
  res.json(formatted);
});

// Send connection request
connectionsRouter.post("/request", (req, res) => {
  const { target_farmer_id } = req.body;
  if (!target_farmer_id || target_farmer_id === req.farmer.id) {
    return res.status(400).json({ error: "Invalid target farmer" });
  }
  
  // Check if connection already exists
  const checkStmt = db.prepare(`
    SELECT * FROM farmer_connections 
    WHERE (farmer_id_1 = ? AND farmer_id_2 = ?) 
       OR (farmer_id_1 = ? AND farmer_id_2 = ?)
  `);
  const existing = checkStmt.get(req.farmer.id, target_farmer_id, target_farmer_id, req.farmer.id);
  
  if (existing) {
    return res.status(400).json({ error: "Connection already exists or is pending" });
  }
  
  const id = newId();
  const insertStmt = db.prepare(`
    INSERT INTO farmer_connections (id, farmer_id_1, farmer_id_2, status)
    VALUES (?, ?, ?, 'pending')
  `);
  insertStmt.run(id, req.farmer.id, target_farmer_id);
  
  res.json({ success: true, status: 'pending' });
});

// Accept connection request
connectionsRouter.post("/accept", (req, res) => {
  const { connection_id } = req.body;
  
  const stmt = db.prepare(`
    UPDATE farmer_connections 
    SET status = 'accepted', updated_at = datetime('now')
    WHERE id = ? AND farmer_id_2 = ? AND status = 'pending'
  `);
  const result = stmt.run(connection_id, req.farmer.id);
  
  if (result.changes === 0) {
    return res.status(400).json({ error: "Invalid request or already accepted" });
  }
  
  res.json({ success: true, status: 'accepted' });
});

// Reject or remove connection
connectionsRouter.post("/remove", (req, res) => {
  const { connection_id } = req.body;
  
  const stmt = db.prepare(`
    DELETE FROM farmer_connections 
    WHERE id = ? AND (farmer_id_1 = ? OR farmer_id_2 = ?)
  `);
  stmt.run(connection_id, req.farmer.id, req.farmer.id);
  
  res.json({ success: true });
});
