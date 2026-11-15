import type { Metadata } from 'next';
import Inbox from '@/components/admin/Inbox';
import { PageHeader } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import type { ConversationRow, LeadRow, MessageRow } from '@/lib/types';
import { isEvolutionConfigured } from '@/lib/whatsapp/evolution';
import { isAiConfigured } from '@/lib/ai/attendant';

export const metadata: Metadata = { title: 'Conversas' };

export default async function ConversationsPage({ searchParams }: PageProps<'/admin/conversas'>) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  const { data: list } = await supabase
    .from('conversations')
    .select('*')
    .order('needs_attention', { ascending: false })
    .order('last_message_at', { ascending: false })
    .limit(100);
  const conversations = (list ?? []) as ConversationRow[];

  const selectedId = typeof params.c === 'string' ? params.c : null;
  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  let messages: MessageRow[] = [];
  let lead: LeadRow | null = null;
  if (selected) {
    const [{ data: msgs }, leadRes] = await Promise.all([
      supabase.from('messages').select('*').eq('conversation_id', selected.id).order('created_at', { ascending: true }).limit(500),
      selected.lead_id ? supabase.from('leads').select('*').eq('id', selected.lead_id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    messages = (msgs ?? []) as MessageRow[];
    lead = (leadRes.data ?? null) as LeadRow | null;
  }

  return (
    <>
      <PageHeader
        title="Conversas"
        description="Mensagens do WhatsApp. A IA responde sozinha até transferir para você; você pode assumir ou devolver qualquer conversa."
      />
      {(!isEvolutionConfigured() || !isAiConfigured()) && (
        <p className="mb-6 rounded-md border border-accent bg-accent/10 px-4 py-3 text-sm">
          {!isEvolutionConfigured() && 'O WhatsApp (Evolution API) ainda não está configurado. '}
          {!isAiConfigured() && 'A chave da IA (ANTHROPIC_API_KEY) não está definida: novas conversas ficam esperando você. '}
          Veja Configurações.
        </p>
      )}
      <Inbox conversations={conversations} selected={selected} messages={messages} lead={lead} />
    </>
  );
}
