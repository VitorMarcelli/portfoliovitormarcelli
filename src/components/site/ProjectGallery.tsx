'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

interface GalleryProps {
  title: string;
  images: { url: string; caption: string | null }[];
  labels: { open: string; close: string; prev: string; next: string };
}

/** Screenshot grid with a keyboard-friendly lightbox (Esc closes, arrows navigate). */
export default function ProjectGallery({ title, images, labels }: GalleryProps) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = previous;
    };
  }, [open, close, step]);

  if (images.length === 0) return null;
  const current = open === null ? null : images[open];

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {images.map((img, i) => (
          <li key={img.url} data-reveal style={{ '--reveal-delay': `${(i % 2) * 120}ms` } as React.CSSProperties}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`${labels.open}: ${img.caption ?? title} (${i + 1}/${images.length})`}
              className="glow-card group block w-full overflow-hidden p-2 text-left"
            >
              <span className="relative block aspect-[16/10] overflow-hidden rounded-lg bg-surface-2">
                <Image
                  src={img.url}
                  alt={img.caption ?? `${title} ${i + 1}`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </span>
              {img.caption && <span className="block px-2 pb-1 pt-3 text-sm text-muted">{img.caption}</span>}
            </button>
          </li>
        ))}
      </ul>

      {current && open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption ?? title}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(3,6,15,0.88)] p-4 sm:p-10"
          onClick={close}
        >
          <figure className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border">
              <Image src={current.url} alt={current.caption ?? title} fill sizes="100vw" className="object-contain" priority />
            </div>
            <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm text-white/80">
              <span>{current.caption}</span>
              <span className="tabular-nums">
                {open + 1}/{images.length}
              </span>
            </figcaption>
            <div className="absolute -top-12 right-0 flex gap-2">
              {images.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label={labels.prev} className="rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/20">
                    ←
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label={labels.next} className="rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/20">
                    →
                  </button>
                </>
              )}
              <button type="button" onClick={close} aria-label={labels.close} className="rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/20" autoFocus>
                ✕
              </button>
            </div>
          </figure>
        </div>
      )}
    </>
  );
}
