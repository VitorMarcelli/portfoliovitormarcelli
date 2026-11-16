'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_KEY = 'vm_visitor';
const CAMPAIGN_KEY = 'vm_campaign';

/**
 * Client link tag (?c=joao): read once, kept for the rest of the visit so clicks are attributed too,
 * then removed from the address bar so it is not passed along when the page is shared.
 */
function campaign(): string | null {
  try {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get('c');
    if (fromUrl) {
      const clean = fromUrl.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
      if (clean) sessionStorage.setItem(CAMPAIGN_KEY, clean);
      url.searchParams.delete('c');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
    return sessionStorage.getItem(CAMPAIGN_KEY);
  } catch {
    return null;
  }
}

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
    campaign: campaign(),
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
