import type { Metadata } from 'next';
import Link from 'next/link';
import { FlagToggle } from '@/components/admin/ProjectToggles';
import { buttonPrimary, buttonSecondary, EmptyState, PageHeader } from '@/components/admin/ui';
import { PROJECT_STATUS_LABELS } from '@/lib/labels';
import { requireAdmin } from '@/lib/auth';
import type { ProjectRow } from '@/lib/types';

export const metadata: Metadata = { title: 'Projetos' };

export default async function ProjectsAdminPage({ searchParams }: PageProps<'/admin/projetos'>) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  const projects = (data ?? []) as ProjectRow[];

  return (
    <>
      <PageHeader
        title="Projetos"
        description="O que aparece na seção de projetos do site, incluindo projetos de código privado à venda. Destaques ganham bloco grande com capa."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/projetos/importar" className={buttonSecondary}>
              Importar do GitHub
            </Link>
            <Link href="/admin/projetos/novo" className={buttonPrimary}>
              Novo projeto
            </Link>
          </div>
        }
      />

      {params.salvo && (
        <p role="status" className="mb-6 rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm">
          Projeto salvo. O site já mostra a versão nova.
        </p>
      )}

      {projects.length === 0 ? (
        <EmptyState title="Nenhum projeto ainda">
          Cadastre o primeiro projeto. Ele só aparece no site depois de marcado como publicado.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Projeto</th>
                <th className="px-4 py-3 font-medium">Ordem</th>
                <th className="px-4 py-3 font-medium">Publicado</th>
                <th className="px-4 py-3 font-medium">Destaque</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.title_pt}</p>
                    <p className="text-muted">
                      {[p.category_pt, p.year, !p.title_en && 'sem tradução EN', !p.cover_url && 'sem capa'].filter(Boolean).join(', ')}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                      <span className="rounded-full border border-border px-2 py-0.5">{PROJECT_STATUS_LABELS[p.status]}</span>
                      {p.repo_private && <span className="rounded-full border border-border px-2 py-0.5">Código privado</span>}
                      {p.for_sale && (
                        <span className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5">
                          À venda{p.price_label ? `: ${p.price_label}` : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{p.sort_order}</td>
                  <td className="px-4 py-3">
                    <FlagToggle id={p.id} field="published" value={p.published} label={`Publicar ${p.title_pt}`} />
                  </td>
                  <td className="px-4 py-3">
                    <FlagToggle id={p.id} field="featured" value={p.featured} label={`Destacar ${p.title_pt}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/projetos/${p.id}`} className="font-medium underline underline-offset-4">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
