import { Router } from "express";
import { db } from "../db.js";

export const alertsRouter = Router();

// Get hyperlocal alerts for the farmer's location (mocked bounding box)
alertsRouter.get("/", (req, res) => {
  const alerts = [
    {
      id: "a1",
      icon: "alerts",
      severity: "high",
      title: "Pest Warning: Fall Armyworm",
      meta: "Spotted in 3 nearby farms in your district",
      timeLabel: "2 hrs ago"
    },
    {
      id: "a2",
      icon: "cloud",
      severity: "medium",
      title: "Heavy Rainfall Expected",
      meta: "15mm rain expected in the next 12 hours",
      timeLabel: "5 hrs ago"
    }
  ];
  res.json(alerts);
});

alertsRouter.get("/nearby-farmers", (req, res) => {
  const { lat, lng } = req.query;
  // In a real app we'd use PostGIS or Haversine formula in SQLite to find nearby.
  // For now, return all other farmers as "nearby".
  
  const stmt = db.prepare("SELECT id, name, farmer_code, village, district, lat, lng FROM farmers WHERE id != ?");
  const farmers = stmt.all(req.farmer.id);
  
  // Get connections status for these farmers
  const connStmt = db.prepare(`
    SELECT farmer_id_1, farmer_id_2, status 
    FROM farmer_connections 
    WHERE farmer_id_1 = ? OR farmer_id_2 = ?
  `);
  const connections = connStmt.all(req.farmer.id, req.farmer.id);
  
  const result = farmers.map(f => {
    // Check if connected
    const conn = connections.find(c => c.farmer_id_1 === f.id || c.farmer_id_2 === f.id);
    return {
      ...f,
      connectionStatus: conn ? conn.status : null,
      isSender: conn ? conn.farmer_id_1 === req.farmer.id : false
    };
  });
  
  res.json(result);
});
