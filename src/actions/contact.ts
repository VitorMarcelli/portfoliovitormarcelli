'use server';

import { after } from 'next/server';
import { z } from 'zod';
import { sendLeadEmail } from '@/lib/notify';
import { getSupabaseAdmin, hasSupabaseAdmin } from '@/lib/supabase/admin';

export interface ContactState {
  status: 'idle' | 'success' | 'error' | 'invalid';
}

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().min(10).max(4000),
  project: z.string().trim().max(80).optional().or(z.literal('')),
  intent: z.enum(['contato', 'compra', 'demonstracao']).default('contato'),
});

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Spam traps: hidden field filled by bots, or a form submitted faster than a person can type.
  if (formData.get('website')) return { status: 'success' };
  const startedAt = Number(formData.get('startedAt'));
  if (Number.isFinite(startedAt) && Date.now() - startedAt < 3000) return { status: 'success' };

  const parsed = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    company: formData.get('company') ?? '',
    message: formData.get('message'),
    project: formData.get('project') ?? '',
    intent: formData.get('intent') || 'contato',
  });
  if (!parsed.success) return { status: 'invalid' };
  if (!hasSupabaseAdmin()) return { status: 'error' };

  const supabase = getSupabaseAdmin();
  const { email } = parsed.data;

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', since);
  if ((count ?? 0) >= 3) return { status: 'success' };

  // Only accept a project that is really published (the slug comes from the browser).
  let projectSlug: string | null = null;
  let projectTitle: string | null = null;
  if (parsed.data.project) {
    const { data: project } = await supabase
      .from('projects')
      .select('slug, title_pt')
      .eq('slug', parsed.data.project)
      .eq('published', true)
      .maybeSingle();
    if (project) {
      projectSlug = project.slug;
      projectTitle = project.title_pt;
    }
  }
  const intent = projectSlug ? parsed.data.intent : 'contato';

  const lead = {
    name: parsed.data.name,
    email,
    phone: parsed.data.phone || null,
    company: parsed.data.company || null,
    message: parsed.data.message,
    source: 'site' as const,
    project_slug: projectSlug,
    intent,
  };
  const { error } = await supabase.from('leads').insert(lead);
  if (error) {
    console.error('[contact] insert failed', error.message);
    return { status: 'error' };
  }

  after(() => sendLeadEmail({ ...lead, projectTitle }));
  return { status: 'success' };
}
