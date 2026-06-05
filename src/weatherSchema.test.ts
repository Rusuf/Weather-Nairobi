import { describe, expect, it } from 'vitest';
import { parseWeatherAiResponse } from './weatherSchema';

describe('Weather-AI response schema', () => {
  it('accepts daily and hourly weather payloads with extra provider fields', () => {
    const payload = parseWeatherAiResponse({
      location: { city: 'Nairobi', country: 'Kenya' },
      current: {
        temp_c: 23,
        humidity: 68,
        weather_description: 'Partly cloudy',
        provider_trace_id: 'demo',
      },
      forecast: [
        {
          date: '2026-06-05',
          max_temp: 25,
          min_temp: 17,
          precipitation_probability: 24,
        },
      ],
      hourly: [
        {
          time: '2026-06-05T12:00:00',
          temperature_c: 25,
          rain_probability: 20,
        },
      ],
      ai_summary: 'A mild day with broken cloud.',
    });

    expect(payload.location?.city).toBe('Nairobi');
    expect(payload.forecast?.[0]?.precipitation_probability).toBe(24);
    expect(payload.hourly?.[0]?.temperature_c).toBe(25);
  });

  it('rejects invalid field types at the API boundary', () => {
    expect(() =>
      parseWeatherAiResponse({
        current: {
          temp_c: '23',
        },
      }),
    ).toThrow();
  });
});
