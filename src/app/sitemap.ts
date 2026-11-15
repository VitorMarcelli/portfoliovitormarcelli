import type { MetadataRoute } from 'next';
import { getPublishedProjectRows } from '@/lib/data';
import { SITE_URL } from '@/lib/env';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await getPublishedProjectRows();
  const home: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: { 'pt-BR': `${SITE_URL}/`, en: `${SITE_URL}/en` } },
    },
  ];
  const projects: MetadataRoute.Sitemap = rows.map((row) => ({
    url: `${SITE_URL}/projetos/${row.slug}`,
    lastModified: row.updated_at,
    changeFrequency: 'monthly',
    priority: 0.7,
    alternates: {
      languages: { 'pt-BR': `${SITE_URL}/projetos/${row.slug}`, en: `${SITE_URL}/en/projetos/${row.slug}` },
    },
  }));
  return [...home, ...projects];
}
