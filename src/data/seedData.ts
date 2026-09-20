// SEED DATA — placeholder data used until a real backend is connected
// (services/mock/*). Nothing here should be read as "demo mode" UI —
// it is the seed/mock content layer, isolated so it's a one-file swap.

import type {
  Farmer, Farm, AlertItem, HistoryEvent, TreatmentZone,
  FarmIntelligenceScore, PriorityAction, DigitalTwinLayer, TimelineEvent,
  ImpactEstimate, IrrigationRecommendation, AIExplanation, MissionOptimization,
  MissionReport, DroneInfo,
} from "../types/domain";

export const CURRENT_FARMER: Farmer = {
  id: "farmer-1",
  farmerCode: "AGG-KA-000124",
  name: "Ravi Kumar",
  phone: "+91 98450 12345",
  preferredLanguage: "English",
  state: "Karnataka",
  district: "Chikkaballapur",
  village: "Hosahalli",
};

export const CURRENT_FARM: Farm = {
  id: "farm-1",
  name: "Green Valley Farm",
  areaAcres: 2.7,
  crop: "Tomato",
  cropVariety: "Arka Rakshak",
  sowingDate: "12 Jun 2026",
  growthStage: "Flowering",
  irrigationType: "Drip",
};

export const SEED_ALERTS: AlertItem[] = [
  { id: "a1", icon: "virus", severity: "high", title: "Early Blight reported", meta: "1.8 km away · 4 farms affected", timeLabel: "2h ago" },
  { id: "a2", icon: "bug", severity: "medium", title: "Aphid activity rising", meta: "3.2 km away · 2 farms", timeLabel: "6h ago" },
  { id: "a3", icon: "cloud", severity: "low", title: "Heavy rain expected", meta: "Tomorrow, 6–9 AM", timeLabel: "1d ago" },
];

export const SEED_HISTORY: HistoryEvent[] = [
  { id: "h1", date: "26 Aug", title: "Possible Early Blight detected", subtitle: "AI Crop Scan · Field 01", icon: "virus", severity: "high" },
  { id: "h2", date: "25 Aug", title: "Soil moisture below optimal", subtitle: "Sensor alert · 34%", icon: "droplet", severity: "medium" },
  { id: "h3", date: "23 Aug", title: "Drone mission completed", subtitle: "Zone D · Targeted application", icon: "drone", severity: "low" },
  { id: "h4", date: "20 Aug", title: "Routine crop scan completed", subtitle: "Health score 88%", icon: "scan", severity: "low" },
  { id: "h5", date: "14 Aug", title: "Farm boundary registered", subtitle: "2.7 acres · Field 01", icon: "map", severity: "low" },
];

export const SEED_ZONES: TreatmentZone[] = [
  { id: "A", label: "Zone A", condition: "Healthy", color: "#2E9D68", top: "10%", left: "8%", width: "38%", height: "36%", confidencePct: 96, recommendedAction: "Continue routine monitoring." },
  { id: "B", label: "Zone B", condition: "Water stress", color: "#E8A317", top: "10%", left: "52%", width: "40%", height: "30%", confidencePct: 88, recommendedAction: "Increase drip irrigation cycle by 15 minutes." },
  { id: "C", label: "Zone C", condition: "Nutrient concern", color: "#F4B942", top: "52%", left: "8%", width: "38%", height: "38%", confidencePct: 79, recommendedAction: "Apply recommended micronutrient mix per local guidance." },
  { id: "D", label: "Zone D", condition: "Disease risk", color: "#D9534F", top: "48%", left: "52%", width: "40%", height: "42%", confidencePct: 94, recommendedAction: "Targeted treatment recommended — see Precision Drone." },
];

// ===== Connected demo story =====
// High humidity → rising disease risk → AI scan confirms Early Blight →
// Zone D flagged → treatment recommended → drone mission planned →
// farmer approves → mission simulated → timeline records it all.
// Every screen below reads from this same story so it feels like one
// system, not disconnected demo cards.

export const FARM_INTELLIGENCE_SCORE: FarmIntelligenceScore = {
  overall: 82,
  label: "Excellent Farm Condition",
  breakdown: [
    { label: "Crop Health", value: 85 },
    { label: "Water Management", value: 78 },
    { label: "Risk Control", value: 80 },
    { label: "Sensor Coverage", value: 90 },
  ],
  recommendations: [
    "Treat the fungal infection flagged in Zone D to lift Risk Control.",
    "Tighten irrigation timing this week to improve Water Management.",
  ],
};

export const PRIORITY_ACTIONS: PriorityAction[] = [
  {
    id: "pa1", priority: 1, icon: "virus", title: "Treat fungal infection in Zone D", urgency: "high",
    reason: "High humidity and today's crop scan results indicate increasing infection risk.",
    estimatedImpact: "Protects an estimated ₹17,000 in crop value if treated within 48 hours.",
    linkTo: "/treatment/zone/D", zoneId: "D",
  },
  {
    id: "pa2", priority: 2, icon: "droplet", title: "Irrigation recommended", urgency: "medium",
    reason: "Soil moisture is below the recommended range for the flowering stage.",
    estimatedImpact: "Prevents water-stress related yield loss.",
    linkTo: "/irrigation",
  },
  {
    id: "pa3", priority: 3, icon: "cloud", title: "Delay next irrigation cycle", urgency: "low",
    reason: "Rain is expected within 24 hours — additional irrigation isn't needed yet.",
    estimatedImpact: "Saves water and avoids over-saturating Zone B.",
    linkTo: "/irrigation",
  },
];

export const DIGITAL_TWIN_LAYERS: DigitalTwinLayer[] = [
  { id: "health", label: "Crop Health", defaultOn: true },
  { id: "disease", label: "Disease", defaultOn: true },
  { id: "risk", label: "Risk", defaultOn: false },
  { id: "sensor", label: "Sensors", defaultOn: false },
  { id: "treatment", label: "Treatment", defaultOn: true },
  { id: "drone", label: "Drone Mission", defaultOn: false },
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: "t1", time: "09:00 AM", title: "Sensor detected high humidity", detail: "Field sensor in Zone D recorded 72% humidity, above the optimal range for tomato foliage.", icon: "droplet", severity: "medium", relatedField: "Zone D", relatedType: "sensor", relatedRoute: "/sensors" },
  { id: "t2", time: "10:15 AM", title: "Disease risk increased", detail: "The risk engine raised Disease Risk to HIGH based on humidity, recent rainfall, and nearby community reports.", icon: "alerts", severity: "high", relatedField: "Zone D", relatedType: "risk", relatedRoute: "/risk" },
  { id: "t3", time: "11:00 AM", title: "AI crop scan detected fungal symptoms", detail: "A crop scan on Zone D returned a 94% confidence match for Early Blight, Moderate severity.", icon: "virus", severity: "high", relatedField: "Zone D", relatedType: "scan", relatedRoute: "/disease-detector" },
  { id: "t4", time: "11:05 AM", title: "Treatment zone suggested", detail: "Zone D was flagged on the Precision Treatment Map with a targeted-application recommendation.", icon: "map", severity: "high", relatedField: "Zone D", relatedType: "treatment", relatedRoute: "/treatment/zone/D" },
  { id: "t5", time: "11:15 AM", title: "Farmer approved drone mission", detail: "Mission #AG-1024 was reviewed and approved for Zone D — 0.35 acres, targeted application.", icon: "check", severity: "low", relatedField: "Zone D", relatedType: "mission", relatedRoute: "/drone/mission" },
  { id: "t6", time: "11:30 AM", title: "Drone mission simulation completed", detail: "AG-1024 completed its simulated flight — 0.35 acres covered, 18% battery used.", icon: "drone", severity: "low", relatedField: "Zone D", relatedType: "mission", relatedRoute: "/drone/report" },
];

export const IMPACT_ESTIMATE: ImpactEstimate = {
  withoutInterventionLoss: "₹25,000",
  withActionLoss: "₹8,000",
  protectedValue: "₹17,000",
  isDemoProjection: true,
  factors: [
    { label: "Crop type", value: "Tomato (Arka Rakshak)" },
    { label: "Affected area", value: "0.35 acres (Zone D)" },
    { label: "Disease severity", value: "Moderate (58%)" },
    { label: "Growth stage", value: "Flowering" },
    { label: "Estimated yield at risk", value: "~340 kg" },
    { label: "Estimated market value", value: "₹28/kg (local mandi average)" },
  ],
};

export const IRRIGATION_RECOMMENDATION: IrrigationRecommendation = {
  recommended: false,
  headline: "Irrigation Not Recommended",
  windowLabel: "Next recommended window: Tomorrow evening",
  reason: "Rain probability is high in the next 24 hours and current soil moisture (61%) is sufficient for the flowering stage.",
  currentMoisturePct: 61,
  recommendedRangePct: [55, 70],
  weatherNote: "70% chance of rain expected this evening.",
};

export const DISEASE_EXPLANATION: AIExplanation = {
  title: "Disease Risk Analysis",
  plainLanguageSummary: "The leaf symptoms in your photo are the strongest signal, and today's humid, warm weather made that kind of infection more likely to take hold.",
  factors: [
    { label: "Leaf Image Symptoms", impact: "High Impact", weightPct: 90 },
    { label: "Humidity", impact: "Medium Impact", weightPct: 60 },
    { label: "Temperature", impact: "Medium Impact", weightPct: 50 },
    { label: "Previous Field History", impact: "Low Impact", weightPct: 25 },
  ],
};

export const MISSION_OPTIMIZATION: MissionOptimization = {
  recommendedAltitudeM: 4,
  recommendedSpeedMs: 3,
  recommendedSprayIntensity: "Medium",
  estimatedFlightTimeMin: 6,
  estimatedBatteryUsagePct: 18,
  waypointCount: 9,
  routeRationale: "This route prioritizes Zone D (highest risk) first while minimizing travel distance from the launch pad, reducing total flight time by an estimated 30%.",
};

export const MISSION_REPORT: MissionReport = {
  code: "AG-1024",
  areaCoveredAcres: 0.35,
  flightDurationMin: 6,
  batteryUsedPct: 18,
  treatmentApplied: "Targeted crop-protection application (Zone D)",
  coveragePct: 100,
};

export const DRONE_INFO: DroneInfo = {
  name: "AgroGon Precision One",
  droneId: "AG-DRN-001",
  connectionStatus: "Connected",
  batteryPct: 82,
  gpsStatus: "Connected",
  flightStatus: "Ready",
  altitudeM: 0,
  estimatedFlightTimeMin: 14,
  payloadStatus: "Loaded — 64% tank",
  mode: "Simulation",
};

export const QUICK_TOPICS = [
  { label: "Disease Help", reply: "Watch for dark spots on lower leaves and remove them early. Avoid wetting leaves when watering." },
  { label: "Pest Help", reply: "A few aphids are normal. If you see curling leaves or sticky residue, monitor twice a week." },
  { label: "Water Advice", reply: "Soil moisture is at 61% — healthy for tomato flowering stage. No extra irrigation needed today." },
  { label: "Fertilizer Advice", reply: "Follow your local Krishi Vigyan Kendra's recommended dose for flowering-stage tomato. Avoid excess nitrogen." },
  { label: "Weather Advice", reply: "Humidity is high today, which raises disease risk. Good day to inspect rather than irrigate." },
];
