import 'server-only';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/env';
import { getSupabaseAdmin, hasSupabaseAdmin } from '@/lib/supabase/admin';
import type { Experience, ExperienceRow, Locale, Project, ProjectRow, PublicSettings } from '@/lib/types';

function publicClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function localizeProject(row: ProjectRow, locale: Locale): Project {
  const en = locale === 'en';
  return {
    slug: row.slug,
    title: (en && row.title_en) || row.title_pt,
    summary: (en && row.summary_en) || row.summary_pt,
    body: (en && row.body_en) || row.body_pt,
    category: (en && row.category_en) || row.category_pt,
    technologies: row.technologies ?? [],
    coverUrl: row.cover_url,
    liveUrl: row.live_url,
    repoUrl: row.repo_url,
    year: row.year,
    featured: row.featured,
    status: row.status ?? 'completed',
    repoPrivate: row.repo_private ?? false,
    forSale: row.for_sale ?? false,
    priceLabel: row.price_label,
    saleNote: (en && row.sale_note_en) || row.sale_note_pt,
    challenge: (en && row.challenge_en) || row.challenge_pt,
    solution: (en && row.solution_en) || row.solution_pt,
    results: (en && row.results_en) || row.results_pt,
    highlights: (en && row.highlights_en?.length ? row.highlights_en : row.highlights_pt) ?? [],
    flow: (en && row.flow_en?.length ? row.flow_en : row.flow_pt) ?? [],
    gallery: (row.gallery ?? []).map((g) => ({ url: g.url, caption: ((en && g.caption_en) || g.caption_pt) ?? null })),
  };
}

export const getPublishedProjectRows = cache(async (): Promise<ProjectRow[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await publicClient()
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  // Throwing (instead of returning []) makes ISR keep serving the last good page
  // when the database is briefly unreachable, rather than caching an empty list or a 404.
  if (error) throw new Error(`[data] projects: ${error.message}`);
  return data as ProjectRow[];
});

export async function getProjects(locale: Locale): Promise<Project[]> {
  const rows = await getPublishedProjectRows();
  return rows.map((row) => localizeProject(row, locale));
}

export async function getProject(slug: string, locale: Locale): Promise<Project | null> {
  const rows = await getPublishedProjectRows();
  const row = rows.find((r) => r.slug === slug);
  return row ? localizeProject(row, locale) : null;
}

export async function getExperiences(locale: Locale): Promise<Experience[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await publicClient()
    .from('experiences')
    .select('*')
    .eq('published', true)
    .order('start_date', { ascending: false });
  if (error) throw new Error(`[data] experiences: ${error.message}`);
  const en = locale === 'en';
  return (data as ExperienceRow[]).map((row) => ({
    id: row.id,
    kind: row.kind,
    title: (en && row.title_en) || row.title_pt,
    organization: row.organization,
    description: (en && row.description_en) || row.description_pt,
    startDate: row.start_date,
    endDate: row.end_date,
  }));
}

const DEFAULT_SETTINGS: PublicSettings = { available: true, whatsappNumber: null, cvUrl: null };

export const getPublicSettings = cache(async (): Promise<PublicSettings> => {
  if (!hasSupabaseAdmin()) return DEFAULT_SETTINGS;
  const { data, error } = await getSupabaseAdmin()
    .from('settings')
    .select('available, whatsapp_number, cv_url')
    .eq('id', 1)
    .maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return {
    available: data.available,
    whatsappNumber: data.whatsapp_number,
    cvUrl: data.cv_url,
  };
});
