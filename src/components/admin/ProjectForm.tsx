'use client';

import Image from 'next/image';
import { useActionState, useState } from 'react';
import { deleteProject, saveProject, type ProjectFormState } from '@/actions/admin/projects';
import { STATUS_OPTIONS } from '@/lib/labels';
import type { ProjectPrivateRow, ProjectRow } from '@/lib/types';
import { buttonDanger, buttonPrimary, Field, inputClass, Panel } from './ui';

interface Props {
  project?: ProjectRow;
  privateData?: ProjectPrivateRow | null;
  /** Categories already in use, suggested so a typo never creates a new group in the constellation. */
  categories?: { pt: string; en: string }[];
}

/** Writing guide shown at the top of the form: one formula and one real example per field. */
function WritingGuide() {
  const rows: [string, string, string][] = [
    ['Título', 'Nome, o que ele faz (até ~60 caracteres)', 'Giro, PDV e retaguarda para adegas'],
    ['Resumo', 'Para quem é + o que resolve + diferencial, em 1 a 2 frases', 'Loja virtual completa para uma marca de cosméticos naturais, feita sem nenhuma dependência.'],
    ['O desafio', 'A dor do cliente na linguagem dele, com números se tiver. Sem falar de tecnologia', 'O escritório emitia guia por guia em cinco portais estaduais, todo mês.'],
    ['A solução', 'O que foi construído, na ordem em que a pessoa usa. Tecnologia só quando explica um ganho. Diga o que ainda não está pronto', 'Um robô entra em cada portal, emite as guias e salva os PDFs organizados por cliente.'],
    ['Resultados', 'Ganho medido (tempo, erros, custo) ou o estado atual. Nunca invente número', 'Fechamento que levava dois dias passou a rodar em minutos.'],
    ['Como funciona', '3 a 5 etapas curtas: o que entra → o que o sistema faz → o que sai', 'Pedido no balcão / Baixa no estoque / Nota emitida'],
    ['Destaques', '4 a 8 capacidades concretas, uma por linha', 'Funciona sem internet e sincroniza depois'],
    ['Imagens', 'Capa = a tela mais bonita. Galeria com 3 a 6 telas do fluxo principal + 1 no celular, cada uma com legenda', 'Checkout com endereço preenchido pelo CEP'],
  ];
  return (
    <details className="rounded-lg border border-border bg-surface-2/60 px-4 py-3 text-sm">
      <summary className="cursor-pointer font-medium">Guia de escrita: como deixar a página completa</summary>
      <dl className="mt-3 grid gap-3">
        {rows.map(([field, formula, example]) => (
          <div key={field}>
            <dt className="font-medium">{field}</dt>
            <dd className="text-muted">
              {formula}. <span className="italic">Ex.: “{example}”</span>
            </dd>
          </div>
        ))}
      </dl>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
        <li>Projeto de cliente: descreva só pelo segmento (ex.: “escritório contábil”), sem nome, link ou print sem autorização.</li>
        <li>Sistema com login: marque “Abre numa tela de login” para o site oferecer demonstração sob pedido.</li>
        <li>Antes de publicar, use “Pré-visualizar” no topo. Depois, gere o link para o cliente em Acessos.</li>
      </ul>
    </details>
  );
}

const checkbox = 'h-4 w-4 accent-[var(--accent)]';

export default function ProjectForm({ project, privateData, categories = [] }: Props) {
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(saveProject, {});
  const p = project;
  const [repoPrivate, setRepoPrivate] = useState(p?.repo_private ?? false);
  const [forSale, setForSale] = useState(p?.for_sale ?? false);
  const repoDefault = (p?.repo_private ? privateData?.repo_url : p?.repo_url) ?? '';

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-3">
      {p && <input type="hidden" name="id" value={p.id} />}

      <div className="flex flex-col gap-6 xl:col-span-2">
        <Panel title="Português">
          <div className="grid gap-4">
            <WritingGuide />
            <Field label="Título" hint='"Nome, o que ele faz", até ~60 caracteres'>
              <input name="title_pt" required defaultValue={p?.title_pt} className={inputClass} />
            </Field>
            <Field label="Resumo" hint="80 a 280 caracteres: para quem é, o que resolve e o diferencial. Aparece no card e no link compartilhado">
              <textarea name="summary_pt" required rows={3} defaultValue={p?.summary_pt} className={inputClass} />
            </Field>
            <Field label="Categoria" hint="escolha uma das sugestões para entrar no grupo certo da constelação">
              <input name="category_pt" list="categorias-pt" defaultValue={p?.category_pt ?? ''} className={inputClass} />
              <datalist id="categorias-pt">
                {categories.map((c) => (
                  <option key={c.pt} value={c.pt} />
                ))}
              </datalist>
            </Field>
            <Field label="O desafio" hint="a dor do cliente, com números se tiver; sem falar de tecnologia">
              <textarea name="challenge_pt" rows={4} defaultValue={p?.challenge_pt ?? ''} className={inputClass} />
            </Field>
            <Field label="A solução" hint="o que foi construído, na ordem de uso; diga o que ainda não está pronto">
              <textarea name="solution_pt" rows={4} defaultValue={p?.solution_pt ?? ''} className={inputClass} />
            </Field>
            <Field label="Resultados" hint="ganho medido ou estado atual; nunca invente número">
              <textarea name="results_pt" rows={3} defaultValue={p?.results_pt ?? ''} className={inputClass} />
            </Field>
            <Field label="Como funciona" hint="3 a 5 etapas curtas, uma por linha: o que entra, o que o sistema faz, o que sai">
              <textarea name="flow_pt" rows={4} defaultValue={p?.flow_pt?.join('\n') ?? ''} className={inputClass} />
            </Field>
            <Field label="Destaques" hint="4 a 8 capacidades concretas, uma por linha">
              <textarea name="highlights_pt" rows={4} defaultValue={p?.highlights_pt.join('\n') ?? ''} className={inputClass} />
            </Field>
            <Field label="Texto livre" hint="usado só quando desafio, solução e resultados estão vazios">
              <textarea name="body_pt" rows={5} defaultValue={p?.body_pt ?? ''} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="English">
          <div className="grid gap-4">
            <p className="text-sm text-muted">Campos vazios usam o texto em português.</p>
            <Field label="Title">
              <input name="title_en" defaultValue={p?.title_en ?? ''} className={inputClass} />
            </Field>
            <Field label="Summary">
              <textarea name="summary_en" rows={3} defaultValue={p?.summary_en ?? ''} className={inputClass} />
            </Field>
            <Field label="Category" hint="use a tradução da categoria escolhida">
              <input name="category_en" list="categorias-en" defaultValue={p?.category_en ?? ''} className={inputClass} />
              <datalist id="categorias-en">
                {categories
                  .filter((c) => c.en)
                  .map((c) => (
                    <option key={c.en} value={c.en} />
                  ))}
              </datalist>
            </Field>
            <Field label="The challenge">
              <textarea name="challenge_en" rows={4} defaultValue={p?.challenge_en ?? ''} className={inputClass} />
            </Field>
            <Field label="The solution">
              <textarea name="solution_en" rows={4} defaultValue={p?.solution_en ?? ''} className={inputClass} />
            </Field>
            <Field label="Results">
              <textarea name="results_en" rows={3} defaultValue={p?.results_en ?? ''} className={inputClass} />
            </Field>
            <Field label="How it works" hint="one step per line">
              <textarea name="flow_en" rows={4} defaultValue={p?.flow_en?.join('\n') ?? ''} className={inputClass} />
            </Field>
            <Field label="Highlights" hint="one per line">
              <textarea name="highlights_en" rows={4} defaultValue={p?.highlights_en.join('\n') ?? ''} className={inputClass} />
            </Field>
            <Field label="Free text">
              <textarea name="body_en" rows={5} defaultValue={p?.body_en ?? ''} className={inputClass} />
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
              <input type="checkbox" name="featured" defaultChecked={p?.featured ?? false} className={checkbox} />
              Em destaque
            </label>
            <Field label="Situação">
              <select name="status" defaultValue={p?.status ?? 'completed'} className={inputClass}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ordem" hint="menor aparece primeiro">
              <input name="sort_order" type="number" defaultValue={p?.sort_order ?? 0} className={inputClass} />
            </Field>
            <Field label="Endereço (slug)" hint="gerado do título se vazio">
              <input name="slug" defaultValue={p?.slug ?? ''} pattern="[a-z0-9-]*" className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="Código e links">
          <div className="grid gap-4">
            <fieldset>
              <legend className="text-sm font-medium">Repositório</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { value: 'public', label: 'Público', active: !repoPrivate },
                  { value: 'private', label: 'Privado', active: repoPrivate },
                ].map((o) => (
                  <label
                    key={o.value}
                    className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium transition-colors ${
                      o.active ? 'border-accent bg-accent/10' : 'border-border text-muted hover:text-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="repo_private"
                      value={o.value}
                      checked={o.active}
                      onChange={() => setRepoPrivate(o.value === 'private')}
                      className="sr-only"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field
              label="Link do repositório"
              hint={repoPrivate ? 'fica só no painel, nunca aparece no site' : 'aparece no site como "Ver código"'}
            >
              <input name="repo_url" type="url" placeholder="https://github.com/…" defaultValue={repoDefault} className={inputClass} />
            </Field>
            <Field label="Link do sistema no ar" hint="usado também na captura automática">
              <input name="live_url" type="url" placeholder="https://" defaultValue={p?.live_url ?? ''} className={inputClass} />
            </Field>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" name="live_login" defaultChecked={p?.live_login ?? false} className={checkbox} />
              Abre numa tela de login (o site mostra &quot;acesso de demonstração sob pedido&quot;)
            </label>
            <Field label="Tecnologias" hint="separadas por vírgula">
              <input name="technologies" defaultValue={p?.technologies.join(', ') ?? ''} className={inputClass} />
            </Field>
            <Field label="Ano">
              <input name="year" type="number" min={2000} max={2100} defaultValue={p?.year ?? new Date().getFullYear()} className={inputClass} />
            </Field>
            <input type="hidden" name="github_full_name" defaultValue={privateData?.github_full_name ?? ''} />
          </div>
        </Panel>

        <Panel title="Venda">
          <div className="grid gap-4">
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" name="for_sale" checked={forSale} onChange={(e) => setForSale(e.target.checked)} className={checkbox} />
              Disponível para venda
            </label>
            <div className={forSale ? 'grid gap-4' : 'hidden'}>
              <Field label="Preço exibido" hint='ex.: "A partir de R$ 4.900". Vazio mostra "Valor sob consulta"'>
                <input name="price_label" defaultValue={p?.price_label ?? ''} className={inputClass} />
              </Field>
              <Field label="Nota de venda (PT)" hint="o que está incluso: código, implantação, suporte…">
                <textarea name="sale_note_pt" rows={3} defaultValue={p?.sale_note_pt ?? ''} className={inputClass} />
              </Field>
              <Field label="Sale note (EN)">
                <textarea name="sale_note_en" rows={3} defaultValue={p?.sale_note_en ?? ''} className={inputClass} />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="Anotações internas">
          <div className="grid gap-4">
            <p className="text-sm text-muted">Só você vê. Nada aqui vai para o site.</p>
            <Field label="Preço mínimo / negociação">
              <input name="internal_price" defaultValue={privateData?.internal_price ?? ''} className={inputClass} />
            </Field>
            <Field label="Notas">
              <textarea name="notes" rows={4} defaultValue={privateData?.notes ?? ''} className={inputClass} />
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
                  Remover capa e usar a capa ilustrada
                </label>
              </>
            )}
            <Field label={p?.cover_url ? 'Trocar imagem' : 'Enviar imagem'} hint="print real, 1600×1000, até 5 MB">
              <input name="cover" type="file" accept="image/png,image/jpeg,image/webp" className="mt-1.5 block w-full text-sm" />
            </Field>
            {p && <p className="text-xs text-muted">Também dá para capturar o site no ar na galeria, abaixo.</p>}
          </div>
        </Panel>

        {state.error && (
          <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
            {state.error}
          </p>
        )}

        <div className="sticky bottom-4 flex flex-wrap gap-3">
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
