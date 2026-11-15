'use client';

import { useState, useTransition } from 'react';
import { deleteLead, updateLeadNotes, updateLeadStatus } from '@/actions/admin/leads';
import type { LeadRow, LeadStatus } from '@/lib/types';
import { formatPhone, whatsappLink } from '@/lib/whatsapp/link';
import { inputClass, timeAgo } from './ui';

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  em_contato: 'Em contato',
  proposta: 'Proposta enviada',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

export default function LeadCard({ lead }: { lead: LeadRow }) {
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(lead.notes ?? '');
  const [savedNotes, setSavedNotes] = useState(lead.notes ?? '');

  return (
    <article className={`rounded-lg border bg-surface p-5 ${lead.status === 'novo' ? 'border-accent' : 'border-border'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">
            {lead.name}
            {lead.company && <span className="font-normal text-muted">, {lead.company}</span>}
          </h3>
          <p className="text-sm text-muted">
            {lead.source === 'whatsapp' ? 'Via WhatsApp' : 'Via formulário do site'}, {timeAgo(lead.created_at)}
          </p>
        </div>
        <select
          aria-label={`Status de ${lead.name}`}
          defaultValue={lead.status}
          disabled={pending}
          onChange={(e) => startTransition(() => updateLeadStatus(lead.id, e.target.value as LeadStatus))}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {lead.message && <p className="mt-4 whitespace-pre-line leading-relaxed">{lead.message}</p>}

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="underline underline-offset-4">
            {lead.email}
          </a>
        )}
        {lead.phone && (
          <a href={whatsappLink(lead.phone, `Olá ${lead.name.split(' ')[0]}, aqui é o Vitor Marcelli.`)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            WhatsApp {formatPhone(lead.phone)}
          </a>
        )}
      </div>

      <label className="mt-4 block text-sm font-medium">
        Anotações
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== savedNotes) {
              startTransition(async () => {
                await updateLeadNotes(lead.id, notes);
                setSavedNotes(notes);
              });
            }
          }}
          placeholder="Orçamento, próximos passos…"
          className={inputClass}
        />
      </label>
      <div className="mt-3 flex justify-between text-sm">
        <span className="text-muted" aria-live="polite">
          {pending ? 'Salvando…' : notes === savedNotes ? '' : 'Alterações não salvas'}
        </span>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Excluir o lead de ${lead.name}?`)) startTransition(() => deleteLead(lead.id));
          }}
          className="text-danger underline underline-offset-4"
        >
          Excluir
        </button>
      </div>
    </article>
  );
}
