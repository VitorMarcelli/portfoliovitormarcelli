'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import type { ConversationMode, ConversationRow } from '@/lib/types';
import { addSystemNote, sendAndStore } from '@/lib/whatsapp/inbox';

export async function sendAdminMessage(conversationId: string, text: string): Promise<{ error?: string }> {
  const body = text.trim();
  if (!body) return {};
  if (body.length > 4000) return { error: 'Mensagem muito longa (máximo 4000 caracteres).' };

  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
  if (!data) return { error: 'Conversa não encontrada.' };
  const conversation = data as ConversationRow;

  if (conversation.mode === 'ai') await addSystemNote(conversation.id, 'Você assumiu a conversa.');
  await supabase
    .from('conversations')
    .update({ mode: 'human', needs_attention: false, unread_count: 0 })
    .eq('id', conversation.id);

  const { status } = await sendAndStore(conversation, 'admin', body);
  revalidatePath('/admin', 'layout');
  return status === 'failed' ? { error: 'O WhatsApp não aceitou o envio. Verifique a conexão em Configurações.' } : {};
}

const NOTES: Record<ConversationMode, string> = {
  human: 'Você assumiu a conversa. A IA não responde mais até você devolver.',
  ai: 'Conversa devolvida para a IA.',
  closed: 'Conversa encerrada. Se o contato escrever de novo, a IA volta a atender.',
};

export async function setConversationMode(conversationId: string, mode: ConversationMode) {
  const { supabase } = await requireAdmin();
  await supabase
    .from('conversations')
    .update({ mode, needs_attention: false, ...(mode !== 'human' ? { handoff_reason: null } : {}) })
    .eq('id', conversationId);
  await addSystemNote(conversationId, NOTES[mode]);
  revalidatePath('/admin', 'layout');
}

export async function markConversationRead(conversationId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('conversations').update({ unread_count: 0 }).eq('id', conversationId);
  revalidatePath('/admin', 'layout');
}
