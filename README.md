# Weather Nairobi

Weather Nairobi is a Vite + React weather app that uses the Weather-AI API to render full-screen Nairobi weather scenes.

The UI is scene-based rather than card-based. Each forecast day becomes a swipeable view with weather-driven imagery, motion, color, and summary data.

## Framework And Libraries

- Vite
- React 19
- TypeScript
- Weather-AI API v1
- Swiper.js
- Lucide React

## Weather-AI API

Docs: https://weather-ai.co/docs

The app calls Weather-AI through a local API proxy so the API key stays out of browser JavaScript.

Client request:

```txt
GET /api/weather?lat=-1.286389&lon=36.817223&days=7&ai=true&units=metric&lang=en
```

Weather-AI request made by the proxy:

```txt
GET https://api.weather-ai.co/v1/weather
Authorization: Bearer wai_<your_api_key>
```

The app requests:

- `lat` and `lon` for the active location
- `days` for the forecast window
- `ai=true` for Weather-AI summary data
- `units=metric`
- `lang=en`

During local development, the proxy is implemented in `vite.config.ts`. The same request shape is also available in `api/weather.ts` for server-side environments.

## Local Setup

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

Add your Weather-AI key:

```txt
WEATHER_AI_API_KEY=wai_your_key_here
VITE_FORECAST_DAYS=7
```

Start the development server:

```bash
npm run dev
```

Open the URL printed by Vite, usually:

```txt
http://localhost:5173
```

Restart the dev server after changing `.env`.

## Scripts

```bash
npm run dev      # start local development
npm run build    # type-check and create production build
npm run preview  # preview the production build locally
```

## How The App Works

1. `src/App.tsx` creates the Swiper scene shell.
2. The app first requests Nairobi weather.
3. If browser geolocation is allowed, it requests Weather-AI again with the user's coordinates.
4. `src/weatherApi.ts` maps Weather-AI response fields into the app's `SceneDay` model.
5. `src/scene.ts` chooses the mood, image pool, copy, overlay, and time-of-day treatment.
6. `src/WeatherScene.tsx` renders the full-screen scene and weather metrics.

Weather-AI is the only weather data provider. If the API key or network is unavailable, the app renders a small preview dataset so the interface still works locally.

## Scene Assets

Images live in `assets/`.

The scene engine groups the images by weather mood:

- Sunny: `City1.jpeg`, `City5.jpeg`, `City8.jpeg`, `City10.jpeg`, `City17.jpeg`
- Cloudy: `City4.jpeg`, `City5.jpeg`, `City12.jpeg`, `City13.jpeg`, `City14.jpeg`
- Rainy: `City2.jpeg`, `City3.jpeg`, `City7.jpeg`, `City16.jpeg`
- Stormy: `City9.jpeg`, `City11.jpeg`, `City15.jpeg`, `City18.jpeg`
- Night: `City2.jpeg`, `City6.jpeg`, `City9.jpeg`, `City11.jpeg`, `City18.jpeg`

Only the active slide image loads eagerly. Other slide images use browser lazy loading.

## User Interactions

- Swipe or scroll between forecast days.
- Click the side day rail to jump to a day.
- Use keyboard navigation through Swiper.
- Allow browser location to request weather for the user's current coordinates.

## Project Structure

```txt
api/weather.ts        Server-side Weather-AI proxy
assets/               Nairobi scene images
src/App.tsx           App shell, geolocation, and day navigation
src/WeatherScene.tsx  Scene view and metric rendering
src/scene.ts          Mood, image, copy, and time helpers
src/weatherApi.ts     Weather-AI fetch and response mapping
src/types.ts          Shared TypeScript types
src/styles.css        Full-screen scene styling
vite.config.ts        Vite config and local API proxy
```

## Notes

- Keep `WEATHER_AI_API_KEY` server-side only.
- Keep `VITE_FORECAST_DAYS` within the limit allowed by the Weather-AI plan.
- Add new city imagery by placing files in `assets/` and assigning them to a mood pool in `src/scene.ts`.
