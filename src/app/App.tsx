import type { ReactNode } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { SplashScreen, useSplashGate } from "../components/layout/Splash";
import { useApp } from "./AppState";
import { LoadingState } from "../components/ui/Primitives";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";

import { LandingScreen } from "../features/onboarding/LandingScreen";
import { OnboardingScreen } from "../features/onboarding/OnboardingScreens";
import { LoginScreen, OtpScreen, RegisterScreen } from "../features/auth/AuthScreens";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { FarmScreen, LandMapScreen } from "../features/farm/FarmScreens";
import { ScannerScreen } from "../features/scanner/ScannerScreen";
import { RiskScreen, AlertsScreen } from "../features/riskAlerts/RiskAlertsScreens";
import { AdvisoryScreen } from "../features/advisory/AdvisoryScreen";
import { SensorsScreen } from "../features/sensors/SensorsScreen";
import { WeatherScreen } from "../features/weather/WeatherScreen";
import { IrrigationScreen } from "../features/irrigation/IrrigationScreen";
import { TreatmentScreen, ZoneDetailScreen } from "../features/treatment/TreatmentScreens";
import { ImpactEstimatorScreen } from "../features/treatment/ImpactEstimatorScreen";
import { DigitalTwinScreen } from "../features/digitalTwin/DigitalTwinScreen";
import { DroneHomeScreen, MissionOptimizeScreen, MissionSimScreen, MissionReportScreen } from "../features/drone/DroneScreens";
import { HistoryScreen } from "../features/history/HistoryScreen";
import { NotificationsScreen } from "../features/profile/NotificationsScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { MarketScreen } from "../features/market/MarketScreen";
import { SchemesScreen } from "../features/schemes/SchemesScreen";
import { CommunityScreen } from "../features/community/CommunityScreen";
import { RecommendationsScreen } from "../features/recommendations/RecommendationsScreen";
import { TasksScreen } from "../features/tasks/TasksScreen";
import { CameraMonitoringScreen } from "../features/camera/CameraMonitoringScreen";
import { ReportsScreen } from "../features/reports/ReportsScreen";
import { FarmMapScreen } from "../features/farmMap/FarmMapScreen";
import { FertilizerCalculatorScreen } from "../features/calculators/FertilizerCalculatorScreen";
import { PesticideCalculatorScreen } from "../features/calculators/PesticideCalculatorScreen";
import { CropRecommendationScreen } from "../features/recommendations/CropRecommendationScreen";
import { CropCalendarScreen } from "../features/calendar/CropCalendarScreen";
import { AdminPanelScreen } from "../features/admin/AdminPanelScreen";
import { DiseaseDetectorScreen } from "../features/diseaseDetector/DiseaseDetectorScreen";
import { SoilFertilityScreen } from "../features/soilFertility/SoilFertilityScreen";

// Gate for every screen that needs a real logged-in farmer. Without this,
// the app previously showed the same hardcoded farmer to anyone who typed
// /dashboard in the URL, logged in or not.
function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, authLoading } = useApp();
  const location = useLocation();
  if (authLoading) return <LoadingState label="Loading your account..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export default function App() {
  const showSplash = useSplashGate();

  return (
    <ErrorBoundary>
      {showSplash && <SplashScreen />}
      <AppShell>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/otp" element={<OtpScreen />} />
        <Route path="/register" element={<RegisterScreen />} />

        <Route path="/dashboard" element={<RequireAuth><DashboardScreen /></RequireAuth>} />
        <Route path="/farm" element={<RequireAuth><FarmScreen /></RequireAuth>} />
        <Route path="/farm/land-map" element={<RequireAuth><LandMapScreen /></RequireAuth>} />
        <Route path="/farm/map" element={<RequireAuth><FarmMapScreen /></RequireAuth>} />
        <Route path="/scanner" element={<RequireAuth><ScannerScreen /></RequireAuth>} />
        <Route path="/risk" element={<RequireAuth><RiskScreen /></RequireAuth>} />
        <Route path="/alerts" element={<RequireAuth><AlertsScreen /></RequireAuth>} />
        <Route path="/advisory" element={<RequireAuth><AdvisoryScreen /></RequireAuth>} />
        <Route path="/sensors" element={<RequireAuth><SensorsScreen /></RequireAuth>} />
        <Route path="/weather" element={<RequireAuth><WeatherScreen /></RequireAuth>} />
        <Route path="/irrigation" element={<RequireAuth><IrrigationScreen /></RequireAuth>} />
        <Route path="/digital-twin" element={<RequireAuth><DigitalTwinScreen /></RequireAuth>} />
        <Route path="/treatment" element={<RequireAuth><TreatmentScreen /></RequireAuth>} />
        <Route path="/treatment/zone/:zoneId" element={<RequireAuth><ZoneDetailScreen /></RequireAuth>} />
        <Route path="/treatment/zone/:zoneId/impact" element={<RequireAuth><ImpactEstimatorScreen /></RequireAuth>} />
        <Route path="/drone" element={<RequireAuth><DroneHomeScreen /></RequireAuth>} />
        <Route path="/drone/optimize" element={<RequireAuth><MissionOptimizeScreen /></RequireAuth>} />
        <Route path="/drone/mission" element={<RequireAuth><MissionSimScreen /></RequireAuth>} />
        <Route path="/drone/report" element={<RequireAuth><MissionReportScreen /></RequireAuth>} />
        <Route path="/market" element={<RequireAuth><MarketScreen /></RequireAuth>} />
        <Route path="/schemes" element={<RequireAuth><SchemesScreen /></RequireAuth>} />
        <Route path="/community" element={<RequireAuth><CommunityScreen /></RequireAuth>} />
        <Route path="/recommendations" element={<RequireAuth><RecommendationsScreen /></RequireAuth>} />
        <Route path="/crop-recommendation" element={<RequireAuth><CropRecommendationScreen /></RequireAuth>} />
        <Route path="/tasks" element={<RequireAuth><TasksScreen /></RequireAuth>} />
        <Route path="/camera" element={<RequireAuth><CameraMonitoringScreen /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><ReportsScreen /></RequireAuth>} />
        <Route path="/history" element={<RequireAuth><HistoryScreen /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><NotificationsScreen /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsScreen /></RequireAuth>} />
        
        {/* Advanced Features */}
        <Route path="/fertilizer-calculator" element={<RequireAuth><FertilizerCalculatorScreen /></RequireAuth>} />
        <Route path="/pesticide-calculator" element={<RequireAuth><PesticideCalculatorScreen /></RequireAuth>} />
        <Route path="/crop-calendar" element={<RequireAuth><CropCalendarScreen /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><AdminPanelScreen /></RequireAuth>} />
        <Route path="/disease-detector" element={<RequireAuth><DiseaseDetectorScreen /></RequireAuth>} />
        <Route path="/soil-fertility" element={<RequireAuth><SoilFertilityScreen /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AppShell>
    </ErrorBoundary>
  );
}
