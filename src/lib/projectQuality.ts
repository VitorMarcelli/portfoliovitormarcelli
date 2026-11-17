import type { ProjectRow } from '@/lib/types';

/**
 * What makes a project page complete, with the tip shown in the panel for each missing item.
 * "essential" items are what a client notices right away; "recommended" ones polish the page.
 */
export interface QualityItem {
  key: string;
  label: string;
  ok: boolean;
  tip: string;
  level: 'essential' | 'recommended';
}

const PLACEHOLDER = 'Descreva em uma ou duas frases';
const len = (s: string | null | undefined) => (s ?? '').trim().length;

export function projectQuality(p: ProjectRow, knownCategories: string[] = []): { items: QualityItem[]; done: number; total: number } {
  const gallery = p.gallery ?? [];
  const flow = p.flow_pt ?? [];
  const words = (p.title_pt ?? '').trim().split(/\s+/).filter(Boolean).length;

  const items: QualityItem[] = [
    {
      key: 'title',
      label: 'Título que diz o que o sistema faz',
      ok: words >= 3 && len(p.title_pt) <= 70,
      tip: 'Use "Nome, o que ele faz". Ex.: "Giro, PDV e retaguarda para adegas". Evite deixar o nome do repositório.',
      level: 'essential',
    },
    {
      key: 'summary',
      label: 'Resumo de 1 a 2 frases',
      ok: len(p.summary_pt) >= 80 && len(p.summary_pt) <= 280 && !(p.summary_pt ?? '').startsWith(PLACEHOLDER),
      tip: 'Entre 80 e 280 caracteres: para quem é, o que resolve e o diferencial. Aparece no card da constelação e quando o link é compartilhado.',
      level: 'essential',
    },
    {
      key: 'category',
      label: 'Categoria',
      ok: len(p.category_pt) > 0 && (knownCategories.length === 0 || knownCategories.includes(p.category_pt!.trim())),
      tip: 'Escolha uma categoria que já existe, para o projeto entrar no grupo certo da constelação.',
      level: 'essential',
    },
    {
      key: 'case',
      label: 'Desafio, solução e resultados',
      ok: len(p.challenge_pt) >= 60 && len(p.solution_pt) >= 150 && len(p.results_pt) >= 40,
      tip: 'Desafio: a dor do cliente. Solução: o que foi construído. Resultados: ganhos ou estado atual. Veja o guia no formulário.',
      level: 'essential',
    },
    {
      key: 'flow',
      label: '"Como funciona" com 3 a 5 etapas',
      ok: flow.length >= 3 && flow.length <= 5,
      tip: 'Uma etapa por linha, do ponto de vista de quem usa: o que entra, o que o sistema faz, o que sai.',
      level: 'essential',
    },
    {
      key: 'cover',
      label: 'Capa',
      ok: Boolean(p.cover_url),
      tip: 'A tela mais bonita e representativa. Na galeria, use "Usar como capa" ou "Capturar site como capa".',
      level: 'essential',
    },
    {
      key: 'highlights',
      label: 'Pelo menos 4 destaques',
      ok: (p.highlights_pt ?? []).length >= 4,
      tip: 'Capacidades concretas, curtas, uma por linha. Ex.: "Checkout com PIX, cartão ou boleto".',
      level: 'recommended',
    },
    {
      key: 'tech',
      label: 'Pelo menos 3 tecnologias',
      ok: (p.technologies ?? []).length >= 3,
      tip: 'As principais, separadas por vírgula. Recrutadores filtram por elas.',
      level: 'recommended',
    },
    {
      key: 'gallery',
      label: 'Galeria com 3 ou mais telas',
      ok: gallery.length >= 3,
      tip: 'Mostre o fluxo principal e uma tela no celular. Prints reais, nunca com dados de clientes.',
      level: 'recommended',
    },
    {
      key: 'captions',
      label: 'Legenda em todas as imagens',
      ok: gallery.length > 0 && gallery.every((g) => len(g.caption_pt) > 0),
      tip: 'Diga o que a tela mostra. Ex.: "Checkout com endereço preenchido pelo CEP".',
      level: 'recommended',
    },
    {
      key: 'english',
      label: 'Versão em inglês',
      ok: len(p.title_en) > 0 && len(p.summary_en) > 0 && len(p.solution_en) > 0 && (p.flow_en ?? []).length > 0,
      tip: 'Pelo menos título, resumo, solução e "Como funciona". Vazio mostra o português na versão em inglês.',
      level: 'recommended',
    },
    {
      key: 'live',
      label: 'Link do sistema no ar',
      ok: Boolean(p.live_url) || p.status !== 'live',
      tip: 'A situação diz "No ar", mas falta o link. Preencha o link ou mude a situação.',
      level: 'recommended',
    },
  ];

  return { items, done: items.filter((i) => i.ok).length, total: items.length };
}

/** Distinct categories already in use, with their English names, most used first. */
export function categoryList(rows: { category_pt: string | null; category_en: string | null }[]) {
  const counts = new Map<string, { pt: string; en: string; n: number }>();
  for (const r of rows) {
    const pt = r.category_pt?.trim();
    if (!pt) continue;
    const entry = counts.get(pt) ?? { pt, en: r.category_en?.trim() ?? '', n: 0 };
    entry.n += 1;
    if (!entry.en && r.category_en) entry.en = r.category_en.trim();
    counts.set(pt, entry);
  }
  return [...counts.values()].sort((a, b) => b.n - a.n).map(({ pt, en }) => ({ pt, en }));
}
