import type { AuthService } from "../contracts";
import { apiFetch, setToken } from "./client";

// Real backend implementation of the AuthService contract — see
// server/src/routes/auth.js. Passwordless phone+OTP flow, matching the
// existing UI (mobile number, then OTP screen; no password field).
export const httpAuthService: AuthService = {
  async register(input) {
    const res = await apiFetch<{ farmerId: string; farmerCode: string; devOtp?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res;
  },

  async requestOtp(phone) {
    const res = await apiFetch<{ sent: boolean; devOtp?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
    return res;
  },

  async verifyOtp(phone, otp) {
    const res = await apiFetch<{ token: string; farmer: import("../../types/domain").Farmer }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    });
    setToken(res.token);
    return res;
  },
};

export async function resendOtp(phone: string, purpose: "login" | "register" = "login") {
  return apiFetch<{ sent: boolean; devOtp?: string }>("/auth/otp/resend", {
    method: "POST",
    body: JSON.stringify({ phone, purpose }),
  });
}

export async function logoutRemote() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    setToken(null);
  }
}
