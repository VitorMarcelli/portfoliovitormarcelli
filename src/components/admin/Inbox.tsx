'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useOptimistic, useRef, useState, useSyncExternalStore, useTransition } from 'react';
import { markConversationRead, sendAdminMessage, setConversationMode } from '@/actions/admin/conversations';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import type { ConversationRow, LeadRow, MessageRow } from '@/lib/types';
import { formatPhone } from '@/lib/whatsapp/link';
import { buttonPrimary, buttonSecondary, timeAgo } from './ui';

interface InboxProps {
  conversations: ConversationRow[];
  selected: ConversationRow | null;
  messages: MessageRow[];
  lead: LeadRow | null;
}

const MODE_LABEL = { ai: 'IA atendendo', human: 'Você atendendo', closed: 'Encerrada' } as const;

function displayName(c: ConversationRow) {
  return c.contact_name || formatPhone(c.phone) || 'Contato';
}

function useLiveRefresh(selectedId: string | null) {
  const router = useRouter();
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 300);
    };

    const channel = supabase
      .channel('inbox')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: { new: unknown }) => {
        const msg = payload.new as MessageRow;
        if (msg.author === 'contact' && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Nova mensagem no WhatsApp', { body: msg.body.slice(0, 120), tag: msg.conversation_id });
        }
        refresh();
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [router, selectedId]);
}

const noopSubscribe = () => () => {};
const permissionSnapshot = (): NotificationPermission | 'unsupported' =>
  'Notification' in window ? Notification.permission : 'unsupported';
const permissionServerSnapshot = () => 'unsupported' as const;

export default function Inbox({ conversations, selected, messages, lead }: InboxProps) {
  useLiveRefresh(selected?.id ?? null);
  const browserPermission = useSyncExternalStore(noopSubscribe, permissionSnapshot, permissionServerSnapshot);
  const [requested, setRequested] = useState<NotificationPermission | null>(null);
  const notifyState = requested ?? browserPermission;
  const setNotifyState = setRequested;

  useEffect(() => {
    if (selected && selected.unread_count > 0) markConversationRead(selected.id);
  }, [selected]);

  return (
    <div className="grid h-[calc(100vh-13rem)] min-h-[520px] overflow-hidden rounded-lg border border-border bg-surface lg:grid-cols-[320px_1fr]">
      <aside className={`flex min-h-0 flex-col border-border lg:border-r ${selected ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm">
          <span className="text-muted">{conversations.length} conversas</span>
          {notifyState === 'default' && (
            <button
              type="button"
              onClick={async () => setNotifyState(await Notification.requestPermission())}
              className="font-medium underline underline-offset-4"
            >
              Ativar avisos
            </button>
          )}
        </div>
        {conversations.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            Nenhuma conversa ainda. Quando alguém mandar mensagem para o seu WhatsApp conectado, ela aparece aqui.
          </p>
        ) : (
          <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
            {conversations.map((c) => {
              const active = c.id === selected?.id;
              return (
                <li key={c.id}>
                  <Link
                    href={`/admin/conversas?c=${c.id}`}
                    scroll={false}
                    aria-current={active ? 'true' : undefined}
                    className={`block px-4 py-3 transition-colors ${active ? 'bg-surface-2' : 'hover:bg-surface-2/60'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{displayName(c)}</span>
                      <span className="shrink-0 text-xs text-muted">{timeAgo(c.last_message_at)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted">{c.last_message_preview}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs">
                      {c.needs_attention && <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-accent-fg">Precisa de você</span>}
                      <span className="text-muted">{MODE_LABEL[c.mode]}</span>
                      {c.unread_count > 0 && (
                        <span className="ml-auto rounded-full bg-foreground px-1.5 text-background tabular-nums">{c.unread_count}</span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <section className={`min-h-0 flex-col ${selected ? 'flex' : 'hidden lg:flex'}`}>
        {selected ? (
          <Chat key={selected.id} conversation={selected} messages={messages} lead={lead} />
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-muted">Escolha uma conversa na lista.</div>
        )}
      </section>
    </div>
  );
}

function Chat({ conversation, messages, lead }: { conversation: ConversationRow; messages: MessageRow[]; lead: LeadRow | null }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [optimistic, addOptimistic] = useOptimistic(messages, (current: MessageRow[], next: MessageRow) => [...current, next]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [optimistic.length]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setError(null);
    startTransition(async () => {
      addOptimistic({
        id: `tmp-${Date.now()}`,
        conversation_id: conversation.id,
        direction: 'out',
        author: 'admin',
        body: text,
        wa_message_id: null,
        status: 'sent',
        created_at: new Date().toISOString(),
      });
      const res = await sendAdminMessage(conversation.id, text);
      if (res.error) {
        setError(res.error);
        setDraft(text);
      }
    });
  }

  function changeMode(mode: ConversationRow['mode']) {
    startTransition(() => setConversationMode(conversation.id, mode));
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/conversas" className="text-muted lg:hidden" aria-label="Voltar para a lista">
            ←
          </Link>
          <div className="min-w-0">
            <p className="truncate font-semibold">{displayName(conversation)}</p>
            <p className="text-sm text-muted">
              {formatPhone(conversation.phone)}
              {lead && (
                <>
                  {', '}
                  <Link href={`/admin/leads?status=${lead.status}`} className="underline underline-offset-4">
                    lead {lead.company ?? lead.name}
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {conversation.mode !== 'human' && (
            <button type="button" disabled={pending} onClick={() => changeMode('human')} className={buttonPrimary}>
              Assumir conversa
            </button>
          )}
          {conversation.mode !== 'ai' && (
            <button type="button" disabled={pending} onClick={() => changeMode('ai')} className={buttonSecondary}>
              Devolver para a IA
            </button>
          )}
          {conversation.mode !== 'closed' && (
            <button type="button" disabled={pending} onClick={() => changeMode('closed')} className={buttonSecondary}>
              Encerrar
            </button>
          )}
        </div>
      </header>

      {conversation.needs_attention && conversation.handoff_reason && (
        <p className="border-b border-border bg-accent/15 px-4 py-2 text-sm">
          <strong>Transferida para você:</strong> {conversation.handoff_reason}
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
        <ol className="flex flex-col gap-2.5">
          {optimistic.map((m) =>
            m.author === 'system' ? (
              <li key={m.id} className="my-1 self-center whitespace-pre-line rounded-md bg-surface-2 px-3 py-1.5 text-center text-xs text-muted">
                {m.body}
              </li>
            ) : (
              <li
                key={m.id}
                className={`max-w-[80%] rounded-lg px-3.5 py-2 ${
                  m.direction === 'in'
                    ? 'self-start bg-surface-2'
                    : m.author === 'ai'
                      ? 'self-end border border-border bg-background'
                      : 'self-end bg-foreground text-background'
                }`}
              >
                <p className="whitespace-pre-line break-words text-[15px] leading-relaxed">{m.body}</p>
                <p className={`mt-1 text-right text-[11px] ${m.direction === 'out' && m.author === 'admin' ? 'opacity-70' : 'text-muted'}`}>
                  {m.author === 'ai' ? 'IA, ' : m.author === 'admin' ? 'Você, ' : ''}
                  {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  {m.status === 'failed' && <span className="text-danger">, não enviada</span>}
                </p>
              </li>
            ),
          )}
        </ol>
        <div ref={endRef} />
      </div>

      <form
        className="border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        {error && (
          <p role="alert" className="mb-2 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2">
          <label className="sr-only" htmlFor="composer">
            Mensagem
          </label>
          <textarea
            id="composer"
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={conversation.mode === 'ai' ? 'Enviar uma mensagem assume a conversa' : 'Escreva sua resposta (Enter envia, Shift+Enter quebra linha)'}
            className="block max-h-40 min-h-11 flex-1 resize-y rounded-md border border-border bg-background px-3 py-2.5 text-[15px] focus:border-foreground focus:outline-none"
          />
          <button type="submit" disabled={pending || !draft.trim()} className={buttonPrimary}>
            Enviar
          </button>
        </div>
      </form>
    </>
  );
}
