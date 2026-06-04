import type { SceneDay, WeatherAiPoint, WeatherAiResponse, WeatherPayload } from './types';

export const NAIROBI = {
  latitude: -1.286389,
  longitude: 36.817223,
  label: 'Nairobi',
};

const FORECAST_DAYS = Number(import.meta.env.VITE_FORECAST_DAYS ?? 7);

export async function fetchWeatherAi(latitude = NAIROBI.latitude, longitude = NAIROBI.longitude): Promise<WeatherPayload> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    days: String(FORECAST_DAYS),
    ai: 'true',
    units: 'metric',
    lang: 'en',
  });
  const response = await fetch(`/api/weather?${params}`);
  const payload = (await response.json()) as WeatherAiResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? payload.detail ?? payload.hint ?? `Weather-AI returned ${response.status}`);
  }

  const place = payload.location?.city ?? payload.location?.name ?? NAIROBI.label;

  return {
    days: toSceneDays(payload),
    place,
  };
}

export function previewWeather(): WeatherPayload {
  const today = new Date();
  const data: Array<Pick<SceneDay, 'condition' | 'rainChance' | 'high' | 'low'> & Partial<SceneDay>> = [
    { condition: 'Partly cloudy', rainChance: 24, high: 25, low: 17, currentTemp: 23, feelsLike: 22 },
    { condition: 'Light showers', rainChance: 58, high: 23, low: 16 },
    { condition: 'Cloud cover', rainChance: 34, high: 24, low: 16 },
    { condition: 'Sunny breaks', rainChance: 18, high: 26, low: 17 },
    { condition: 'Cloud cover', rainChance: 32, high: 24, low: 16 },
    { condition: 'Rain showers', rainChance: 54, high: 22, low: 15 },
    { condition: 'Clear sky', rainChance: 12, high: 27, low: 18 },
  ];

  return {
    place: NAIROBI.label,
    days: data.map((item, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      const isoDate = date.toISOString().slice(0, 10);

      return {
        label: labelForDay(isoDate, index),
        shortLabel: shortLabelForDay(isoDate, index),
        date: isoDate,
        humidity: 68,
        wind: 12,
        live: false,
        ...item,
      };
    }),
  };
}

function toSceneDays(payload: WeatherAiResponse): SceneDay[] {
  const current = payload.current ?? {};
  const forecast = payload.forecast?.length ? payload.forecast : payload.daily ?? [];
  const summary = payload.ai_summary ?? payload.summary;
  const days = forecast.length ? forecast : [current];

  return days.slice(0, FORECAST_DAYS).map((day, index) => toSceneDay(dateOf(day, index), day, current, summary, index));
}

function toSceneDay(
  date: string,
  day: WeatherAiPoint,
  current: WeatherAiPoint,
  summary: string | undefined,
  index: number,
): SceneDay {
  const temp = numberOf(day.temp, day.temp_c, day.temperature, day.temperature_c, current.temp, current.temp_c, current.temperature, current.temperature_c, 23);
  const rainChance = numberOf(
    day.precipitation_probability,
    day.precipitation_probability_max,
    day.rain_probability,
    current.precipitation_probability,
    current.precipitation_probability_max,
    current.rain_probability,
    day.rain_mm,
    day.precipitation_mm,
    20,
  );
  const condition = conditionOf(day, current, rainChance);

  return {
    label: labelForDay(date, index),
    shortLabel: shortLabelForDay(date, index),
    date,
    condition,
    high: numberOf(day.max_temp, day.temp_max, day.temp, day.temp_c, day.temperature, day.temperature_c, temp + 2),
    low: numberOf(day.min_temp, day.temp_min, day.temp, day.temp_c, day.temperature, day.temperature_c, temp - 5),
    rainChance,
    wind: numberOf(day.wind_kph, day.wind_speed_kph, day.wind_speed, day.wind, current.wind_kph, current.wind_speed_kph, current.wind_speed, current.wind, 10),
    humidity: numberOf(day.humidity, day.humidity_percent, current.humidity, current.humidity_percent, 60),
    currentTemp: index === 0 ? temp : undefined,
    feelsLike: index === 0 ? numberOf(current.feels_like, current.feels_like_c, day.feels_like, day.feels_like_c, temp) : undefined,
    sunrise: day.sunrise,
    sunset: day.sunset,
    summary: textOf(day.ai_summary, day.summary, summary),
    live: true,
  };
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
  if (day.date) {
    const parsed = new Date(day.date);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }

  return shiftDate(offset);
}

function shiftDate(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function labelForDay(date: string, index: number) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-KE', { weekday: 'long' });
}

function shortLabelForDay(date: string, index: number) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-KE', { weekday: 'short' });
}

function numberOf(...values: unknown[]) {
  const fallback = Number(values.at(-1) ?? 0);
  const value = Number(values.slice(0, -1).find((item) => item !== undefined && item !== null) ?? fallback);
  return Number.isFinite(value) ? Math.round(value) : fallback;
}

function textOf(...values: Array<string | undefined>) {
  return values.find((item) => item?.trim()) ?? '';
}
