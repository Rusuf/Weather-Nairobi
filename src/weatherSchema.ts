import { z } from 'zod';

const pointSchema = z
  .object({
    time: z.string().optional(),
    hour: z.string().optional(),
    datetime: z.string().optional(),
    timestamp: z.string().optional(),
    date: z.string().optional(),
    temp: z.number().optional(),
    temp_c: z.number().optional(),
    temperature: z.number().optional(),
    temperature_c: z.number().optional(),
    feels_like: z.number().optional(),
    feels_like_c: z.number().optional(),
    min_temp: z.number().optional(),
    max_temp: z.number().optional(),
    temp_min: z.number().optional(),
    temp_max: z.number().optional(),
    humidity: z.number().optional(),
    humidity_percent: z.number().optional(),
    wind: z.number().optional(),
    wind_kph: z.number().optional(),
    wind_speed_kph: z.number().optional(),
    wind_speed: z.number().optional(),
    rain_mm: z.number().optional(),
    rain_probability: z.number().optional(),
    precipitation_mm: z.number().optional(),
    precipitation_probability: z.number().optional(),
    precipitation_probability_max: z.number().optional(),
    condition: z.string().optional(),
    description: z.string().optional(),
    weather: z.string().optional(),
    weather_description: z.string().optional(),
    summary: z.string().optional(),
    ai_summary: z.string().optional(),
    sunrise: z.string().optional(),
    sunrise_time: z.string().optional(),
    sunriseTime: z.string().optional(),
    sunset: z.string().optional(),
    sunset_time: z.string().optional(),
    sunsetTime: z.string().optional(),
    uv_index: z.number().optional(),
    uv: z.number().optional(),
  })
  .passthrough();

const responseSchema = z
  .object({
    location: z
      .object({
        name: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
      })
      .passthrough()
      .optional(),
    current: pointSchema.optional(),
    forecast: z.array(pointSchema).optional(),
    daily: z.array(pointSchema).optional(),
    hourly: z.array(pointSchema).optional(),
    hours: z.array(pointSchema).optional(),
    summary: z.string().optional(),
    ai_summary: z.string().optional(),
    source: z.string().optional(),
    error: z.string().optional(),
    hint: z.string().optional(),
    detail: z.string().optional(),
  })
  .passthrough();

export function parseWeatherAiResponse(payload: unknown) {
  return responseSchema.parse(payload);
}
