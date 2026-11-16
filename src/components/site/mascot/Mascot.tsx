'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  animate,
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import type { Dictionary } from '@/i18n/dictionaries';
import { localePath } from '@/i18n/dictionaries';
import type { Faq, Locale } from '@/lib/types';
import { track } from '../Tracker';
import AstronautFigure, { type Expression, type FigureMotion } from './AstronautFigure';

interface Props {
  locale: Locale;
  labels: Dictionary['mascot'];
  faqs: Faq[];
  whatsappHref: string | null;
}

type TipKey = keyof Dictionary['mascot']['tips'];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const SLEEP_AFTER = 28000;
const TIP_SECTIONS: TipKey[] = ['projetos', 'perguntas', 'contato', 'interesse'];
const MAX_TIPS = 2;

function sessionFlag(key: string, write = false): boolean {
  try {
    if (write) sessionStorage.setItem(key, '1');
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

/**
 * Mini astronaut that floats in the corner and answers frequent questions.
 * Motion is layered springs: helmet, face, pupils and visor reflection follow the pointer at different
 * depths (parallax), while legs and antenna lag behind like inertia in zero gravity.
 */
export default function Mascot({ locale, labels, faqs, whatsappHref }: Props) {
  const pathname = usePathname().replace(/^\/pt(?=\/|$)/, '') || '/';
  const home = localePath(locale);
  const onHome = pathname === home;
  const onProject = /\/projetos\/[^/]+$/.test(pathname);
  const reduce = useReducedMotion() ?? false;
  const panelId = useId();

  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [expression, setExpression] = useState<Expression>('normal');
  const [blinking, setBlinking] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [answer, setAnswer] = useState<Faq | null>(null);
  const [typing, setTyping] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const state = useRef({ lastPointer: -1e9, lastActive: 0, sleeping: false, open: false, clicks: 0, clickAt: 0, busy: false });
  const exprTimer = useRef<number | undefined>(undefined);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  /* ───────── Motion values ───────── */
  const lookX = useMotionValue(0);
  const lookY = useMotionValue(0);
  const spring = { stiffness: 85, damping: 13, mass: 0.75 };
  const sx = useSpring(lookX, spring);
  const sy = useSpring(lookY, spring);
  const floatY = useMotionValue(0);
  const floatRot = useMotionValue(0);
  const hop = useMotionValue(0);
  const spin = useMotionValue(0);
  const wave = useMotionValue(0);

  const vx = useVelocity(sx);
  const vy = useVelocity(sy);
  const vFloat = useVelocity(floatY);
  const lean = useSpring(useTransform(sx, (v) => v * 4), { stiffness: 34, damping: 9 });
  const legTarget = useTransform([vx, vFloat], ([a, b]: number[]) => clamp(-a * 9 + b * 0.55, -20, 20));
  const legL = useSpring(legTarget, { stiffness: 46, damping: 4.5, mass: 0.7 });
  const legR = useSpring(useTransform(legTarget, (v) => v * 0.8), { stiffness: 40, damping: 4, mass: 0.8 });
  const antennaTarget = useTransform([vx, vy, vFloat], ([a, b, c]: number[]) => clamp(-a * 16 + b * 4 + c * 0.9, -30, 30));
  const antennaRot = useSpring(antennaTarget, { stiffness: 150, damping: 5, mass: 0.5 });

  const motionValues: FigureMotion = {
    root: useTransform([floatY, hop, floatRot, spin], ([y, h, r, s]: number[]) => `translate(0 ${y + h}) rotate(${r + s} 60 78)`),
    shadow: useTransform([floatY, hop], ([y, h]: number[]) => {
      const lift = -(y + h);
      return `translate(60 ${146}) scale(${clamp(1 - lift / 34, 0.55, 1.08)} 1)`;
    }),
    body: useTransform(lean, (r) => `rotate(${r} 60 122)`),
    head: useTransform([sx, sy], ([x, y]: number[]) => `translate(${x * 3.4} ${y * 2.6}) rotate(${x * 7} 60 84)`),
    face: useTransform([sx, sy], ([x, y]: number[]) => `translate(${x * 6.2} ${y * 4.8})`),
    pupils: useTransform([sx, sy], ([x, y]: number[]) => `translate(${x * 1.4} ${y * 1.2})`),
    reflection: useTransform([sx, sy], ([x, y]: number[]) => `translate(${x * -3.6} ${y * -2.4})`),
    legLeft: useTransform(legL, (r) => `rotate(${r} 52 114)`),
    legRight: useTransform(legR, (r) => `rotate(${r} 68 114)`),
    arm: useTransform(wave, (w) => `rotate(${-22 + w} 79 89)`),
    antenna: useTransform(antennaRot, (r) => `rotate(${r} 60 13)`),
  };

  // Idle float: slow sine, slower and lower while asleep.
  useAnimationFrame((t) => {
    const s = state.current.sleeping;
    const amp = reduce ? 2 : s ? 3 : 5.5;
    const speed = s ? 1500 : 950;
    floatY.set(Math.sin(t / speed) * amp);
    floatRot.set(Math.sin(t / (speed * 1.45)) * (reduce ? 0.6 : 1.8));
  });

  /* ───────── Expressions ───────── */
  const express = useCallback((e: Expression, ms?: number) => {
    window.clearTimeout(exprTimer.current);
    setExpression(e);
    state.current.busy = Boolean(ms);
    if (ms) {
      exprTimer.current = window.setTimeout(() => {
        state.current.busy = false;
        setExpression(state.current.sleeping ? 'sleep' : 'normal');
      }, ms);
    }
  }, []);

  const wake = useCallback(() => {
    state.current.lastActive = performance.now();
    if (state.current.sleeping) {
      state.current.sleeping = false;
      express('surprised', 750);
    }
  }, [express]);

  /* ───────── Ready after the welcome screen (same rule as the dock) ───────── */
  useEffect(() => {
    if (!document.querySelector('.welcome-loader')) {
      const frame = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(frame);
    }
    const onDone = () => setReady(true);
    window.addEventListener('welcome:done', onDone, { once: true });
    const timer = setTimeout(onDone, 8000);
    return () => {
      window.removeEventListener('welcome:done', onDone);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach(window.clearTimeout);
      window.clearTimeout(exprTimer.current);
    };
  }, []);

  /* ───────── Look at the mouse; wander on touch screens; look along the scroll ───────── */
  useEffect(() => {
    state.current.lastActive = performance.now();
    let lastScroll = window.scrollY;
    let scrollTimer: number | undefined;

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || state.current.open) return;
      const el = buttonRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.35);
      // Soft saturation: close movements matter, far ones top out smoothly.
      lookX.set(dx / (Math.abs(dx) + 220));
      lookY.set(dy / (Math.abs(dy) + 200));
      state.current.lastPointer = e.timeStamp;
      wake();
    };
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScroll;
      lastScroll = y;
      if (Math.abs(delta) < 4 || state.current.open) return;
      wake();
      if (performance.now() - state.current.lastPointer < 1500) return;
      lookY.set(delta > 0 ? 0.75 : -0.75);
      lookX.set(-0.15);
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => lookY.set(0), 600);
    };
    const onTouch = () => wake();

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });

    // When nobody is steering him, he looks around on his own.
    const wander = window.setInterval(() => {
      const now = performance.now();
      if (state.current.open || state.current.sleeping || now - state.current.lastPointer < 2600) return;
      if (Math.random() < 0.25) {
        lookX.set(0);
        lookY.set(0);
      } else {
        lookX.set(-0.95 + Math.random() * 1.35);
        lookY.set(-0.85 + Math.random() * 1.2);
      }
    }, 2900);

    // Falls asleep when the page is left alone.
    const sleepCheck = window.setInterval(() => {
      if (state.current.open || state.current.sleeping || state.current.busy) return;
      if (performance.now() - state.current.lastActive > SLEEP_AFTER) {
        state.current.sleeping = true;
        lookX.set(0);
        lookY.set(0.55);
        setExpression('sleep');
      }
    }, 2000);

    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouch);
      window.clearInterval(wander);
      window.clearInterval(sleepCheck);
      window.clearTimeout(scrollTimer);
    };
  }, [lookX, lookY, wake]);

  /* ───────── Natural blinking (sometimes twice) ───────── */
  useEffect(() => {
    let id: number;
    const schedule = () => {
      id = window.setTimeout(() => {
        if (!state.current.sleeping) {
          setBlinking(true);
          window.setTimeout(() => setBlinking(false), 120);
          if (Math.random() < 0.18) {
            window.setTimeout(() => setBlinking(true), 260);
            window.setTimeout(() => setBlinking(false), 380);
          }
        }
        schedule();
      }, 2200 + Math.random() * 3600);
    };
    schedule();
    return () => window.clearTimeout(id);
  }, []);

  /* ───────── Hide while typing on a phone (he would cover the field) ───────── */
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)');
    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (coarse.matches && t?.matches('input, textarea, select') && !panelRef.current?.contains(t)) setTyping(true);
    };
    const onBlur = () => setTyping(false);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, []);

  /* ───────── Speech bubbles: one greeting, then a tip per section (few per visit) ───────── */
  const say = useCallback(
    (text: string, ms = 6000) => {
      setBubble(text);
      later(() => setBubble((b) => (b === text ? null : b)), ms);
    },
    [later],
  );

  useEffect(() => {
    if (!ready || sessionFlag('vm_mascot_greet')) return;
    const id = window.setTimeout(() => {
      if (state.current.open) return;
      sessionFlag('vm_mascot_greet', true);
      const mouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      say(mouse ? labels.greetingMouse : labels.greetingTouch);
      express('happy', 1200);
      if (!reduce) animate(wave, [0, -120, -95, -125, -95, 0], { duration: 1.7, ease: 'easeInOut' });
    }, 4200);
    return () => window.clearTimeout(id);
  }, [ready, labels, say, express, reduce, wave]);

  useEffect(() => {
    if (!ready) return;
    const shown = (): string[] => {
      try {
        return JSON.parse(sessionStorage.getItem('vm_mascot_tips') || '[]');
      } catch {
        return [];
      }
    };
    const dwell = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = entry.target.id as TipKey;
          window.clearTimeout(dwell.get(key));
          if (!entry.isIntersecting) continue;
          dwell.set(
            key,
            window.setTimeout(() => {
              const done = shown();
              if (state.current.open || done.includes(key) || done.length >= MAX_TIPS) return;
              try {
                sessionStorage.setItem('vm_mascot_tips', JSON.stringify([...done, key]));
              } catch {}
              say(labels.tips[key], 6500);
              express('happy', 900);
            }, 4500),
          );
        }
      },
      { threshold: 0.35 },
    );
    TIP_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      observer.disconnect();
      dwell.forEach((t) => window.clearTimeout(t));
    };
  }, [ready, pathname, labels, say, express]);

  /* ───────── Panel ───────── */
  const setPanel = useCallback(
    (next: boolean) => {
      state.current.open = next;
      setOpen(next);
      setBubble(null);
      if (next) {
        setAnswer(null);
        lookX.set(-0.3);
        lookY.set(-0.9);
        express('happy', 900);
        track('click', 'mascot_open');
      } else {
        lookY.set(0);
        buttonRef.current?.focus({ preventScroll: true });
      }
    },
    [express, lookX, lookY],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(false);
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) setPanel(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('button, a')?.focus({ preventScroll: true }));
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
      cancelAnimationFrame(frame);
    };
  }, [open, setPanel]);

  function onClick() {
    wake();
    const s = state.current;
    const now = performance.now();
    s.clicks = now - s.clickAt < 1500 ? s.clicks + 1 : 1;
    s.clickAt = now;
    if (s.clicks >= 4) {
      s.clicks = 0;
      if (open) setPanel(false);
      express('dizzy', 1700);
      say(labels.dizzy, 2200);
      if (!reduce) animate(spin, [0, 360], { duration: 0.9, ease: [0.3, 0, 0.2, 1] }).then(() => spin.jump(0));
      return;
    }
    if (!reduce) animate(hop, [0, -11, 0], { duration: 0.55, ease: 'easeOut' });
    setPanel(!open);
  }

  function onEnter(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse' || open || state.current.busy) return;
    express('happy', 1000);
    if (!reduce) animate(wave, [0, -120, -95, -125, 0], { duration: 1.3, ease: 'easeInOut' });
  }

  function chooseFaq(faq: Faq) {
    setAnswer(faq);
    track('click', 'mascot_faq');
  }

  const contactHref = onProject ? '#interesse' : onHome ? '#contato' : `${home}#contato`;
  const projectsHref = onHome ? '#projetos' : `${home}#projetos`;
  const visible = ready && !typing;

  return (
    <div
      className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+76px)] right-1 z-40 flex flex-col items-end md:bottom-5 md:right-5"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s', visibility: visible ? 'visible' : 'hidden' }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={labels.title}
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{ transformOrigin: 'bottom right' }}
            className="pointer-events-auto mb-2 mr-1 flex max-h-[min(70vh,560px)] w-[min(calc(100vw-1.5rem),360px)] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_86%,transparent)] shadow-[0_24px_70px_-20px_var(--glow)] backdrop-blur-xl backdrop-saturate-150"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 pb-3.5 pt-4">
              <div>
                <p className="font-display text-lg font-semibold">{labels.title}</p>
                <p className="text-sm text-muted">{labels.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setPanel(false)}
                aria-label={labels.close}
                className="-mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-[var(--surface-2)] hover:text-foreground"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain px-3 py-3">
              <AnimatePresence mode="wait" initial={false}>
                {answer ? (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 18 }}
                    transition={{ duration: 0.22 }}
                    className="px-2"
                  >
                    <button
                      type="button"
                      onClick={() => setAnswer(null)}
                      className="text-sm text-accent-text underline-offset-4 hover:underline"
                    >
                      ← {labels.back}
                    </button>
                    <p className="mt-3 font-display font-semibold">{answer.question}</p>
                    <p className="mt-2 leading-relaxed text-muted">{answer.answer}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.22 }}
                  >
                    {onProject && (
                      <a
                        href="#interesse"
                        onClick={() => setPanel(false)}
                        className="mb-2 flex items-center gap-3 rounded-2xl bg-accent/10 px-3 py-3 font-medium text-accent-text transition-colors hover:bg-accent/15"
                      >
                        <span aria-hidden="true">✦</span>
                        {labels.demo}
                      </a>
                    )}
                    {faqs.length > 0 && (
                      <>
                        <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wider text-muted">{labels.faqTitle}</p>
                        <ul>
                          {faqs.map((faq) => (
                            <li key={faq.id}>
                              <button
                                type="button"
                                onClick={() => chooseFaq(faq)}
                                className="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-2)]"
                              >
                                <span>{faq.question}</span>
                                <span className="text-muted" aria-hidden="true">›</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid gap-2 border-t border-[var(--border)] p-3">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('click', 'whatsapp_mascot')}
                  className="flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 font-medium text-accent-fg shadow-[0_10px_30px_-12px_var(--glow)] transition-opacity hover:opacity-90"
                >
                  {labels.whatsapp}
                </a>
              )}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={contactHref}
                  onClick={() => setPanel(false)}
                  className="rounded-full border border-[var(--border)] px-3 py-2 text-center text-sm font-medium transition-colors hover:border-accent hover:text-accent-text"
                >
                  {labels.message}
                </a>
                <a
                  href={projectsHref}
                  onClick={() => setPanel(false)}
                  className="rounded-full border border-[var(--border)] px-3 py-2 text-center text-sm font-medium transition-colors hover:border-accent hover:text-accent-text"
                >
                  {labels.projects}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bubble && !open && (
          <motion.button
            type="button"
            key={bubble}
            onClick={() => setPanel(true)}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            style={{ transformOrigin: 'bottom right' }}
            className="pointer-events-auto relative mb-1 mr-3 max-w-[15rem] rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] px-3.5 py-2 text-left text-sm shadow-[0_14px_40px_-14px_var(--glow)] backdrop-blur-xl"
          >
            {bubble}
            <span
              aria-hidden="true"
              className="absolute -bottom-[6px] right-8 h-3 w-3 rotate-45 border-b border-r border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)]"
            />
          </motion.button>
        )}
      </AnimatePresence>

      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onPointerEnter={onEnter}
        aria-label={open ? labels.close : labels.open}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        title={open ? undefined : labels.open}
        className="pointer-events-auto block h-[100px] w-[82px] cursor-pointer touch-manipulation select-none rounded-full outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-[var(--accent)] md:h-[140px] md:w-[116px]"
      >
        <AstronautFigure motion={motionValues} expression={expression} blinking={blinking} />
      </button>
    </div>
  );
}
