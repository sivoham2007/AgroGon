// MOCK SERVICES — placeholder implementations used until a real backend
// is connected. Not "Demo Mode" UI — this is the standard mock/stub
// layer every app needs before its API is live. Each function here
// simulates network latency and returns data shaped exactly like the
// real API contract (services/contracts). When a real backend exists,
// each of these files gets a sibling in services/http/ implementing the
// same interface — features/ code never changes.

import type {
  AuthService, FarmService, ScanService, WeatherService, HealthService,
  SensorService, RiskService, AlertService, AdvisoryService,
  TreatmentService, DroneService, HistoryService, SyncService,
  IntelligenceService, DigitalTwinService, TimelineService, ImpactService,
  IrrigationService, ExplainabilityService, MissionPlanningService,
} from "../contracts";
import type { DiseaseResult, PestResult, MissionStatus, OfflineQueueItem } from "../../types/domain";
import {
  CURRENT_FARMER, CURRENT_FARM, SEED_ALERTS, SEED_HISTORY, SEED_ZONES, QUICK_TOPICS,
  FARM_INTELLIGENCE_SCORE, PRIORITY_ACTIONS, DIGITAL_TWIN_LAYERS, TIMELINE_EVENTS,
  IMPACT_ESTIMATE, IRRIGATION_RECOMMENDATION, DISEASE_EXPLANATION, MISSION_OPTIMIZATION,
  MISSION_REPORT, DRONE_INFO,
} from "../../data/seedData";

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

export const mockAuthService: AuthService = {
  async register(input) {
    await delay(600);
    // Deterministic ID generation: AGG-<STATE>-<seq>
    const stateCode = (input.state || "KA").slice(0, 2).toUpperCase();
    const seq = Math.floor(100000 + Math.random() * 899999);
    return { farmerId: "farmer-new", farmerCode: `AGG-${stateCode}-${seq}` };
  },
  async requestOtp(_phone) {
    await delay(500);
    return { sent: true };
  },
  async verifyOtp(_phone, otp) {
    await delay(500);
    if (otp.length !== 4) {
      throw new Error("Enter the 4-digit code sent to your phone.");
    }
    return { token: "session-token", farmer: CURRENT_FARMER };
  },
};

export const mockFarmService: FarmService = {
  async getFarms(_farmerId) {
    await delay(400);
    return [CURRENT_FARM, { ...CURRENT_FARM, id: "farm-2", name: "East Rice Field", crop: "Rice", areaAcres: 1.4 }];
  },
  async getFarm(_farmId) {
    await delay(300);
    return CURRENT_FARM;
  },
  async saveBoundary(_farmId, points) {
    await delay(700);
    // trivial shoelace-formula-style stand-in so the number reacts to input
    const area = Math.max(0.5, Math.min(9.9, points.length * 0.6 + 1.1));
    return { areaAcres: Math.round(area * 10) / 10 };
  },
};

export const mockScanService: ScanService = {
  async scanCrop(_farmId, _imageBlob): Promise<DiseaseResult> {
    await delay(2200); // simulates on-device/edge inference time
    return {
      crop: "Tomato",
      label: "Early Blight",
      confidencePct: 94,
      severity: "Moderate",
      severityPct: 58,
      note: "Detected on 3 leaves in the lower canopy",
      modelVersion: "mock-disease-v0",
      isMock: true,
    };
  },
  async scanPest(_farmId, _imageBlob): Promise<PestResult> {
    await delay(1800);
    return {
      label: "Aphids", confidencePct: 91, detectedCount: 7, infestationLevel: "low", isMock: true,
    };
  },
};

export const mockWeatherService: WeatherService = {
  async getWeather(_farmId) {
    await delay(350);
    return {
      tempC: 28, condition: "Partly Cloudy", humidityPct: 72, rainChancePct: 12, windKph: 9,
      note: "High humidity may increase disease risk today",
    };
  },
};

export const mockHealthService: HealthService = {
  async getHealth(_farmId) {
    await delay(350);
    return {
      overallPct: 82, disease: "low", pest: "medium", water: "low", nutrient: "medium",
      soilMoisturePct: 61, soilPh: 6.5, soilTempC: 29,
    };
  },
};

export const mockSensorService: SensorService = {
  async getReading(_farmId) {
    await delay(400);
    return {
      online: true, soilMoisturePct: 61, tempC: 29, humidityPct: 68, ph: 6.5, light: "Normal",
      lastSyncedLabel: "2 minutes ago",
    };
  },
};

export const mockRiskService: RiskService = {
  async getRisk(_farmId) {
    await delay(400);
    return {
      disease: "HIGH", pest: "MEDIUM", water: "LOW",
      factors: [
        "High humidity (72%)",
        "Recent rainfall in the area",
        "Temperature suited for fungal growth",
        "3 nearby farms reported similar symptoms",
      ],
      recommendation: "Inspect affected crop zones today, especially the lower canopy of Zone D.",
    };
  },
};

export const mockAlertService: AlertService = {
  async getNearbyAlerts(_farmId) {
    await delay(400);
    return SEED_ALERTS;
  },
  async notifyNearbyFarmers(_alertId) {
    await delay(700);
    return { notified: 14 };
  },
};

export const mockAdvisoryService: AdvisoryService = {
  async send(_farmerId, text, _language) {
    await delay(600);
    const hit = QUICK_TOPICS.find((q) => text.toLowerCase().includes(q.label.split(" ")[0].toLowerCase()));
    return { who: "bot", text: hit ? hit.reply : "Thanks — noted. For anything specific, try one of the quick topics below, or describe what you're seeing on the leaves." };
  },
  async quickTopics() {
    await delay(150);
    return QUICK_TOPICS;
  },
};

export const mockTreatmentService: TreatmentService = {
  async getZones(_farmId) {
    await delay(400);
    return SEED_ZONES;
  },
};

let missionState: MissionStatus = "planned";
export const mockDroneService: DroneService = {
  async getStatus(_farmId) {
    await delay(350);
    return {
      code: "AG-1024", targetZoneId: "D", operationType: "Targeted application",
      estimatedAreaAcres: 0.35, status: missionState, batteryPct: 82, tankPct: 64, gpsConnected: true,
    };
  },
  async createMission(_farmId, zoneId) {
    await delay(500);
    missionState = "pending_approval";
    return {
      code: "AG-1024", targetZoneId: zoneId, operationType: "Targeted application",
      estimatedAreaAcres: 0.35, status: missionState, batteryPct: 82, tankPct: 64, gpsConnected: true,
    };
  },
  async approveMission(_code) {
    await delay(500);
    missionState = "in_flight";
    return { status: missionState };
  },
  async advanceMission(_code) {
    await delay(300);
    const order: MissionStatus[] = ["in_flight", "applying", "completed"];
    const idx = order.indexOf(missionState);
    missionState = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : "completed";
    return { status: missionState };
  },
};

export const mockHistoryService: HistoryService = {
  async getHistory(_farmId) {
    await delay(350);
    return SEED_HISTORY;
  },
};

let offlineQueue: OfflineQueueItem[] = [];
export const mockSyncService: SyncService = {
  async push() { await delay(600); const n = offlineQueue.length; offlineQueue = []; return { pushed: n }; },
  async pull() { await delay(600); return { pulled: 2, lastSyncedLabel: "just now" }; },
  async getStatus() { await delay(150); return { online: true, lastSyncedLabel: "2 minutes ago" }; },
  async getQueue() { await delay(100); return offlineQueue; },
  async queueAction(label: string) {
    await delay(200);
    const item: OfflineQueueItem = { id: `q-${Date.now()}`, label, createdAt: "just now" };
    offlineQueue = [...offlineQueue, item];
    return item;
  },
};

export const mockIntelligenceService: IntelligenceService = {
  async getFarmScore(_farmId) { await delay(300); return FARM_INTELLIGENCE_SCORE; },
  async getPriorityActions(_farmId) { await delay(350); return PRIORITY_ACTIONS; },
};

export const mockDigitalTwinService: DigitalTwinService = {
  async getLayers() { await delay(150); return DIGITAL_TWIN_LAYERS; },
};

export const mockTimelineService: TimelineService = {
  async getTimeline(_farmId) { await delay(350); return TIMELINE_EVENTS; },
};

export const mockImpactService: ImpactService = {
  async getEstimate(_zoneId) { await delay(400); return IMPACT_ESTIMATE; },
};

export const mockIrrigationService: IrrigationService = {
  async getRecommendation(_farmId) { await delay(350); return IRRIGATION_RECOMMENDATION; },
};

export const mockExplainabilityService: ExplainabilityService = {
  async getDiseaseExplanation(_farmId) { await delay(300); return DISEASE_EXPLANATION; },
};

export const mockMissionPlanningService: MissionPlanningService = {
  async getOptimization(_zoneId) { await delay(500); return MISSION_OPTIMIZATION; },
  async getReport(_code) { await delay(300); return MISSION_REPORT; },
  async getDroneInfo() { await delay(200); return DRONE_INFO; },
};
