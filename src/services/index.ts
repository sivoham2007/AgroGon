// Service REGISTRY — the one file that decides whether features/ talk to
// mock services or a real backend. Today (Phase 1) everything is mock.
// From Phase 4 onward, swap individual entries to services/http/* as each
// real endpoint comes online — features/ code imports from here and never
// needs to change.

import {
  mockFarmService, mockScanService,
  mockHealthService, mockSensorService, mockRiskService, mockAlertService,
  mockAdvisoryService, mockTreatmentService, mockDroneService,
  mockHistoryService, mockSyncService, mockIntelligenceService,
  mockDigitalTwinService, mockTimelineService, mockImpactService,
  mockIrrigationService, mockExplainabilityService, mockMissionPlanningService,
} from "./mock";
import { httpAuthService } from "./http/authService";
import { httpWeatherService } from "./http/weatherService";
import { httpProfileService } from "./http/profileService";
import { httpNotificationsService } from "./http/notificationsService";

// Real backend (server/) is wired in for auth, weather, profile, and
// notifications — see src/services/http/*. Everything else still returns
// mock/seed data because the real thing it depends on (disease-detection
// model, IoT sensors, drone hardware, market/community data feeds) isn't
// connected yet; those screens say so in their own UI (IntegrationPending /
// "SIMULATED" labels) rather than pretending otherwise.
import {
  httpCalculatorsService,
  httpSoilAdvancedService,
  httpCalendarService,
  httpRecommendationsService,
  httpAdminService,
  httpDiseaseService,
  httpSoilFertilityService
} from "./http/advancedServices";

export const services = {
  auth: httpAuthService,
  farm: mockFarmService,
  scan: mockScanService,
  weather: httpWeatherService,
  profile: httpProfileService,
  notifications: httpNotificationsService,
  health: mockHealthService,
  sensor: mockSensorService,
  risk: mockRiskService,
  alert: mockAlertService,
  advisory: mockAdvisoryService,
  treatment: mockTreatmentService,
  drone: mockDroneService,
  history: mockHistoryService,
  sync: mockSyncService,
  intelligence: mockIntelligenceService,
  digitalTwin: mockDigitalTwinService,
  timeline: mockTimelineService,
  impact: mockImpactService,
  irrigation: mockIrrigationService,
  explain: mockExplainabilityService,
  missionPlanning: mockMissionPlanningService,
  // Added services
  calculators: httpCalculatorsService,
  soilAdvanced: httpSoilAdvancedService,
  calendar: httpCalendarService,
  recommendations: httpRecommendationsService,
  admin: httpAdminService,
  disease: httpDiseaseService,
  soilFertility: httpSoilFertilityService
};

// No longer all-or-nothing: auth/weather/profile/notifications are real
// (see above), the rest are mock pending their own backend/model/hardware.
export const IS_USING_MOCK_SERVICES = false;
