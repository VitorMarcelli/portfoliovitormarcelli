'use client';

import { useEffect } from 'react';

/**
 * One pointer listener for the whole page: elements with [data-spotlight] (cards) or
 * [data-mouse-light] (the footer name) get --mx/--my with the mouse position inside them.
 * Mouse only; touch screens have their own animations instead.
 */
export default function Spotlight() {
  useEffect(() => {
    let frame = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-spotlight], [data-mouse-light]');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
