import type { Farmer } from "../../types/domain";
import { apiFetch } from "./client";

export const httpProfileService = {
  get(): Promise<Farmer> {
    return apiFetch<Farmer>("/profile");
  },
  update(patch: Partial<{
    name: string; age: number; village: string; district: string; state: string;
    primaryCrop: string; farmAreaAcres: number; preferredLanguage: string;
  }>): Promise<Farmer> {
    return apiFetch<Farmer>("/profile", { method: "PATCH", body: JSON.stringify(patch) });
  },
  updateLanguage(language: string): Promise<{ preferredLanguage: string }> {
    return apiFetch("/profile/language", { method: "PUT", body: JSON.stringify({ language }) });
  },
};
