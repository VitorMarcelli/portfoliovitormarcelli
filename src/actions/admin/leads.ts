'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import type { LeadStatus } from '@/lib/types';

const STATUSES: LeadStatus[] = ['novo', 'em_contato', 'proposta', 'fechado', 'perdido'];

export async function updateLeadStatus(id: string, status: LeadStatus) {
  if (!STATUSES.includes(status)) return;
  const { supabase } = await requireAdmin();
  await supabase.from('leads').update({ status }).eq('id', id);
  revalidatePath('/admin', 'layout');
}

export async function updateLeadNotes(id: string, notes: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('leads').update({ notes: notes.trim() || null }).eq('id', id);
  revalidatePath('/admin/leads');
}

export async function deleteLead(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('leads').delete().eq('id', id);
  revalidatePath('/admin', 'layout');
}
