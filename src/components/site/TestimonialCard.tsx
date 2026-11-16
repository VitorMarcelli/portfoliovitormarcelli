import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Testimonial } from '@/lib/types';

interface Props {
  testimonial: Testimonial;
  ratingLabel: string;
  /** Link to the related project case, when the card is shown outside of it. */
  project?: { href: string; title: string; label: string } | null;
  className?: string;
  style?: CSSProperties;
}

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <p className="flex gap-1" role="img" aria-label={label.replace('{n}', String(rating))}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={`rating-star ${n <= rating ? 'is-on' : ''}`}
          style={{ '--d': `${n * 90}ms` } as CSSProperties}
        >
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
        </svg>
      ))}
    </p>
  );
}

export default function TestimonialCard({ testimonial: t, ratingLabel, project, className = '', style }: Props) {
  const initials = t.author
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <figure data-reveal data-spotlight style={style} className={`glow-card flex flex-col p-7 sm:p-8 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="quote-mark select-none text-7xl" aria-hidden="true">
          “
        </span>
        {t.rating && <Stars rating={t.rating} label={ratingLabel} />}
      </div>
      <blockquote className="mt-1 flex-1 text-lg leading-relaxed">{t.quote}</blockquote>
      <figcaption className="mt-6 flex items-center gap-4 border-t border-border pt-5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-sm font-semibold text-accent-text shadow-[0_0_18px_-6px_var(--glow)]"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold">{t.author}</span>
          {(t.role || t.source) && (
            <span className="block text-sm text-muted">{[t.role, t.source].filter(Boolean).join(' · ')}</span>
          )}
          {project && (
            <Link href={project.href} className="mt-1 block text-sm text-accent-text underline-offset-4 hover:underline">
              {project.label}: {project.title}
            </Link>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
