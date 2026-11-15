'use server';

import { z } from 'zod';
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

  const { error } = await supabase.from('leads').insert({
    name: parsed.data.name,
    email,
    phone: parsed.data.phone || null,
    company: parsed.data.company || null,
    message: parsed.data.message,
    source: 'site',
  });
  if (error) {
    console.error('[contact] insert failed', error.message);
    return { status: 'error' };
  }
  return { status: 'success' };
}
