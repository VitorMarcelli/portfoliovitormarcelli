import type { Metadata } from 'next';
import Link from 'next/link';
import LeadCard from '@/components/admin/LeadCard';
import { STATUS_LABELS } from '@/lib/labels';
import { EmptyState, PageHeader } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import type { LeadRow, LeadStatus } from '@/lib/types';

export const metadata: Metadata = { title: 'Leads' };

export default async function LeadsPage({ searchParams }: PageProps<'/admin/leads'>) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const filter = typeof params.status === 'string' && params.status in STATUS_LABELS ? (params.status as LeadStatus) : null;

  let query = supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(200);
  if (filter) query = query.eq('status', filter);
  const [{ data }, { data: all }] = await Promise.all([query, supabase.from('leads').select('status')]);
  const leads = (data ?? []) as LeadRow[];

  const counts = new Map<string, number>();
  for (const row of (all ?? []) as { status: string }[]) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);

  const tabs: { key: LeadStatus | null; label: string; count: number }[] = [
    { key: null, label: 'Todos', count: all?.length ?? 0 },
    ...(Object.keys(STATUS_LABELS) as LeadStatus[]).map((key) => ({ key, label: STATUS_LABELS[key], count: counts.get(key) ?? 0 })),
  ];

  return (
    <>
      <PageHeader
        title="Leads"
        description="Pessoas que entraram em contato pelo formulário do site ou que a IA qualificou no WhatsApp. Atualize o status conforme a negociação avança."
      />
      <nav aria-label="Filtrar por status" className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <Link
              key={tab.label}
              href={tab.key ? `/admin/leads?status=${tab.key}` : '/admin/leads'}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full px-4 py-1.5 text-sm ${active ? 'bg-foreground text-background' : 'border border-border hover:bg-surface-2'}`}
            >
              {tab.label} <span className="tabular-nums opacity-70">{tab.count}</span>
            </Link>
          );
        })}
      </nav>
      {leads.length === 0 ? (
        <EmptyState title={filter ? 'Nenhum lead com esse status' : 'Nenhum lead ainda'}>
          Quando alguém enviar o formulário do site ou a IA qualificar uma conversa, o contato aparece aqui.
        </EmptyState>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </>
  );
}
