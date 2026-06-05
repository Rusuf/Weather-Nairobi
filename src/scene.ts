import cityEveningLights from '../assets/City1.jpeg';
import cityNightLights from '../assets/City2.jpeg';
import cityRain from '../assets/City3.jpeg';
import citySunnyPark from '../assets/City4.jpeg';
import citySunnyWide from '../assets/City5.jpeg';
import citySunnyHighway from '../assets/City6.jpeg';
import cityDryStreet from '../assets/City7.jpeg';
import citySunnyTraffic from '../assets/City8.jpeg';
import cityCloudySkyline from '../assets/City9.jpeg';
import citySunnyGlow from '../assets/City10.jpeg';
import cityNightCore from '../assets/City11.jpeg';
import cityNightRoad from '../assets/City12.jpeg';
import cityNightClouds from '../assets/City13.jpeg';
import cityRainStreet from '../assets/City14.jpeg';
import cityWetTraffic from '../assets/City15.jpeg';
import cityRainUmbrellas from '../assets/City16.jpeg';
import cityLightning from '../assets/City17.jpeg';
import cityStormClouds from '../assets/City18.jpeg';
import type { SceneDay, TimeMood, WeatherMood } from './types';

type SceneTheme = {
  images: SceneImage[];
  place: string;
  overlay: string;
  glow: string;
  accent: string;
};

type SceneImage = {
  src: string;
  position: string;
  mobilePosition?: string;
};

export const themes: Record<WeatherMood, SceneTheme> = {
  sunny: {
    images: [
      image(citySunnyPark, '50% 48%', '50% 50%'),
      image(citySunnyWide, '55% 50%', '52% 50%'),
      image(citySunnyHighway, '50% 50%', '50% 50%'),
      image(citySunnyTraffic, '54% 50%', '50% 50%'),
      image(citySunnyGlow, '58% 50%', '54% 50%'),
    ],
    place: 'Nairobi skyline',
    overlay: 'linear-gradient(120deg, rgba(255,183,3,.52), rgba(14,165,233,.16) 48%, rgba(3,7,18,.58))',
    glow: 'rgba(255, 183, 3, .44)',
    accent: '#FFE29A',
  },
  cloudy: {
    images: [
      image(cityDryStreet, '48% 50%', '50% 50%'),
      image(cityCloudySkyline, '58% 50%', '52% 50%'),
      image(cityWetTraffic, '50% 50%', '50% 50%'),
      image(cityRainStreet, '50% 54%', '50% 50%'),
    ],
    place: 'Nairobi skyline',
    overlay: 'linear-gradient(120deg, rgba(142,167,184,.58), rgba(51,65,85,.24) 45%, rgba(3,7,18,.74))',
    glow: 'rgba(199, 210, 218, .28)',
    accent: '#DCEAF1',
  },
  rainy: {
    images: [
      image(cityRain, '52% 50%', '50% 50%'),
      image(cityRainStreet, '50% 54%', '50% 50%'),
      image(cityWetTraffic, '50% 50%', '50% 50%'),
      image(cityRainUmbrellas, '50% 50%', '48% 50%'),
    ],
    place: 'CBD roads',
    overlay: 'linear-gradient(120deg, rgba(44,62,80,.74), rgba(15,23,42,.34) 48%, rgba(0,0,0,.78))',
    glow: 'rgba(103, 232, 249, .3)',
    accent: '#CFFAFE',
  },
  stormy: {
    images: [image(cityLightning, '50% 45%', '50% 50%'), image(cityStormClouds, '55% 45%', '50% 50%')],
    place: 'Nairobi lights',
    overlay: 'linear-gradient(120deg, rgba(49,46,129,.72), rgba(15,23,42,.44) 48%, rgba(0,0,0,.84))',
    glow: 'rgba(196, 181, 253, .32)',
    accent: '#DDD6FE',
  },
  night: {
    images: [
      image(cityEveningLights, '50% 50%', '50% 50%'),
      image(cityNightLights, '50% 50%', '50% 50%'),
      image(cityNightCore, '50% 50%', '50% 50%'),
      image(cityNightRoad, '48% 50%', '44% 50%'),
      image(cityNightClouds, '50% 50%', '50% 50%'),
    ],
    place: 'Nairobi lights',
    overlay: 'linear-gradient(120deg, rgba(15,23,42,.78), rgba(30,41,59,.24) 48%, rgba(0,0,0,.84))',
    glow: 'rgba(251, 146, 60, .26)',
    accent: '#FED7AA',
  },
};

export function imageForMood(mood: WeatherMood, index: number, seed: number) {
  const images = themes[mood].images;
  return images[(seed + index) % images.length];
}

function image(src: string, position: string, mobilePosition = position): SceneImage {
  return { src, position, mobilePosition };
}

export function timeMood(hour: number): TimeMood {
  if (hour < 5) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 17) return 'day';
  if (hour < 19) return 'sunset';
  return 'night';
}

export function weatherMood(day: SceneDay, hour: number): WeatherMood {
  const condition = day.condition.toLowerCase();

  if (timeMood(hour) === 'night') return 'night';
  if (has(condition, ['storm', 'thunder'])) return 'stormy';
  if (day.rainChance >= 70) return 'stormy';
  if (has(condition, ['rain', 'shower', 'drizzle'])) return 'rainy';
  if (has(condition, ['cloud', 'overcast', 'fog', 'mist'])) return 'cloudy';
  if (day.rainChance >= 55) return 'rainy';
  if (day.rainChance >= 35) return 'cloudy';
  return 'sunny';
}

export function weatherCopy(day: SceneDay) {
  const condition = day.condition.toLowerCase();

  if (has(condition, ['storm', 'thunder'])) return { title: 'Thunder', line: 'Strong weather over the city.' };
  if (day.rainChance >= 70) return { title: 'Heavy rain', line: 'Stormy skies and difficult roads.' };
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
  if (/^\d{1,2}:\d{2}/.test(value)) return timeWithPeriod(value);

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';

  return parsed.toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function has(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}

function timeWithPeriod(value: string) {
  const [hour = '0', minute = '00'] = value.split(':');
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date.toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit', hour12: true });
}
