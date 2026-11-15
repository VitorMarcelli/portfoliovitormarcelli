'use client';

import { useState, type ReactNode } from 'react';

export interface FilterItem {
  key: string;
  category: string;
  featured: boolean;
  node: ReactNode;
}

interface ProjectFilterProps {
  items: FilterItem[];
  allLabel: string;
  filterLabel: string;
  moreTitle: string;
}

/** Category chips over the project list. Featured projects keep the large layout; the rest stay in the grid. */
export default function ProjectFilter({ items, allLabel, filterLabel, moreTitle }: ProjectFilterProps) {
  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
  const [active, setActive] = useState<string | null>(null);
  const visible = items.filter((i) => !active || i.category === active);
  const featured = visible.filter((i) => i.featured);
  const others = visible.filter((i) => !i.featured);

  return (
    <>
      {categories.length > 1 && (
        <div role="group" aria-label={filterLabel} className="mb-10 flex flex-wrap gap-2">
          {[null, ...categories].map((category) => {
            const selected = active === category;
            return (
              <button
                key={category ?? 'all'}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(category)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  selected
                    ? 'border-accent bg-accent text-accent-fg shadow-[0_8px_24px_-12px_var(--glow)]'
                    : 'border-border text-muted hover:border-accent/60 hover:text-foreground'
                }`}
              >
                {category ?? allLabel}
              </button>
            );
          })}
        </div>
      )}

      {featured.length > 0 && <div className="flex flex-col gap-8">{featured.map((i) => <div key={i.key}>{i.node}</div>)}</div>}

      {others.length > 0 && (
        <div className={featured.length > 0 ? 'mt-20' : ''}>
          {featured.length > 0 && <h3 className="font-display text-2xl font-semibold">{moreTitle}</h3>}
          <div className={`grid gap-6 md:grid-cols-2 ${featured.length > 0 ? 'mt-8' : ''}`}>
            {others.map((i) => (
              <div key={i.key} className="flex">
                {i.node}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
