'use client';

import { useEffect, useState } from 'react';
import styles from './WelcomeLoader.module.css';

const DURATION_MS = 3000;
const TITLE = 'Welcome';

interface WelcomeLoaderProps {
  subtitle: string;
}

/**
 * Welcome screen shown over the home page for 3s after load.
 * The page content is rendered underneath (and stays in the HTML for search engines);
 * this layer only covers it and is removed when the time is up.
 */
export default function WelcomeLoader({ subtitle }: WelcomeLoaderProps) {
  const [entered, setEntered] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Next frame, so the hidden server-rendered state is painted before the transitions start.
    const frame = requestAnimationFrame(() => setEntered(true));
    const timer = setTimeout(() => setDone(true), DURATION_MS);
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      root.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (done) document.documentElement.style.overflow = '';
  }, [done]);

  if (done) return null;

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
        <p className={styles.title}>
          {TITLE.split('').map((char, i) => (
            <span key={i} className={styles.letter} style={{ transitionDelay: `${800 + 50 * i}ms` }}>
              {char}
            </span>
          ))}
        </p>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}
