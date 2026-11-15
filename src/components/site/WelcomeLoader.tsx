'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/types';
import styles from './WelcomeLoader.module.css';
import { clearSkipWelcome, shouldSkipWelcome } from './welcomeSkip';

const DURATION_MS = 5000;
/** When the greeting dissolves into the page language (ms after the screen starts). */
const SWAP_AT_MS = 2600;

const GREETINGS: Record<Locale, { title: string; subtitle: string }> = {
  en: { title: 'Welcome', subtitle: 'Loading Portfolio...' },
  pt: { title: 'Bem-vindo', subtitle: 'Carregando portfólio...' },
};

interface WelcomeLoaderProps {
  locale: Locale;
}

/**
 * Welcome screen shown over the home page for 5s after load.
 * It opens in the other language and dissolves into the page language once,
 * so it always ends in the language of the page (PT page: Welcome → Bem-vindo).
 * The page content is rendered underneath (and stays in the HTML for search engines);
 * this layer only covers it and is removed when the time is up.
 */
export default function WelcomeLoader({ locale }: WelcomeLoaderProps) {
  const first = GREETINGS[locale === 'pt' ? 'en' : 'pt'];
  const last = GREETINGS[locale];

  // Skipped right after an in-site language switch, so visitors do not wait 5s again.
  const [skipped] = useState(shouldSkipWelcome);
  const [entered, setEntered] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [done, setDone] = useState(skipped);

  useEffect(() => {
    clearSkipWelcome();
    if (skipped) {
      window.dispatchEvent(new Event('welcome:done'));
      return;
    }
    // Next frame, so the hidden server-rendered state is painted before the transitions start.
    const frame = requestAnimationFrame(() => setEntered(true));
    const swapTimer = setTimeout(() => setSwapped(true), SWAP_AT_MS);
    const doneTimer = setTimeout(() => setDone(true), DURATION_MS);
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(swapTimer);
      clearTimeout(doneTimer);
      root.style.overflow = previousOverflow;
    };
  }, [skipped]);

  useEffect(() => {
    if (!done || skipped) return;
    document.documentElement.style.overflow = '';
    window.dispatchEvent(new Event('welcome:done'));
  }, [done, skipped]);

  if (done) return null;

  const away = `${styles.word} ${styles.wordAway}`;
  const shown = `${styles.word} ${styles.wordArriving}`;

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
        <p className={`${styles.title} ${styles.stack}`}>
          <span className={swapped ? away : styles.word}>
            {first.title.split('').map((char, i) => (
              <span key={i} className={styles.letter} style={{ transitionDelay: `${800 + 50 * i}ms` }}>
                {char}
              </span>
            ))}
          </span>
          <span className={swapped ? shown : away}>{last.title}</span>
        </p>
        <p className={`${styles.subtitle} ${styles.stack}`}>
          <span className={swapped ? away : styles.word}>{first.subtitle}</span>
          <span className={swapped ? shown : away}>{last.subtitle}</span>
        </p>
      </div>
    </div>
  );
}
