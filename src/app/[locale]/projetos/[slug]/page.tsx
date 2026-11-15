import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProjectCover from '@/components/site/ProjectCover';
import TrackedLink from '@/components/site/TrackedLink';
import { getDictionary, isLocale, localePath, locales } from '@/i18n/dictionaries';
import { getProject, getPublishedProjectRows } from '@/lib/data';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await getPublishedProjectRows();
  return locales.flatMap((locale) => rows.map((row) => ({ locale, slug: row.slug })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/projetos/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = await getProject(slug, locale);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: localePath(locale, `/projetos/${slug}`),
      languages: { 'pt-BR': `/projetos/${slug}`, en: `/en/projetos/${slug}` },
    },
    openGraph: { title: project.title, description: project.summary, images: project.coverUrl ? [project.coverUrl] : undefined },
  };
}

export default async function ProjectPage({ params }: PageProps<'/[locale]/projetos/[slug]'>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const project = await getProject(slug, locale);
  if (!project) notFound();
  const t = getDictionary(locale);
  const paragraphs = (project.body || project.summary).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <article className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      <Link href={`${localePath(locale)}#projetos`} className="text-sm text-muted hover:text-foreground">
        ← {t.projects.back}
      </Link>

      <header className="mt-8 max-w-4xl">
        <p className="text-sm text-muted">{project.category}</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">{project.title}</h1>
        <p className="mt-6 text-xl leading-relaxed text-muted sm:text-2xl">{project.summary}</p>
      </header>

      <div className="mt-12">
        <ProjectCover project={project} priority sizes="(min-width: 1152px) 1152px, 100vw" />
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="prose-case max-w-[68ch] text-lg leading-relaxed lg:col-span-8">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <aside className="lg:col-span-4">
          <dl className="divide-y divide-border border-y border-border">
            <div className="py-4">
              <dt className="text-sm text-muted">{t.projects.stack}</dt>
              <dd className="mt-1">{project.technologies.join(', ')}</dd>
            </div>
            {project.year && (
              <div className="py-4">
                <dt className="text-sm text-muted">{t.projects.year}</dt>
                <dd className="mt-1">{project.year}</dd>
              </div>
            )}
            {(project.liveUrl || project.repoUrl) && (
              <div className="py-4">
                <dt className="text-sm text-muted">{t.projects.links}</dt>
                <dd className="mt-1 flex flex-col gap-1 font-medium">
                  {project.liveUrl && (
                    <TrackedLink event={`project_live:${project.slug}`} href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                      {t.projects.viewLive}
                    </TrackedLink>
                  )}
                  {project.repoUrl && (
                    <TrackedLink event={`project_repo:${project.slug}`} href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                      {t.projects.viewCode}
                    </TrackedLink>
                  )}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-8 rounded-lg bg-ink p-6 text-ink-fg">
            <p className="font-display text-xl font-semibold">{t.projects.talkCta}</p>
            <Link href={`${localePath(locale)}#contato`} className="mt-4 inline-flex rounded-full bg-accent px-5 py-2.5 font-medium text-accent-fg">
              {t.nav.contact}
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
