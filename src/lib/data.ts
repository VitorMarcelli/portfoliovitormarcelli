import 'server-only';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/env';
import { getSupabaseAdmin, hasSupabaseAdmin } from '@/lib/supabase/admin';
import type {
  Experience,
  ExperienceRow,
  Faq,
  FaqRow,
  Locale,
  Project,
  ProjectRow,
  PublicSettings,
  Testimonial,
  TestimonialRow,
} from '@/lib/types';

/** Every public read is kept in the data cache under one tag; the panel expires it on each save. */
export const SITE_DATA_TAG = 'site-data';

function publicClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'force-cache', next: { revalidate: 3600, tags: [SITE_DATA_TAG] } }),
    },
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
    liveLogin: Boolean(row.live_login),
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

export const getTestimonials = cache(async (locale: Locale): Promise<Testimonial[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await publicClient()
    .from('testimonials')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw new Error(`[data] testimonials: ${error.message}`);
  const en = locale === 'en';
  return (data as TestimonialRow[]).map((row) => ({
    id: row.id,
    author: row.author_name,
    role: (en && row.author_role_en) || row.author_role_pt,
    quote: (en && row.quote_en) || row.quote_pt,
    rating: row.rating,
    projectSlug: row.project_slug,
    source: row.source,
  }));
});

export const getFaqs = cache(async (locale: Locale): Promise<Faq[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await publicClient()
    .from('faqs')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(`[data] faqs: ${error.message}`);
  const en = locale === 'en';
  return (data as FaqRow[]).map((row) => ({
    id: row.id,
    question: (en && row.question_en) || row.question_pt,
    answer: (en && row.answer_en) || row.answer_pt,
  }));
});

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
