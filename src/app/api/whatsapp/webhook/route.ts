import { timingSafeEqual } from 'node:crypto';
import { after, NextResponse, type NextRequest } from 'next/server';
import { runAttendant } from '@/lib/ai/attendant';
import { getSupabaseAdmin, hasSupabaseAdmin } from '@/lib/supabase/admin';
import { recordInbound } from '@/lib/whatsapp/inbox';

export const maxDuration = 60;

/** Time to wait for follow-up messages before the AI answers, so a burst gets one reply. */
const DEBOUNCE_MS = 4000;

interface EvolutionKey {
  remoteJid?: string;
  remoteJidAlt?: string;
  senderPn?: string;
  fromMe?: boolean;
  id?: string;
}

interface EvolutionMessageData {
  key?: EvolutionKey;
  pushName?: string;
  message?: Record<string, unknown> & {
    conversation?: string;
    extendedTextMessage?: { text?: string };
    imageMessage?: { caption?: string };
    videoMessage?: { caption?: string };
    documentMessage?: { caption?: string; fileName?: string };
  };
}

function secretMatches(given: string | null) {
  const expected = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function extractText(message: EvolutionMessageData['message']): string | null {
  if (!message) return null;
  const text =
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption;
  if (text) return text;
  if ('audioMessage' in message) return '[Áudio recebido]';
  if ('imageMessage' in message) return '[Imagem recebida]';
  if ('videoMessage' in message) return '[Vídeo recebido]';
  if ('documentMessage' in message) return `[Documento recebido: ${message.documentMessage?.fileName ?? 'arquivo'}]`;
  if ('locationMessage' in message) return '[Localização recebida]';
  if ('contactMessage' in message) return '[Contato recebido]';
  return null;
}

function phoneFromKey(key: EvolutionKey): string | null {
  const candidates = [key.remoteJidAlt, key.senderPn, key.remoteJid];
  for (const jid of candidates) {
    if (jid?.endsWith('@s.whatsapp.net')) return jid.split('@')[0].split(':')[0];
  }
  return null;
}

async function answerAfterQuietPeriod(conversationId: string, messageId: string) {
  await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS));
  const { data: latest } = await getSupabaseAdmin()
    .from('messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('author', 'contact')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  // A newer message arrived meanwhile: its own webhook call will answer the whole burst.
  if (latest?.id !== messageId) return;
  await runAttendant(conversationId);
}

export async function POST(request: NextRequest) {
  if (!secretMatches(request.nextUrl.searchParams.get('secret'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!hasSupabaseAdmin()) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  let payload: { event?: string; data?: EvolutionMessageData | EvolutionMessageData[] };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const event = (payload.event || '').toLowerCase().replace('_', '.');
  if (event !== 'messages.upsert') return NextResponse.json({ ok: true, ignored: payload.event });

  const items = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];

  for (const data of items) {
    const key = data.key;
    const jid = key?.remoteJid;
    if (!key?.id || !jid) continue;
    if (jid.endsWith('@g.us') || jid.endsWith('@broadcast') || jid.endsWith('@newsletter')) continue;

    const text = extractText(data.message);
    if (!text) continue;

    const recorded = await recordInbound({
      jid,
      phone: phoneFromKey(key),
      name: key.fromMe ? null : data.pushName ?? null,
      text,
      waMessageId: key.id,
      fromMe: Boolean(key.fromMe),
    });
    if (!recorded || key.fromMe) continue;

    if (recorded.conversation.mode === 'ai') {
      const conversationId = recorded.conversation.id;
      const messageId = recorded.message.id;
      after(() => answerAfterQuietPeriod(conversationId, messageId));
    }
  }

  return NextResponse.json({ ok: true });
}
