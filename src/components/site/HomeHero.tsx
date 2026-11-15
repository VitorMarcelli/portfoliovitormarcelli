'use client';

import dynamic from 'next/dynamic';
import { useRef, type CSSProperties } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';

// The 3D scene loads after the text, so it never delays the first paint or search engines.
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

const NAME = 'VITOR MARCELLI';

/**
 * Splits a line into letters that enter one by one (opacity + 20px rise, 0.6s, 20ms apart).
 * Letters are grouped per word so lines only break between words.
 */
function Letters({ text, startMs }: { text: string; startMs: number }) {
  const words = text.split(' ');
  // Index of each word's first letter in the whole line (spaces count, like the reference stagger).
  const offsets = words.map((_, w) => words.slice(0, w).reduce((sum, word) => sum + word.length + 1, 0));
  return (
    <>
      {words.map((word, w) => (
        <span key={w}>
          {w > 0 && ' '}
          <span className="inline-block whitespace-nowrap">
            {word.split('').map((char, c) => (
              <span key={c} className="hero-char" style={{ '--d': `${startMs + 20 * (offsets[w] + c)}ms` } as CSSProperties}>
                {char}
              </span>
            ))}
          </span>
        </span>
      ))}
    </>
  );
}

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export default function HomeHero({ t }: { t: Dictionary['hero'] }) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} id="inicio" className="hero-stage relative min-h-svh w-full overflow-hidden">
      <HeroScene containerRef={sectionRef} />

      <div className="relative z-20 flex min-h-svh flex-col items-center justify-center px-4 pb-24 text-center">
        <div className="max-w-5xl space-y-6">
          <h1
            aria-label={NAME}
            className="hero-gradient mb-4 font-[family-name:var(--font-hero-display)] text-5xl font-bold md:text-7xl lg:text-8xl"
          >
            <span aria-hidden="true">
              <Letters text={NAME} startMs={500} />
            </span>
          </h1>

          <div className="space-y-3">
            <p
              aria-label={t.role}
              className="hero-role font-[family-name:var(--font-hero-display)] text-2xl font-medium md:text-4xl lg:text-5xl"
            >
              <span aria-hidden="true">
                <Letters text={t.role} startMs={1500} />
              </span>
            </p>
            <p className="hero-fade hero-tagline font-[family-name:var(--font-hero-body)] text-lg font-light md:text-2xl" style={delay(2500)}>
              {t.tagline}
            </p>
          </div>

          <div className="hero-fade mt-12 flex flex-col justify-center gap-4 md:flex-row" style={delay(3000)}>
            <p className="hero-lead mx-auto max-w-2xl font-[family-name:var(--font-hero-body)] text-base md:text-lg">
              {t.leadBefore}
              <span className="hero-highlight font-semibold">{t.leadHighlight}</span>
              {t.leadAfter}
              <br />
              {t.leadSecond}
            </p>
          </div>
        </div>

        <div className="hero-fade absolute bottom-32 left-1/2 -translate-x-1/2" style={delay(3500)} aria-hidden="true">
          <div className="flex flex-col items-center gap-2">
            <span className="hero-scroll-label font-[family-name:var(--font-hero-body)] text-sm uppercase tracking-widest">
              {t.scroll}
            </span>
            <div className="hero-scroll-mouse flex h-10 w-6 items-start justify-center rounded-full border-2 p-2">
              <div className="hero-scroll-dot h-3 w-1 animate-bounce rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
