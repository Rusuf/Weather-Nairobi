import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const WEATHER_AI_BASE_URL = 'https://api.weather-ai.co/v1/weather';
const NAIROBI = {
  lat: '-1.2921',
  lon: '36.8219',
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), weatherApiDevProxy(mode)],
}));

function weatherApiDevProxy(mode: string): Plugin {
  return {
    name: 'weather-ai-dev-proxy',
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), '');

      server.middlewares.use('/api/weather', async (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Cache-Control', 'no-store');

        const apiKey = env.WEATHER_AI_API_KEY;

        if (!apiKey) {
          response.statusCode = 503;
          response.end(
            JSON.stringify({
              error: 'WEATHER_AI_API_KEY is not configured.',
              hint: 'Add WEATHER_AI_API_KEY to .env, then restart npm run dev.',
            }),
          );
          return;
        }

        const incoming = new URL(request.url ?? '/api/weather', 'http://localhost').searchParams;
        const params = new URLSearchParams({
          lat: incoming.get('lat') ?? NAIROBI.lat,
          lon: incoming.get('lon') ?? NAIROBI.lon,
          days: incoming.get('days') ?? '7',
          ai: incoming.get('ai') ?? 'true',
          units: incoming.get('units') ?? 'metric',
          lang: incoming.get('lang') ?? 'en',
        });

        try {
          const weatherResponse = await fetch(`${WEATHER_AI_BASE_URL}?${params.toString()}`, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          });

          response.statusCode = weatherResponse.status;
          response.setHeader('X-Weather-AI-Status', String(weatherResponse.status));
          response.setHeader('X-Weather-AI-Endpoint', '/v1/weather');
          response.end(await weatherResponse.text());
        } catch (error) {
          response.statusCode = 502;
          response.end(
            JSON.stringify({
              error: 'Unable to reach Weather-AI.',
              detail: error instanceof Error ? error.message : 'Unknown network error',
            }),
          );
        }
      });
    },
  };
}
