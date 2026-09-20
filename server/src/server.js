import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { farmsRouter } from "./routes/farms.js";
import { cropsRouter } from "./routes/crops.js";
import { soilRouter } from "./routes/soil.js";
import { weatherRouter } from "./routes/weather.js";
import { scanRouter } from "./routes/scan.js";
import { irrigationRouter } from "./routes/irrigation.js";
import { equipmentRouter } from "./routes/equipment.js";
import { notificationsRouter } from "./routes/notifications.js";
import { alertsRouter } from "./routes/alerts.js";
import { connectionsRouter } from "./routes/connections.js";
import { cameraRouter } from "./routes/camera.js";
import { aiRouter } from "./routes/ai.js";
import { calculatorsRouter } from "./routes/calculators.js";
import { calendarRouter } from "./routes/crop_calendar.js";
import { recommendationsRouter } from "./routes/recommendations.js";
import { adminRouter } from "./routes/admin.js";
import { diseaseRouter } from "./routes/disease.js";
import { requireAuth } from "./middleware/auth.js";
import "./db.js"; // ensures schema is created on boot

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "agrogon-server" }));

// Public
app.use("/api/auth", authRouter);
app.use("/api/weather", weatherRouter); // no auth needed for a location-based forecast

// Authenticated — every route below only ever touches req.farmer's own data
app.use("/api/profile", requireAuth, profileRouter);
app.use("/api/farms", requireAuth, farmsRouter);
app.use("/api/crops", requireAuth, cropsRouter);
app.use("/api/soil-analysis", requireAuth, soilRouter);
app.use("/api/scan", requireAuth, scanRouter);
app.use("/api/irrigation", requireAuth, irrigationRouter);
app.use("/api/equipment", requireAuth, equipmentRouter);
app.use("/api/notifications", requireAuth, notificationsRouter);
app.use("/api/alerts", requireAuth, alertsRouter);
app.use("/api/connections", requireAuth, connectionsRouter);
app.use("/api/camera", requireAuth, cameraRouter);
app.use("/api/ai", requireAuth, aiRouter);
app.use("/api/calculators", requireAuth, calculatorsRouter);
app.use("/api/calendar", requireAuth, calendarRouter);
app.use("/api/recommendations", requireAuth, recommendationsRouter);
app.use("/api/admin", requireAuth, adminRouter); // Add actual admin middleware in production
app.use("/api/disease", requireAuth, diseaseRouter);


// Centralized error handler so unexpected errors never leak stack traces
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "server_error", message: "Something went wrong. Please try again." });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`AgroGon backend listening on :${port}`));
