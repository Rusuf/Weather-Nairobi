import type { SceneDay, WeatherAiPoint, WeatherAiResponse, WeatherPayload } from './types';

export const NAIROBI = {
  latitude: -1.286389,
  longitude: 36.817223,
  label: 'Nairobi',
};

const DEFAULT_FORECAST_DAYS = 7;
const FORECAST_DAYS = forecastDays();

const previewDays: Array<Pick<SceneDay, 'condition' | 'rainChance' | 'high' | 'low'> & Partial<SceneDay>> = [
  { condition: 'Partly cloudy', rainChance: 24, high: 25, low: 17, currentTemp: 23, feelsLike: 22 },
  { condition: 'Light showers', rainChance: 58, high: 23, low: 16 },
  { condition: 'Cloud cover', rainChance: 34, high: 24, low: 16 },
  { condition: 'Sunny breaks', rainChance: 18, high: 26, low: 17 },
  { condition: 'Cloud cover', rainChance: 32, high: 24, low: 16 },
  { condition: 'Rain showers', rainChance: 54, high: 22, low: 15 },
  { condition: 'Clear sky', rainChance: 12, high: 27, low: 18 },
];

export async function fetchWeatherAi(latitude = NAIROBI.latitude, longitude = NAIROBI.longitude): Promise<WeatherPayload> {
  const response = await fetch(weatherUrl(latitude, longitude));
  const payload = (await response.json()) as WeatherAiResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? payload.detail ?? payload.hint ?? `Weather-AI returned ${response.status}`);
  }

  return {
    days: toSceneDays(payload),
    place: payload.location?.city ?? payload.location?.name ?? NAIROBI.label,
  };
}

export function previewWeather(): WeatherPayload {
  const today = new Date();

  return {
    place: NAIROBI.label,
    days: previewDays.map((day, index) => {
      const date = offsetDate(today, index);

      return {
        label: labelForDay(date, index),
        shortLabel: shortLabelForDay(date, index),
        date,
        humidity: 68,
        wind: 12,
        ...day,
      };
    }),
  };
}

function weatherUrl(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    days: String(FORECAST_DAYS),
    ai: 'true',
    units: 'metric',
    lang: 'en',
  });

  return `/api/weather?${params}`;
}

function toSceneDays(payload: WeatherAiResponse): SceneDay[] {
  const current = payload.current ?? {};
  const forecast = payload.forecast?.length ? payload.forecast : payload.daily ?? [];
  const days = forecast.length ? forecast : [current];
  const summary = payload.ai_summary ?? payload.summary;

  return days.slice(0, FORECAST_DAYS).map((day, index) => toSceneDay(day, current, summary, index));
}

function toSceneDay(day: WeatherAiPoint, current: WeatherAiPoint, summary: string | undefined, index: number): SceneDay {
  const date = dateOf(day, index);
  const temp = numberOf([...temperatureFields(day), ...temperatureFields(current), 23]);
  const rainChance = numberOf([...rainFields(day), ...rainFields(current), 20]);

  return {
    label: labelForDay(date, index),
    shortLabel: shortLabelForDay(date, index),
    date,
    condition: conditionOf(day, current, rainChance),
    high: numberOf([day.max_temp, day.temp_max, ...temperatureFields(day), temp + 2]),
    low: numberOf([day.min_temp, day.temp_min, ...temperatureFields(day), temp - 5]),
    rainChance,
    wind: numberOf([...windFields(day), ...windFields(current), 10]),
    humidity: numberOf([day.humidity, day.humidity_percent, current.humidity, current.humidity_percent, 60]),
    currentTemp: index === 0 ? temp : undefined,
    feelsLike: index === 0 ? numberOf([current.feels_like, current.feels_like_c, day.feels_like, day.feels_like_c, temp]) : undefined,
    sunrise: day.sunrise,
    sunset: day.sunset,
    summary: textOf(day.ai_summary, day.summary, summary),
  };
}

function temperatureFields(point: WeatherAiPoint) {
  return [point.temp, point.temp_c, point.temperature, point.temperature_c];
}

function rainFields(point: WeatherAiPoint) {
  return [point.precipitation_probability, point.precipitation_probability_max, point.rain_probability, point.rain_mm, point.precipitation_mm];
}

function windFields(point: WeatherAiPoint) {
  return [point.wind_kph, point.wind_speed_kph, point.wind_speed, point.wind];
}

function conditionOf(day: WeatherAiPoint, current: WeatherAiPoint, rainChance: number) {
  const raw = textOf(
    day.condition,
    day.description,
    day.weather,
    day.weather_description,
    current.condition,
    current.description,
    current.weather,
    current.weather_description,
  );

  if (raw && !/nairobi weather/i.test(raw)) return raw;
  if (rainChance >= 55) return 'Rain showers';
  if (rainChance >= 35) return 'Cloud cover';
  return 'Clear sky';
}

function dateOf(day: WeatherAiPoint, offset: number) {
  if (!day.date) return offsetDate(new Date(), offset);

  const parsed = new Date(day.date);
  return Number.isNaN(parsed.getTime()) ? offsetDate(new Date(), offset) : parsed.toISOString().slice(0, 10);
}

function offsetDate(base: Date, offset: number) {
  const date = new Date(base);
  date.setDate(base.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function labelForDay(date: string, index: number) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return weekday(date, 'long');
}

function shortLabelForDay(date: string, index: number) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return weekday(date, 'short');
}

function weekday(date: string, weekdayStyle: 'long' | 'short') {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-KE', { weekday: weekdayStyle });
}

function numberOf(values: unknown[]) {
  const fallback = Number(values.at(-1) ?? 0);
  const value = Number(values.slice(0, -1).find((item) => item !== undefined && item !== null) ?? fallback);
  return Number.isFinite(value) ? Math.round(value) : fallback;
}

function textOf(...values: Array<string | undefined>) {
  return values.find((item) => item?.trim()) ?? '';
}

function forecastDays() {
  const value = Number(import.meta.env.VITE_FORECAST_DAYS ?? DEFAULT_FORECAST_DAYS);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : DEFAULT_FORECAST_DAYS;
}
