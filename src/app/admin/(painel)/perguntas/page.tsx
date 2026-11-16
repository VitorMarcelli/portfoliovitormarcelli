import type { Metadata } from 'next';
import Link from 'next/link';
import { deleteFaq, setFaqPublished } from '@/actions/admin/faqs';
import FaqForm from '@/components/admin/FaqForm';
import { EmptyState, PageHeader, Panel } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import type { FaqRow } from '@/lib/types';

export const metadata: Metadata = { title: 'Perguntas frequentes' };

export default async function FaqAdminPage({ searchParams }: PageProps<'/admin/perguntas'>) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data } = await supabase.from('faqs').select('*').order('sort_order').order('created_at');
  const items = (data ?? []) as FaqRow[];
  const editing = typeof params.editar === 'string' ? items.find((i) => i.id === params.editar) : undefined;
  const drafts = items.filter((i) => !i.published).length;

  return (
    <>
      <PageHeader
        title="Perguntas frequentes"
        description="Respostas para as dúvidas que todo cliente faz antes de fechar: preço, prazo, pagamento, código e suporte. Aparecem antes do contato, na página inicial."
      />
      {params.salvo && (
        <p role="status" className="mb-6 rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm">
          Perguntas atualizadas no site.
        </p>
      )}
      {drafts > 0 && (
        <p className="mb-6 rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          {drafts === 1 ? '1 pergunta está' : `${drafts} perguntas estão`} em rascunho. Confira se as condições batem com o
          jeito que você trabalha, ajuste o texto e publique.
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title={editing ? 'Editar pergunta' : 'Adicionar pergunta'} className="xl:col-span-2">
          <FaqForm faq={editing} />
        </Panel>
        <Panel title="Cadastradas" className="xl:col-span-3">
          {items.length === 0 ? (
            <EmptyState title="Nenhuma pergunta">Adicione as dúvidas que os clientes mais fazem.</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {item.question_pt}
                      {!item.published && (
                        <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-xs font-normal text-muted">rascunho</span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted">{item.answer_pt}</p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-sm">
                    <form action={setFaqPublished.bind(null, item.id, !item.published)}>
                      <button type="submit" className="font-medium underline underline-offset-4">
                        {item.published ? 'Ocultar' : 'Publicar'}
                      </button>
                    </form>
                    <Link href={`/admin/perguntas?editar=${item.id}`} className="font-medium underline underline-offset-4">
                      Editar
                    </Link>
                    <form action={deleteFaq.bind(null, item.id)}>
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
