'use client';

import { useState } from 'react';
import { buttonPrimary, buttonSecondary, Field, inputClass } from './ui';

interface Props {
  siteUrl: string;
  projects: { slug: string; title: string }[];
  initialSlug?: string;
}

/** "Carlos Mendes" → "carlos-mendes": the tag the site records for every visit made through the link. */
export function clientTag(name: string) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export default function ClientLinkBuilder({ siteUrl, projects, initialSlug }: Props) {
  const [slug, setSlug] = useState(
    initialSlug && projects.some((p) => p.slug === initialSlug) ? initialSlug : (projects[0]?.slug ?? ''),
  );
  const [client, setClient] = useState('');
  const [english, setEnglish] = useState(false);
  const [copied, setCopied] = useState<'link' | 'message' | null>(null);

  const tag = clientTag(client);
  const path = `${english ? '/en' : ''}${slug ? `/projetos/${slug}` : ''}` || '/';
  const link = tag ? `${siteUrl}${path}?c=${tag}` : '';
  const title = projects.find((p) => p.slug === slug)?.title;
  const firstName = client.trim().split(/\s+/)[0];
  const message = english
    ? `Hi ${firstName}! Here is the ${title ?? 'portfolio'} case, with how it works, screenshots and stack: ${link}`
    : `Olá, ${firstName}! Segue o case ${title ? `do ${title}` : 'do meu portfólio'}, com como funciona, telas e tecnologias: ${link}`;

  async function copy(kind: 'link' | 'message') {
    await navigator.clipboard.writeText(kind === 'link' ? link : message);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Projeto">
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass}>
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
            <option value="">Página inicial (portfólio inteiro)</option>
          </select>
        </Field>
        <Field label="Cliente" hint="nome ou apelido, só você vê no painel">
          <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="ex.: Carlos adega" className={inputClass} />
        </Field>
      </div>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input type="checkbox" checked={english} onChange={(e) => setEnglish(e.target.checked)} className="h-4 w-4" />
        Página em inglês
      </label>
      <div className="rounded-md border border-border bg-surface-2 px-4 py-3 text-sm">
        {link ? <span className="break-all font-mono">{link}</span> : <span className="text-muted">Digite o nome do cliente para gerar o link.</span>}
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={!link} onClick={() => copy('link')} className={buttonPrimary}>
          {copied === 'link' ? 'Link copiado' : 'Copiar link'}
        </button>
        <button type="button" disabled={!link} onClick={() => copy('message')} className={buttonSecondary}>
          {copied === 'message' ? 'Mensagem copiada' : 'Copiar mensagem pronta'}
        </button>
      </div>
      <p className="text-xs text-muted">
        Ao abrir, o site guarda a marca do cliente e tira o <code>?c=</code> do endereço. Se ele copiar o link da barra do navegador para
        repassar, quem receber não entra na conta dele.
      </p>
    </div>
  );
}
