import { useEffect, useState } from "react";
import { Card } from "../../components/cards/Cards";
import { LoadingState } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { useT } from "../../i18n/useT";
import {
  getWeather,
  type WeatherWithForecast,
} from "../../services/http/weatherService";

// Simple condition -> emoji mapping for the real backend's text conditions
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationName, setLocationName] = useState("Default Location");

  const fetchWeather = (lat?: number, lon?: number) => {
    setLoading(true);
    setError("");

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error("API timeout: Request took longer than 10 seconds."),
          ),
        10000,
      ),
    );

    Promise.race([getWeather(lat, lon), timeoutPromise])
      .then((data) => {
        setWeather(data as WeatherWithForecast);
        if (!lat || !lon) {
          setLocationName("Karnataka (Default)");
        }
      })
      .catch((err) => {
        setError(err.message || "Couldn't load live weather.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRefresh = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationName("Current Location");
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn(
            "Geolocation denied/failed, falling back to default.",
            err,
          );
          fetchWeather(); // fallback
        },
        { timeout: 5000 },
      );
    } else {
      fetchWeather();
    }
  };

  // Initial load
  useEffect(() => {
    handleRefresh();

    // Auto refresh every 15 minutes
    const interval = setInterval(
      () => {
        handleRefresh();
      },
      15 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [farm.id]);

  if (loading && !weather)
    return (
      <LoadingState label={t("weather_fetching") || "Fetching weather..."} />
    );

  return (
    <div className="view-enter pb-4">
      <ScreenHeader
        title={t("weather_title") || "Weather & Alerts"}
        back="/dashboard"
        eyebrow="LIVE — OPEN-METEO"
      />

      <div className="px-5 mb-3 flex justify-between items-center">
        <div className="text-sm font-semibold text-[#1B7F4C]">
          📍 {locationName}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-full flex items-center gap-1 disabled:opacity-50 transition-colors"
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      <div className="px-5">
        {error && !weather && (
          <Card
            tight
            className="bg-[#FCEBEA] mb-3 flex flex-col items-center p-6 text-center"
            style={{ borderColor: "#F3B9B4" }}
          >
            <div className="text-[32px] mb-2">⚠️</div>
            <div className="text-[14px] font-semibold text-[#B3261E] mb-1">
              Unable to fetch weather information.
            </div>
            <div className="text-[12.5px] text-[#B3261E] mb-4">{error}</div>
            <button
              onClick={handleRefresh}
              className="bg-[#B3261E] text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Retry
            </button>
          </Card>
        )}

        {error && weather && (
          <Card
            tight
            className="bg-[#FCEBEA] mb-3"
            style={{ borderColor: "#F3B9B4" }}
          >
            <div className="text-[12.5px] text-[#B3261E]">{error}</div>
          </Card>
        )}

        {weather && (
          <Card
            className="text-white border-none shadow-md"
            style={{ background: "linear-gradient(135deg,#1B7F4C,#12352A)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-[var(--font-head)] font-extrabold text-[42px] leading-tight">
                  {weather.tempC}°C
                </div>
                <div className="text-[14px] font-medium opacity-90">
                  {weather.condition}
                </div>
                {weather.feelsLike != null && (
                  <div className="text-[11px] opacity-75 mt-0.5">
                    Feels like {weather.feelsLike}°C
                  </div>
                )}
              </div>
              <div className="text-[52px] drop-shadow-md">
                {conditionIcon(weather.condition)}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-5 p-3 rounded-lg bg-black/10 text-center text-[12px]">
              <div>
                <div className="opacity-70 mb-0.5">
                  {t("weather_humidity") || "Humidity"}
                </div>
                <b className="text-[13px]">{weather.humidityPct}%</b>
              </div>
              <div>
                <div className="opacity-70 mb-0.5">
                  {t("weather_wind") || "Wind"}
                </div>
                <b className="text-[13px]">{weather.windKph} km/h</b>
              </div>
              <div>
                <div className="opacity-70 mb-0.5">
                  {t("weather_rain") || "Rain"}
                </div>
                <b className="text-[13px]">{weather.rainChancePct}%</b>
              </div>
              <div>
                <div className="opacity-70 mb-0.5">UV Index</div>
                <b className="text-[13px]">{weather.uvIndex ?? "–"}</b>
              </div>
            </div>

            {(weather.sunrise || weather.sunset) && (
              <div className="flex justify-between items-center mt-3 px-1 text-[11px] opacity-80">
                {weather.sunrise && <div>🌅 Sunrise: {weather.sunrise}</div>}
                {weather.sunset && <div>🌇 Sunset: {weather.sunset}</div>}
              </div>
            )}

            <div className="mt-3 text-right text-[9px] opacity-50">
              Last updated: {new Date(weather.fetchedAt).toLocaleTimeString()}
            </div>
          </Card>
        )}
      </div>

      {weather && (
        <>
          <div className="px-5 pt-3.5">
            <Card
              tight
              className="bg-[#FFF8E9]"
              style={{ borderColor: "#F3E1AE" }}
            >
              <div className="text-[13px] text-[#7A5B0A] leading-relaxed">
                🌿 {weather.note}
              </div>
            </Card>
          </div>
          <div className="px-5 pt-4">
            <div className="font-[var(--font-head)] font-bold text-[16px] mb-3 text-gray-800">
              {t("weather_forecast") || "5-Day Forecast"}
            </div>
            <Card className="flex flex-col gap-3.5 shadow-sm">
              {weather.forecast.map((f) => (
                <div
                  key={f.date}
                  className="flex items-center justify-between text-[13.5px]"
                >
                  <span className="w-16 font-semibold text-gray-700">
                    {f.day}
                  </span>
                  <span className="text-[20px]">
                    {conditionIcon(f.condition)}
                  </span>
                  <span className="text-[#5E7568] w-14 text-right text-[12px]">
                    {f.rainChancePct}%{" "}
                    {t("weather_rain")?.toLowerCase() || "rain"}
                  </span>
                  <span className="w-16 text-right">
                    <b>{f.hi}°</b>{" "}
                    <span className="text-[#8AA093] ml-1">{f.lo}°</span>
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
