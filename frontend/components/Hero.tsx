'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export type Slide = { tag: string; title: string; bg: string; image?: string };

export default function Hero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const move = (direction: number) => {
    setI((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <section aria-label="Featured collections" className="hero-section relative overflow-hidden">
      {slides.map((s, k) => (
        <div key={s.title}
          className={`absolute inset-0 bg-gradient-to-br ${s.bg} transition-opacity duration-1000 ${
            k === i ? 'hero-slide-active ' : ''
          }${
            k === i ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}>
          {s.image && (
            <>
              <div className="hero-image absolute inset-0">
                <Image src={s.image} alt="" fill sizes="100vw" unoptimized className="hero-photo" />
              </div>
              <div className="absolute inset-0 bg-brand-dark/30" />
            </>
          )}
          <div className="hero-copy relative flex h-full flex-col items-center justify-center px-6 pb-8 text-center text-white">
            {k === i && (
              <>
                <p className="hero-tag fade-up uppercase tracking-[0.3em] text-white/85">{s.tag}</p>
                <h1 className="hero-title fade-up mt-5 max-w-4xl text-5xl uppercase md:text-7xl lg:text-8xl" style={{ animationDelay: '.15s' }}>
                  {s.title}
                </h1>
                <a href="#shop"
                  className="hero-cta fade-up mt-9 border border-white px-10 py-3 uppercase tracking-widest transition hover:bg-white hover:text-brand-dark"
                  style={{ animationDelay: '.35s' }}>
                  Shop Now
                </a>
              </>
            )}
          </div>
        </div>
      ))}
      <button type="button" aria-label="Previous slide" onClick={() => move(-1)}
        className="hero-control absolute left-4 top-1/2 z-10 -translate-y-1/2 md:left-8">
        <span aria-hidden="true" className="text-xl">‹</span>
      </button>
      <button type="button" aria-label="Next slide" onClick={() => move(1)}
        className="hero-control absolute right-4 top-1/2 z-10 -translate-y-1/2 md:right-8">
        <span aria-hidden="true" className="text-xl">›</span>
      </button>
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {slides.map((_, k) => (
          <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} aria-current={k === i}
            className={`hero-indicator h-1.5 rounded-full ${k === i ? 'w-8 bg-white' : 'w-3 bg-white/55'}`} />
        ))}
      </div>
    </section>
  );
}
