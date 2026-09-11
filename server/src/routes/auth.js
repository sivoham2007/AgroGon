import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import { db } from "../db.js";
import { newId, generateFarmerCode, generateOtp, publicFarmer } from "../utils.js";

export const authRouter = Router();

const OTP_TTL_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

function issueToken(farmerId) {
  return jwt.sign({ sub: farmerId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("+") ? `+${digits.replace(/^\+/, "")}` : `+${digits}`;
}

async function sendSms(phone, otp, purpose) {
  const to = normalizePhone(phone);
  const body = `Your AgroGon OTP is ${otp}. Valid for ${OTP_TTL_MINUTES} minutes.`;

  // 1. Twilio
  if (twilioClient && (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)) {
    try {
      await twilioClient.messages.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER || undefined,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || undefined,
        body,
      });
      console.log(`[SMS] Sent Twilio OTP for ${purpose} to ${to}`);
      return true;
    } catch (error) {
      console.error("[SMS] Twilio send failed:", error?.message || error);
    }
  }

  // 2. Fast2SMS (Indian mobile numbers)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const rawDigits = phone.replace(/\D/g, "").slice(-10);
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=otp&variables_values=${otp}&numbers=${rawDigits}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (data?.return) {
        console.log(`[SMS] Sent Fast2SMS OTP for ${purpose} to ${rawDigits}`);
        return true;
      } else {
        console.error("[SMS] Fast2SMS returned error:", data?.message || data);
      }
    } catch (error) {
      console.error("[SMS] Fast2SMS send failed:", error?.message || error);
    }
  }

  // 3. Fallback: Log to terminal for local dev testing
  console.log(`[OTP] ${purpose} code for ${phone}: ${otp} (expires in ${OTP_TTL_MINUTES}m)`);
  return false;
}

function findFarmer(phone) {
  if (!phone) return null;
  const raw = String(phone).trim();
  const digits = raw.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  if (!last10) return null;
  return db.prepare(
    `SELECT * FROM farmers WHERE phone = ? OR phone = ? OR phone LIKE ?`
  ).get(raw, `+91${last10}`, `%${last10}`);
}

async function sendOtp(phone, purpose) {
  const otp = generateOtp();
  const otpHash = bcrypt.hashSync(otp, 8);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();
  db.prepare(
    `INSERT INTO otp_challenges (id, phone, otp_hash, purpose, expires_at) VALUES (?,?,?,?,?)`
  ).run(newId(), phone, otpHash, purpose, expiresAt);

  const smsSent = await sendSms(phone, otp, purpose);
  return smsSent || process.env.DEV_OTP_ECHO === "true" ? otp : undefined;
}

// POST /api/auth/register
authRouter.post("/register", async (req, res) => {
  const { name, phone, language = "en", state, district, village, primaryCrop, farmAreaAcres, age } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ error: "validation_error", message: "name and phone are required." });
  }
  const existing = findFarmer(phone);
  if (existing) {
    return res.status(409).json({ error: "phone_exists", message: "An account with this phone number already exists. Try logging in instead." });
  }

  const id = newId();
  const farmerCode = generateFarmerCode(state);
  db.prepare(
    `INSERT INTO farmers (id, farmer_code, name, phone, preferred_language, state, district, village, primary_crop, farm_area_acres, age)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).run(id, farmerCode, name, phone, language, state || null, district || null, village || null, primaryCrop || null, farmAreaAcres || null, age || null);

  const devOtp = await sendOtp(phone, "register");
  res.status(201).json({ farmerId: id, farmerCode, otpSent: true, ...(devOtp ? { devOtp } : {}) });
});

// POST /api/auth/login  (request OTP for an existing phone number)
authRouter.post("/login", async (req, res) => {
  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ error: "validation_error", message: "phone is required." });

  const farmer = findFarmer(phone);
  if (!farmer) {
    return res.status(404).json({ error: "not_found", message: "No account found for this phone number. Please register first." });
  }
  const devOtp = await sendOtp(phone, "login");
  res.json({ sent: true, ...(devOtp ? { devOtp } : {}) });
});

// POST /api/auth/otp/resend
authRouter.post("/otp/resend", async (req, res) => {
  const { phone, purpose = "login" } = req.body || {};
  if (!phone) return res.status(400).json({ error: "validation_error", message: "phone is required." });
  const devOtp = await sendOtp(phone, purpose);
  res.json({ sent: true, ...(devOtp ? { devOtp } : {}) });
});

// POST /api/auth/verify-otp
authRouter.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body || {};
  if (!phone || !otp) {
    return res.status(400).json({ error: "validation_error", message: "phone and otp are required." });
  }

  const last10 = String(phone).replace(/\D/g, "").slice(-10);
  const challenge = db.prepare(
    `SELECT * FROM otp_challenges WHERE (phone = ? OR phone LIKE ?) AND consumed = 0 ORDER BY rowid DESC LIMIT 1`
  ).get(phone, `%${last10}`);

  if (!challenge) {
    return res.status(400).json({ error: "no_otp", message: "No pending OTP for this number. Request a new one." });
  }
  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ error: "otp_expired", message: "This OTP has expired. Request a new one." });
  }
  if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
    return res.status(429).json({ error: "too_many_attempts", message: "Too many incorrect attempts. Request a new OTP." });
  }

  const valid = bcrypt.compareSync(otp, challenge.otp_hash);
  if (!valid) {
    db.prepare("UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = ?").run(challenge.id);
    return res.status(400).json({ error: "invalid_otp", message: "Incorrect OTP." });
  }

  db.prepare("UPDATE otp_challenges SET consumed = 1 WHERE id = ?").run(challenge.id);

  const farmer = findFarmer(phone);
  if (farmer) {
    db.prepare("UPDATE farmers SET phone_verified = 1, updated_at = datetime('now') WHERE id = ?").run(farmer.id);
  }
  
  const token = issueToken(farmer.id);
  res.json({ token, farmer: publicFarmer(farmer) });
});

// POST /api/auth/logout
// Stateless JWTs: the client discards the token. This route exists so the
// frontend has a clean call site if server-side revocation (a token
// denylist) is added later.
authRouter.post("/logout", (_req, res) => {
  res.json({ ok: true });
});
