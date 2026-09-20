import { apiFetch } from "./client";

export const httpCalculatorsService = {
  async calculateFertilizer(data: any) {
    return apiFetch("/calculators/fertilizer", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async calculatePesticide(data: any) {
    return apiFetch("/calculators/pesticide", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async getHistory() {
    return apiFetch("/calculators/history");
  }
};

export const httpSoilAdvancedService = {
  async getScore(id: string) {
    return apiFetch(`/soil-analysis/score/${id}`);
  }
};

export const httpCalendarService = {
  async getEvents(farmId?: string) {
    const url = farmId ? `/calendar?farm_id=${farmId}` : "/calendar";
    return apiFetch(url);
  },
  async generateCalendar(data: any) {
    return apiFetch("/calendar/generate", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async updateEventStatus(id: string, status: string) {
    return apiFetch(`/calendar/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  }
};

export const httpRecommendationsService = {
  async getCropRecommendations(data: any) {
    return apiFetch("/recommendations/crop", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async getHistory() {
    return apiFetch("/recommendations/history");
  }
};

export const httpAdminService = {
  async getRules() {
    return apiFetch("/admin/rules");
  },
  async addRule(data: any) {
    return apiFetch("/admin/rules", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async updateRule(id: string, data: any) {
    return apiFetch(`/admin/rules/${id}`, {
      method: "PUT",
      body: JSON.stringify({ rule_data: data })
    });
  },
  async deleteRule(id: string) {
    return apiFetch(`/admin/rules/${id}`, { method: "DELETE" });
  }
};

export const httpDiseaseService = {
  scanCrop: async (farmId: string, imageFile: File, crop: string) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("farmId", farmId);
    formData.append("crop", crop);
    
    const token = localStorage.getItem("agrogon_token");
    const res = await fetch("http://localhost:4000/api/disease/analyze", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to scan crop");
    return res.json();
  },
  getHistory: async () => {
    return apiFetch("/disease/history");
  }
};

export const httpSoilFertilityService = {
  analyze: async (payload: any) => {
    return apiFetch("/soil-analysis/analyze", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getHistory: async () => {
    return apiFetch("/soil-analysis/history");
  }
};
