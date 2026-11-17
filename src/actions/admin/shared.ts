import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import { SITE_DATA_TAG } from '@/lib/data';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Refreshes every public page (both locales, project pages, sitemap).
 * The data tag is the part that matters for project pages (rendered per request from cached data);
 * the paths refresh the pages that are still prerendered (home, sitemap).
 */
export function revalidatePublicSite(...slugs: (string | null | undefined)[]) {
  revalidateTag(SITE_DATA_TAG, { expire: 0 });
  revalidatePath('/[locale]', 'layout');
  revalidatePath('/[locale]/projetos/[slug]', 'page');
  for (const slug of new Set(slugs.filter(Boolean))) {
    for (const path of [`/pt/projetos/${slug}`, `/en/projetos/${slug}`, `/projetos/${slug}`]) revalidatePath(path);
  }
  revalidatePath('/sitemap.xml');
}

export function text(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

const ALLOWED = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['application/pdf', 'pdf'],
]);

/** Uploads a file to the public bucket and returns its public URL, or null when no file was sent. */
export async function uploadPublicFile(
  supabase: SupabaseClient,
  file: FormDataEntryValue | null,
  folder: string,
  baseName: string,
  maxBytes = 5 * 1024 * 1024,
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new Error('Formato não aceito. Use PNG, JPG, WEBP ou PDF.');
  if (file.size > maxBytes) throw new Error(`Arquivo maior que ${Math.round(maxBytes / 1024 / 1024)} MB.`);

  const path = `${folder}/${baseName}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('public-assets').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Falha no upload: ${error.message}`);
  return supabase.storage.from('public-assets').getPublicUrl(path).data.publicUrl;
}
