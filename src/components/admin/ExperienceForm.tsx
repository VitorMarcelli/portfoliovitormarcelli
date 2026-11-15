'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { saveExperience, type ExperienceFormState } from '@/actions/admin/experiences';
import type { ExperienceRow } from '@/lib/types';
import { buttonPrimary, buttonSecondary, Field, inputClass } from './ui';

export default function ExperienceForm({ experience }: { experience?: ExperienceRow }) {
  const [state, action, pending] = useActionState<ExperienceFormState, FormData>(saveExperience, {});
  const e = experience;
  const [current, setCurrent] = useState(e ? !e.end_date : false);

  return (
    <form action={action} key={e?.id ?? 'new'} className="grid gap-4 sm:grid-cols-2">
      {e && <input type="hidden" name="id" value={e.id} />}
      <Field label="Tipo">
        <select name="kind" defaultValue={e?.kind ?? 'work'} className={inputClass}>
          <option value="work">Experiência profissional</option>
          <option value="education">Formação</option>
        </select>
      </Field>
      <Field label="Empresa ou instituição">
        <input name="organization" required defaultValue={e?.organization} className={inputClass} />
      </Field>
      <Field label="Cargo ou curso (PT)">
        <input name="title_pt" required defaultValue={e?.title_pt} className={inputClass} />
      </Field>
      <Field label="Cargo ou curso (EN)" hint="opcional">
        <input name="title_en" defaultValue={e?.title_en ?? ''} className={inputClass} />
      </Field>
      <Field label="Início">
        <input name="start" type="month" required defaultValue={e?.start_date.slice(0, 7)} className={inputClass} />
      </Field>
      <Field label="Término">
        <input name="end" type="month" disabled={current} defaultValue={e?.end_date?.slice(0, 7) ?? ''} className={`${inputClass} disabled:opacity-50`} />
      </Field>
      <label className="flex items-center gap-3 text-sm font-medium sm:col-span-2">
        <input type="checkbox" name="current" checked={current} onChange={(ev) => setCurrent(ev.target.checked)} className="h-4 w-4" />
        Atual (ainda estou aqui)
      </label>
      <Field label="Descrição (PT)" hint="opcional, 1 a 3 frases" className="sm:col-span-2">
        <textarea name="description_pt" rows={3} defaultValue={e?.description_pt ?? ''} className={inputClass} />
      </Field>
      <Field label="Descrição (EN)" hint="opcional" className="sm:col-span-2">
        <textarea name="description_en" rows={3} defaultValue={e?.description_en ?? ''} className={inputClass} />
      </Field>
      <label className="flex items-center gap-3 text-sm font-medium sm:col-span-2">
        <input type="checkbox" name="published" defaultChecked={e?.published ?? true} className="h-4 w-4" />
        Mostrar no site
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-danger sm:col-span-2">
          {state.error}
        </p>
      )}
      <div className="flex gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? 'Salvando…' : e ? 'Salvar alterações' : 'Adicionar'}
        </button>
        {e && (
          <Link href="/admin/trajetoria" className={buttonSecondary}>
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
