import type { ReactNode } from 'react';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className = '', actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`rounded-lg border border-border bg-surface ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-semibold">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export const inputClass =
  'mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2.5 text-[15px] focus:border-foreground focus:outline-none';

export const buttonPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50';

export const buttonSecondary =
  'inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2 disabled:opacity-50';

export const buttonDanger =
  'inline-flex items-center justify-center gap-2 rounded-full border border-danger/50 px-5 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50';

export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block text-sm font-medium ${className}`}>
      {label}
      {hint && <span className="ml-1 font-normal text-muted">{hint}</span>}
      {children}
    </label>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-14 text-center">
      <p className="font-semibold">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-muted">{children}</div>}
    </div>
  );
}

const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

export function timeAgo(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return 'agora';
  if (abs < 3600) return relative.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return relative.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return relative.format(Math.round(diff / 86400), 'day');
  return new Date(iso).toLocaleDateString('pt-BR');
}
