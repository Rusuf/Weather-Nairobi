import { Cloud, CloudRain, MapPin, Moon, Navigation, Sun, ThermometerSun, Wind } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ReactNode } from 'react';
import { formatClock, formatHeroDate, imageForMood, themes, timeMood, weatherCopy, weatherMood } from './scene';
import type { SceneDay, WeatherHour } from './types';

type Props = {
  day: SceneDay;
  place: string;
  now: {
    hour: number;
    label: string;
  };
  index: number;
  imageSeed: number;
  priority: boolean;
};

type SceneStyle = CSSProperties & {
  '--accent': string;
  '--glow': string;
};

export function WeatherScene({ day, place, now, index, imageSeed, priority }: Props) {
  const mood = weatherMood(day, now.hour);
  const theme = themes[mood];
  const image = imageForMood(mood, index, imageSeed);
  const copy = weatherCopy(day);
  const temp = day.currentTemp ?? day.high;
  const feels = day.feelsLike ?? day.low;
  const sceneStyle: SceneStyle = { '--accent': theme.accent, '--glow': theme.glow };
  const details = [
    ['Condition', day.condition],
    ['Range', `${day.low}° / ${day.high}°`],
    ['Humidity', `${day.humidity}%`],
    ['Rain chance', `${day.rainChance}%`],
    ['Wind', `${day.wind} kph`],
    ['Sun', sunWindow(day)],
  ];
  const cues = dayCues(day, feels, theme.place);

  return (
    <section className={`scene scene-${mood}`} style={sceneStyle}>
      <img className="scene-image" src={image} alt="" decoding="async" draggable="false" loading={priority ? 'eager' : 'lazy'} />
      <div className="scene-overlay" style={{ background: theme.overlay }} />
      <div className={`time-wash time-${timeMood(now.hour)}`} />
      <WeatherFx mood={mood} />
      <div className="scene-glow" />

      <div className="scene-ui">
        <header className="topbar">
          <div className="brand-mark">
            {mood === 'rainy' ? <CloudRain size={20} /> : mood === 'night' ? <Moon size={20} /> : <Cloud size={20} />}
            <span>Weather Nairobi</span>
          </div>
          <div className="place-pill">
            <MapPin size={16} />
            {place} · {now.label}
          </div>
        </header>

        <div className="scene-content">
          <main className="hero-read">
            <p className="day-label">
              {day.label} / {formatHeroDate(day.date)}
            </p>
            <h1>
              {temp}
              <sup>°</sup>
            </h1>
            <div>
              <h2>{copy.title}</h2>
              <p>{copy.line}{day.summary ? ` ${day.summary}` : ''}</p>
            </div>
          </main>

          <aside className="detail-stack" aria-label={`${day.label} weather details`}>
            {details.map(([label, value]) => (
              <Detail key={label} label={label} value={value} />
            ))}
          </aside>
        </div>

        <HourlyStrip hours={day.hours} />

        <footer className="data-strip" aria-label="Day cues">
          {cues.map((cue) => (
            <Metric key={cue.label} {...cue} />
          ))}
        </footer>
      </div>
    </section>
  );
}

function HourlyStrip({ hours }: { hours: WeatherHour[] }) {
  if (!hours.length) return null;

  return (
    <section className="hour-strip" aria-label="Hourly forecast">
      {hours.map((hour) => (
        <article key={hour.time}>
          <time>{formatHour(hour.time)}</time>
          <strong>{hour.temp}°</strong>
          <span>{hour.rainChance}%</span>
        </article>
      ))}
    </section>
  );
}

function dayCues(day: SceneDay, feels: number, scene: string) {
  const daylight = sunWindow(day);

  if (!day.hours.length) {
    return [
      { icon: <ThermometerSun size={18} />, label: 'Feels now', value: `${feels}°` },
      { icon: <Navigation size={18} />, label: 'Scene', value: scene },
      { icon: <Sun size={18} />, label: 'Sun window', value: daylight },
    ];
  }

  const warmest = maxBy(day.hours, (hour) => hour.temp);
  const wettest = maxBy(day.hours, (hour) => hour.rainChance);
  const windiest = maxBy(day.hours, (hour) => hour.wind);
  const bestWindow = dryWindow(day.hours);

  return [
    { icon: <ThermometerSun size={18} />, label: 'Warmest', value: `${warmest.temp}° ${formatHour(warmest.time)}` },
    { icon: <CloudRain size={18} />, label: 'Wettest', value: `${wettest.rainChance}% ${formatHour(wettest.time)}` },
    { icon: <Wind size={18} />, label: 'Wind peak', value: `${windiest.wind} kph ${formatHour(windiest.time)}` },
    { icon: <Sun size={18} />, label: 'Best dry window', value: bestWindow },
    { icon: <Navigation size={18} />, label: 'Scene', value: scene },
    { icon: <Sun size={18} />, label: 'Sun window', value: daylight },
  ];
}

function sunWindow(day: SceneDay) {
  const sunrise = formatClock(day.sunrise);
  const sunset = formatClock(day.sunset);
  return sunrise === '--' || sunset === '--' ? 'Not provided' : `${sunrise} / ${sunset}`;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <span>
      {icon}
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function maxBy<T>(items: T[], score: (item: T) => number) {
  return items.reduce((best, item) => (score(item) > score(best) ? item : best));
}

function minBy<T>(items: T[], score: (item: T) => number) {
  return items.reduce((best, item) => (score(item) < score(best) ? item : best));
}

function dryWindow(hours: WeatherHour[]) {
  const start = hours.find((hour) => hour.rainChance <= 5) ?? hours.find((hour) => hour.rainChance <= 25) ?? minBy(hours, (hour) => hour.rainChance);
  const startIndex = hours.findIndex((hour) => hour.time === start.time);
  const end = hours[startIndex + 1] ?? start;
  return `${formatHour(start.time)} - ${formatHour(end.time)}`;
}

function formatHour(value: string) {
  if (/^\d{1,2}:\d{2}/.test(value)) return formatTimeText(value);

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  return value.slice(11, 16) || value;
}

function formatTimeText(value: string) {
  const [hour = '0', minute = '00'] = value.split(':');
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date.toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function WeatherFx({ mood }: { mood: ReturnType<typeof weatherMood> }) {
  const wet = mood === 'rainy' || mood === 'stormy';
  const cloudy = wet || mood === 'cloudy';
  const night = mood === 'night' || mood === 'stormy';

  return (
    <>
      {cloudy && (
        <div className="cloud-layer" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span key={index} style={{ '--i': index } as CSSProperties} />
          ))}
        </div>
      )}

      {wet && (
        <div className="rain-layer" aria-hidden="true">
          {Array.from({ length: 48 }).map((_, index) => (
            <span key={index} style={{ '--x': `${(index * 17) % 100}%`, '--d': `${(index % 11) * -0.13}s` } as CSSProperties} />
          ))}
        </div>
      )}

      {night && (
        <div className="star-layer" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <span key={index} style={{ '--x': `${(index * 23) % 100}%`, '--y': `${8 + ((index * 17) % 38)}%` } as CSSProperties} />
          ))}
        </div>
      )}

      <div className="traffic-layer" aria-hidden="true">
        <span />
        <span />
      </div>
    </>
  );
}
