import { Router } from "express";
import { db } from "../db.js";

export const notificationsRouter = Router();

function rowToNotif(r) {
  return { id: r.id, title: r.title, body: r.body, category: r.category, isRead: !!r.is_read, createdAt: r.created_at };
}

notificationsRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM notifications WHERE farmer_id = ? ORDER BY created_at DESC").all(req.farmer.id);
  const unreadCount = rows.filter((r) => !r.is_read).length;
  res.json({ items: rows.map(rowToNotif), unreadCount });
});

notificationsRouter.put("/:id/read", (req, res) => {
  const row = db.prepare("SELECT * FROM notifications WHERE id = ?").get(req.params.id);
  if (!row || row.farmer_id !== req.farmer.id) {
    return res.status(404).json({ error: "not_found", message: "Notification not found." });
  }
  db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

notificationsRouter.put("/read-all", (req, res) => {
  db.prepare("UPDATE notifications SET is_read = 1 WHERE farmer_id = ?").run(req.farmer.id);
  res.json({ ok: true });
});
