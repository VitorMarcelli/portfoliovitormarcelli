'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { revalidatePublicSite, text, uploadPublicFile } from './shared';

export interface ProjectFormState {
  error?: string;
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

  const yearRaw = text(formData, 'year');
  const year = yearRaw ? Number.parseInt(yearRaw, 10) : null;

  let coverUrl: string | null | undefined;
  try {
    coverUrl = await uploadPublicFile(supabase, formData.get('cover'), 'covers', slug);
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (!coverUrl && formData.get('remove_cover') === 'on') coverUrl = null;

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
    repo_url: repoUrl,
    year: Number.isFinite(year) ? year : null,
    featured: formData.get('featured') === 'on',
    published: formData.get('published') === 'on',
    sort_order: Number.parseInt(text(formData, 'sort_order') || '0', 10) || 0,
    ...(coverUrl !== undefined ? { cover_url: coverUrl } : {}),
  };

  const { error } = id
    ? await supabase.from('projects').update(record).eq('id', id)
    : await supabase.from('projects').insert(record);

  if (error) {
    if (error.code === '23505') return { error: 'Já existe um projeto com esse endereço (slug).' };
    return { error: error.message };
  }

  revalidatePublicSite();
  revalidatePath('/admin/projetos');
  redirect('/admin/projetos?salvo=1');
}

export async function setProjectFlag(id: string, field: 'published' | 'featured', value: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from('projects').update({ [field]: value }).eq('id', id);
  revalidatePublicSite();
  revalidatePath('/admin/projetos');
}

export async function deleteProject(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('projects').delete().eq('id', id);
  revalidatePublicSite();
  redirect('/admin/projetos');
}
