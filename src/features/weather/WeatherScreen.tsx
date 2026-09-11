import { useEffect, useState } from "react";
import { Card } from "../../components/cards/Cards";
import { LoadingState } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { useT } from "../../i18n/useT";
import { getWeather, type WeatherWithForecast } from "../../services/http/weatherService";

// Simple condition -> emoji mapping for the real backend's text conditions
// (Clear / Partly Cloudy / Overcast / Foggy / Drizzle / Rain / Snow / Thunderstorm).
function conditionIcon(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("thunder")) return "⛈️";
  if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("fog")) return "🌫️";
  if (c.includes("overcast")) return "☁️";
  if (c.includes("partly")) return "⛅";
  if (c.includes("clear")) return "☀️";
  return "⛅";
}

export function WeatherScreen() {
  const { farm } = useApp();
  const t = useT();
  const [weather, setWeather] = useState<WeatherWithForecast | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getWeather()
      .then(setWeather)
      .catch(() => setError("Couldn't load live weather. Showing may be out of date — pull to refresh."));
  }, [farm.id]);
  if (!weather) return <LoadingState label={t("weather_fetching")} />;

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title={t("weather_title")} back="/dashboard" eyebrow="LIVE — OPEN-METEO" />
      <div className="px-5">
        {error && (
          <Card tight className="bg-[#FCEBEA] mb-3" style={{ borderColor: "#F3B9B4" }}>
            <div className="text-[12.5px] text-[#B3261E]">{error}</div>
          </Card>
        )}
        <Card className="text-white border-none" style={{ background: "linear-gradient(135deg,#1B7F4C,#12352A)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-[var(--font-head)] font-extrabold text-[38px]">{weather.tempC}°C</div>
              <div className="text-[13px] opacity-85">{weather.condition}</div>
            </div>
            <div className="text-[46px]">{conditionIcon(weather.condition)}</div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4 text-center text-[11.5px]">
            <div><div className="opacity-70">{t("weather_humidity")}</div><b>{weather.humidityPct}%</b></div>
            <div><div className="opacity-70">{t("weather_wind")}</div><b>{weather.windKph} km/h</b></div>
            <div><div className="opacity-70">{t("weather_rain")}</div><b>{weather.rainChancePct}%</b></div>
            <div><div className="opacity-70">{t("weather_uvIndex")}</div><b>{weather.uvIndex ?? "–"}</b></div>
          </div>
        </Card>
      </div>
      <div className="px-5 pt-3.5">
        <Card tight className="bg-[#FFF8E9]" style={{ borderColor: "#F3E1AE" }}>
          <div className="text-[13px] text-[#7A5B0A]">🌿 {weather.note}</div>
        </Card>
      </div>
      <div className="px-5 pt-4">
        <div className="font-[var(--font-head)] font-bold text-[15px] mb-2">{t("weather_forecast")}</div>
        <Card className="flex flex-col gap-3">
          {weather.forecast.map((f) => (
            <div key={f.date} className="flex items-center justify-between text-[13px]">
              <span className="w-16 font-semibold">{f.day}</span>
              <span className="text-[18px]">{conditionIcon(f.condition)}</span>
              <span className="text-[#5E7568] w-14 text-right">{f.rainChancePct}% {t("weather_rain").toLowerCase()}</span>
              <span className="w-16 text-right"><b>{f.hi}°</b> <span className="text-[#8AA093]">{f.lo}°</span></span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
