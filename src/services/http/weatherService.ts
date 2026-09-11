import type { WeatherService } from "../contracts";
import type { WeatherSnapshot } from "../../types/domain";
import { apiFetch } from "./client";

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

// Real backend weather, proxied through our server (server/src/routes/weather.js)
// to Open-Meteo — updates daily instead of returning the same fixed values
// every time. Takes an optional lat/lon (falls back to a Karnataka default
// on the server until the frontend has a real farm location to pass).
export async function getWeather(lat?: number, lon?: number): Promise<WeatherWithForecast> {
  const params = new URLSearchParams();
  if (lat != null) params.set("lat", String(lat));
  if (lon != null) params.set("lon", String(lon));
  const qs = params.toString();
  return apiFetch<WeatherWithForecast>(`/weather${qs ? `?${qs}` : ""}`);
}

export const httpWeatherService: WeatherService = {
  async getWeather(_farmId) {
    return getWeather();
  },
};
