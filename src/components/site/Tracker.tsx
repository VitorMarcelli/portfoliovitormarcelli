'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_KEY = 'vm_visitor';

function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

export function track(type: 'pageview' | 'click', label?: string) {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify({
    type,
    label,
    path: window.location.pathname,
    referrer: document.referrer || null,
    visitorId: visitorId(),
  });
  const blob = new Blob([payload], { type: 'application/json' });
  if (!navigator.sendBeacon?.('/api/track', blob)) {
    fetch('/api/track', { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
  }
}

/** Records one page view per route change. No cookies; a random id in localStorage counts unique visitors. */
export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    track('pageview');
  }, [pathname]);

  return null;
}
