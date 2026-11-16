import type { Metadata } from 'next';
import Link from 'next/link';
import { deleteTestimonial } from '@/actions/admin/testimonials';
import TestimonialForm from '@/components/admin/TestimonialForm';
import { EmptyState, PageHeader, Panel } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import type { TestimonialRow } from '@/lib/types';

export const metadata: Metadata = { title: 'Depoimentos' };

export default async function TestimonialsAdminPage({ searchParams }: PageProps<'/admin/depoimentos'>) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const [{ data }, { data: projectData }] = await Promise.all([
    supabase.from('testimonials').select('*').order('sort_order').order('created_at', { ascending: false }),
    supabase.from('projects').select('slug, title_pt').order('sort_order'),
  ]);
  const items = (data ?? []) as TestimonialRow[];
  const projects = (projectData ?? []).map((p) => ({ slug: p.slug as string, title: p.title_pt as string }));
  const titleOf = new Map(projects.map((p) => [p.slug, p.title]));
  const editing = typeof params.editar === 'string' ? items.find((i) => i.id === params.editar) : undefined;

  return (
    <>
      <PageHeader
        title="Depoimentos"
        description="O que clientes disseram do seu trabalho. Aparecem na página inicial e na página do projeto relacionado. A seção fica oculta enquanto não houver nenhum publicado."
      />
      {params.salvo && (
        <p role="status" className="mb-6 rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm">
          Depoimentos atualizados no site.
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title={editing ? 'Editar depoimento' : 'Adicionar depoimento'} className="xl:col-span-3">
          <TestimonialForm testimonial={editing} projects={projects} />
        </Panel>
        <Panel title="Cadastrados" className="xl:col-span-2">
          {items.length === 0 ? (
            <EmptyState title="Nenhum depoimento ainda">
              Copie as avaliações que você recebeu no 99Freelas ou peça uma frase curta aos clientes que já atendeu. Use só
              depoimentos reais.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {item.author_name}
                      {item.rating ? <span className="ml-2 text-accent-text">{'★'.repeat(item.rating)}</span> : null}
                    </p>
                    <p className="line-clamp-2 text-sm text-muted">“{item.quote_pt}”</p>
                    <p className="mt-1 text-xs text-muted">
                      {[item.project_slug && titleOf.get(item.project_slug), item.source, !item.published && 'oculto']
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-sm">
                    <Link href={`/admin/depoimentos?editar=${item.id}`} className="font-medium underline underline-offset-4">
                      Editar
                    </Link>
                    <form action={deleteTestimonial.bind(null, item.id)}>
                      <button type="submit" className="text-danger underline underline-offset-4">
                        Excluir
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
