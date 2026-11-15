'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Locale } from '@/lib/types';
import styles from './WelcomeLoader.module.css';
import { clearSkipWelcome, shouldSkipWelcome } from './welcomeSkip';

/*
 * Welcome screen in the hero's style. It has no background of its own: it plays inside the
 * site's 3D night (NightScene), which keeps the sphere small at the center while this screen
 * is on and grows it into the hero when it leaves, so the intro flows into the page without a cut.
 * Previous design (orbs and beams) is kept in the git tag `backup/abertura-orbes`.
 */

const DURATION_MS = 5000;
/** When the greeting dissolves into the next language (ms after the screen starts). */
const SWAP_AT_MS = [1900, 3300];
/** The greeting dissolves and the sphere starts growing this long before the end. */
const OUTRO_MS = 650;

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

export default function WelcomeLoader({ locale }: WelcomeLoaderProps) {
  // Skipped right after an in-site language switch, so visitors do not wait 5s again.
  const [skipped] = useState(shouldSkipWelcome);
  const [entered, setEntered] = useState(false);
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(skipped);

  const leavingRef = useRef(false);

  const leave = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    setTimeout(() => setDone(true), OUTRO_MS);
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
    const outroTimer = setTimeout(leave, DURATION_MS - OUTRO_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leave();
    };
    window.addEventListener('keydown', onKey);
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      clearTimeout(outroTimer);
      window.removeEventListener('keydown', onKey);
      root.style.overflow = previousOverflow;
    };
  }, [skipped, leave]);

  // Tell the 3D scene to grow the sphere as soon as the outro starts.
  useEffect(() => {
    if (leaving) window.dispatchEvent(new Event('welcome:phase'));
  }, [leaving]);

  useEffect(() => {
    if (!done || skipped) return;
    document.documentElement.style.overflow = '';
    window.dispatchEvent(new Event('welcome:done'));
  }, [done, skipped]);

  if (done) return null;

  const wordClass = (index: number) =>
    index === step && !leaving ? `${styles.word} ${index > 0 ? styles.wordArriving : ''}` : `${styles.word} ${styles.wordAway}`;
  const label = SKIP_LABEL[locale];
  const sceneAttrs = leaving ? {} : { 'data-scene-x': 0, 'data-scene-y': 0.62, 'data-scene-scale': 0.24 };

  return (
    <div className={`welcome-loader ${styles.root} ${entered ? styles.entered : ''} ${leaving ? styles.leaving : ''}`} {...sceneAttrs}>
      <div className={styles.text} aria-hidden="true">
        <p className={`${styles.title} ${styles.stack}`}>
          {GREETINGS.map((g, index) => (
            <span key={g.title} className={wordClass(index)}>
              {index === 0
                ? g.title.split('').map((char, i) => (
                    <span key={i} className={styles.letter} style={{ '--d': `${700 + 45 * i}ms` } as CSSProperties}>
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

      <button type="button" onClick={leave} className={styles.skip} aria-label={label.aria}>
        <svg className={styles.skipRing} viewBox="0 0 24 24" aria-hidden="true">
          <circle className={styles.skipTrack} cx="12" cy="12" r="10" />
          <circle className={styles.skipProgress} cx="12" cy="12" r="10" style={{ animationDuration: `${DURATION_MS}ms` }} />
        </svg>
        <span className={styles.skipText}>{label.text}</span>
      </button>
    </div>
  );
}
