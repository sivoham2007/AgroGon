import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { LoadingState, Pill } from "../../components/ui/Primitives";
import { Card, FieldMap } from "../../components/cards/Cards";
import { PriorityActionCard } from "../../components/cards/Intelligence";
import { CameraFeedIllustration } from "../../components/ui/Illustrations";
import { useApp } from "../../app/AppState";
import { useT } from "../../i18n/useT";
import { services } from "../../services";
import { SEED_ZONES, SEED_ALERTS } from "../../data/seedData";
import type { WeatherSnapshot, HealthSnapshot, PriorityAction, SensorReading } from "../../types/domain";

function StatCard({ icon, iconBg, iconFg, label, value, sub }: {
  icon: Parameters<typeof Icon>[0]["name"]; iconBg: string; iconFg: string; label: string; value: string; sub?: string;
}) {
  return (
    <Card tight className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-none" style={{ background: iconBg, color: iconFg }}>
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] text-[#5E7568] truncate">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="font-[var(--font-head)] font-extrabold text-[18px] text-[var(--color-dark)]">{value}</span>
          {sub && <span className="text-[11px] text-[#8AA093]">{sub}</span>}
        </div>
      </div>
    </Card>
  );
}

export function DashboardScreen() {
  const navigate = useNavigate();
  const { farmer, farm } = useApp();
  const t = useT();
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [actions, setActions] = useState<PriorityAction[] | null>(null);
  const [sensor, setSensor] = useState<SensorReading | null>(null);

  useEffect(() => {
    services.weather.getWeather(farm.id).then(setWeather);
    services.health.getHealth(farm.id).then(setHealth);
    services.intelligence.getPriorityActions(farm.id).then(setActions);
    services.sensor.getReading(farm.id).then(setSensor);
  }, [farm.id]);

  if (!weather || !health || !actions || !sensor) return <LoadingState label={t("common_loading")} />;

  const today = new Date();

  return (
    <div className="view-enter flex flex-col gap-5 max-w-7xl">
      {/* Welcome banner with subtle field background */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--color-mist)]">
        <div className="absolute inset-0">
          <CameraFeedIllustration className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/40" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-6">
          <div>
            <div className="font-[var(--font-head)] font-extrabold text-[22px] sm:text-[26px] text-[var(--color-dark)]">
              {t("dashboard_welcomeBack")} <span className="text-[var(--color-primary)]">{farmer.name}</span> 🌱
            </div>
            <p className="text-[13px] text-[#5E7568] mt-1">{t("dashboard_farmToday")}</p>
          </div>
          <div className="text-right flex-none">
            <div className="text-[12.5px] font-bold text-[var(--color-dark)] flex items-center gap-1.5 justify-end">
              <Icon name="history" className="w-3.5 h-3.5" />
              {today.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <div className="text-[11.5px] text-[#8AA093]">{today.toLocaleDateString(undefined, { weekday: "long" })}</div>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon="gauge" iconBg="#E7F5EC" iconFg="var(--color-primary)" label={t("dashboard_healthScore")} value={`${health.overallPct}/100`} sub={health.overallPct >= 70 ? "Good" : "Fair"} />
        <StatCard icon="map" iconBg="#EAF3EC" iconFg="var(--color-primary)" label={t("dashboard_totalLand")} value={`${farm.areaAcres}`} sub={t("common_acres")} />
        <StatCard icon="farm" iconBg="#EFE7F5" iconFg="#7C4FD1" label={t("dashboard_activeCrops")} value="2" sub={t("common_crops")} />
        <StatCard icon="chat" iconBg="#E7EEFB" iconFg="#3B6FD6" label={t("dashboard_aiRecs")} value={`${actions.length}`} sub={t("common_new")} />
        <StatCard icon="alerts" iconBg="#FBE8E7" iconFg="var(--color-danger)" label={t("dashboard_activeAlerts")} value={`${SEED_ALERTS.length}`} sub={t("common_alerts")} />
      </div>

      {/* Live Farm View + Weather + Soil */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="!p-0 overflow-hidden lg:col-span-1">
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="font-[var(--font-head)] font-bold text-[15px] flex items-center gap-2"><Icon name="camera" className="w-4 h-4 text-[var(--color-primary)]" /> {t("dashboard_liveFarmView")}</div>
            <button onClick={() => navigate("/camera")} className="text-[11.5px] font-bold text-[var(--color-secondary)]">{t("dashboard_fullscreen")}</button>
          </div>
          <div className="relative mt-3 aspect-video">
            <CameraFeedIllustration className="w-full h-full object-cover" />
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/50 text-white text-[10.5px] font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
            </div>
            <div className="absolute bottom-2.5 left-2.5 text-white text-[11.5px] font-bold">Camera 01 — North Field</div>
            <div className="absolute bottom-2.5 right-2.5 text-white text-[10px] font-mono">{today.toLocaleTimeString()}</div>
          </div>
          <button onClick={() => navigate("/camera")} className="w-full text-center py-3 text-[12.5px] font-bold text-[var(--color-primary)] border-t border-[var(--color-mist)]">
            {t("dashboard_viewAllCameras")}
          </button>
        </Card>

        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px] flex items-center gap-2 mb-3"><Icon name="cloud" className="w-4 h-4 text-[var(--color-primary)]" /> {t("dashboard_weatherToday")}</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-[var(--font-head)] font-extrabold text-[32px] text-[var(--color-dark)]">{weather.tempC}°C</div>
              <div className="text-[12.5px] text-[#5E7568]">{weather.condition}</div>
            </div>
            <div className="text-[38px]">⛅</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div><div className="text-[10.5px] text-[#8AA093]">{t("weather_humidity")}</div><b className="text-[13px]">{weather.humidityPct}%</b></div>
            <div><div className="text-[10.5px] text-[#8AA093]">{t("weather_wind")}</div><b className="text-[13px]">{weather.windKph} km/h</b></div>
            <div><div className="text-[10.5px] text-[#8AA093]">{t("weather_rain")}</div><b className="text-[13px]">0 mm</b></div>
          </div>
          <button onClick={() => navigate("/weather")} className="w-full text-center mt-4 pt-3 text-[12px] font-bold text-[var(--color-primary)] border-t border-[var(--color-mist)]">
            {t("dashboard_forecast5day")}
          </button>
        </Card>

        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px] flex items-center gap-2 mb-3"><Icon name="gauge" className="w-4 h-4 text-[var(--color-primary)]" /> {t("dashboard_soilEnv")}</div>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: "droplet" as const, label: t("sensor_soilMoisture"), value: `${sensor.soilMoisturePct}%` },
              { icon: "cloud" as const, label: t("sensor_temperature"), value: `${sensor.tempC}°C` },
              { icon: "gauge" as const, label: "pH Level", value: `${sensor.ph}` },
              { icon: "droplet" as const, label: t("sensor_humidity"), value: `${sensor.humidityPct}%` },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 text-[#5E7568]"><Icon name={row.icon} className="w-3.5 h-3.5 text-[var(--color-secondary)]" />{row.label}</span>
                <b>{row.value}</b>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/sensors")} className="w-full text-center mt-4 pt-3 text-[12px] font-bold text-[var(--color-primary)] border-t border-[var(--color-mist)]">
            {t("dashboard_fullSensor")}
          </button>
        </Card>
      </div>

      {/* AI Recommendations + Recent Alerts + Farm Map */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="font-[var(--font-head)] font-bold text-[15px]">{t("dashboard_aiRecommendations")}</div>
            <button onClick={() => navigate("/recommendations")} className="text-[11.5px] font-bold text-[var(--color-secondary)]">{t("dashboard_viewAll")}</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {actions.slice(0, 2).map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-[var(--color-mist-2)]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold">{a.icon} {a.title}</span>
                  <Pill level={a.urgency === "critical" ? "high" : a.urgency}>{a.urgency.toUpperCase()}</Pill>
                </div>
                <p className="text-[12px] text-[#5E7568] mt-1">{a.reason}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="font-[var(--font-head)] font-bold text-[15px]">{t("dashboard_recentAlertsTitle")}</div>
            <button onClick={() => navigate("/alerts")} className="text-[11.5px] font-bold text-[var(--color-secondary)]">{t("dashboard_viewAll")}</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {SEED_ALERTS.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[var(--color-mist-2)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#FBE8E7] text-[var(--color-danger)] flex items-center justify-center flex-none">
                    <Icon name={a.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold truncate">{a.title}</div>
                    <div className="text-[11px] text-[#8AA093]">{a.timeLabel}</div>
                  </div>
                </div>
                <Pill level={a.severity}>{a.severity.toUpperCase()}</Pill>
              </div>
            ))}
          </div>
        </Card>

        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="font-[var(--font-head)] font-bold text-[15px]">{t("dashboard_farmMap")}</div>
            <div className="flex rounded-lg overflow-hidden border border-[var(--color-mist)] text-[10.5px]">
              <span className="px-2 py-1 bg-[var(--color-primary)] text-white font-bold">Map</span>
              <span className="px-2 py-1 bg-white text-[#5E7568] font-bold">Satellite</span>
            </div>
          </div>
          <div onClick={() => navigate("/farm/map")} className="cursor-pointer">
            <FieldMap zones={SEED_ZONES} height={160} />
          </div>
          <button onClick={() => navigate("/farm/map")} className="w-full text-center py-3 text-[12.5px] font-bold text-[var(--color-primary)] border-t border-[var(--color-mist)]">
            {t("dashboard_openFullMap")}
          </button>
        </Card>
      </div>

      {/* Full Next Best Action list */}
      <div>
        <div className="font-[var(--font-head)] font-bold text-[15px] mb-1">{t("dashboard_nextBestAction")}</div>
        <div className="text-[12px] text-[#8AA093] mb-2.5">{t("dashboard_nextBestEngine")}</div>
        <div className="grid md:grid-cols-2 gap-3">
          {actions.map((a) => <PriorityActionCard key={a.id} action={a} />)}
        </div>
      </div>
    </div>
  );
}
