import 'server-only';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Ensures the request comes from a signed-in admin. Use at the top of every admin page and action. */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) redirect('/admin/login?erro=acesso');

  return { supabase, user };
}

/**
 * The signed-in admin's client for this request, or null. Never redirects: used by the public site to
 * show a draft preview to the owner while everyone else keeps getting a 404.
 */
export async function getAdminClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc('is_admin');
  return isAdmin ? supabase : null;
}
