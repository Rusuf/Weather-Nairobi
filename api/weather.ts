const WEATHER_AI_BASE_URL = 'https://api.weather-ai.co/v1/weather';

const NAIROBI = {
  lat: '-1.2921',
  lon: '36.8219',
};

type ApiRequest = {
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => {
    json: (body: unknown) => void;
  };
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  const apiKey = process.env.WEATHER_AI_API_KEY;

  response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=120');

  if (!apiKey) {
    return response.status(503).json({
      error: 'WEATHER_AI_API_KEY is not configured.',
      hint: 'Add WEATHER_AI_API_KEY to the server environment.',
    });
  }

  const params = weatherParams(readQuery(request));

  try {
    const weatherResponse = await fetch(`${WEATHER_AI_BASE_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const payload = await weatherResponse.json();
    response.setHeader('X-Weather-AI-Status', String(weatherResponse.status));
    response.setHeader('X-Weather-AI-Endpoint', '/v1/weather');

    return response.status(weatherResponse.status).json(payload);
  } catch (error) {
    return response.status(502).json({
      error: 'Unable to reach Weather-AI.',
      detail: error instanceof Error ? error.message : 'Unknown network error',
    });
  }
}

function weatherParams(incoming: URLSearchParams) {
  return new URLSearchParams({
    lat: incoming.get('lat') ?? NAIROBI.lat,
    lon: incoming.get('lon') ?? NAIROBI.lon,
    days: incoming.get('days') ?? '7',
    ai: incoming.get('ai') ?? 'true',
    units: incoming.get('units') ?? 'metric',
    lang: incoming.get('lang') ?? 'en',
  });
}

function readQuery(request: ApiRequest) {
  const params = new URLSearchParams();

  if (request.url) {
    const parsed = new URL(request.url, 'https://weather-nairobi.local');
    parsed.searchParams.forEach((value, key) => params.set(key, value));
  }

  Object.entries(request.query ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value[0]) params.set(key, value[0]);
      return;
    }

    if (value) params.set(key, value);
  });

  return params;
}
