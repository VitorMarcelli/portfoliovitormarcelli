import type { CSSProperties } from 'react';
import type { Faq } from '@/lib/types';

/** Native <details> accordion: works without JS, opens smoothly where the browser supports it. */
export default function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <details
          key={item.id}
          data-reveal
          style={{ '--reveal-delay': `${Math.min(i, 5) * 70}ms` } as CSSProperties}
          className="faq-item glow-card px-6 sm:px-8"
        >
          <summary className="flex items-center justify-between gap-6 py-5 font-display text-lg font-semibold sm:text-xl">
            {item.question}
            <span
              className="faq-plus flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-accent-text"
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </summary>
          <p className="pb-6 pr-2 text-lg leading-relaxed text-muted sm:pr-14">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
