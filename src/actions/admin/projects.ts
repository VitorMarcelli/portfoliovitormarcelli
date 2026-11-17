'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { listRepos, titleFromRepoName } from '@/lib/github';
import { captureScreenshot } from '@/lib/screenshot';
import type { GalleryItem, ProjectRow, ProjectStatus } from '@/lib/types';
import { revalidatePublicSite, text, uploadPublicFile } from './shared';

export interface ProjectFormState {
  error?: string;
}

const STATUSES: ProjectStatus[] = ['live', 'mvp', 'in_progress', 'completed'];

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function validUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** One item per line, blank lines ignored. */
function lines(formData: FormData, key: string) {
  return (text(formData, key) || '')
    .split('\n')
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function saveProject(_prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const { supabase } = await requireAdmin();
  const id = text(formData, 'id');
  const titlePt = text(formData, 'title_pt');
  const summaryPt = text(formData, 'summary_pt');
  if (!titlePt || !summaryPt) return { error: 'Título e resumo em português são obrigatórios.' };

  const slug = slugify(text(formData, 'slug') || titlePt);
  if (!slug) return { error: 'Não foi possível gerar o endereço (slug) do projeto.' };

  const liveRaw = text(formData, 'live_url');
  const repoRaw = text(formData, 'repo_url');
  const liveUrl = validUrl(liveRaw);
  const repoUrl = validUrl(repoRaw);
  if ((liveRaw && !liveUrl) || (repoRaw && !repoUrl)) return { error: 'Os links precisam começar com https://' };

  const repoPrivate = formData.get('repo_private') === 'private';
  const statusRaw = text(formData, 'status') as ProjectStatus | null;
  const status = statusRaw && STATUSES.includes(statusRaw) ? statusRaw : 'completed';
  const yearRaw = text(formData, 'year');
  const year = yearRaw ? Number.parseInt(yearRaw, 10) : null;

  // undefined = keep the current cover. Only a new upload or the "remove cover" box changes it
  // (no file sent used to come back as null and wiped the cover on every save).
  let coverUrl: string | null | undefined;
  try {
    coverUrl = (await uploadPublicFile(supabase, formData.get('cover'), 'covers', slug)) ?? undefined;
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (coverUrl === undefined && formData.get('remove_cover') === 'on') coverUrl = null;

  const record = {
    slug,
    title_pt: titlePt,
    title_en: text(formData, 'title_en'),
    summary_pt: summaryPt,
    summary_en: text(formData, 'summary_en'),
    body_pt: text(formData, 'body_pt'),
    body_en: text(formData, 'body_en'),
    category_pt: text(formData, 'category_pt'),
    category_en: text(formData, 'category_en'),
    technologies: (text(formData, 'technologies') || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    live_url: liveUrl,
    live_login: Boolean(liveUrl) && formData.get('live_login') === 'on',
    // A private repository never goes to the public table: its address lives in project_private.
    repo_url: repoPrivate ? null : repoUrl,
    repo_private: repoPrivate,
    status,
    year: Number.isFinite(year) ? year : null,
    featured: formData.get('featured') === 'on',
    published: formData.get('published') === 'on',
    sort_order: Number.parseInt(text(formData, 'sort_order') || '0', 10) || 0,
    for_sale: formData.get('for_sale') === 'on',
    price_label: text(formData, 'price_label'),
    sale_note_pt: text(formData, 'sale_note_pt'),
    sale_note_en: text(formData, 'sale_note_en'),
    challenge_pt: text(formData, 'challenge_pt'),
    challenge_en: text(formData, 'challenge_en'),
    solution_pt: text(formData, 'solution_pt'),
    solution_en: text(formData, 'solution_en'),
    results_pt: text(formData, 'results_pt'),
    results_en: text(formData, 'results_en'),
    highlights_pt: lines(formData, 'highlights_pt'),
    highlights_en: lines(formData, 'highlights_en'),
    flow_pt: lines(formData, 'flow_pt').slice(0, 5),
    flow_en: lines(formData, 'flow_en').slice(0, 5),
    ...(coverUrl !== undefined ? { cover_url: coverUrl } : {}),
  };

  const { data: before } = id ? await supabase.from('projects').select('slug').eq('id', id).maybeSingle() : { data: null };
  const { data: saved, error } = id
    ? await supabase.from('projects').update(record).eq('id', id).select('id, slug').single()
    : await supabase.from('projects').insert(record).select('id, slug').single();

  if (error || !saved) {
    if (error?.code === '23505') return { error: 'Já existe um projeto com esse endereço (slug).' };
    return { error: error?.message ?? 'Não foi possível salvar.' };
  }

  const { error: privateError } = await supabase.from('project_private').upsert({
    project_id: saved.id,
    repo_url: repoPrivate ? repoUrl : null,
    github_full_name: text(formData, 'github_full_name'),
    internal_price: text(formData, 'internal_price'),
    notes: text(formData, 'notes'),
  });
  if (privateError) return { error: privateError.message };

  revalidatePublicSite(saved.slug, before?.slug);
  revalidatePath('/admin/projetos');
  redirect(id ? `/admin/projetos/${saved.id}?salvo=1` : `/admin/projetos/${saved.id}?criado=1`);
}

export async function setProjectFlag(id: string, field: 'published' | 'featured', value: boolean) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('projects').update({ [field]: value }).eq('id', id).select('slug').maybeSingle();
  revalidatePublicSite(data?.slug);
  revalidatePath('/admin/projetos');
}

export async function deleteProject(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('projects').delete().eq('id', id).select('slug').maybeSingle();
  revalidatePublicSite(data?.slug);
  redirect('/admin/projetos');
}

/* ───────────────────────── Gallery ───────────────────────── */

export interface GalleryResult {
  error?: string;
  gallery?: GalleryItem[];
  coverUrl?: string | null;
}

async function loadProject(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('projects').select('id, slug, gallery, cover_url, live_url').eq('id', id).single();
  return { supabase, project: data as Pick<ProjectRow, 'id' | 'slug' | 'gallery' | 'cover_url' | 'live_url'> | null };
}

async function saveGallery(id: string, gallery: GalleryItem[], extra: Record<string, unknown> = {}): Promise<GalleryResult> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from('projects')
    .update({ gallery, ...extra })
    .eq('id', id)
    .select('slug, gallery, cover_url')
    .single();
  if (error) return { error: error.message };
  revalidatePublicSite(data.slug as string);
  return { gallery: data.gallery as GalleryItem[], coverUrl: data.cover_url as string | null };
}

export async function addGalleryImages(id: string, formData: FormData): Promise<GalleryResult> {
  const { supabase, project } = await loadProject(id);
  if (!project) return { error: 'Projeto não encontrado.' };
  const files = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0).slice(0, 10);
  if (files.length === 0) return { error: 'Escolha pelo menos uma imagem.' };

  const added: GalleryItem[] = [];
  try {
    for (const [i, file] of files.entries()) {
      const url = await uploadPublicFile(supabase, file, 'gallery', `${project.slug}-${i}`);
      if (url) added.push({ url, caption_pt: null, caption_en: null });
    }
  } catch (e) {
    return { error: (e as Error).message };
  }
  return saveGallery(id, [...(project.gallery ?? []), ...added]);
}

export async function updateGallery(id: string, gallery: GalleryItem[]): Promise<GalleryResult> {
  const clean = gallery
    .filter((g) => typeof g.url === 'string' && g.url.startsWith('http'))
    .slice(0, 30)
    .map((g) => ({
      url: g.url,
      caption_pt: g.caption_pt?.trim().slice(0, 200) || null,
      caption_en: g.caption_en?.trim().slice(0, 200) || null,
    }));
  return saveGallery(id, clean);
}

export async function setCoverFromGallery(id: string, url: string): Promise<GalleryResult> {
  const { project } = await loadProject(id);
  if (!project) return { error: 'Projeto não encontrado.' };
  if (!(project.gallery ?? []).some((g) => g.url === url)) return { error: 'Imagem não pertence à galeria.' };
  return saveGallery(id, project.gallery, { cover_url: url });
}

/** Screenshots the project's live site and stores it as the cover or as a new gallery image. */
export async function captureLiveSite(id: string, target: 'cover' | 'gallery'): Promise<GalleryResult> {
  const { supabase, project } = await loadProject(id);
  if (!project) return { error: 'Projeto não encontrado.' };
  if (!project.live_url) return { error: 'Preencha o link do sistema no ar e salve antes de capturar.' };

  try {
    const { bytes, contentType } = await captureScreenshot(project.live_url);
    const ext = contentType.includes('jpeg') ? 'jpg' : contentType.includes('webp') ? 'webp' : 'png';
    const path = `captures/${project.slug}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('public-assets').upload(path, bytes, { contentType, upsert: false });
    if (error) return { error: `Falha ao salvar a captura: ${error.message}` };
    const url = supabase.storage.from('public-assets').getPublicUrl(path).data.publicUrl;

    if (target === 'cover') return saveGallery(id, project.gallery ?? [], { cover_url: url });
    return saveGallery(id, [...(project.gallery ?? []), { url, caption_pt: null, caption_en: null }]);
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/* ───────────────────────── GitHub import ───────────────────────── */

export async function importFromGithub(fullName: string) {
  const { supabase } = await requireAdmin();
  // Already imported (a second click, or another tab): open the existing project instead of duplicating it.
  const { data: existing } = await supabase
    .from('project_private')
    .select('project_id')
    .eq('github_full_name', fullName)
    .limit(1)
    .maybeSingle();
  if (existing) redirect(`/admin/projetos/${existing.project_id}`);

  const repo = (await listRepos()).find((r) => r.fullName === fullName);
  if (!repo) redirect('/admin/projetos/importar?erro=repo');

  const baseSlug = slugify(repo.name) || 'projeto';
  const { data: clash } = await supabase.from('projects').select('slug').like('slug', `${baseSlug}%`);
  const taken = new Set((clash ?? []).map((r) => r.slug));
  let slug = baseSlug;
  for (let n = 2; taken.has(slug); n++) slug = `${baseSlug}-${n}`;

  const technologies = Array.from(new Set([repo.language, ...repo.topics].filter((t): t is string => Boolean(t)))).slice(0, 8);
  const live = validUrl(repo.homepage);

  const { data: created, error } = await supabase
    .from('projects')
    .insert({
      slug,
      title_pt: titleFromRepoName(repo.name),
      summary_pt: repo.description || 'Descreva em uma ou duas frases o que este sistema faz.',
      technologies,
      live_url: live,
      repo_url: repo.isPrivate ? null : repo.htmlUrl,
      repo_private: repo.isPrivate,
      status: live ? 'live' : 'completed',
      year: new Date(repo.pushedAt).getFullYear(),
      published: false,
      featured: false,
      sort_order: 100,
    })
    .select('id')
    .single();
  if (error || !created) redirect('/admin/projetos/importar?erro=salvar');

  await supabase.from('project_private').upsert({
    project_id: created.id,
    repo_url: repo.isPrivate ? repo.htmlUrl : null,
    github_full_name: repo.fullName,
  });

  revalidatePath('/admin/projetos');
  redirect(`/admin/projetos/${created.id}?importado=1`);
}
