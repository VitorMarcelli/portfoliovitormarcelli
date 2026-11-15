export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export const CONTACT = {
  email: 'tecnologybluelife@gmail.com',
  linkedin: 'https://www.linkedin.com/in/vitor-augusto-marcelli-ba4070220/',
  github: 'https://github.com/VitorMarcelli',
} as const;
