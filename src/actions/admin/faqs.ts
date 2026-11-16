'use server';

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { revalidatePublicSite, text } from './shared';

export interface FaqFormState {
  error?: string;
}

export async function saveFaq(_prev: FaqFormState, formData: FormData): Promise<FaqFormState> {
  const { supabase } = await requireAdmin();
  const id = text(formData, 'id');
  const question = text(formData, 'question_pt');
  const answer = text(formData, 'answer_pt');
  if (!question || !answer) return { error: 'Preencha a pergunta e a resposta em português.' };

  const record = {
    question_pt: question,
    question_en: text(formData, 'question_en'),
    answer_pt: answer,
    answer_en: text(formData, 'answer_en'),
    sort_order: Number(text(formData, 'sort_order')) || 0,
    published: formData.get('published') === 'on',
  };

  const { error } = id
    ? await supabase.from('faqs').update(record).eq('id', id)
    : await supabase.from('faqs').insert(record);
  if (error) return { error: error.message };

  revalidatePublicSite();
  redirect('/admin/perguntas?salvo=1');
}

export async function setFaqPublished(id: string, published: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from('faqs').update({ published }).eq('id', id);
  revalidatePublicSite();
  redirect('/admin/perguntas');
}

export async function deleteFaq(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('faqs').delete().eq('id', id);
  revalidatePublicSite();
  redirect('/admin/perguntas');
}
