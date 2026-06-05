import type { SceneDay, WeatherAiPoint, WeatherAiResponse, WeatherHour, WeatherPayload } from './types';

export const NAIROBI = {
  latitude: -1.286389,
  longitude: 36.817223,
  label: 'Nairobi',
};

const DEFAULT_FORECAST_DAYS = 7;
const FORECAST_DAYS = forecastDays();

type PreviewDay = Pick<SceneDay, 'condition' | 'rainChance' | 'high' | 'low'> & {
  currentTemp?: number;
  feelsLike?: number;
  wind?: number;
};

const previewDays: PreviewDay[] = [
  { condition: 'Partly cloudy', rainChance: 24, high: 25, low: 17, currentTemp: 23, feelsLike: 22 },
  { condition: 'Light showers', rainChance: 58, high: 23, low: 16 },
  { condition: 'Cloud cover', rainChance: 34, high: 24, low: 16 },
  { condition: 'Sunny breaks', rainChance: 18, high: 26, low: 17 },
  { condition: 'Cloud cover', rainChance: 32, high: 24, low: 16 },
  { condition: 'Rain showers', rainChance: 54, high: 22, low: 15 },
  { condition: 'Clear sky', rainChance: 12, high: 27, low: 18 },
];

export async function fetchWeatherAi(latitude = NAIROBI.latitude, longitude = NAIROBI.longitude): Promise<WeatherPayload> {
  const [weather, hourly] = await Promise.all([
    fetchWeatherEndpoint('weather', latitude, longitude),
    fetchWeatherEndpoint('hourly', latitude, longitude).catch(() => undefined),
  ]);

  const hours = hourly ? toWeatherHours(hourly) : [];

  return {
    days: toSceneDays(weather, hours),
    place: weather.location?.city ?? weather.location?.name ?? NAIROBI.label,
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
        hours: previewHours(date, day),
        ...day,
      };
    }),
  };
}

async function fetchWeatherEndpoint(endpoint: 'weather' | 'hourly', latitude: number, longitude: number) {
  const response = await fetch(weatherUrl(endpoint, latitude, longitude));
  const payload = (await response.json()) as WeatherAiResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? payload.detail ?? payload.hint ?? `Weather-AI returned ${response.status}`);
  }

  return payload;
}

function weatherUrl(endpoint: 'weather' | 'hourly', latitude: number, longitude: number) {
  const params = new URLSearchParams({
    endpoint,
    lat: String(latitude),
    lon: String(longitude),
    days: String(FORECAST_DAYS),
    ai: 'true',
    units: 'metric',
    lang: 'en',
  });

  return `/api/weather?${params}`;
}

function toSceneDays(payload: WeatherAiResponse, hours: WeatherHour[]): SceneDay[] {
  const current = payload.current ?? {};
  const forecast = payload.forecast?.length ? payload.forecast : payload.daily ?? [];
  const days = forecast.length ? forecast : [current];
  const summary = payload.ai_summary ?? payload.summary;

  return days.slice(0, FORECAST_DAYS).map((day, index) => toSceneDay(day, current, summary, index, hours));
}

function toSceneDay(day: WeatherAiPoint, current: WeatherAiPoint, summary: string | undefined, index: number, hours: WeatherHour[]): SceneDay {
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
    sunrise: sunTime(day, current, 'sunrise'),
    sunset: sunTime(day, current, 'sunset'),
    summary: textOf(day.ai_summary, day.summary, summary),
    hours: hoursForDate(hours, date),
  };
}

function toWeatherHours(payload: WeatherAiResponse): WeatherHour[] {
  const points = payload.hourly?.length ? payload.hourly : payload.hours?.length ? payload.hours : payload.forecast ?? [];

  return points
    .map((point) => {
      const time = timeOf(point);
      if (!time) return undefined;

      const temp = numberOf([...temperatureFields(point), 0]);
      const rainChance = numberOf([...rainFields(point), 0]);

      return {
        time,
        temp,
        rainChance,
        wind: numberOf([...windFields(point), 0]),
        condition: conditionOf(point, {}, rainChance),
      };
    })
    .filter((hour): hour is WeatherHour => Boolean(hour));
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

function sunTime(day: WeatherAiPoint, current: WeatherAiPoint, type: 'sunrise' | 'sunset') {
  if (type === 'sunrise') {
    return textOf(day.sunrise, day.sunrise_time, day.sunriseTime, current.sunrise, current.sunrise_time, current.sunriseTime);
  }

  return textOf(day.sunset, day.sunset_time, day.sunsetTime, current.sunset, current.sunset_time, current.sunsetTime);
}

function dateOf(day: WeatherAiPoint, offset: number) {
  if (!day.date) return offsetDate(new Date(), offset);

  const parsed = new Date(day.date);
  return Number.isNaN(parsed.getTime()) ? offsetDate(new Date(), offset) : parsed.toISOString().slice(0, 10);
}

function timeOf(point: WeatherAiPoint) {
  const raw = point.time ?? point.hour ?? point.datetime ?? point.timestamp ?? point.date;
  if (!raw) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.replace(' ', 'T');

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : parsed.toISOString();
}

function hoursForDate(hours: WeatherHour[], date: string) {
  const dayHours = hours.filter((hour) => hour.time.slice(0, 10) === date);
  return dayHours.length ? sampleHours(dayHours) : [];
}

function sampleHours(hours: WeatherHour[]) {
  if (hours.length <= 8) return hours;

  return hours.filter((_, index) => index % 3 === 0).slice(0, 8);
}

function previewHours(date: string, day: PreviewDay): WeatherHour[] {
  const temps = [day.low ?? 16, day.high ?? 24, day.high ?? 24, day.low ?? 16];
  const times = ['06:00', '12:00', '15:00', '18:00'];

  return times.map((time, index) => ({
    time: `${date}T${time}:00`,
    temp: temps[index],
    rainChance: Math.max(0, (day.rainChance ?? 20) - index * 4),
    wind: day.wind ?? 12,
    condition: day.condition ?? 'Weather',
  }));
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
