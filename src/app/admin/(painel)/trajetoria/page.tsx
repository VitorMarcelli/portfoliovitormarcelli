import type { Metadata } from 'next';
import Link from 'next/link';
import { deleteExperience } from '@/actions/admin/experiences';
import ExperienceForm from '@/components/admin/ExperienceForm';
import { EmptyState, PageHeader, Panel } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import type { ExperienceRow } from '@/lib/types';

export const metadata: Metadata = { title: 'Trajetória' };

const monthYear = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export default async function CareerAdminPage({ searchParams }: PageProps<'/admin/trajetoria'>) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data } = await supabase.from('experiences').select('*').order('start_date', { ascending: false });
  const items = (data ?? []) as ExperienceRow[];
  const editing = typeof params.editar === 'string' ? items.find((i) => i.id === params.editar) : undefined;

  return (
    <>
      <PageHeader
        title="Trajetória"
        description="Experiências e formação mostradas na seção Trajetória do site. A seção fica oculta enquanto estiver vazia e sem currículo."
      />
      {params.salvo && (
        <p role="status" className="mb-6 rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm">
          Trajetória atualizada no site.
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title={editing ? 'Editar item' : 'Adicionar item'} className="xl:col-span-3">
          <ExperienceForm experience={editing} />
        </Panel>
        <Panel title="Itens cadastrados" className="xl:col-span-2">
          {items.length === 0 ? (
            <EmptyState title="Nada cadastrado">Adicione seu emprego atual e sua formação para recrutadores verem.</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium">{item.title_pt}</p>
                    <p className="text-sm text-muted">
                      {item.organization}, {monthYear.format(new Date(item.start_date))} a{' '}
                      {item.end_date ? monthYear.format(new Date(item.end_date)) : 'atual'}
                      {!item.published && ', oculto'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-sm">
                    <Link href={`/admin/trajetoria?editar=${item.id}`} className="font-medium underline underline-offset-4">
                      Editar
                    </Link>
                    <form action={deleteExperience.bind(null, item.id)}>
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
