export type TimeMood = 'morning' | 'day' | 'sunset' | 'night';

export type WeatherMood = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'night';

export type SceneDay = {
  label: string;
  shortLabel: string;
  date: string;
  condition: string;
  high: number;
  low: number;
  rainChance: number;
  wind: number;
  humidity: number;
  currentTemp?: number;
  feelsLike?: number;
  sunrise?: string;
  sunset?: string;
  summary?: string;
  live?: boolean;
};

export type WeatherAiPoint = {
  date?: string;
  temp?: number;
  temp_c?: number;
  temperature?: number;
  temperature_c?: number;
  feels_like?: number;
  feels_like_c?: number;
  min_temp?: number;
  max_temp?: number;
  temp_min?: number;
  temp_max?: number;
  humidity?: number;
  humidity_percent?: number;
  wind?: number;
  wind_kph?: number;
  wind_speed_kph?: number;
  wind_speed?: number;
  rain_mm?: number;
  rain_probability?: number;
  precipitation_mm?: number;
  precipitation_probability?: number;
  precipitation_probability_max?: number;
  condition?: string;
  description?: string;
  weather?: string;
  weather_description?: string;
  summary?: string;
  ai_summary?: string;
  sunrise?: string;
  sunset?: string;
  uv_index?: number;
  uv?: number;
};

export type WeatherAiResponse = {
  location?: {
    name?: string;
    city?: string;
    country?: string;
  };
  current?: WeatherAiPoint;
  forecast?: WeatherAiPoint[];
  daily?: WeatherAiPoint[];
  summary?: string;
  ai_summary?: string;
  source?: string;
  error?: string;
  hint?: string;
  detail?: string;
};

export type WeatherPayload = {
  days: SceneDay[];
  place: string;
};
