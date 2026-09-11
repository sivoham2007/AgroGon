import jwt from "jsonwebtoken";
import { db } from "../db.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "unauthorized", message: "Missing bearer token." });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const farmer = db.prepare("SELECT * FROM farmers WHERE id = ?").get(payload.sub);
    if (!farmer) {
      return res.status(401).json({ error: "unauthorized", message: "Account no longer exists." });
    }
    req.farmer = farmer;
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized", message: "Invalid or expired token." });
  }
}
