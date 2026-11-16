'use client';

import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';
import {
  addGalleryImages,
  captureLiveSite,
  setCoverFromGallery,
  updateGallery,
  type GalleryResult,
} from '@/actions/admin/projects';
import type { GalleryItem } from '@/lib/types';
import { buttonSecondary, inputClass, Panel } from './ui';

interface Props {
  projectId: string;
  initialGallery: GalleryItem[];
  initialCover: string | null;
  liveUrl: string | null;
}

export default function GalleryManager({ projectId, initialGallery, initialCover, liveUrl }: Props) {
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [cover, setCover] = useState<string | null>(initialCover);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const run = (label: string, ok: string, task: () => Promise<GalleryResult>) => {
    setBusy(label);
    setMessage(null);
    startTransition(async () => {
      const result = await task();
      setBusy(null);
      if (result.error) return setMessage({ kind: 'error', text: result.error });
      if (result.gallery) setGallery(result.gallery);
      if (result.coverUrl !== undefined) setCover(result.coverUrl);
      setDirty(false);
      setMessage({ kind: 'ok', text: ok });
    });
  };

  const edit = (next: GalleryItem[]) => {
    setGallery(next);
    setDirty(true);
  };
  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= gallery.length) return;
    const next = [...gallery];
    [next[i], next[j]] = [next[j], next[i]];
    edit(next);
  };

  return (
    <Panel title="Galeria e capturas">
      <div className="grid gap-5">
        <div className="flex flex-wrap gap-3">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length === 0) return;
              const data = new FormData();
              files.forEach((f) => data.append('images', f));
              e.target.value = '';
              run('upload', `${files.length} imagem(ns) adicionada(s).`, () => addGalleryImages(projectId, data));
            }}
          />
          <button type="button" className={buttonSecondary} disabled={busy !== null} onClick={() => fileRef.current?.click()}>
            {busy === 'upload' ? 'Enviando…' : 'Enviar imagens'}
          </button>
          <button
            type="button"
            className={buttonSecondary}
            disabled={busy !== null || !liveUrl}
            title={liveUrl ? undefined : 'Preencha e salve o link do sistema no ar'}
            onClick={() => run('cover', 'Captura salva como capa.', () => captureLiveSite(projectId, 'cover'))}
          >
            {busy === 'cover' ? 'Capturando… (até 40 s)' : 'Capturar site como capa'}
          </button>
          <button
            type="button"
            className={buttonSecondary}
            disabled={busy !== null || !liveUrl}
            onClick={() => run('shot', 'Captura adicionada à galeria.', () => captureLiveSite(projectId, 'gallery'))}
          >
            {busy === 'shot' ? 'Capturando… (até 40 s)' : 'Capturar site na galeria'}
          </button>
        </div>
        <p className="text-xs text-muted">
          PNG, JPG ou WEBP até 5 MB cada, até 10 por vez. A captura abre o link do sistema no ar em 1440×900.
        </p>

        {message && (
          <p
            role={message.kind === 'error' ? 'alert' : 'status'}
            className={`rounded-md border px-4 py-3 text-sm ${
              message.kind === 'error' ? 'border-danger/40 bg-danger/10' : 'border-success/40 bg-success/10'
            }`}
          >
            {message.text}
          </p>
        )}

        {gallery.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            Nenhuma imagem ainda. Prints de telas reais vendem muito mais que texto.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {gallery.map((item, i) => (
              <li key={item.url} className="rounded-lg border border-border p-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-surface-2">
                  <Image src={item.url} alt="" fill sizes="400px" className="object-cover object-top" />
                  {cover === item.url && (
                    <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-fg">Capa</span>
                  )}
                </div>
                <div className="mt-3 grid gap-2">
                  <input
                    aria-label="Legenda em português"
                    placeholder="Legenda (PT)"
                    value={item.caption_pt ?? ''}
                    onChange={(e) => edit(gallery.map((g, k) => (k === i ? { ...g, caption_pt: e.target.value } : g)))}
                    className={inputClass}
                  />
                  <input
                    aria-label="Legenda em inglês"
                    placeholder="Caption (EN)"
                    value={item.caption_en ?? ''}
                    onChange={(e) => edit(gallery.map((g, k) => (k === i ? { ...g, caption_en: e.target.value } : g)))}
                    className={inputClass}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded border border-border px-2 py-1 disabled:opacity-40" aria-label="Mover para antes">
                    ←
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === gallery.length - 1} className="rounded border border-border px-2 py-1 disabled:opacity-40" aria-label="Mover para depois">
                    →
                  </button>
                  {cover !== item.url && (
                    <button
                      type="button"
                      disabled={busy !== null || dirty}
                      title={dirty ? 'Salve a galeria antes' : undefined}
                      onClick={() => run('setcover', 'Capa atualizada.', () => setCoverFromGallery(projectId, item.url))}
                      className="rounded border border-border px-2 py-1 disabled:opacity-40"
                    >
                      Usar como capa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => edit(gallery.filter((_, k) => k !== i))}
                    className="ml-auto rounded border border-danger/40 px-2 py-1 text-danger"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {dirty && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => run('save', 'Galeria salva.', () => updateGallery(projectId, gallery))}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg disabled:opacity-60"
            >
              {busy === 'save' ? 'Salvando…' : 'Salvar galeria'}
            </button>
            <span className="text-sm text-muted">Há alterações de ordem, legenda ou remoção não salvas.</span>
          </div>
        )}
      </div>
    </Panel>
  );
}
