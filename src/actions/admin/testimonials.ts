'use server';

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { revalidatePublicSite, text } from './shared';

export interface TestimonialFormState {
  error?: string;
}

export async function saveTestimonial(_prev: TestimonialFormState, formData: FormData): Promise<TestimonialFormState> {
  const { supabase } = await requireAdmin();
  const id = text(formData, 'id');
  const author = text(formData, 'author_name');
  const quote = text(formData, 'quote_pt');
  if (!author || !quote) return { error: 'Preencha o nome e o depoimento em português.' };

  const rating = Number(text(formData, 'rating'));
  const record = {
    author_name: author,
    author_role_pt: text(formData, 'author_role_pt'),
    author_role_en: text(formData, 'author_role_en'),
    quote_pt: quote,
    quote_en: text(formData, 'quote_en'),
    rating: rating >= 1 && rating <= 5 ? Math.round(rating) : null,
    project_slug: text(formData, 'project_slug'),
    source: text(formData, 'source'),
    sort_order: Number(text(formData, 'sort_order')) || 0,
    published: formData.get('published') === 'on',
  };

  const { error } = id
    ? await supabase.from('testimonials').update(record).eq('id', id)
    : await supabase.from('testimonials').insert(record);
  if (error) return { error: error.message };

  revalidatePublicSite();
  redirect('/admin/depoimentos?salvo=1');
}

export async function deleteTestimonial(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('testimonials').delete().eq('id', id);
  revalidatePublicSite();
  redirect('/admin/depoimentos');
}
