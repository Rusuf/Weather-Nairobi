import cityMorning from '../assets/City1.jpeg';
import cityDusk from '../assets/City2.jpeg';
import cityRain from '../assets/City3.jpeg';
import cityWarm from '../assets/City4.jpeg';
import cityWide from '../assets/City5.jpeg';
import cityHighway from '../assets/City6.jpeg';
import cityUrban from '../assets/City7.jpeg';
import cityBrightRoad from '../assets/City8.jpeg';
import cityLowLight from '../assets/City9.jpeg';
import cityNight from '../assets/City11.jpeg';
import cityCloudRise from '../assets/City12.jpeg';
import cityStorm from '../assets/City18.jpeg';
import cityBright from '../assets/City10.jpeg';
import cityCloud from '../assets/City13.jpeg';
import cityGrey from '../assets/City14.jpeg';
import cityBlue from '../assets/City15.jpeg';
import cityWet from '../assets/City16.jpeg';
import cityEvening from '../assets/City17.jpeg';
import type { SceneDay, TimeMood, WeatherMood } from './types';

type SceneTheme = {
  images: string[];
  place: string;
  overlay: string;
  glow: string;
  accent: string;
};

export const themes: Record<WeatherMood, SceneTheme> = {
  sunny: {
    images: [cityMorning, cityWide, cityBright, cityBrightRoad, cityEvening],
    place: 'Nairobi skyline',
    overlay: 'linear-gradient(120deg, rgba(255,183,3,.52), rgba(14,165,233,.16) 48%, rgba(3,7,18,.58))',
    glow: 'rgba(255, 183, 3, .44)',
    accent: '#FFE29A',
  },
  cloudy: {
    images: [cityWarm, cityCloud, cityCloudRise, cityGrey, cityWide],
    place: 'Nairobi skyline',
    overlay: 'linear-gradient(120deg, rgba(142,167,184,.58), rgba(51,65,85,.24) 45%, rgba(3,7,18,.74))',
    glow: 'rgba(199, 210, 218, .28)',
    accent: '#DCEAF1',
  },
  rainy: {
    images: [cityRain, cityWet, cityDusk, cityUrban],
    place: 'CBD roads',
    overlay: 'linear-gradient(120deg, rgba(44,62,80,.74), rgba(15,23,42,.34) 48%, rgba(0,0,0,.78))',
    glow: 'rgba(103, 232, 249, .3)',
    accent: '#CFFAFE',
  },
  stormy: {
    images: [cityStorm, cityLowLight, cityNight, cityBlue],
    place: 'Nairobi lights',
    overlay: 'linear-gradient(120deg, rgba(49,46,129,.72), rgba(15,23,42,.44) 48%, rgba(0,0,0,.84))',
    glow: 'rgba(196, 181, 253, .32)',
    accent: '#DDD6FE',
  },
  night: {
    images: [cityNight, cityDusk, cityLowLight, cityStorm, cityHighway],
    place: 'Nairobi lights',
    overlay: 'linear-gradient(120deg, rgba(15,23,42,.78), rgba(30,41,59,.24) 48%, rgba(0,0,0,.84))',
    glow: 'rgba(251, 146, 60, .26)',
    accent: '#FED7AA',
  },
};

export function imageForMood(mood: WeatherMood, index: number) {
  const images = themes[mood].images;
  return images[index % images.length];
}

export function timeMood(hour: number): TimeMood {
  if (hour < 5) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 17) return 'day';
  if (hour < 20) return 'sunset';
  return 'night';
}

export function weatherMood(day: SceneDay, hour: number): WeatherMood {
  const condition = day.condition.toLowerCase();

  if (day.label === 'Today' && timeMood(hour) === 'night') return 'night';
  if (has(condition, ['storm', 'thunder'])) return 'stormy';
  if (has(condition, ['rain', 'shower', 'drizzle'])) return 'rainy';
  if (has(condition, ['cloud', 'overcast', 'fog', 'mist'])) return 'cloudy';
  if (day.rainChance >= 55) return 'rainy';
  if (day.rainChance >= 35) return 'cloudy';
  return 'sunny';
}

export function weatherCopy(day: SceneDay) {
  const condition = day.condition.toLowerCase();

  if (has(condition, ['storm', 'thunder'])) return { title: 'Thunder', line: 'Strong weather over the city.' };
  if (has(condition, ['rain', 'shower', 'drizzle'])) return { title: 'Rain', line: 'Wet roads and low cloud.' };
  if (has(condition, ['cloud', 'overcast', 'fog', 'mist'])) return { title: 'Cloudy', line: 'A softer sky over Nairobi.' };
  if (day.rainChance >= 55) return { title: 'Rain', line: 'Wet roads and low cloud.' };
  if (day.rainChance >= 35) return { title: 'Cloudy', line: 'A softer sky over Nairobi.' };
  if (has(condition, ['clear', 'sun', 'bright'])) return { title: 'Sunny', line: 'Clear light across the skyline.' };
  return { title: day.condition, line: 'Current city conditions.' };
}

export function nowInNairobi() {
  const timeZone = 'Africa/Nairobi';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  return {
    hour: Number(parts.find((part) => part.type === 'hour')?.value ?? 20),
    label: new Intl.DateTimeFormat('en-KE', { timeZone, hour: '2-digit', minute: '2-digit' }).format(new Date()),
  };
}

export function formatHeroDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatClock(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

function has(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}
