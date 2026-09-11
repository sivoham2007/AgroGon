import type { WeatherService } from "../contracts";
import type { WeatherSnapshot } from "../../types/domain";

export interface ForecastDay {
  day: string;
  date: string;
  condition: string;
  hi: number;
  lo: number;
  rainChancePct: number;
}

export interface WeatherWithForecast extends WeatherSnapshot {
  uvIndex: number | null;
  forecast: ForecastDay[];
  fetchedAt: string;
  feelsLike?: number;
  sunrise?: string;
  sunset?: string;
}

const DEFAULT_LAT = 13.43;
const DEFAULT_LON = 77.71;

function pickCondition(code: number): string {
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

export async function getWeather(lat?: number, lon?: number): Promise<WeatherWithForecast> {
  const fetchLat = lat ?? DEFAULT_LAT;
  const fetchLon = lon ?? DEFAULT_LON;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(fetchLat));
  url.searchParams.set("longitude", String(fetchLon));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,precipitation_probability");
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "5");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Open-Meteo responded ${response.status}`);
  }
  
  const data = await response.json();
  const current = data.current || {};
  const daily = data.daily || {};
  const days = ["Today", "Tomorrow", ...(daily.time || []).slice(2).map((d: string) =>
    new Date(d).toLocaleDateString(undefined, { weekday: "short" })
  )];

  const formatTime = (isoString?: string) => {
    if (!isoString) return undefined;
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const code = current.weather_code ?? 0;

  return {
    tempC: Math.round(current.temperature_2m ?? 0),
    feelsLike: current.apparent_temperature != null ? Math.round(current.apparent_temperature) : undefined,
    condition: pickCondition(code),
    humidityPct: Math.round(current.relative_humidity_2m ?? 0),
    rainChancePct: current.precipitation_probability_max ?? current.precipitation_probability ?? 0,
    windKph: Math.round(current.wind_speed_10m ?? 0),
    uvIndex: daily.uv_index_max?.[0] ?? null,
    sunrise: formatTime(daily.sunrise?.[0]),
    sunset: formatTime(daily.sunset?.[0]),
    note: code >= 61 ? "Rain expected — good day to inspect drainage." : "Conditions look stable for field work.",
    forecast: (daily.time || []).map((date: string, i: number) => ({
      day: days[i] || new Date(date).toLocaleDateString(undefined, { weekday: "short" }),
      date,
      condition: pickCondition(daily.weather_code?.[i] ?? 0),
      hi: Math.round(daily.temperature_2m_max?.[i] ?? 0),
      lo: Math.round(daily.temperature_2m_min?.[i] ?? 0),
      rainChancePct: daily.precipitation_probability_max?.[i] ?? 0,
    })),
    fetchedAt: new Date().toISOString(),
  };
}

export const httpWeatherService: WeatherService = {
  async getWeather(_farmId) {
    return getWeather();
  },
};
