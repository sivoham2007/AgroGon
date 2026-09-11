import { Router } from "express";

export const weatherRouter = Router();

// Open-Meteo needs no API key, so nothing sensitive sits in the frontend —
// the browser calls our backend, and the backend calls Open-Meteo.
// Defaults to a Karnataka coordinate (matches the seed farm data) until the
// frontend passes the farm's real lat/lon from its boundary/geolocation.
const DEFAULT_LAT = 13.43;
const DEFAULT_LON = 77.71;

function pickCondition(code) {
  // Minimal WMO weather-code → label mapping.
  if (code === 0) return "Clear";
  if ([1, 2].includes(code)) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Partly Cloudy";
}

weatherRouter.get("/", async (req, res) => {
  const lat = Number(req.query.lat) || DEFAULT_LAT;
  const lon = Number(req.query.lon) || DEFAULT_LON;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,precipitation_probability");
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "5");

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      throw new Error(`Open-Meteo responded ${upstream.status}`);
    }
    const data = await upstream.json();

    const current = data.current || {};
    const daily = data.daily || {};
    const days = ["Today", "Tomorrow", ...(daily.time || []).slice(2).map((d) =>
      new Date(d).toLocaleDateString(undefined, { weekday: "short" })
    )];

    const formatTime = (isoString) => {
      if (!isoString) return null;
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    res.json({
      tempC: Math.round(current.temperature_2m),
      feelsLike: current.apparent_temperature != null ? Math.round(current.apparent_temperature) : undefined,
      condition: pickCondition(current.weather_code),
      humidityPct: Math.round(current.relative_humidity_2m),
      rainChancePct: current.precipitation_probability_max ?? current.precipitation_probability ?? 0,
      windKph: Math.round(current.wind_speed_10m),
      uvIndex: daily.uv_index_max?.[0] ?? null,
      sunrise: formatTime(daily.sunrise?.[0]),
      sunset: formatTime(daily.sunset?.[0]),
      note: current.weather_code >= 61 ? "Rain expected — good day to inspect drainage." : "Conditions look stable for field work.",
      forecast: (daily.time || []).map((date, i) => ({
        day: days[i] || new Date(date).toLocaleDateString(undefined, { weekday: "short" }),
        date,
        condition: pickCondition(daily.weather_code[i]),
        hi: Math.round(daily.temperature_2m_max[i]),
        lo: Math.round(daily.temperature_2m_min[i]),
        rainChancePct: daily.precipitation_probability_max?.[i] ?? 0,
      })),
      source: "open-meteo",
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(502).json({ error: "weather_unavailable", message: "Could not reach the weather provider. Try again shortly." });
  }
});
