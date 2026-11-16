'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { saveFaq, type FaqFormState } from '@/actions/admin/faqs';
import type { FaqRow } from '@/lib/types';
import { buttonPrimary, buttonSecondary, Field, inputClass } from './ui';

export default function FaqForm({ faq }: { faq?: FaqRow }) {
  const [state, action, pending] = useActionState<FaqFormState, FormData>(saveFaq, {});
  const f = faq;

  return (
    <form action={action} key={f?.id ?? 'new'} className="grid gap-4">
      {f && <input type="hidden" name="id" value={f.id} />}
      <Field label="Pergunta (PT)">
        <input name="question_pt" required defaultValue={f?.question_pt} className={inputClass} />
      </Field>
      <Field label="Resposta (PT)" hint="2 a 3 frases diretas">
        <textarea name="answer_pt" required rows={4} defaultValue={f?.answer_pt} className={inputClass} />
      </Field>
      <Field label="Question (EN)" hint="opcional, vazio usa o português">
        <input name="question_en" defaultValue={f?.question_en ?? ''} className={inputClass} />
      </Field>
      <Field label="Answer (EN)">
        <textarea name="answer_en" rows={4} defaultValue={f?.answer_en ?? ''} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ordem" hint="menor aparece primeiro">
          <input name="sort_order" type="number" defaultValue={f?.sort_order ?? 0} className={inputClass} />
        </Field>
        <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium">
          <input type="checkbox" name="published" defaultChecked={f?.published ?? true} className="h-4 w-4" />
          Mostrar no site
        </label>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? 'Salvando…' : f ? 'Salvar alterações' : 'Adicionar pergunta'}
        </button>
        {f && (
          <Link href="/admin/perguntas" className={buttonSecondary}>
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
