import { describe, expect, it } from 'vitest';
import stormLightning from '../assets/City17.jpeg';
import stormClouds from '../assets/City18.jpeg';
import nightCore from '../assets/City11.jpeg';
import nightRoad from '../assets/City12.jpeg';
import nightClouds from '../assets/City13.jpeg';
import { imageForMood, themes, timeMood, weatherMood } from './scene';
import type { SceneDay } from './types';

const baseDay: SceneDay = {
  label: 'Today',
  shortLabel: 'Today',
  date: '2026-06-05',
  condition: 'Clear sky',
  high: 26,
  low: 17,
  rainChance: 12,
  wind: 10,
  humidity: 60,
  hours: [],
};

describe('weather scene rules', () => {
  it('uses storm scenes for days with at least 70% rain chance', () => {
    expect(weatherMood({ ...baseDay, rainChance: 70 }, 14)).toBe('stormy');
  });

  it('switches scenes to night from 7 PM', () => {
    expect(timeMood(18)).toBe('sunset');
    expect(timeMood(19)).toBe('night');
    expect(weatherMood({ ...baseDay, rainChance: 80 }, 19)).toBe('night');
  });

  it('keeps storm images out of sunny, cloudy, rainy, and night pools', () => {
    const stormImages = new Set([stormLightning, stormClouds]);
    const nonStormMoods = ['sunny', 'cloudy', 'rainy', 'night'] as const;
    const nonStormImages = nonStormMoods.flatMap((mood) => themes[mood].images.map((item) => item.src));

    expect(nonStormImages.some((src) => stormImages.has(src))).toBe(false);
  });

  it('keeps night-only city images out of sunny and cloudy pools', () => {
    const nightImages = new Set([nightCore, nightRoad, nightClouds]);
    const dayImages = [...themes.sunny.images, ...themes.cloudy.images].map((item) => item.src);

    expect(dayImages.some((src) => nightImages.has(src))).toBe(false);
  });

  it('rotates images only inside the selected mood pool', () => {
    const selected = imageForMood('rainy', 3, 12).src;

    expect(themes.rainy.images.map((item) => item.src)).toContain(selected);
  });
});
