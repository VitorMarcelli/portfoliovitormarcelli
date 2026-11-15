'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';

/**
 * Re-applies the saved (or system) theme after every client navigation.
 * Switching language re-renders the root <html>, which drops the class set by ThemeScript.
 * Layout effect, so it runs before the browser paints the new page (no light/dark flash).
 */
export default function ThemeKeeper() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', dark);
    } catch {
      // storage unavailable: keep whatever is applied
    }
  }, [pathname]);

  return null;
}
