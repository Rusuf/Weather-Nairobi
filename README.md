# Weather Nairobi

Weather Nairobi is a Vite, React, and TypeScript app that uses Weather-AI to render swipeable full-screen weather scenes. The interface treats each forecast day as a Nairobi scene instead of a dashboard card.

## Stack

- React 19 with Vite
- TypeScript
- Weather-AI API v1
- Swiper.js
- Lucide React
- Zod for Weather-AI response validation
- Vitest for focused logic tests

## Weather-AI Integration

The browser calls a local `/api/weather` proxy. The proxy forwards requests to Weather-AI with the API key kept server-side.

```txt
GET /api/weather?endpoint=weather&lat=-1.286389&lon=36.817223&days=7&ai=true&units=metric&lang=en
GET /api/weather?endpoint=hourly&lat=-1.286389&lon=36.817223&days=7&ai=true&units=metric&lang=en
```

Proxy upstream calls:

```txt
GET https://api.weather-ai.co/v1/weather
GET https://api.weather-ai.co/v1/hourly
Authorization: Bearer wai_<your_api_key>
```

`vite.config.ts` provides the development proxy. `api/weather.ts` provides the same server-side request shape for hosted environments.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Add your Weather-AI key to `.env`:

```txt
WEATHER_AI_API_KEY=wai_your_key_here
VITE_FORECAST_DAYS=7
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`. Restart the dev server after changing `.env`.

## Scripts

```bash
npm run dev      # start local development
npm run test     # run unit tests
npm run build    # type-check and create production build
npm run preview  # preview the production build locally
```

## Architecture

`src/App.tsx` owns the app shell, geolocation, and day navigation. It first loads Nairobi weather, then requests the user's coordinates if browser location is allowed.

`src/weatherApi.ts` fetches Weather-AI daily and hourly data, validates payloads through `src/weatherSchema.ts`, and maps provider fields into a stable `SceneDay` model.

`src/scene.ts` owns the mood rules, time-of-day rules, image pools, image focal points, copy, and overlays.

`src/WeatherScene.tsx` renders the selected scene from the local model. It shows the hero reading, detail panel, hourly strip, and derived day cues such as warmest hour, wettest hour, wind peak, best dry window, scene source, and sun window.

Weather-AI is the only weather provider. If the key or network is unavailable, the app falls back to a small local preview dataset so the UI remains inspectable during development.

## Scene Rules

- Storm or thunder conditions use storm scenes.
- Rain chance of `70%` or higher uses storm scenes.
- Rain and shower conditions below that threshold use rainy scenes.
- Cloud, overcast, fog, and mist use cloudy scenes.
- From 7 PM, the scene shifts to the night image pool.
- Each image has desktop and mobile focal points to keep full-screen crops intentional.

## Scene Assets

Images live in `assets/` and are grouped by weather mood:

- Sunny: `City4.jpeg`, `City5.jpeg`, `City6.jpeg`, `City8.jpeg`, `City10.jpeg`
- Cloudy: `City7.jpeg`, `City9.jpeg`, `City15.jpeg`, `City14.jpeg`
- Rainy: `City3.jpeg`, `City14.jpeg`, `City15.jpeg`, `City16.jpeg`
- Stormy: `City17.jpeg`, `City18.jpeg`
- Night: `City1.jpeg`, `City2.jpeg`, `City11.jpeg`, `City12.jpeg`, `City13.jpeg`

Only the active slide image loads eagerly. Other slide images use browser lazy loading. On refresh, the starting image changes inside the selected mood pool only.

## Project Structure

```txt
api/weather.ts             Server-side Weather-AI proxy
assets/                    Nairobi scene images
src/App.tsx                App shell, geolocation, and navigation
src/WeatherScene.tsx       Scene rendering
src/scene.ts               Mood rules, image pools, and time helpers
src/scene.test.ts          Scene rule tests
src/weatherApi.ts          Weather-AI fetching and mapping
src/weatherSchema.ts       Weather-AI response validation
src/weatherSchema.test.ts  Schema tests
src/types.ts               Shared TypeScript types
src/styles.css             Full-screen scene styling
vite.config.ts             Vite config and local proxy
```

## Testing

Vitest covers the rules most likely to regress:

- High rain chance escalates to storm scenes.
- Night mood begins at 7 PM.
- Storm and night images do not leak into the wrong mood pools.
- Weather-AI payload validation accepts expected fields and rejects invalid field types.
