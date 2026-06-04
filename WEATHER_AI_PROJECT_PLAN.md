# Weather-AI Take-Home Plan

## Submission Goal

Build a public, deployable Weather-AI integration that feels more memorable than a normal weather dashboard. The app should prove that we can consume the API correctly, protect credentials, handle slow/error states, and translate raw weather data into a useful product experience.

Deadline from pasted email: June 5, 2026 at 23:13, assuming the email timestamp is the receipt time.

## Product Concept

**Nairobi Sky Brief** is a weather moodboard for Nairobi. Instead of only showing temperature, it turns Weather-AI data into a practical city read:

- What kind of Nairobi day is this?
- When is the best window to step out?
- Should someone carry a jacket, umbrella, or sunglasses?
- How do the next few days feel at a glance?

The UI should be Kenyan, playful, and polished without becoming noisy.

## Weather-AI API Notes

Docs: https://weather-ai.co/docs

Base URL:

```txt
https://api.weather-ai.co
```

Authentication:

```txt
Authorization: Bearer wai_<your_api_key>
```

Primary endpoint for this project:

```txt
GET /v1/weather?lat=-1.2921&lon=36.8219&days=7&ai=true&units=metric&lang=en
```

Useful alternatives:

- `GET /v1/current` for current conditions only.
- `GET /v1/hourly` for hourly forecast.
- `GET /v1/daily` for daily forecast.
- `GET /v1/usage` for account/quota stats.

Plan limits:

- Free plan supports 1,000 requests/month and 7 forecast days.
- AI summaries count against AI quota.
- Add `ai=false` to preserve AI quota if needed.

## Architecture

- React + Vite frontend.
- Vite dev middleware for local `/api/weather` testing.
- Vercel serverless API route at `/api/weather`.
- API key stored in `WEATHER_AI_API_KEY` on Vercel/deployment environment.
- Frontend never commits or hardcodes the API key.
- Graceful fallback view if the API key is not configured yet.

## UI Plan

1. **Hero Weather Mood**
   - Large Nairobi status line.
   - Current temperature and condition.
   - Cartoon weather mark built with CSS.
   - Practical city advice.

2. **Best Window Timeline**
   - Morning, midday, afternoon, evening.
   - Highlights the easiest time to go out.
   - Uses weather severity, rain chance, wind, and temperature when available.

3. **Seven-Day Mood Strip**
   - Compact forecast row.
   - Each day gets a short human label.
   - Quick scanning for rain/heat/calm.

4. **API Proof Panel**
   - Shows endpoint, coordinates, units, freshness, and whether live API data is active.
   - Useful for reviewers evaluating integration.

## Implementation Tasks

- [x] Read Weather-AI docs.
- [x] Create plan markdown.
- [x] Scaffold Vite/React app.
- [x] Add Weather-AI proxy function.
- [x] Build Nairobi weather interpretation helpers.
- [x] Create polished responsive UI.
- [x] Add README with setup and deployment instructions.
- [ ] Run local build.
- [ ] Deploy and add live link.

## What Rufus Needs To Do

1. Create a Weather-AI API key from the Weather-AI dashboard.
2. Put it in `.env` locally:

```txt
WEATHER_AI_API_KEY=wai_your_key_here
```

3. Add the same variable in Vercel deployment settings.
4. Deploy the repo.
5. Reply to the email with GitHub repo link and live deployment link.
