import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import ProjectCover from '@/components/site/ProjectCover';
import RevealTitle from '@/components/site/RevealTitle';
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
    <article
      className="mx-auto max-w-6xl px-4 pb-40 pt-12 sm:px-6"
      data-scene-x="0.62"
      data-scene-y="0.2"
      data-scene-scale="0.4"
    >
      <Link href={`${localePath(locale)}#projetos`} className="text-sm text-muted transition-colors hover:text-accent-text">
        ← {t.projects.back}
      </Link>

      <header className="mt-8 max-w-4xl">
        <p data-reveal className="text-sm text-accent-text">
          {project.category}
        </p>
        <RevealTitle
          as="h1"
          text={project.title}
          className="night-gradient mt-2 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
        />
        <p data-reveal className="mt-6 text-xl leading-relaxed text-muted sm:text-2xl" style={{ '--reveal-delay': '250ms' } as CSSProperties}>
          {project.summary}
        </p>
      </header>

      {project.coverUrl && (
        <div data-reveal className="glow-card mt-12 p-3 sm:p-4">
          <ProjectCover project={project} priority sizes="(min-width: 1152px) 1152px, 100vw" />
        </div>
      )}

      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        <div data-reveal className="glow-card prose-case p-7 text-lg leading-relaxed sm:p-10 lg:col-span-8">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <aside className="flex flex-col gap-6 lg:col-span-4">
          <dl data-reveal className="glow-card divide-y divide-border px-7" style={{ '--reveal-delay': '120ms' } as CSSProperties}>
            <div className="py-5">
              <dt className="text-sm text-muted">{t.projects.stack}</dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="rounded-full border border-border px-3 py-1 text-sm text-muted">
                    {tech}
                  </span>
                ))}
              </dd>
            </div>
            {project.year && (
              <div className="py-5">
                <dt className="text-sm text-muted">{t.projects.year}</dt>
                <dd className="mt-1">{project.year}</dd>
              </div>
            )}
            {(project.liveUrl || project.repoUrl) && (
              <div className="py-5">
                <dt className="text-sm text-muted">{t.projects.links}</dt>
                <dd className="mt-1 flex flex-col gap-1 font-medium">
                  {project.liveUrl && (
                    <TrackedLink event={`project_live:${project.slug}`} href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-accent-text underline underline-offset-4">
                      {t.projects.viewLive}
                    </TrackedLink>
                  )}
                  {project.repoUrl && (
                    <TrackedLink event={`project_repo:${project.slug}`} href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-accent-text underline underline-offset-4">
                      {t.projects.viewCode}
                    </TrackedLink>
                  )}
                </dd>
              </div>
            )}
          </dl>
          <div data-reveal className="glow-card p-7" style={{ '--reveal-delay': '240ms' } as CSSProperties}>
            <p className="font-display text-xl font-semibold">{t.projects.talkCta}</p>
            <Link
              href={`${localePath(locale)}#contato`}
              className="mt-5 inline-flex rounded-full bg-accent px-6 py-3 font-medium text-accent-fg shadow-[0_10px_30px_-12px_var(--glow)] transition-opacity hover:opacity-90"
            >
              {t.nav.contact}
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
