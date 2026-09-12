// Shared domain types — these mirror agrogon_API_SPEC.md / database_schema.sql
// so the mock service layer and a future real backend are interchangeable.

export type RiskLevel = "low" | "medium" | "high";

export interface Farmer {
  id: string;
  farmerCode: string; // e.g. AGG-KA-000124
  name: string;
  phone: string;
  email?: string;
  preferredLanguage: string;
  state: string;
  district: string;
  village: string;
  primaryCrop?: string;
  farmAreaAcres?: number;
  age?: number;
}

export interface Farm {
  id: string;
  name: string;
  areaAcres: number;
  crop: string;
  cropVariety: string;
  sowingDate: string;
  growthStage: string;
  irrigationType: string;
}

export interface WeatherSnapshot {
  tempC: number;
  condition: string;
  humidityPct: number;
  rainChancePct: number;
  windKph: number;
  note: string;
}

export interface HealthSnapshot {
  overallPct: number;
  disease: RiskLevel;
  pest: RiskLevel;
  water: RiskLevel;
  nutrient: RiskLevel;
  soilMoisturePct: number;
  soilPh: number;
  soilTempC: number;
}

export interface SensorReading {
  online: boolean;
  soilMoisturePct: number;
  tempC: number;
  humidityPct: number;
  ph: number;
  light: "Low" | "Normal" | "High";
  lastSyncedLabel: string;
}

export interface DiseaseResult {
  crop: string;
  label: string;
  confidencePct: number;
  severity: "Low" | "Moderate" | "High";
  severityPct: number;
  note: string;
  modelVersion: string;
  isMock: boolean;
}

export interface PestResult {
  label: string;
  confidencePct: number;
  detectedCount: number;
  infestationLevel: RiskLevel;
  isMock: boolean;
}

export interface AlertItem {
  id: string;
  icon: "virus" | "bug" | "cloud";
  severity: RiskLevel;
  title: string;
  meta: string;
  timeLabel: string;
}

export interface HistoryEvent {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  icon: string;
  severity: RiskLevel;
}

export interface TreatmentZone {
  id: string;
  label: string;
  condition: string;
  color: string;
  top: string; left: string; width: string; height: string;
  confidencePct: number;
  recommendedAction: string;
}

export type MissionStatus =
  | "planned" | "pending_approval" | "approved"
  | "in_flight" | "applying" | "completed";

export interface DroneMission {
  code: string;
  targetZoneId: string;
  operationType: string;
  estimatedAreaAcres: number;
  status: MissionStatus;
  batteryPct: number;
  tankPct: number;
  gpsConnected: boolean;
}

export interface ChatMessage {
  who: "bot" | "user";
  text: string;
}

// ===== Added for the "connected intelligent system" upgrade =====

export interface FarmIntelligenceScore {
  overall: number; // 0-100
  label: string; // e.g. "Excellent Farm Condition"
  breakdown: { label: string; value: number }[];
  recommendations: string[];
}

export type ActionUrgency = "low" | "medium" | "high" | "critical";

export interface PriorityAction {
  id: string;
  priority: number;
  icon: string;
  title: string;
  urgency: ActionUrgency;
  reason: string;
  estimatedImpact: string;
  linkTo?: string; // route to "View Details"
  zoneId?: string;
}

export type DigitalTwinLayerId = "health" | "disease" | "risk" | "sensor" | "treatment" | "drone";

export interface DigitalTwinLayer {
  id: DigitalTwinLayerId;
  label: string;
  defaultOn: boolean;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  icon: string;
  severity: RiskLevel;
  relatedField?: string;
  relatedType?: "scan" | "risk" | "treatment" | "mission" | "sensor" | "weather";
  relatedRoute?: string;
}

export interface ImpactFactor {
  label: string;
  value: string;
}

export interface ImpactEstimate {
  withoutInterventionLoss: string;
  withActionLoss: string;
  protectedValue: string;
  factors: ImpactFactor[];
  isDemoProjection: boolean;
}

export interface IrrigationRecommendation {
  recommended: boolean;
  headline: string;
  windowLabel: string;
  reason: string;
  currentMoisturePct: number;
  recommendedRangePct: [number, number];
  weatherNote: string;
}

export interface AIExplanationFactor {
  label: string;
  impact: "High Impact" | "Medium Impact" | "Low Impact";
  weightPct: number;
}

export interface AIExplanation {
  title: string;
  factors: AIExplanationFactor[];
  plainLanguageSummary: string;
}

export interface MissionOptimization {
  recommendedAltitudeM: number;
  recommendedSpeedMs: number;
  recommendedSprayIntensity: "Low" | "Medium" | "High";
  estimatedFlightTimeMin: number;
  estimatedBatteryUsagePct: number;
  waypointCount: number;
  routeRationale: string;
}

export interface MissionReport {
  code: string;
  areaCoveredAcres: number;
  flightDurationMin: number;
  batteryUsedPct: number;
  treatmentApplied: string;
  coveragePct: number;
}

export interface DroneInfo {
  name: string;
  droneId: string;
  connectionStatus: "Connected" | "Disconnected";
  batteryPct: number;
  gpsStatus: "Connected" | "Searching";
  flightStatus: "Ready" | "In Flight" | "Returning" | "Landed";
  altitudeM: number;
  estimatedFlightTimeMin: number;
  payloadStatus: string;
  mode: "Simulation";
}

export interface OfflineQueueItem {
  id: string;
  label: string;
  createdAt: string;
}
