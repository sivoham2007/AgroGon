import type { Farmer } from "../../types/domain";
import { apiFetch } from "./client";

import { handleApiFallback, shouldFallback } from "./authService";

const DEMO_PROFILE_KEY = "agrogon.demo_profile";

export const httpProfileService = {
  async get(): Promise<Farmer> {
    try {
      return await apiFetch<Farmer>("/profile");
    } catch (e) {
      if (!shouldFallback(e)) throw e;
      const savedProfile = typeof window !== "undefined" ? window.localStorage.getItem(DEMO_PROFILE_KEY) : null;
      let demoFarmer = null;
      if (savedProfile) {
        try { demoFarmer = JSON.parse(savedProfile); } catch(err){}
      }
      if (!demoFarmer) throw e;
      return handleApiFallback(e, demoFarmer as Farmer);
    }
  },
  async update(patch: Partial<{
    name: string; age: number; village: string; district: string; state: string;
    primaryCrop: string; farmAreaAcres: number; preferredLanguage: string; email: string;
  }>): Promise<Farmer> {
    try {
      return await apiFetch<Farmer>("/profile", { method: "PATCH", body: JSON.stringify(patch) });
    } catch (e) {
      if (!shouldFallback(e)) throw e;
      let demoFarmer: Partial<Farmer> = {};
      if (typeof window !== "undefined") {
        const savedProfile = window.localStorage.getItem(DEMO_PROFILE_KEY);
        if (savedProfile) {
          try { demoFarmer = JSON.parse(savedProfile); } catch(err){}
        }
        demoFarmer = { ...demoFarmer, ...patch };
        window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(demoFarmer));
      }
      return handleApiFallback(e, demoFarmer as Farmer);
    }
  },
  async updateLanguage(language: string): Promise<{ preferredLanguage: string }> {
    try {
      return await apiFetch("/profile/language", { method: "PUT", body: JSON.stringify({ language }) });
    } catch (e) {
      if (!shouldFallback(e)) throw e;
      if (typeof window !== "undefined") {
        const savedProfile = window.localStorage.getItem(DEMO_PROFILE_KEY);
        if (savedProfile) {
          try { 
            const demoFarmer = JSON.parse(savedProfile);
            demoFarmer.preferredLanguage = language;
            window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(demoFarmer));
          } catch(err){}
        }
      }
      return handleApiFallback(e, { preferredLanguage: language });
    }
  },
};
