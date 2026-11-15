import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '@/lib/env';

let client: SupabaseClient | undefined;

/**
 * Service client that bypasses RLS. Only for trusted server code:
 * analytics ingestion, contact form, WhatsApp webhook and public settings.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !secret) {
    throw new Error('Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY).');
  }
  client ??= createClient(SUPABASE_URL, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export function hasSupabaseAdmin() {
  return Boolean(SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}
