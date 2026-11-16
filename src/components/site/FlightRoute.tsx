'use client';

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';

interface Step {
  title: string;
  description: string;
}

/**
 * "How I work" as a flight route: a line of light is drawn as the page scrolls and a comet runs along
 * it, lighting each step as it passes. Desktop: route in the middle, steps alternating sides.
 * Phone: route on the left edge, steps to its right.
 */
export default function FlightRoute({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 72%', 'end 62%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const height = useTransform(progress, (v) => `${Math.min(1, Math.max(0, v)) * 100}%`);
  const [reached, setReached] = useState(-1);
  const n = steps.length;

  useMotionValueEvent(progress, 'change', (v) => {
    // A step lights when the comet arrives at its dot (dots sit at i / (n - 1) of the route).
    const next = v <= 0.01 ? -1 : Math.min(n - 1, Math.floor(v * (n - 1) + 0.04));
    setReached((current) => (current === next ? current : next));
  });

  return (
    <ol ref={ref} className="relative grid" style={{ gridAutoRows: '1fr' }}>
      {/* Route: from the first dot to the last (rows are equal, so that is 2rem to 100%/n - 2rem). */}
      <div
        className="absolute left-5 w-px md:left-1/2"
        style={{ top: '2rem', bottom: `calc(${100 / n}% - 2rem)` }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,var(--border)_0_6px,transparent_6px_12px)]" />
        <motion.div className="absolute inset-x-0 top-0 bg-[var(--beam)] shadow-[0_0_12px_var(--glow)]" style={{ height }} />
        <motion.div className="absolute left-1/2 -translate-x-1/2 -translate-y-full" style={{ top: height }}>
          {/* Comet: a tail of light above a bright head. */}
          <div className="mx-auto h-16 w-[3px] rounded-full bg-gradient-to-b from-transparent to-[var(--beam)]" />
          <div className="mx-auto -mt-1.5 h-3 w-3 rounded-full bg-white shadow-[0_0_16px_6px_var(--glow),0_0_4px_var(--beam)]" />
        </motion.div>
      </div>

      {steps.map((step, i) => {
        const lit = i <= reached;
        const right = i % 2 === 1;
        return (
          <li key={step.title} className="relative grid grid-cols-[2.5rem_1fr] gap-4 pb-10 md:grid-cols-[1fr_4rem_1fr] md:gap-0 md:pb-14">
            <span
              className="relative z-10 col-start-1 row-start-1 mt-[1.5rem] flex h-4 w-4 items-center justify-center justify-self-center rounded-full border transition-all duration-500 md:col-start-2"
              style={{
                borderColor: lit ? 'var(--beam)' : 'var(--border)',
                background: lit ? 'var(--beam)' : 'var(--background)',
                boxShadow: lit ? '0 0 18px 4px var(--glow)' : 'none',
              }}
              aria-hidden="true"
            />
            <div
              className={`glow-card col-start-2 row-start-1 p-6 transition-all duration-700 sm:p-7 ${
                right ? 'md:col-start-3' : 'md:col-start-1 md:text-right'
              }`}
              style={{
                opacity: lit ? 1 : 0.45,
                transform: lit ? 'none' : `translateY(12px)`,
                borderColor: lit ? 'color-mix(in srgb, var(--beam) 55%, transparent)' : undefined,
              }}
            >
              <span className="font-display text-sm font-semibold tracking-[0.2em] text-accent-text">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 font-display text-xl font-semibold sm:text-2xl">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
