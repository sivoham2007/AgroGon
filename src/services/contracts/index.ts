// Service CONTRACTS — these interfaces are the boundary between the UI and
// "wherever the data actually comes from". Phase 1 wires them to
// services/mock/*. Phase 4+ replaces the mock implementations with real
// HTTP calls to the FastAPI backend in agrogon_API_SPEC.md — no calling
// code in features/ should need to change when that swap happens.

import type {
  Farmer, Farm, WeatherSnapshot, HealthSnapshot, SensorReading,
  DiseaseResult, PestResult, AlertItem, HistoryEvent, TreatmentZone,
  DroneMission, ChatMessage, MissionStatus,
  FarmIntelligenceScore, PriorityAction, DigitalTwinLayer, TimelineEvent,
  ImpactEstimate, IrrigationRecommendation, AIExplanation, MissionOptimization,
  MissionReport, DroneInfo, OfflineQueueItem,
} from "../../types/domain";

export interface AuthService {
  register(input: {
    name: string; phone: string; language: string;
    state: string; district: string; village: string;
    primaryCrop: string; farmAreaAcres: number;
  }): Promise<{ farmerId: string; farmerCode: string }>;
  requestOtp(phone: string): Promise<{ sent: boolean }>;
  verifyOtp(phone: string, otp: string): Promise<{ token: string; farmer: Farmer }>;
}

export interface FarmService {
  getFarms(farmerId: string): Promise<Farm[]>;
  getFarm(farmId: string): Promise<Farm>;
  saveBoundary(farmId: string, points: { lat: number; lng: number }[]): Promise<{ areaAcres: number }>;
}

export interface ScanService {
  scanCrop(farmId: string, imageBlob: Blob | null): Promise<DiseaseResult>;
  scanPest(farmId: string, imageBlob: Blob | null): Promise<PestResult>;
}

export interface WeatherService {
  getWeather(farmId: string): Promise<WeatherSnapshot>;
}

export interface HealthService {
  getHealth(farmId: string): Promise<HealthSnapshot>;
}

export interface SensorService {
  getReading(farmId: string): Promise<SensorReading>;
}

export interface RiskService {
  getRisk(farmId: string): Promise<{
    disease: string; pest: string; water: string; factors: string[]; recommendation: string;
  }>;
}

export interface AlertService {
  getNearbyAlerts(farmId: string): Promise<AlertItem[]>;
  notifyNearbyFarmers(alertId: string): Promise<{ notified: number }>;
}

export interface AdvisoryService {
  send(farmerId: string, text: string, language: string): Promise<ChatMessage>;
  quickTopics(): Promise<{ label: string; reply: string }[]>;
}

export interface TreatmentService {
  getZones(farmId: string): Promise<TreatmentZone[]>;
}

export interface DroneService {
  getStatus(farmId: string): Promise<DroneMission>;
  createMission(farmId: string, zoneId: string): Promise<DroneMission>;
  approveMission(code: string): Promise<{ status: MissionStatus }>;
  advanceMission(code: string): Promise<{ status: MissionStatus }>;
}

export interface HistoryService {
  getHistory(farmId: string): Promise<HistoryEvent[]>;
}

export interface SyncService {
  push(): Promise<{ pushed: number }>;
  pull(): Promise<{ pulled: number; lastSyncedLabel: string }>;
  getStatus(): Promise<{ online: boolean; lastSyncedLabel: string }>;
  getQueue(): Promise<OfflineQueueItem[]>;
  queueAction(label: string): Promise<OfflineQueueItem>;
}

// ===== Added for the "connected intelligent system" upgrade =====

export interface IntelligenceService {
  getFarmScore(farmId: string): Promise<FarmIntelligenceScore>;
  getPriorityActions(farmId: string): Promise<PriorityAction[]>;
}

export interface DigitalTwinService {
  getLayers(): Promise<DigitalTwinLayer[]>;
}

export interface TimelineService {
  getTimeline(farmId: string): Promise<TimelineEvent[]>;
}

export interface ImpactService {
  getEstimate(zoneId: string): Promise<ImpactEstimate>;
}

export interface IrrigationService {
  getRecommendation(farmId: string): Promise<IrrigationRecommendation>;
}

export interface ExplainabilityService {
  getDiseaseExplanation(farmId: string): Promise<AIExplanation>;
}

export interface MissionPlanningService {
  getOptimization(zoneId: string): Promise<MissionOptimization>;
  getReport(code: string): Promise<MissionReport>;
  getDroneInfo(): Promise<DroneInfo>;
}
