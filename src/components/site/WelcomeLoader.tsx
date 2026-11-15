'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Locale } from '@/lib/types';
import styles from './WelcomeLoader.module.css';
import { clearSkipWelcome, shouldSkipWelcome } from './welcomeSkip';

const DURATION_MS = 5000;
/** When the greeting dissolves into the next language (ms after the screen starts). */
const SWAP_AT_MS = [1900, 3300];
/** Quick dissolve when the visitor skips the intro. */
const LEAVE_MS = 450;

/** Portuguese first, then Spanish, then English. */
const GREETINGS = [
  { title: 'Bem-vindo', subtitle: 'Carregando portfólio...' },
  { title: 'Bienvenido', subtitle: 'Cargando portafolio...' },
  { title: 'Welcome', subtitle: 'Loading Portfolio...' },
];

const SKIP_LABEL: Record<Locale, { text: string; aria: string }> = {
  pt: { text: 'pular', aria: 'Pular introdução' },
  en: { text: 'skip', aria: 'Skip intro' },
};

interface WelcomeLoaderProps {
  locale: Locale;
}

/**
 * Welcome screen shown over the home page for 5s after load. The greeting dissolves
 * Portuguese → Spanish → English; a small ring counts down and lets the visitor skip (or press Esc).
 * The page content is rendered underneath (and stays in the HTML for search engines);
 * this layer only covers it and is removed when the time is up.
 */
export default function WelcomeLoader({ locale }: WelcomeLoaderProps) {
  // Skipped right after an in-site language switch, so visitors do not wait 5s again.
  const [skipped] = useState(shouldSkipWelcome);
  const [entered, setEntered] = useState(false);
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(skipped);

  const skip = useCallback(() => {
    setLeaving(true);
    setTimeout(() => setDone(true), LEAVE_MS);
  }, []);

  useEffect(() => {
    clearSkipWelcome();
    if (skipped) {
      window.dispatchEvent(new Event('welcome:done'));
      return;
    }
    // Next frame, so the hidden server-rendered state is painted before the transitions start.
    const frame = requestAnimationFrame(() => setEntered(true));
    const timers = SWAP_AT_MS.map((at, i) => setTimeout(() => setStep(i + 1), at));
    const doneTimer = setTimeout(() => setDone(true), DURATION_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
    };
    window.addEventListener('keydown', onKey);
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
      window.removeEventListener('keydown', onKey);
      root.style.overflow = previousOverflow;
    };
  }, [skipped, skip]);

  useEffect(() => {
    if (!done || skipped) return;
    document.documentElement.style.overflow = '';
    window.dispatchEvent(new Event('welcome:done'));
  }, [done, skipped]);

  if (done) return null;

  const wordClass = (index: number) =>
    index === step ? `${styles.word} ${index > 0 ? styles.wordArriving : ''}` : `${styles.word} ${styles.wordAway}`;
  const label = SKIP_LABEL[locale];

  return (
    <div className={`welcome-loader ${styles.root} ${entered ? styles.entered : ''} ${leaving ? styles.leaving : ''}`}>
      <div className={`${styles.orbSlot} ${styles.orbA}`} aria-hidden="true">
        <div className={styles.orb}>
          <div className={`${styles.beamTrack} ${styles.spin8}`}>
            <div className={styles.beam} />
          </div>
        </div>
      </div>
      <div className={`${styles.orbSlot} ${styles.orbB}`} aria-hidden="true">
        <div className={styles.orb}>
          <div className={`${styles.beamTrack} ${styles.spin10r}`}>
            <div className={styles.beam} />
          </div>
        </div>
      </div>
      <div className={`${styles.orbSlot} ${styles.orbC}`} aria-hidden="true">
        <div className={styles.orb}>
          <div className={`${styles.beamTrack} ${styles.spin6}`}>
            <div className={styles.beam} />
          </div>
        </div>
      </div>
      <div className={`${styles.orbSlot} ${styles.orbD}`} aria-hidden="true">
        <div className={styles.orb}>
          <div className={`${styles.beamTrack} ${styles.spin7r}`}>
            <div className={styles.beam} />
          </div>
        </div>
      </div>

      <div className={styles.text} aria-hidden="true">
        <p className={`${styles.title} ${styles.stack}`}>
          {GREETINGS.map((g, index) => (
            <span key={g.title} className={wordClass(index)}>
              {index === 0
                ? g.title.split('').map((char, i) => (
                    <span key={i} className={styles.letter} style={{ transitionDelay: `${800 + 50 * i}ms` }}>
                      {char}
                    </span>
                  ))
                : g.title}
            </span>
          ))}
        </p>
        <p className={`${styles.subtitle} ${styles.stack}`}>
          {GREETINGS.map((g, index) => (
            <span key={g.subtitle} className={wordClass(index)}>
              {g.subtitle}
            </span>
          ))}
        </p>
      </div>

      <button type="button" onClick={skip} className={styles.skip} aria-label={label.aria}>
        <svg className={styles.skipRing} viewBox="0 0 24 24" aria-hidden="true">
          <circle className={styles.skipTrack} cx="12" cy="12" r="10" />
          <circle className={styles.skipProgress} cx="12" cy="12" r="10" style={{ animationDuration: `${DURATION_MS}ms` }} />
        </svg>
        <span className={styles.skipText}>{label.text}</span>
      </button>
    </div>
  );
}
