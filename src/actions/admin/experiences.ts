'use server';

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { revalidatePublicSite, text } from './shared';

export interface ExperienceFormState {
  error?: string;
}

/** Accepts "2024-03" from <input type="month"> and stores the first day of the month. */
function monthToDate(value: string | null) {
  if (!value) return null;
  return /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : null;
}

export async function saveExperience(_prev: ExperienceFormState, formData: FormData): Promise<ExperienceFormState> {
  const { supabase } = await requireAdmin();
  const id = text(formData, 'id');
  const titlePt = text(formData, 'title_pt');
  const organization = text(formData, 'organization');
  const start = monthToDate(text(formData, 'start'));
  const current = formData.get('current') === 'on';
  const end = current ? null : monthToDate(text(formData, 'end'));

  if (!titlePt || !organization || !start) return { error: 'Preencha cargo/curso, empresa/instituição e o início.' };
  if (!current && !end) return { error: 'Informe o mês de término ou marque como atual.' };

  const kind = formData.get('kind') === 'education' ? 'education' : 'work';
  const record = {
    kind,
    title_pt: titlePt,
    title_en: text(formData, 'title_en'),
    organization,
    description_pt: text(formData, 'description_pt'),
    description_en: text(formData, 'description_en'),
    start_date: start,
    end_date: end,
    published: formData.get('published') === 'on',
  };

  const { error } = id
    ? await supabase.from('experiences').update(record).eq('id', id)
    : await supabase.from('experiences').insert(record);
  if (error) return { error: error.message };

  revalidatePublicSite();
  redirect('/admin/trajetoria?salvo=1');
}

export async function deleteExperience(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('experiences').delete().eq('id', id);
  revalidatePublicSite();
  redirect('/admin/trajetoria');
}
