import { Cloud, CloudRain, Droplets, Gauge, MapPin, Moon, Navigation, Sun, ThermometerSun, Wind } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ReactNode } from 'react';
import { formatClock, formatHeroDate, imageForMood, themes, timeMood, weatherCopy, weatherMood } from './scene';
import type { SceneDay } from './types';

type Props = {
  day: SceneDay;
  place: string;
  now: {
    hour: number;
    label: string;
  };
  index: number;
  priority: boolean;
};

export function WeatherScene({ day, place, now, index, priority }: Props) {
  const mood = weatherMood(day, now.hour);
  const theme = themes[mood];
  const image = imageForMood(mood, index);
  const copy = weatherCopy(day);
  const temp = day.currentTemp ?? day.high;
  const feels = day.feelsLike ?? day.low;

  return (
    <section className={`scene scene-${mood}`} style={{ '--accent': theme.accent, '--glow': theme.glow } as CSSProperties}>
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
            <Detail label="Condition" value={day.condition} />
            <Detail label="Range" value={`${day.low}° / ${day.high}°`} />
            <Detail label="Humidity" value={`${day.humidity}%`} />
            <Detail label="Rain chance" value={`${day.rainChance}%`} />
            <Detail label="Wind" value={`${day.wind} kph`} />
            <Detail label="Sun" value={`${formatClock(day.sunrise)} / ${formatClock(day.sunset)}`} />
          </aside>
        </div>

        <footer className="data-strip">
          <Metric icon={<ThermometerSun size={18} />} label="Feels" value={`${feels}°`} />
          <Metric icon={<CloudRain size={18} />} label="Rain" value={`${day.rainChance}%`} />
          <Metric icon={<Wind size={18} />} label="Wind" value={`${day.wind} kph`} />
          <Metric icon={<Droplets size={18} />} label="Humidity" value={`${day.humidity}%`} />
          <Metric icon={<Gauge size={18} />} label="Range" value={`${day.low}° / ${day.high}°`} />
          <Metric icon={<Navigation size={18} />} label="Scene" value={theme.place} />
          <Metric icon={<Sun size={18} />} label="Sun" value={`${formatClock(day.sunrise)} / ${formatClock(day.sunset)}`} />
        </footer>
      </div>
    </section>
  );
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
