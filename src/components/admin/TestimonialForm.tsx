'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { saveTestimonial, type TestimonialFormState } from '@/actions/admin/testimonials';
import type { TestimonialRow } from '@/lib/types';
import { buttonPrimary, buttonSecondary, Field, inputClass } from './ui';

interface Props {
  testimonial?: TestimonialRow;
  projects: { slug: string; title: string }[];
}

export default function TestimonialForm({ testimonial, projects }: Props) {
  const [state, action, pending] = useActionState<TestimonialFormState, FormData>(saveTestimonial, {});
  const t = testimonial;

  return (
    <form action={action} key={t?.id ?? 'new'} className="grid gap-4 sm:grid-cols-2">
      {t && <input type="hidden" name="id" value={t.id} />}
      <Field label="Nome" hint='ex.: "Carlos M." ou "Clínica de estética"'>
        <input name="author_name" required defaultValue={t?.author_name} className={inputClass} />
      </Field>
      <Field label="Nota" hint="opcional, de 1 a 5 estrelas">
        <select name="rating" defaultValue={t?.rating ?? ''} className={inputClass}>
          <option value="">Sem nota</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {'★'.repeat(n)} ({n})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Cargo ou segmento (PT)" hint='ex.: "Dono de adega" ou "Escritório contábil"'>
        <input name="author_role_pt" defaultValue={t?.author_role_pt ?? ''} className={inputClass} />
      </Field>
      <Field label="Cargo ou segmento (EN)" hint="opcional">
        <input name="author_role_en" defaultValue={t?.author_role_en ?? ''} className={inputClass} />
      </Field>
      <Field label="Depoimento (PT)" hint="o texto como o cliente escreveu" className="sm:col-span-2">
        <textarea name="quote_pt" required rows={4} defaultValue={t?.quote_pt} className={inputClass} />
      </Field>
      <Field label="Depoimento (EN)" hint="opcional, vazio usa o português" className="sm:col-span-2">
        <textarea name="quote_en" rows={4} defaultValue={t?.quote_en ?? ''} className={inputClass} />
      </Field>
      <Field label="Projeto relacionado" hint="aparece também na página do projeto">
        <select name="project_slug" defaultValue={t?.project_slug ?? ''} className={inputClass}>
          <option value="">Nenhum</option>
          {projects.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Origem" hint='ex.: "99Freelas", "Workana", "LinkedIn"'>
        <input name="source" defaultValue={t?.source ?? ''} className={inputClass} />
      </Field>
      <Field label="Ordem" hint="menor aparece primeiro">
        <input name="sort_order" type="number" defaultValue={t?.sort_order ?? 0} className={inputClass} />
      </Field>
      <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium">
        <input type="checkbox" name="published" defaultChecked={t?.published ?? true} className="h-4 w-4" />
        Mostrar no site
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-danger sm:col-span-2">
          {state.error}
        </p>
      )}
      <div className="flex gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? 'Salvando…' : t ? 'Salvar alterações' : 'Adicionar depoimento'}
        </button>
        {t && (
          <Link href="/admin/depoimentos" className={buttonSecondary}>
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
