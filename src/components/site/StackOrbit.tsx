'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

/** Seconds each ring stays lit during the automatic tour. */
const TOUR_STEP = 3500;

interface Group {
  label: string;
  items: string[];
}

/** Ring radius as a percentage of the square: the innermost ring is 21%, each next one 5.6% wider. */
const radiusOf = (ring: number) => 21 + ring * 5.6;
/** Slow, alternating orbits: inner rings turn faster, like a real system. */
const durationOf = (ring: number) => 70 + ring * 22;

/**
 * Tools as a small solar system: the initials in the middle, one ring per group with its tools as
 * satellites. The legend beside it is the readable content (and what screen readers get); hovering or
 * tapping a group lights its ring and pauses it. Only the lit ring shows names (all at once overlap);
 * while nobody interacts, a tour lights one ring after another, only while the orbit is on screen.
 */
export default function StackOrbit({ groups, hint }: { groups: Group[]; hint: string }) {
  const [focus, setFocus] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (touched || !rootRef.current) return;
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (!entry.isIntersecting) return;
      setFocus((f) => f ?? 0);
      timer = window.setInterval(() => setFocus((f) => ((f ?? -1) + 1) % groups.length), TOUR_STEP);
    }, { threshold: 0.35 });
    observer.observe(rootRef.current);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [touched, groups.length]);

  const pick = (ring: number | null) => {
    setTouched(true);
    setFocus(ring);
  };

  return (
    <div ref={rootRef} className="grid items-center gap-10 lg:grid-cols-12">
      <div className="relative mx-auto aspect-square w-full max-w-[560px] lg:col-span-7" aria-hidden="true">
        {/* The sun. */}
        <div className="absolute left-1/2 top-1/2 flex h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_34%_30%,#cfe4ff_0%,#96c8ff_18%,#3b82f6_55%,#1e3a8a_100%)] font-display text-[clamp(1rem,3.4vw,1.6rem)] font-bold text-white shadow-[0_0_60px_10px_var(--glow)]">
          VM
        </div>

        {groups.map((group, ring) => {
          const r = radiusOf(ring);
          const lit = focus === ring;
          const dim = focus !== null && !lit;
          const style = {
            '--orbit-duration': `${durationOf(ring)}s`,
            '--orbit-direction': ring % 2 ? 'reverse' : 'normal',
          } as CSSProperties;
          return (
            <div key={group.label} className={`orbit-ring absolute inset-0 ${lit ? 'is-paused' : ''}`} style={style}>
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[border-color,opacity] duration-500"
                style={{
                  width: `${r * 2}%`,
                  height: `${r * 2}%`,
                  borderColor: lit ? 'var(--beam)' : 'var(--border)',
                  opacity: dim ? 0.35 : 1,
                }}
              />
              {group.items.map((item, j) => {
                const angle = (360 / group.items.length) * j + ring * 27;
                return (
                  <div key={item} className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
                    <div
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${50 + r}%` }}
                    >
                      <div style={{ transform: `rotate(${-angle}deg)` }}>
                        <div className="orbit-counter flex items-center gap-1.5">
                          <span
                            className="block h-2 w-2 shrink-0 rounded-full transition-all duration-500"
                            style={{
                              background: lit ? 'var(--beam)' : 'var(--star-core)',
                              boxShadow: lit ? '0 0 12px 2px var(--glow)' : 'none',
                              opacity: dim ? 0.35 : 0.9,
                            }}
                          />
                          <span
                            className="block whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-sm transition-all duration-500 sm:px-2 sm:text-[11px]"
                            style={{
                              borderColor: 'var(--beam)',
                              background: 'color-mix(in srgb, var(--background) 78%, transparent)',
                              color: 'var(--foreground)',
                              opacity: lit ? 1 : 0,
                              transform: lit ? 'none' : 'scale(0.8)',
                            }}
                          >
                            {item}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="lg:col-span-5">
        <p className="mb-4 text-sm text-muted">{hint}</p>
        <ul className="flex flex-col gap-2">
          {groups.map((group, ring) => {
            const lit = focus === ring;
            return (
              <li key={group.label}>
                <button
                  type="button"
                  // Mouse only on enter: a tap fires an emulated enter right before the click.
                  onPointerEnter={(e) => e.pointerType === 'mouse' && pick(ring)}
                  onFocus={() => pick(ring)}
                  onClick={() => pick(ring)}
                  aria-pressed={lit}
                  className={`w-full rounded-2xl border px-5 py-4 text-left transition-colors duration-300 ${
                    lit ? 'border-[var(--beam)] bg-accent/10' : 'border-border bg-surface hover:border-[var(--beam)]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: 'var(--beam)', boxShadow: lit ? '0 0 12px 2px var(--glow)' : 'none' }}
                      aria-hidden="true"
                    />
                    <span className="font-display text-lg font-semibold">{group.label}</span>
                    <span className="ml-auto text-xs tabular-nums text-muted">
                      {String(ring + 1).padStart(2, '0')}
                    </span>
                  </span>
                  <span className="mt-2 block pl-5 text-sm leading-relaxed text-muted">{group.items.join(' · ')}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
