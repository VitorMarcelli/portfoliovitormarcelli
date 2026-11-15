'use client';

import { useState } from 'react';

export interface DailyPoint {
  day: string;
  views: number;
  visitors: number;
}

const HEIGHT = 220;
const PAD = { top: 16, right: 8, bottom: 28, left: 40 };
const BAR_MAX = 24;
const GAP = 2;

function niceMax(value: number) {
  if (value <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 2, 2.5, 5, 10];
  for (const s of steps) if (s * pow >= value) return s * pow;
  return 10 * pow;
}

const dayLabel = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
const fullLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC' });

/** Daily page views: single series column chart with per-column hover tooltip. */
export default function VisitsChart({ data }: { data: DailyPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 720;
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(0, ...data.map((d) => d.views)));
  const band = data.length > 0 ? innerW / data.length : innerW;
  const barW = Math.max(2, Math.min(BAR_MAX, band - GAP));
  const ticks = [0, max / 2, max];
  const labelEvery = Math.ceil(data.length / 8);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const active = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Visualizações por dia">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--muted)">
              {t.toLocaleString('pt-BR')}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = PAD.left + i * band + (band - barW) / 2;
          const top = y(d.views);
          const h = PAD.top + innerH - top;
          const r = Math.min(4, h, barW / 2);
          return (
            <g key={d.day}>
              {h > 0 && (
                <path
                  d={`M${x},${top + h} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${top + h} Z`}
                  fill="var(--chart)"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={HEIGHT - 8} textAnchor="middle" fontSize={11} fill="var(--muted)">
                  {dayLabel.format(new Date(d.day))}
                </text>
              )}
              <rect
                x={PAD.left + i * band}
                y={PAD.top}
                width={band}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${fullLabel.format(new Date(d.day))}: ${d.views} visualizações, ${d.visitors} visitantes`}
              />
            </g>
          );
        })}
      </svg>

      {active && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
          style={{ left: `${((PAD.left + hover * band + band / 2) / width) * 100}%` }}
        >
          <p className="font-medium">{fullLabel.format(new Date(active.day))}</p>
          <p className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-chart" aria-hidden="true" />
            {active.views.toLocaleString('pt-BR')} visualizações
          </p>
          <p className="text-muted">{active.visitors.toLocaleString('pt-BR')} visitantes</p>
        </div>
      )}

      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-muted">Ver como tabela</summary>
        <div className="mt-2 max-h-60 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="text-muted">
              <tr>
                <th className="py-1 font-medium">Dia</th>
                <th className="py-1 text-right font-medium">Visualizações</th>
                <th className="py-1 text-right font-medium">Visitantes</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.day} className="border-t border-border">
                  <td className="py-1">{fullLabel.format(new Date(d.day))}</td>
                  <td className="py-1 text-right tabular-nums">{d.views}</td>
                  <td className="py-1 text-right tabular-nums">{d.visitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
