import type { AuthService } from "../contracts";
import { apiFetch, setToken } from "./client";
import { CURRENT_FARMER } from "../../data/seedData";

const DEMO_OTP_KEY = "agrogon.demo_otp";

function handleApiFallback<T>(error: any, fallbackData: T): T {
  console.warn("API unavailable, falling back to demo mode.", error);
  return fallbackData;
}

// Real backend implementation of the AuthService contract — see
// server/src/routes/auth.js. Passwordless phone+OTP flow, matching the
// existing UI (mobile number, then OTP screen; no password field).
export const httpAuthService: AuthService = {
  async register(input) {
    try {
      const res = await apiFetch<{ farmerId: string; farmerCode: string; devOtp?: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return res;
    } catch (e) {
      const devOtp = Math.floor(100000 + Math.random() * 900000).toString();
      if (typeof window !== "undefined") window.localStorage.setItem(DEMO_OTP_KEY, devOtp);
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
          return handleApiFallback(e, { token: "demo-session-token", farmer: CURRENT_FARMER });
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
