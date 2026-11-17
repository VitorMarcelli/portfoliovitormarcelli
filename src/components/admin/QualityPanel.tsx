import Link from 'next/link';
import type { QualityItem } from '@/lib/projectQuality';

interface Props {
  items: QualityItem[];
  done: number;
  total: number;
  slug: string;
  published: boolean;
}

/** Score of the project page plus what is missing, with a tip for each item. */
export default function QualityPanel({ items, done, total, slug, published }: Props) {
  const missing = items.filter((i) => !i.ok);
  const essentialMissing = missing.filter((i) => i.level === 'essential').length;
  const pct = Math.round((done / total) * 100);
  const tone = essentialMissing > 0 ? 'bg-danger' : missing.length > 0 ? 'bg-accent' : 'bg-success';

  return (
    <section className="mb-6 rounded-lg border border-border bg-surface p-5" aria-labelledby="qualidade-titulo">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="qualidade-titulo" className="font-semibold">
            Qualidade da página: {done} de {total}
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            {missing.length === 0
              ? 'Página completa. Pronta para mandar a clientes.'
              : essentialMissing > 0
                ? `Faltam ${essentialMissing} ${essentialMissing === 1 ? 'item essencial' : 'itens essenciais'} antes de mandar para clientes.`
                : 'O essencial está pronto. Os itens abaixo deixam a página ainda melhor.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
          <Link href={published ? `/projetos/${slug}` : `/projetos/${slug}?previa=1`} target="_blank" className="underline underline-offset-4">
            {published ? 'Ver no site' : 'Pré-visualizar'}
          </Link>
          {published && (
            <Link href={`/admin/acessos?projeto=${slug}`} className="underline underline-offset-4">
              Gerar link para cliente
            </Link>
          )}
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Qualidade da página">
        <div className={`h-full rounded-full ${tone} transition-[width]`} style={{ width: `${pct}%` }} />
      </div>
      {missing.length > 0 && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {missing.map((item) => (
            <li key={item.key} className="rounded-md border border-border px-3 py-2 text-sm">
              <p className="font-medium">
                <span
                  className={`mr-2 inline-block h-2 w-2 rounded-full ${item.level === 'essential' ? 'bg-danger' : 'bg-accent'}`}
                  aria-hidden="true"
                />
                {item.label}
                <span className="ml-1.5 text-xs font-normal text-muted">{item.level === 'essential' ? 'essencial' : 'recomendado'}</span>
              </p>
              <p className="mt-0.5 text-muted">{item.tip}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
