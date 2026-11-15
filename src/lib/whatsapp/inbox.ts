import 'server-only';
import { SITE_URL } from '@/lib/env';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { ConversationRow, MessageRow } from '@/lib/types';
import { formatPhone, onlyDigits } from './link';
import { sendWhatsappText } from './evolution';

function preview(text: string) {
  return text.length > 140 ? `${text.slice(0, 137)}…` : text;
}

export interface InboundMessage {
  jid: string;
  phone: string | null;
  name: string | null;
  text: string;
  waMessageId: string;
  fromMe: boolean;
}

/**
 * Stores a message received by the webhook. Returns null for duplicates
 * (Evolution can deliver the same event twice, and our own sends echo back as fromMe).
 */
export async function recordInbound(msg: InboundMessage): Promise<{ conversation: ConversationRow; message: MessageRow } | null> {
  const db = getSupabaseAdmin();

  const { data: existing } = await db.from('messages').select('id').eq('wa_message_id', msg.waMessageId).maybeSingle();
  if (existing) return null;

  const { data: found } = await db.from('conversations').select('*').eq('wa_jid', msg.jid).maybeSingle();
  let conversation = found as ConversationRow | null;

  if (!conversation) {
    const { data: created, error } = await db
      .from('conversations')
      .insert({ wa_jid: msg.jid, phone: msg.phone, contact_name: msg.name })
      .select('*')
      .single();
    if (error) {
      // Two events for a brand-new contact raced: read the row the other one created.
      const { data: retry } = await db.from('conversations').select('*').eq('wa_jid', msg.jid).single();
      conversation = retry as ConversationRow;
    } else {
      conversation = created as ConversationRow;
    }
  }

  // A message typed by Vitor directly on his phone: keep it in the history and take the chat over.
  const author = msg.fromMe ? 'admin' : 'contact';
  const { data: message, error: msgError } = await db
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      direction: msg.fromMe ? 'out' : 'in',
      author,
      body: msg.text,
      wa_message_id: msg.waMessageId,
      status: msg.fromMe ? 'sent' : 'received',
    })
    .select('*')
    .single();
  if (msgError) return null;

  const update: Partial<ConversationRow> = {
    last_message_at: new Date().toISOString(),
    last_message_preview: preview(msg.text),
  };
  if (msg.fromMe) {
    update.mode = 'human';
    update.needs_attention = false;
  } else {
    update.unread_count = conversation.unread_count + 1;
    if (msg.name && !conversation.contact_name) update.contact_name = msg.name;
    if (msg.phone && !conversation.phone) update.phone = msg.phone;
    if (conversation.mode === 'human') update.needs_attention = true;
    if (conversation.mode === 'closed') update.mode = 'ai';
  }

  const { data: updated } = await db.from('conversations').update(update).eq('id', conversation.id).select('*').single();
  return { conversation: (updated ?? conversation) as ConversationRow, message: message as MessageRow };
}

/** Sends a WhatsApp message and stores it in the conversation history. */
export async function sendAndStore(conversation: Pick<ConversationRow, 'id' | 'wa_jid'>, author: 'ai' | 'admin', text: string) {
  const db = getSupabaseAdmin();
  let waId: string | null = null;
  let status: 'sent' | 'failed' = 'sent';
  try {
    waId = (await sendWhatsappText(conversation.wa_jid, text)).id;
  } catch (e) {
    console.error('[whatsapp] send failed', (e as Error).message);
    status = 'failed';
  }

  const { data } = await db
    .from('messages')
    .insert({ conversation_id: conversation.id, direction: 'out', author, body: text, wa_message_id: waId, status })
    .select('*')
    .single();

  await db
    .from('conversations')
    .update({ last_message_at: new Date().toISOString(), last_message_preview: preview(text) })
    .eq('id', conversation.id);

  return { message: data as MessageRow | null, status };
}

export async function addSystemNote(conversationId: string, text: string) {
  await getSupabaseAdmin()
    .from('messages')
    .insert({ conversation_id: conversationId, direction: 'out', author: 'system', body: text, status: 'sent' });
}

/** Moves the chat to Vitor: AI stops answering and the panel flags it. */
export async function handOff(conversation: ConversationRow, reason: string, summary?: string) {
  const db = getSupabaseAdmin();
  await db
    .from('conversations')
    .update({ mode: 'human', needs_attention: true, handoff_reason: reason })
    .eq('id', conversation.id);
  await addSystemNote(conversation.id, `IA transferiu a conversa para você. Motivo: ${reason}${summary ? `\nResumo: ${summary}` : ''}`);

  const notify = process.env.NOTIFY_WHATSAPP_NUMBER;
  if (notify && onlyDigits(notify) !== onlyDigits(conversation.phone ?? '')) {
    const who = conversation.contact_name || formatPhone(conversation.phone) || 'Um contato';
    const text = `🔔 ${who} precisa de você no atendimento.\nMotivo: ${reason}${summary ? `\n${summary}` : ''}\n${SITE_URL}/admin/conversas?c=${conversation.id}`;
    sendWhatsappText(onlyDigits(notify), text).catch((e) => console.error('[whatsapp] notify failed', (e as Error).message));
  }
}
