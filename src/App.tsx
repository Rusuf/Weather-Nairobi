import { useEffect, useMemo, useRef, useState } from 'react';
import { EffectCreative, Keyboard, Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper/types';
import 'swiper/css';
import 'swiper/css/effect-creative';
import { nowInNairobi } from './scene';
import type { SceneDay } from './types';
import { WeatherScene } from './WeatherScene';
import { fetchWeatherAi, NAIROBI, previewWeather } from './weatherApi';

export function App() {
  const preview = useMemo(() => previewWeather(), []);
  const imageSeed = useMemo(() => Math.floor(Math.random() * 1000), []);
  const [days, setDays] = useState<SceneDay[]>(preview.days);
  const [place, setPlace] = useState(preview.place);
  const [activeIndex, setActiveIndex] = useState(0);
  const [now, setNow] = useState(nowInNairobi);
  const swiperRef = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(nowInNairobi()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;

    const load = async (latitude: number, longitude: number) => {
      try {
        const weather = await fetchWeatherAi(latitude, longitude);
        if (!ignore) {
          setDays(weather.days);
          setPlace(weather.place);
        }
      } catch {
        if (!ignore) setDays(preview.days);
      }
    };

    load(NAIROBI.latitude, NAIROBI.longitude);

    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => load(coords.latitude, coords.longitude),
      () => undefined,
      { enableHighAccuracy: false, maximumAge: 600000, timeout: 8000 },
    );

    return () => {
      ignore = true;
    };
  }, [preview.days]);

  return (
    <main className="app">
      <Swiper
        className="scene-swiper"
        creativeEffect={{
          limitProgress: 2,
          next: { opacity: 0.25, translate: ['88%', 0, -180] },
          prev: { opacity: 0.25, translate: ['-88%', 0, -180] },
        }}
        effect="creative"
        initialSlide={0}
        keyboard={{ enabled: true }}
        modules={[EffectCreative, Keyboard, Mousewheel]}
        mousewheel={{ forceToAxis: true }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        resistanceRatio={0.72}
        speed={620}
      >
        {days.map((day, index) => (
          <SwiperSlide key={`${day.label}-${day.date}`}>
            <WeatherScene day={day} imageSeed={imageSeed} index={index} now={now} place={place} priority={index === activeIndex} />
          </SwiperSlide>
        ))}
      </Swiper>

      <nav className="forecast-rail" aria-label="Forecast days">
        {days.map((day, index) => (
          <button
            className={index === activeIndex ? 'active' : ''}
            key={`${day.label}-${day.date}`}
            onClick={() => swiperRef.current?.slideTo(index)}
            type="button"
          >
            <span>{day.shortLabel}</span>
            <strong>{day.currentTemp ?? day.high}°</strong>
            <small>{day.rainChance}%</small>
          </button>
        ))}
      </nav>
    </main>
  );
}
