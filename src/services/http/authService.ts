import type { AuthService } from "../contracts";
import { apiFetch, setToken } from "./client";
import type { Farmer } from "../../types/domain";

const EMPTY_FARMER: Farmer = {
  id: "demo-id",
  farmerCode: "AGG-DEMO",
  name: "",
  phone: "",
  preferredLanguage: "en",
  state: "",
  district: "",
  village: "",
};

const DEMO_OTP_KEY = "agrogon.demo_otp";

function handleApiFallback<T>(error: any, fallbackData: T): T {
  console.warn("API unavailable, falling back to demo mode.", error);
  return fallbackData;
}

function shouldFallback(error: any): boolean {
  // If it's an ApiError with a status, only fallback on network issues (0),
  // missing endpoints (404), or server crashes (>= 500).
  // Rethrow validation errors (400) or auth errors (401/403).
  if (error && typeof error.status === "number") {
    return error.status === 0 || error.status === 404 || error.status >= 500;
  }
  return true;
}

// Real backend implementation of the AuthService contract — see
// server/src/routes/auth.js. Passwordless phone+OTP flow, matching the
// existing UI (mobile number, then OTP screen; no password field).
const DEMO_PROFILE_KEY = "agrogon.demo_profile";

export const httpAuthService: AuthService = {
  async register(input) {
    try {
      const res = await apiFetch<{ farmerId: string; farmerCode: string; devOtp?: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return res;
    } catch (e) {
      if (!shouldFallback(e)) throw e;
      const devOtp = Math.floor(100000 + Math.random() * 900000).toString();
      if (typeof window !== "undefined") {
        window.localStorage.setItem(DEMO_OTP_KEY, devOtp);
        window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify({
          ...EMPTY_FARMER,
          id: "farmer-demo",
          farmerCode: "AGG-KA-DEMO",
          name: input.name || "",
          phone: input.phone || "",
          preferredLanguage: input.language || "en",
          state: input.state || "",
          district: input.district || "",
          village: input.village || "",
          primaryCrop: input.primaryCrop || "",
          farmAreaAcres: input.farmAreaAcres || null,
        }));
      }
      return handleApiFallback(e, {
        farmerId: "farmer-demo",
        farmerCode: "AGG-KA-DEMO",
        devOtp,
      });
    }
  },

  async requestOtp(phone) {
    try {
      const res = await apiFetch<{ sent: boolean; devOtp?: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      return res;
    } catch (e) {
      if (!shouldFallback(e)) throw e;
      const devOtp = Math.floor(100000 + Math.random() * 900000).toString();
      if (typeof window !== "undefined") window.localStorage.setItem(DEMO_OTP_KEY, devOtp);
      return handleApiFallback(e, { sent: true, devOtp });
    }
  },

  async verifyOtp(phone, otp) {
    try {
      const res = await apiFetch<{ token: string; farmer: import("../../types/domain").Farmer }>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });
      setToken(res.token);
      return res;
    } catch (e) {
      if (typeof window !== "undefined") {
        const expected = window.localStorage.getItem(DEMO_OTP_KEY);
        if (expected && otp === expected) {
          window.localStorage.removeItem(DEMO_OTP_KEY);
          setToken("demo-session-token");
          
          let demoFarmer = { ...EMPTY_FARMER, phone, name: "Demo Farmer" };
          const savedProfile = window.localStorage.getItem(DEMO_PROFILE_KEY);
          if (savedProfile) {
            try { demoFarmer = JSON.parse(savedProfile); } catch(err){}
          }
          
          return handleApiFallback(e, { token: "demo-session-token", farmer: demoFarmer });
        }
      }
      throw e; // Rethrow if it wasn't our demo OTP
    }
  },
};

export async function resendOtp(phone: string, purpose: "login" | "register" = "login") {
  try {
    return await apiFetch<{ sent: boolean; devOtp?: string }>("/auth/otp/resend", {
      method: "POST",
      body: JSON.stringify({ phone, purpose }),
    });
  } catch (e) {
    if (!shouldFallback(e)) throw e;
    const devOtp = Math.floor(100000 + Math.random() * 900000).toString();
    if (typeof window !== "undefined") window.localStorage.setItem(DEMO_OTP_KEY, devOtp);
    return handleApiFallback(e, { sent: true, devOtp });
  }
}

export async function logoutRemote() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch (e) {
    // Ignore error on logout fallback
  } finally {
    setToken(null);
  }
}
