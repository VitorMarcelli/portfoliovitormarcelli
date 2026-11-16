import type { Metadata } from 'next';
import Link from 'next/link';
import ClientLinkBuilder from '@/components/admin/ClientLinkBuilder';
import { EmptyState, PageHeader, Panel, timeAgo } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { SITE_URL } from '@/lib/env';

export const metadata: Metadata = { title: 'Acessos aos projetos' };

const RANGES = [7, 30, 90] as const;
const DEVICE_LABELS: Record<string, string> = { desktop: 'computador', mobile: 'celular', tablet: 'tablet' };
const regionNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

interface EventRow {
  type: 'pageview' | 'click';
  path: string;
  label: string | null;
  referrer: string | null;
  country: string | null;
  device: string | null;
  visitor_id: string | null;
  campaign: string | null;
  created_at: string;
}

interface ProjectStats {
  slug: string;
  title: string;
  views: number;
  visitors: Set<string>;
  live: number;
  code: number;
  leads: number;
  last: string | null;
}

interface ClientStats {
  tag: string;
  first: string;
  last: string;
  views: number;
  projects: Set<string>;
  live: Set<string>;
  devices: Set<string>;
  country: string | null;
  contacted: boolean;
}

/** "/projetos/giro" or "/en/projetos/giro" → "giro". */
const slugOfPath = (path: string) => path.match(/^\/(?:en\/)?projetos\/([^/?#]+)/)?.[1] ?? null;

function country(code: string | null) {
  if (!code || code.length !== 2) return null;
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export default async function ProjectAccessPage({ searchParams }: PageProps<'/admin/acessos'>) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const days = RANGES.find((r) => String(r) === params.dias) ?? 30;
  const since = new Date(Date.now() - days * 86400 * 1000).toISOString();

  const [{ data: projectData }, { data: eventData, error }, { data: leadData }] = await Promise.all([
    supabase.from('projects').select('slug, title_pt, published').order('sort_order'),
    supabase
      .from('events')
      .select('type, path, label, referrer, country, device, visitor_id, campaign, created_at')
      .gte('created_at', since)
      .or('path.like./projetos/%,path.like./en/projetos/%,label.like.project_%,campaign.not.is.null')
      .order('created_at', { ascending: false })
      .limit(10000),
    supabase.from('leads').select('project_slug, created_at').gte('created_at', since).not('project_slug', 'is', null),
  ]);

  const projects = (projectData ?? []) as { slug: string; title_pt: string; published: boolean }[];
  const events = (eventData ?? []) as EventRow[];
  const titleOf = new Map(projects.map((p) => [p.slug, p.title_pt]));

  const stats = new Map<string, ProjectStats>(
    projects.map((p) => [p.slug, { slug: p.slug, title: p.title_pt, views: 0, visitors: new Set(), live: 0, code: 0, leads: 0, last: null }]),
  );
  const clients = new Map<string, ClientStats>();

  // Events come newest first, so the first one seen is the latest.
  for (const e of events) {
    const pageSlug = e.type === 'pageview' ? slugOfPath(e.path) : null;
    const [clickKind, clickSlug] = e.type === 'click' && e.label ? e.label.split(':') : [];
    const s = stats.get(pageSlug ?? clickSlug ?? '');
    if (s && pageSlug) {
      s.views += 1;
      if (e.visitor_id) s.visitors.add(e.visitor_id);
      s.last ??= e.created_at;
    }
    if (s && clickKind === 'project_live') s.live += 1;
    if (s && clickKind === 'project_repo') s.code += 1;

    if (e.campaign) {
      const c =
        clients.get(e.campaign) ??
        ({ tag: e.campaign, first: e.created_at, last: e.created_at, views: 0, projects: new Set(), live: new Set(), devices: new Set(), country: null, contacted: false } satisfies ClientStats);
      c.first = e.created_at;
      if (e.type === 'pageview') {
        c.views += 1;
        if (pageSlug) c.projects.add(pageSlug);
      }
      if (clickKind === 'project_live' && clickSlug) c.live.add(clickSlug);
      if (e.label === 'contact_form' || e.label?.startsWith('whatsapp')) c.contacted = true;
      if (e.device) c.devices.add(DEVICE_LABELS[e.device] ?? e.device);
      c.country ??= country(e.country);
      clients.set(e.campaign, c);
    }
  }
  for (const lead of (leadData ?? []) as { project_slug: string }[]) {
    const s = stats.get(lead.project_slug);
    if (s) s.leads += 1;
  }

  const ranked = [...stats.values()]
    .filter((s) => s.views || s.live || s.code || s.leads)
    .sort((a, b) => b.visitors.size - a.visitors.size || b.views - a.views);
  const clientList = [...clients.values()].sort((a, b) => b.last.localeCompare(a.last));
  const recent = events.filter((e) => e.type === 'pageview' && slugOfPath(e.path)).slice(0, 25);

  return (
    <>
      <PageHeader
        title="Acessos aos projetos"
        description="Quem abriu as páginas dos projetos. Gere um link por cliente para saber se a pessoa para quem você mandou realmente olhou."
        actions={
          <nav aria-label="Período" className="flex rounded-full border border-border p-1">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/admin/acessos?dias=${r}`}
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
          Não foi possível carregar os acessos: {error.message}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title="Gerar link para um cliente" className="min-w-0 xl:col-span-2">
          <ClientLinkBuilder siteUrl={SITE_URL} projects={projects.filter((p) => p.published).map((p) => ({ slug: p.slug, title: p.title_pt }))} />
        </Panel>

        <Panel title="Links de clientes abertos" className="min-w-0 xl:col-span-3">
          {clientList.length === 0 ? (
            <EmptyState title="Nenhum link de cliente aberto no período">
              Gere um link ao lado e mande para o cliente. Quando ele abrir, aparece aqui: quando, em qual aparelho, quais projetos viu e se
              clicou para abrir o sistema.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {clientList.map((c) => (
                <li key={c.tag} className="py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-medium">
                      {c.tag}
                      {c.contacted && (
                        <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-xs font-normal text-success">entrou em contato</span>
                      )}
                    </p>
                    <p className="text-sm text-muted">última atividade {timeAgo(c.last)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {c.views} {c.views === 1 ? 'página vista' : 'páginas vistas'}, primeiro acesso {timeAgo(c.first)}
                    {c.devices.size > 0 && `, ${[...c.devices].join(' e ')}`}
                    {c.country && `, ${c.country}`}
                  </p>
                  {c.projects.size > 0 && (
                    <p className="mt-1 text-sm">
                      Viu: {[...c.projects].map((slug) => titleOf.get(slug) ?? slug).join(', ')}
                    </p>
                  )}
                  {c.live.size > 0 && (
                    <p className="mt-1 text-sm text-accent-text">
                      Abriu o sistema: {[...c.live].map((slug) => titleOf.get(slug) ?? slug).join(', ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Por projeto" className="min-w-0 xl:col-span-5">
          {ranked.length === 0 ? (
            <EmptyState title="Nenhuma visita às páginas de projeto no período" />
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="px-2 pb-2 font-medium">Projeto</th>
                    <th className="px-2 pb-2 text-right font-medium">Pessoas</th>
                    <th className="px-2 pb-2 text-right font-medium">Visitas</th>
                    <th className="px-2 pb-2 text-right font-medium" title="Cliques em Abrir sistema">Sistema</th>
                    <th className="px-2 pb-2 text-right font-medium" title="Cliques em Ver código">Código</th>
                    <th className="px-2 pb-2 text-right font-medium">Leads</th>
                    <th className="px-2 pb-2 text-right font-medium">Última visita</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((s) => (
                    <tr key={s.slug} className="border-t border-border">
                      <td className="max-w-[22rem] truncate px-2 py-2.5">
                        <Link href={`/projetos/${s.slug}`} target="_blank" className="hover:underline">
                          {s.title}
                        </Link>
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{s.visitors.size}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{s.views}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{s.live || '–'}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{s.code || '–'}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{s.leads || '–'}</td>
                      <td className="whitespace-nowrap px-2 py-2.5 text-right text-muted">{s.last ? timeAgo(s.last) : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Últimas visitas" className="min-w-0 xl:col-span-5">
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma visita ainda.</p>
          ) : (
            <ul className="grid gap-x-8 md:grid-cols-2">
              {recent.map((e, i) => {
                const slug = slugOfPath(e.path) ?? '';
                return (
                  <li key={`${e.created_at}-${i}`} className="border-t border-border py-2.5 text-sm">
                    <p className="truncate font-medium">
                      {titleOf.get(slug) ?? slug}
                      {e.path.startsWith('/en/') && <span className="ml-1.5 text-xs font-normal text-muted">EN</span>}
                    </p>
                    <p className="text-muted">
                      {[timeAgo(e.created_at), e.campaign && `link de ${e.campaign}`, e.device && DEVICE_LABELS[e.device], country(e.country), e.referrer && `veio de ${e.referrer}`]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
