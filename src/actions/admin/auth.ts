'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface LoginState {
  error?: string;
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const next = String(formData.get('next') || '/admin');
  if (!email || !password) return { error: 'Informe e-mail e senha.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'E-mail ou senha incorretos.' };

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { error: 'Esta conta não tem acesso ao painel.' };
  }

  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
