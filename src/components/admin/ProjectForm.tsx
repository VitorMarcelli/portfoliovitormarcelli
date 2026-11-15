'use client';

import Image from 'next/image';
import { useActionState } from 'react';
import { deleteProject, saveProject, type ProjectFormState } from '@/actions/admin/projects';
import type { ProjectRow } from '@/lib/types';
import { buttonDanger, buttonPrimary, Field, inputClass, Panel } from './ui';

export default function ProjectForm({ project }: { project?: ProjectRow }) {
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(saveProject, {});
  const p = project;

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-3">
      {p && <input type="hidden" name="id" value={p.id} />}

      <div className="flex flex-col gap-6 xl:col-span-2">
        <Panel title="Português">
          <div className="grid gap-4">
            <Field label="Título">
              <input name="title_pt" required defaultValue={p?.title_pt} className={inputClass} />
            </Field>
            <Field label="Resumo" hint="1 a 2 frases, aparece na listagem">
              <textarea name="summary_pt" required rows={3} defaultValue={p?.summary_pt} className={inputClass} />
            </Field>
            <Field label="Case completo" hint="parágrafos separados por linha em branco">
              <textarea name="body_pt" rows={9} defaultValue={p?.body_pt ?? ''} className={inputClass} />
            </Field>
            <Field label="Categoria" hint="ex.: Automação fiscal">
              <input name="category_pt" defaultValue={p?.category_pt ?? ''} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="English">
          <div className="grid gap-4">
            <Field label="Title" hint="se vazio, usa o português">
              <input name="title_en" defaultValue={p?.title_en ?? ''} className={inputClass} />
            </Field>
            <Field label="Summary">
              <textarea name="summary_en" rows={3} defaultValue={p?.summary_en ?? ''} className={inputClass} />
            </Field>
            <Field label="Full case">
              <textarea name="body_en" rows={9} defaultValue={p?.body_en ?? ''} className={inputClass} />
            </Field>
            <Field label="Category">
              <input name="category_en" defaultValue={p?.category_en ?? ''} className={inputClass} />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-6">
        <Panel title="Publicação">
          <div className="grid gap-4">
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" name="published" defaultChecked={p?.published ?? false} className="h-4 w-4 accent-[var(--success)]" />
              Publicado no site
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" name="featured" defaultChecked={p?.featured ?? false} className="h-4 w-4 accent-[var(--accent)]" />
              Em destaque
            </label>
            <Field label="Ordem" hint="menor aparece primeiro">
              <input name="sort_order" type="number" defaultValue={p?.sort_order ?? 0} className={inputClass} />
            </Field>
            <Field label="Endereço (slug)" hint="gerado do título se vazio">
              <input name="slug" defaultValue={p?.slug ?? ''} pattern="[a-z0-9-]*" className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="Detalhes">
          <div className="grid gap-4">
            <Field label="Tecnologias" hint="separadas por vírgula">
              <input name="technologies" defaultValue={p?.technologies.join(', ') ?? ''} className={inputClass} />
            </Field>
            <Field label="Ano">
              <input name="year" type="number" min={2000} max={2100} defaultValue={p?.year ?? new Date().getFullYear()} className={inputClass} />
            </Field>
            <Field label="Link do sistema no ar">
              <input name="live_url" type="url" placeholder="https://" defaultValue={p?.live_url ?? ''} className={inputClass} />
            </Field>
            <Field label="Link do repositório">
              <input name="repo_url" type="url" placeholder="https://github.com/…" defaultValue={p?.repo_url ?? ''} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="Capa">
          <div className="grid gap-4">
            {p?.cover_url && (
              <>
                <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-border">
                  <Image src={p.cover_url} alt="" fill sizes="320px" className="object-cover object-top" />
                </div>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" name="remove_cover" className="h-4 w-4" />
                  Remover capa e usar a capa tipográfica
                </label>
              </>
            )}
            <Field label={p?.cover_url ? 'Trocar imagem' : 'Enviar imagem'} hint="print real, 1600×1000, até 5 MB">
              <input name="cover" type="file" accept="image/png,image/jpeg,image/webp" className="mt-1.5 block w-full text-sm" />
            </Field>
          </div>
        </Panel>

        {state.error && (
          <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
            {state.error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={pending} className={buttonPrimary}>
            {pending ? 'Salvando…' : p ? 'Salvar alterações' : 'Criar projeto'}
          </button>
          {p && (
            <button
              type="button"
              className={buttonDanger}
              onClick={async () => {
                if (confirm(`Excluir "${p.title_pt}"? Essa ação não pode ser desfeita.`)) await deleteProject(p.id);
              }}
            >
              Excluir
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
