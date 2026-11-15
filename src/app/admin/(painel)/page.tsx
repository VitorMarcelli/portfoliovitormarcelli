import type { Metadata } from 'next';
import Link from 'next/link';
import { STATUS_LABELS } from '@/lib/labels';
import { EmptyState, PageHeader, Panel, timeAgo } from '@/components/admin/ui';
import VisitsChart, { type DailyPoint } from '@/components/admin/VisitsChart';
import { requireAdmin } from '@/lib/auth';
import type { ConversationRow, LeadRow } from '@/lib/types';
import { formatPhone } from '@/lib/whatsapp/link';

export const metadata: Metadata = { title: 'Visão geral' };

interface Ranked {
  name: string;
  total: number;
}

interface Summary {
  pageviews: number;
  visitors: number;
  whatsapp_clicks: number;
  leads: number;
  daily: DailyPoint[];
  referrers: Ranked[];
  pages: Ranked[];
  countries: Ranked[];
  devices: Ranked[];
  clicks: Ranked[];
}

const RANGES = [7, 30, 90] as const;

const CLICK_LABELS: Record<string, string> = {
  whatsapp: 'Botão do WhatsApp',
  contact_form: 'Formulário enviado',
  cv_download: 'Download do currículo',
  email: 'E-mail',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};

function clickLabel(name: string) {
  if (CLICK_LABELS[name]) return CLICK_LABELS[name];
  const [kind, slug] = name.split(':');
  if (kind === 'project_live') return `Sistema no ar: ${slug}`;
  if (kind === 'project_repo') return `Código: ${slug}`;
  return name;
}

const DEVICE_LABELS: Record<string, string> = { desktop: 'Computador', mobile: 'Celular', tablet: 'Tablet' };
const regionNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });
function countryLabel(code: string) {
  try {
    return code.length === 2 ? regionNames.of(code) ?? code : 'Desconhecido';
  } catch {
    return code;
  }
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-4xl font-bold tabular-nums">{value.toLocaleString('pt-BR')}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

function RankTable({ rows, format = (n: string) => n, empty }: { rows: Ranked[]; format?: (name: string) => string; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.total));
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="border-t border-border first:border-t-0">
            <td className="py-2 pr-3">
              <span className="block truncate">{format(r.name)}</span>
              <span className="mt-1 block h-1.5 rounded-full bg-chart" style={{ width: `${Math.max(4, (r.total / max) * 100)}%` }} aria-hidden="true" />
            </td>
            <td className="w-16 py-2 text-right align-top tabular-nums">{r.total.toLocaleString('pt-BR')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function DashboardPage({ searchParams }: PageProps<'/admin'>) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const days = RANGES.find((r) => String(r) === params.dias) ?? 30;

  const [{ data: summaryData, error }, { data: leadsData }, { data: convData }] = await Promise.all([
    supabase.rpc('analytics_summary', { days }),
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('conversations').select('*').eq('needs_attention', true).order('last_message_at', { ascending: false }).limit(5),
  ]);

  const summary = summaryData as Summary | null;
  const leads = (leadsData ?? []) as LeadRow[];
  const waiting = (convData ?? []) as ConversationRow[];

  return (
    <>
      <PageHeader
        title="Visão geral"
        description="Quem visitou o site, de onde veio e quem entrou em contato."
        actions={
          <nav aria-label="Período" className="flex rounded-full border border-border p-1">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/admin?dias=${r}`}
                aria-current={r === days ? 'page' : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm ${r === days ? 'bg-foreground text-background' : 'text-muted hover:text-foreground'}`}
              >
                {r} dias
              </Link>
            ))}
          </nav>
        }
      />

      {error && (
        <p role="alert" className="mb-6 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          Não foi possível carregar as métricas: {error.message}. Confira se as migrações do Supabase foram aplicadas.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <Stat label="Visualizações" value={summary?.pageviews ?? 0} />
        <Stat label="Visitantes únicos" value={summary?.visitors ?? 0} />
        <Stat label="Cliques no WhatsApp" value={summary?.whatsapp_clicks ?? 0} />
        <Stat label="Leads no período" value={summary?.leads ?? 0} />
        <Stat label="Conversas esperando você" value={waiting.length} hint="agora" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Visualizações por dia" className="xl:col-span-2">
          {summary && summary.pageviews > 0 ? (
            <VisitsChart data={summary.daily} />
          ) : (
            <EmptyState title="Sem visitas registradas no período">
              As visitas começam a aparecer assim que o site estiver no ar com as variáveis do Supabase configuradas.
            </EmptyState>
          )}
        </Panel>

        <Panel
          title="Esperando você"
          actions={
            <Link href="/admin/conversas" className="text-sm underline underline-offset-4">
              Abrir conversas
            </Link>
          }
        >
          {waiting.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma conversa precisa de você agora.</p>
          ) : (
            <ul className="divide-y divide-border">
              {waiting.map((c) => (
                <li key={c.id} className="py-2.5">
                  <Link href={`/admin/conversas?c=${c.id}`} className="block hover:underline">
                    <span className="font-medium">{c.contact_name || formatPhone(c.phone)}</span>
                    <span className="block truncate text-sm text-muted">{c.handoff_reason || c.last_message_preview}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="De onde vêm as visitas">
          <RankTable rows={summary?.referrers ?? []} empty="Sem dados ainda." />
        </Panel>
        <Panel title="Páginas mais vistas">
          <RankTable rows={summary?.pages ?? []} empty="Sem dados ainda." />
        </Panel>
        <Panel title="Cliques">
          <RankTable rows={summary?.clicks ?? []} format={clickLabel} empty="Nenhum clique registrado." />
        </Panel>
        <Panel title="Países">
          <RankTable rows={summary?.countries ?? []} format={countryLabel} empty="Sem dados ainda." />
        </Panel>
        <Panel title="Dispositivos">
          <RankTable rows={summary?.devices ?? []} format={(n) => DEVICE_LABELS[n] ?? n} empty="Sem dados ainda." />
        </Panel>
        <Panel
          title="Últimos leads"
          actions={
            <Link href="/admin/leads" className="text-sm underline underline-offset-4">
              Ver todos
            </Link>
          }
        >
          {leads.length === 0 ? (
            <p className="text-sm text-muted">Nenhum lead ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {leads.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{l.name}</p>
                    <p className="text-muted">
                      {l.source === 'whatsapp' ? 'WhatsApp' : 'Site'}, {timeAgo(l.created_at)}
                    </p>
                  </div>
                  <span className="shrink-0 text-muted">{STATUS_LABELS[l.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
