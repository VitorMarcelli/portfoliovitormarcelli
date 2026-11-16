import type { CSSProperties } from 'react';

/** Seconds the signal takes to cross one link; the whole cycle (see .flow-* in globals.css) lasts 3.5 s. */
const STEP = 0.7;

/**
 * "How it works" diagram: input → processing → output. A point of light runs through the links and
 * each step lights up as it arrives. Vertical in narrow containers, horizontal from 42rem (container query).
 */
export default function ProjectFlow({ steps, label }: { steps: string[]; label: string }) {
  const list = steps.slice(0, 5);
  if (list.length < 2) return null;

  return (
    <div className="@container">
      <ol aria-label={label} className="flex flex-col @2xl:flex-row @2xl:items-stretch">
        {list.map((step, i) => (
          <li key={`${i}-${step}`} className="contents">
            {i > 0 && (
              <span aria-hidden="true" className="flow-link" style={{ '--d': `${(i - 1) * STEP}s` } as CSSProperties}>
                <span className="flow-dot" />
              </span>
            )}
            <span className="flow-node" style={{ '--d': `${i * STEP}s` } as CSSProperties}>
              <span className="flow-index">{String(i + 1).padStart(2, '0')}</span>
              <span>{step}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
