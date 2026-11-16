'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';

export interface SkyStar {
  slug: string;
  title: string;
  category: string;
  featured: boolean;
  live: boolean;
}

interface ProjectSkyProps {
  stars: SkyStar[];
  /** One rendered case card per star, same order. */
  articles: ReactNode[];
  hint: string;
  label: string;
}

const SIZE = 1000;
/** Smallest camera window; a lone star is framed with this much sky around it. */
const MIN_SPAN = 540;
/** Room the names need beside the stars (they wrap at about 18 characters). */
const LABEL_PAD = 200;

/** Splits a name into lines of about 18 characters, so labels stay compact inside the frame. */
function wrapLabel(text: string, max = 18) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}
const OVERVIEW = `0 0 ${SIZE} ${SIZE}`;
/**
 * Where each category's constellation sits in the sky (in a 1000 × 1000 box): a hexagon around the
 * center, 330 apart, so clusters (radius up to 130) never overlap. A seventh category takes the middle.
 */
const CENTERS: [number, number][] = [
  [335, 214],
  [665, 214],
  [830, 500],
  [665, 786],
  [335, 786],
  [170, 500],
  [500, 500],
];

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PlacedStar extends SkyStar {
  x: number;
  y: number;
  r: number;
  index: number;
}

interface Cluster {
  name: string;
  stars: PlacedStar[];
  labelX: number;
  labelY: number;
}

/** Deterministic layout: same projects, same sky, on the server and in every browser. */
function layout(stars: SkyStar[]) {
  const names = Array.from(new Set(stars.map((s) => s.category || '·')));
  const clusters: Cluster[] = names.map((name, k) => {
    const [cx, cy] = CENTERS[k % CENTERS.length];
    const members = stars
      .map((s, index) => ({ s, index }))
      .filter(({ s }) => (s.category || '·') === name);
    const n = members.length;
    const start = hash(name) * Math.PI * 2;
    const placed = members.map(({ s, index }, j) => {
      const angle = start + (j * Math.PI * 2 * 0.78) / Math.max(n, 2);
      const radius = n === 1 ? 0 : 78 + hash(s.slug) * 52;
      return {
        ...s,
        index,
        x: Math.round(cx + Math.cos(angle) * radius),
        y: Math.round(cy + Math.sin(angle) * radius),
        r: s.featured ? 9 : 6.5,
      };
    });
    const top = Math.min(...placed.map((p) => p.y));
    return { name, stars: placed, labelX: cx, labelY: top - 46 };
  });
  const all = clusters.flatMap((c) => c.stars).sort((a, b) => a.index - b.index);

  const random = mulberry32(7);
  const dust = Array.from({ length: 150 }, (_, i) => ({
    x: Math.round(-150 + random() * 1300),
    y: Math.round(-150 + random() * 1300),
    r: 0.6 + random() * 1.4,
    d: `${(random() * 4).toFixed(2)}s`,
    key: i,
  }));
  return { clusters, all, dust };
}

/**
 * Projects as a night sky: each category is a constellation and each project a star. While the cases
 * scroll by, the "camera" (the SVG viewBox) travels to the star of the case in the middle of the screen.
 */
export default function ProjectSky({ stars, articles, hint, label }: ProjectSkyProps) {
  const { clusters, all, dust } = useMemo(() => layout(stars), [stars]);
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const desktop = window.matchMedia('(min-width: 1024px)');
    const update = () => {
      frame = 0;
      const items = listRef.current?.querySelectorAll<HTMLElement>('[data-star-article]');
      if (!items?.length) return;
      // On phones the sky covers the top of the screen, so the reading line sits lower.
      const line = window.innerHeight * (desktop.matches ? 0.5 : 0.66);
      let next: string | null = null;
      const first = items[0].getBoundingClientRect();
      if (first.top > line) next = null;
      else {
        items.forEach((el) => {
          if (el.getBoundingClientRect().top <= line) next = el.dataset.starArticle ?? null;
        });
      }
      setActive(next);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const current = all.find((s) => s.slug === active) ?? null;
  // The camera frames the whole constellation being visited (stars, names and its title), not one star.
  const currentCluster = current ? clusters.find((c) => c.stars.some((s) => s.slug === current.slug)) ?? null : null;
  let viewBox = OVERVIEW;
  if (currentCluster) {
    const xs = currentCluster.stars.map((s) => s.x);
    const ys = currentCluster.stars.map((s) => s.y);
    const minX = Math.min(...xs) - LABEL_PAD;
    const maxX = Math.max(...xs) + LABEL_PAD;
    const minY = Math.min(currentCluster.labelY - 40, ...ys.map((y) => y - 60));
    const maxY = Math.max(...ys) + 90;
    const span = Math.max(MIN_SPAN, maxX - minX, maxY - minY);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    viewBox = `${Math.round(cx - span / 2)} ${Math.round(cy - span / 2)} ${Math.round(span)} ${Math.round(span)}`;
  }

  function travel(slug: string) {
    const target = document.getElementById(`projeto-${slug}`);
    if (!target) return;
    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    target.scrollIntoView({ behavior: 'smooth', block: desktop ? 'center' : 'start' });
  }

  const onStarKey = (e: KeyboardEvent, slug: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      travel(slug);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
      {/* The sky: sticky "telescope" window. */}
      <div className="sticky top-2 z-10 h-[36vh] lg:top-[10vh] lg:col-span-6 lg:h-[80vh]">
        <div className="relative h-full overflow-hidden rounded-[28px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_82%,transparent)] shadow-[0_20px_60px_-30px_var(--glow)] backdrop-blur-md">
          <motion.svg
            role="img"
            aria-label={label}
            viewBox={OVERVIEW}
            initial={false}
            animate={{ viewBox }}
            transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1] }}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <radialGradient id="sky-star-glow">
                <stop offset="0%" stopColor="var(--beam)" stopOpacity="0.85" />
                <stop offset="40%" stopColor="var(--accent)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </radialGradient>
            </defs>

            {dust.map((d) => (
              <circle
                key={d.key}
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill="var(--star-faint)"
                className="sky-twinkle"
                style={{ '--d': d.d } as CSSProperties}
              />
            ))}

            {/* Faint path between constellations, like a route through the sky. */}
            <polyline
              points={clusters.map((c) => `${c.stars[0].x},${c.stars[0].y}`).join(' ')}
              fill="none"
              stroke="var(--star-faint)"
              strokeWidth={1}
              strokeDasharray="2 10"
              opacity={0.35}
            />

            {clusters.map((cluster) => {
              const lit = cluster.stars.some((s) => s.slug === active);
              const dim = active !== null && !lit;
              return (
                <g key={cluster.name} style={{ transition: 'opacity 0.8s' }} opacity={dim ? 0.4 : 1}>
                  {cluster.stars.length > 1 && (
                    <motion.polyline
                      points={cluster.stars.map((s) => `${s.x},${s.y}`).join(' ')}
                      fill="none"
                      stroke="var(--beam)"
                      strokeWidth={lit ? 1.6 : 1}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.6, ease: 'easeInOut' }}
                      style={{ opacity: lit ? 0.75 : 0.3, transition: 'opacity 0.8s' }}
                    />
                  )}
                  <text
                    x={cluster.labelX}
                    y={cluster.labelY}
                    textAnchor="middle"
                    fill="var(--accent-text)"
                    fontSize={17}
                    letterSpacing={4}
                    style={{ textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}
                    opacity={lit ? 0.95 : 0.6}
                  >
                    {cluster.name}
                  </text>

                  {cluster.stars.map((star) => {
                    const isActive = star.slug === active;
                    // Names point outward from the constellation, so they never cross its lines.
                    const anchorEnd = star.x < cluster.labelX - 5;
                    const fontSize = isActive ? 22 : 18;
                    const lines = wrapLabel(star.title.split(',')[0]);
                    const lineHeight = fontSize * 1.15;
                    const labelX = anchorEnd ? -(star.r + 12) : star.r + 12;
                    return (
                      <g
                        key={star.slug}
                        transform={`translate(${star.x} ${star.y})`}
                        role="link"
                        tabIndex={0}
                        aria-label={star.title}
                        onClick={() => travel(star.slug)}
                        onKeyDown={(e) => onStarKey(e, star.slug)}
                        className="cursor-pointer outline-none [&:focus-visible>circle:last-of-type]:stroke-[var(--focus)]"
                      >
                        <circle r={30} fill="transparent" />
                        <circle
                          r={star.r * (isActive ? 7 : 4.5)}
                          fill="url(#sky-star-glow)"
                          style={{ transition: 'r 0.8s' }}
                          opacity={isActive ? 1 : 0.7}
                        />
                        {(isActive || star.live) && (
                          <circle r={star.r * 1.6} fill="none" stroke="var(--beam)" strokeWidth={1.2} className="star-ping" />
                        )}
                        <circle r={isActive ? star.r * 1.25 : star.r} fill="var(--star-core)" stroke="transparent" strokeWidth={3} />
                        <text
                          x={labelX}
                          y={6 - ((lines.length - 1) * lineHeight) / 2}
                          textAnchor={anchorEnd ? 'end' : 'start'}
                          fill="var(--foreground)"
                          fontSize={fontSize}
                          fontWeight={isActive ? 600 : 400}
                          // Names only in the constellation being visited: with many stars, every
                          // label at once turns into overlapping text.
                          opacity={isActive ? 1 : lit ? 0.75 : 0}
                          style={{ transition: 'all 0.6s', fontFamily: 'var(--font-display)' }}
                        >
                          {/* Short name in the sky ("Giro, PDV para adegas" → "Giro"), wrapped; the card has the full title. */}
                          {lines.map((line, i) => (
                            <tspan key={i} x={labelX} dy={i === 0 ? 0 : lineHeight}>
                              {line}
                            </tspan>
                          ))}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </motion.svg>

          {/* Caption of the telescope: where the camera is pointing. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-[var(--background)] to-transparent px-5 pb-4 pt-10 text-sm">
            {current ? (
              <>
                <span className="truncate text-muted">{current.category}</span>
                <span className="shrink-0 font-display tabular-nums text-accent-text">
                  {String(current.index + 1).padStart(2, '0')} / {String(all.length).padStart(2, '0')}
                </span>
              </>
            ) : (
              <span className="text-muted">{hint}</span>
            )}
          </div>
        </div>
      </div>

      {/* The cases. */}
      <div ref={listRef} className="flex flex-col gap-6 lg:col-span-6 lg:gap-0">
        {stars.map((star, i) => (
          <div
            key={star.slug}
            id={`projeto-${star.slug}`}
            data-star-article={star.slug}
            className={`scroll-mt-[40vh] transition-opacity duration-700 lg:flex lg:min-h-[72vh] lg:scroll-mt-0 lg:items-center ${
              active === null || active === star.slug ? 'opacity-100' : 'opacity-45'
            }`}
          >
            {articles[i]}
          </div>
        ))}
      </div>
    </div>
  );
}
