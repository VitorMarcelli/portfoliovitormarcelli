'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import type { Locale } from '@/lib/types';
import styles from './WelcomeLoader.module.css';

const DURATION_MS = 5000;
/** Moments when the greeting switches language (ms after the screen starts). */
const SWAP_AT_MS = [2000, 3400];
/** Exit of the current word: 250ms per letter plus a 25ms stagger. */
const LETTER_OUT_MS = 250;
const LETTER_OUT_STAGGER_MS = 25;
/** Entrance of a swapped-in word (the first word keeps the original 800ms + 50ms stagger, 500ms each). */
const LETTER_SWAP_IN_MS = 400;
const LETTER_SWAP_IN_STAGGER_MS = 35;

const GREETINGS: Record<Locale, { title: string; subtitle: string }> = {
  en: { title: 'Welcome', subtitle: 'Loading Portfolio...' },
  pt: { title: 'Bem-vindo', subtitle: 'Carregando portfólio...' },
};

type Phase = 'pre' | 'in' | 'out';

interface WelcomeLoaderProps {
  locale: Locale;
}

/**
 * Welcome screen shown over the home page for 5s after load.
 * The greeting goes page language → other language → page language, so it always ends
 * in the language of the page. The page content is rendered underneath (and stays in the
 * HTML for search engines); this layer only covers it and is removed when the time is up.
 */
export default function WelcomeLoader({ locale }: WelcomeLoaderProps) {
  const other: Locale = locale === 'pt' ? 'en' : 'pt';
  const sequence: Locale[] = [locale, other, locale];

  const [entered, setEntered] = useState(false);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('pre');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const frames: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    // Two frames, so the hidden state is painted before a transition starts.
    const nextPaint = (fn: () => void) => {
      frames.push(requestAnimationFrame(() => frames.push(requestAnimationFrame(fn))));
    };

    nextPaint(() => {
      setEntered(true);
      setPhase('in');
    });

    SWAP_AT_MS.forEach((at, index) => {
      const leaving = GREETINGS[sequence[index]].title.length;
      const outTotal = LETTER_OUT_MS + LETTER_OUT_STAGGER_MS * (leaving - 1);
      later(at, () => setPhase('out'));
      later(at + outTotal, () => {
        setStep(index + 1);
        setPhase('pre');
        nextPaint(() => setPhase('in'));
      });
    });

    later(DURATION_MS, () => setDone(true));

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      timers.forEach(clearTimeout);
      frames.forEach(cancelAnimationFrame);
      root.style.overflow = previousOverflow;
    };
    // The sequence depends only on the page locale, fixed for this mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (done) document.documentElement.style.overflow = '';
  }, [done]);

  if (done) return null;

  const greeting = GREETINGS[sequence[step]];
  const firstEntrance = step === 0;

  function letterTiming(i: number): CSSProperties {
    if (phase === 'out') return { transitionDelay: `${LETTER_OUT_STAGGER_MS * i}ms`, transitionDuration: `${LETTER_OUT_MS}ms` };
    if (phase === 'in' && firstEntrance) return { transitionDelay: `${800 + 50 * i}ms` };
    if (phase === 'in') return { transitionDelay: `${LETTER_SWAP_IN_STAGGER_MS * i}ms`, transitionDuration: `${LETTER_SWAP_IN_MS}ms` };
    return {};
  }

  return (
    <div className={`welcome-loader ${styles.root} ${entered ? styles.entered : ''}`} aria-hidden="true">
      <div className={`${styles.orbSlot} ${styles.orbA}`}>
        <div className={styles.orb}>
          <div className={`${styles.beamTrack} ${styles.spin8}`}>
            <div className={styles.beam} />
          </div>
        </div>
      </div>
      <div className={`${styles.orbSlot} ${styles.orbB}`}>
        <div className={styles.orb}>
          <div className={`${styles.beamTrack} ${styles.spin10r}`}>
            <div className={styles.beam} />
          </div>
        </div>
      </div>
      <div className={`${styles.orbSlot} ${styles.orbC}`}>
        <div className={styles.orb}>
          <div className={`${styles.beamTrack} ${styles.spin6}`}>
            <div className={styles.beam} />
          </div>
        </div>
      </div>
      <div className={`${styles.orbSlot} ${styles.orbD}`}>
        <div className={styles.orb}>
          <div className={`${styles.beamTrack} ${styles.spin7r}`}>
            <div className={styles.beam} />
          </div>
        </div>
      </div>

      <div className={styles.text}>
        <p className={styles.title} data-phase={phase}>
          {greeting.title.split('').map((char, i) => (
            <span key={`${step}-${i}`} className={styles.letter} style={letterTiming(i)}>
              {char}
            </span>
          ))}
        </p>
        <p className={styles.subtitle}>
          <span className={styles.subText} data-phase={firstEntrance && phase !== 'out' ? 'in' : phase}>
            {greeting.subtitle}
          </span>
        </p>
      </div>
    </div>
  );
}
