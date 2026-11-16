'use client';

import { useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';

export type Expression = 'normal' | 'happy' | 'surprised' | 'sleep' | 'dizzy';

/** Every moving part is driven by a motion value holding an SVG transform string (no React re-render per frame). */
export interface FigureMotion {
  root: MotionValue<string>;
  shadow: MotionValue<string>;
  body: MotionValue<string>;
  head: MotionValue<string>;
  face: MotionValue<string>;
  pupils: MotionValue<string>;
  reflection: MotionValue<string>;
  legLeft: MotionValue<string>;
  legRight: MotionValue<string>;
  arm: MotionValue<string>;
  antenna: MotionValue<string>;
}

function useTransformAttr(mv: MotionValue<string>) {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = (v: string) => el.setAttribute('transform', v);
    set(mv.get());
    return mv.on('change', set);
  }, [mv]);
  return ref;
}

const OUTLINE = '#1b2550';
const SUIT = '#f5f8fe';
const SUIT_SHADE = '#d7e2f4';
const BLUE = '#3b82f6';
const BLUE_DARK = '#2856c8';
const LIGHT = '#5cc8ff';
const SKIN = '#d29a72';
const HAIR = '#2b1a12';
const INK = '#1b1430';

function Eyes({ expression, blinking }: { expression: Expression; blinking: boolean }) {
  const closed = blinking || expression === 'sleep';
  if (closed) {
    return (
      <g fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round">
        <path d="M47.2 58 Q51 60.4 54.8 58" />
        <path d="M65.2 58 Q69 60.4 72.8 58" />
      </g>
    );
  }
  if (expression === 'happy') {
    return (
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round">
        <path d="M47.2 59 Q51 54 54.8 59" />
        <path d="M65.2 59 Q69 54 72.8 59" />
      </g>
    );
  }
  if (expression === 'dizzy') {
    return (
      <g fill="none" stroke={INK} strokeWidth="1.4">
        <circle cx="51" cy="57.5" r="4" />
        <circle cx="51" cy="57.5" r="1.7" />
        <circle cx="69" cy="57.5" r="4" />
        <circle cx="69" cy="57.5" r="1.7" />
      </g>
    );
  }
  const big = expression === 'surprised';
  return (
    <g>
      <ellipse cx="51" cy="57.5" rx={big ? 4.4 : 3.7} ry={big ? 5.6 : 4.7} fill={INK} />
      <ellipse cx="69" cy="57.5" rx={big ? 4.4 : 3.7} ry={big ? 5.6 : 4.7} fill={INK} />
      <circle cx="52.4" cy="55.6" r="1.45" fill="#fff" />
      <circle cx="70.4" cy="55.6" r="1.45" fill="#fff" />
      <circle cx="50" cy="59.6" r="0.7" fill="#fff" opacity="0.7" />
      <circle cx="68" cy="59.6" r="0.7" fill="#fff" opacity="0.7" />
    </g>
  );
}

function Mouth({ expression }: { expression: Expression }) {
  switch (expression) {
    case 'happy':
      return (
        <g>
          <path d="M54.2 65.2 Q60 74 65.8 65.2 Z" fill="#7a2630" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          <path d="M57 69.6 Q60 72.4 63 69.6 Q60 68.4 57 69.6 Z" fill="#f07a86" />
        </g>
      );
    case 'surprised':
      return <ellipse cx="60" cy="67.5" rx="2.5" ry="3.1" fill="#7a2630" stroke={INK} strokeWidth="0.9" />;
    case 'sleep':
      return <ellipse cx="60" cy="67" rx="1.6" ry="1.9" fill="#7a2630" />;
    case 'dizzy':
      return <path d="M54.5 67.5 q1.4 -1.6 2.75 0 t2.75 0 t2.75 0 t2.75 0" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />;
    default:
      return (
        <g>
          <path d="M55.6 65.4 Q60 71.4 64.4 65.4 Q60 67.2 55.6 65.4 Z" fill="#7a2630" stroke={INK} strokeWidth="0.9" strokeLinejoin="round" />
          <path d="M58 68.4 Q60 69.9 62 68.4 Q60 67.7 58 68.4 Z" fill="#f07a86" />
        </g>
      );
  }
}

export default function AstronautFigure({
  motion,
  expression,
  blinking,
}: {
  motion: FigureMotion;
  expression: Expression;
  blinking: boolean;
}) {
  const root = useTransformAttr(motion.root);
  const shadow = useTransformAttr(motion.shadow);
  const body = useTransformAttr(motion.body);
  const head = useTransformAttr(motion.head);
  const face = useTransformAttr(motion.face);
  const pupils = useTransformAttr(motion.pupils);
  const reflection = useTransformAttr(motion.reflection);
  const legLeft = useTransformAttr(motion.legLeft);
  const legRight = useTransformAttr(motion.legRight);
  const arm = useTransformAttr(motion.arm);
  const antenna = useTransformAttr(motion.antenna);

  return (
    <svg viewBox="-12 -18 144 174" width="100%" height="100%" aria-hidden="true" overflow="visible">
      <defs>
        <radialGradient id="astro-helmet" cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.65" stopColor={SUIT} />
          <stop offset="1" stopColor={SUIT_SHADE} />
        </radialGradient>
        <linearGradient id="astro-suit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={SUIT_SHADE} />
        </linearGradient>
        <linearGradient id="astro-glass" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor={BLUE} stopOpacity="0.22" />
        </linearGradient>
        <radialGradient id="astro-glow">
          <stop offset="0" stopColor={LIGHT} stopOpacity="0.9" />
          <stop offset="1" stopColor={LIGHT} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="astro-shadow">
          <stop offset="0" stopColor="#1e3a8a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#1e3a8a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="astro-visor">
          <ellipse cx="60" cy="55" rx="28" ry="24" />
        </clipPath>
      </defs>

      {/* Soft shadow on the "ground": it shrinks as he floats up. */}
      <g ref={shadow}>
        <ellipse cx="0" cy="0" rx="26" ry="5" fill="url(#astro-shadow)" />
      </g>

      <g ref={root}>
        <g ref={body}>
          {/* Backpack */}
          <rect x="30" y="80" width="60" height="34" rx="12" fill={SUIT_SHADE} stroke={OUTLINE} strokeWidth="2.2" />

          {/* Legs dangle with inertia */}
          <g ref={legLeft}>
            <rect x="46" y="112" width="12.5" height="19" rx="6" fill="url(#astro-suit)" stroke={OUTLINE} strokeWidth="2.2" />
            <rect x="44.2" y="126.5" width="16" height="9.5" rx="4.75" fill={BLUE_DARK} stroke={OUTLINE} strokeWidth="2.2" />
          </g>
          <g ref={legRight}>
            <rect x="61.5" y="112" width="12.5" height="19" rx="6" fill="url(#astro-suit)" stroke={OUTLINE} strokeWidth="2.2" />
            <rect x="59.8" y="126.5" width="16" height="9.5" rx="4.75" fill={BLUE_DARK} stroke={OUTLINE} strokeWidth="2.2" />
          </g>

          {/* Torso */}
          <rect x="37" y="78" width="46" height="42" rx="17" fill="url(#astro-suit)" stroke={OUTLINE} strokeWidth="2.2" />
          <rect x="49" y="93" width="22" height="13" rx="3.5" fill={SUIT_SHADE} stroke={OUTLINE} strokeWidth="1.6" />
          <circle cx="54.5" cy="99.5" r="2.4" fill={LIGHT} className="mascot-pulse" />
          <rect x="59" y="97" width="8" height="2" rx="1" fill={BLUE} />
          <rect x="59" y="101" width="5" height="2" rx="1" fill={OUTLINE} opacity="0.5" />

          {/* Left arm (resting) */}
          <g transform="rotate(22 41 89)">
            <rect x="35.5" y="86" width="11" height="22" rx="5.5" fill="url(#astro-suit)" stroke={OUTLINE} strokeWidth="2.2" />
            <circle cx="41" cy="109" r="6.2" fill={BLUE} stroke={OUTLINE} strokeWidth="2.2" />
          </g>

          {/* Collar */}
          <ellipse cx="60" cy="82" rx="19" ry="5.5" fill={SUIT_SHADE} stroke={OUTLINE} strokeWidth="2.2" />

          <g ref={head}>
            {/* Antenna whips with the head movement */}
            <g ref={antenna}>
              <line x1="60" y1="13" x2="60" y2="1.5" stroke={OUTLINE} strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="60" cy="0" r="7" fill="url(#astro-glow)" className="mascot-pulse" />
              <circle cx="60" cy="0" r="3.3" fill={LIGHT} stroke={OUTLINE} strokeWidth="1.6" />
            </g>

            {/* Ear pods */}
            <rect x="15.5" y="41" width="10" height="20" rx="5" fill={SUIT_SHADE} stroke={OUTLINE} strokeWidth="2.2" />
            <rect x="94.5" y="41" width="10" height="20" rx="5" fill={SUIT_SHADE} stroke={OUTLINE} strokeWidth="2.2" />
            <circle cx="20.5" cy="51" r="2.6" fill={LIGHT} className="mascot-pulse" />
            <circle cx="99.5" cy="51" r="2.6" fill={LIGHT} className="mascot-pulse" />

            {/* Helmet */}
            <circle cx="60" cy="50" r="38" fill="url(#astro-helmet)" stroke={OUTLINE} strokeWidth="2.4" />
            <path d="M33 33 Q43 17 61 14.5" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity="0.95" />

            {/* Visor rim */}
            <ellipse cx="60" cy="55" rx="32" ry="28" fill={BLUE} stroke={OUTLINE} strokeWidth="2.2" />
            <ellipse cx="60" cy="55" rx="32" ry="28" fill="none" stroke="#9cc4ff" strokeWidth="1.2" opacity="0.6" strokeDasharray="30 200" strokeDashoffset="-8" />

            {/* Inside the glass: face moves more than the helmet = depth */}
            <g clipPath="url(#astro-visor)">
              <rect x="28" y="28" width="64" height="56" fill="#13234a" />
              <g ref={face}>
                <g transform="translate(60 58) scale(1.13) translate(-60 -58)">
                <ellipse cx="60" cy="59" rx="23.5" ry="21.5" fill={SKIN} />
                <path
                  d="M36 53 Q37 36 60 34.5 Q83 36 84 53 Q79 45 72.5 47 Q68 41.5 61.5 45 Q55.5 41 49.5 46.5 Q42 44 36 53 Z"
                  fill={HAIR}
                />
                <ellipse cx="45.5" cy="64.5" rx="3.6" ry="2.2" fill="#ef7d82" opacity="0.55" />
                <ellipse cx="74.5" cy="64.5" rx="3.6" ry="2.2" fill="#ef7d82" opacity="0.55" />
                <g ref={pupils}>
                  <Eyes expression={expression} blinking={blinking} />
                </g>
                <Mouth expression={expression} />
                </g>
              </g>
              <ellipse cx="60" cy="55" rx="28" ry="24" fill="url(#astro-glass)" />
              <g ref={reflection}>
                <path d="M38 49 Q39.5 37.5 50 33" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                <circle cx="40.2" cy="55" r="1.4" fill="#fff" opacity="0.7" />
                <path d="M76 74 Q82.5 69.5 84.5 62" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
              </g>
            </g>
            <ellipse cx="60" cy="55" rx="28" ry="24" fill="none" stroke={OUTLINE} strokeWidth="1.6" />

            {expression === 'sleep' && (
              <g fill={BLUE} fontFamily="var(--font-display), system-ui" fontWeight="700">
                <text x="88" y="16" fontSize="11" className="mascot-z">z</text>
                <text x="96" y="6" fontSize="8" className="mascot-z" style={{ animationDelay: '0.9s' }}>z</text>
              </g>
            )}
            {expression === 'dizzy' && (
              <g className="mascot-orbit" fill="#fbbf24" stroke={OUTLINE} strokeWidth="0.8">
                <path d="M60 2 l2 4 4.4 .6 -3.2 3 .8 4.4 -4 -2.1 -4 2.1 .8 -4.4 -3.2 -3 4.4 -.6 z" transform="translate(-30 4) scale(.7)" />
                <path d="M60 2 l2 4 4.4 .6 -3.2 3 .8 4.4 -4 -2.1 -4 2.1 .8 -4.4 -3.2 -3 4.4 -.6 z" transform="translate(48 -6) scale(.6)" />
                <path d="M60 2 l2 4 4.4 .6 -3.2 3 .8 4.4 -4 -2.1 -4 2.1 .8 -4.4 -3.2 -3 4.4 -.6 z" transform="translate(20 -14) scale(.5)" />
              </g>
            )}
          </g>

          {/* Right arm, drawn last so the wave goes over the helmet edge */}
          <g ref={arm}>
            <rect x="73.5" y="86" width="11" height="22" rx="5.5" fill="url(#astro-suit)" stroke={OUTLINE} strokeWidth="2.2" />
            <circle cx="79" cy="109" r="6.2" fill={BLUE} stroke={OUTLINE} strokeWidth="2.2" />
          </g>
        </g>
      </g>
    </svg>
  );
}
