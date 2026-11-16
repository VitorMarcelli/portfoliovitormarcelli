import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import ContactForm from '@/components/site/ContactForm';
import ProjectBadges, { LockIcon } from '@/components/site/ProjectBadges';
import ProjectCover from '@/components/site/ProjectCover';
import ProjectFlow from '@/components/site/ProjectFlow';
import ProjectGallery from '@/components/site/ProjectGallery';
import RevealTitle from '@/components/site/RevealTitle';
import TestimonialCard from '@/components/site/TestimonialCard';
import TrackedLink from '@/components/site/TrackedLink';
import { getDictionary, isLocale, localePath, locales } from '@/i18n/dictionaries';
import { getProject, getPublishedProjectRows, getTestimonials } from '@/lib/data';

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
  // The share image is the generated card in ./opengraph-image.tsx (works even without a cover).
  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: localePath(locale, `/projetos/${slug}`),
      languages: { 'pt-BR': `/projetos/${slug}`, en: `/en/projetos/${slug}` },
    },
    openGraph: {
      type: 'article',
      title: project.title,
      description: project.summary,
      url: localePath(locale, `/projetos/${slug}`),
    },
    twitter: { card: 'summary_large_image', title: project.title, description: project.summary },
  };
}

const paragraphsOf = (text: string | null) =>
  (text ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

const reveal = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

export default async function ProjectPage({ params }: PageProps<'/[locale]/projetos/[slug]'>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const [project, allTestimonials] = await Promise.all([getProject(slug, locale), getTestimonials(locale)]);
  if (!project) notFound();
  const testimonials = allTestimonials.filter((item) => item.projectSlug === project.slug);
  const t = getDictionary(locale);
  const tp = t.projects;

  // Structured case (challenge / solution / results) when filled in the panel; otherwise the free text.
  const structured = [
    { title: tp.challenge, text: project.challenge },
    { title: tp.solution, text: project.solution },
    { title: tp.results, text: project.results },
  ].filter((part) => part.text);
  const fallback = paragraphsOf(project.body || project.summary);
  const primaryIntent = project.forSale ? 'compra' : 'demonstracao';

  return (
    <article
      className="mx-auto max-w-6xl px-4 pb-40 pt-12 sm:px-6"
      data-scene-x="0.62"
      data-scene-y="0.2"
      data-scene-scale="0.4"
    >
      <Link href={`${localePath(locale)}#projetos`} className="text-sm text-muted transition-colors hover:text-accent-text">
        ← {tp.back}
      </Link>

      <header className="mt-8 max-w-4xl">
        <p data-reveal className="text-sm text-accent-text">
          {[project.category, project.year].filter(Boolean).join(', ')}
        </p>
        <RevealTitle
          as="h1"
          text={project.title}
          className="night-gradient mt-2 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
        />
        <div data-reveal className="mt-5" style={reveal(150)}>
          <ProjectBadges project={project} t={tp} />
        </div>
        <p data-reveal className="mt-6 text-xl leading-relaxed text-muted sm:text-2xl" style={reveal(250)}>
          {project.summary}
        </p>
        <div data-reveal className="mt-8 flex flex-wrap gap-3" style={reveal(350)}>
          <a
            href="#interesse"
            className="inline-flex items-center rounded-full bg-accent px-6 py-3 font-medium text-accent-fg shadow-[0_10px_30px_-12px_var(--glow)] transition-opacity hover:opacity-90"
          >
            {project.forSale ? tp.buyCta : tp.demoCta}
          </a>
          {project.liveUrl && (
            <TrackedLink
              event={`project_live:${project.slug}`}
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-border px-6 py-3 font-medium transition-colors hover:border-accent hover:text-accent-text"
            >
              {tp.viewLive}
            </TrackedLink>
          )}
        </div>
        {project.liveUrl && project.liveLogin && (
          <p data-reveal className="mt-3 flex items-center gap-2 text-sm text-muted" style={reveal(400)}>
            <LockIcon />
            {tp.liveLoginNote}
          </p>
        )}
      </header>

      {project.coverUrl && (
        <div data-reveal className="glow-card mt-12 p-3 sm:p-4">
          <ProjectCover project={project} priority sizes="(min-width: 1152px) 1152px, 100vw" />
        </div>
      )}

      {project.flow.length > 1 && (
        <section data-reveal className="glow-card mt-12 p-7 sm:p-9" aria-labelledby="como-funciona">
          <h2 id="como-funciona" className="font-display text-2xl font-semibold">
            {tp.howItWorks}
          </h2>
          <div className="mt-6">
            <ProjectFlow steps={project.flow} label={tp.howItWorks} />
          </div>
        </section>
      )}

      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {structured.length > 0 ? (
            structured.map((part, i) => (
              <section key={part.title} data-reveal style={reveal(i * 100)} className="glow-card p-7 sm:p-9">
                <h2 className="font-display text-2xl font-semibold">{part.title}</h2>
                <div className="prose-case mt-4 text-lg leading-relaxed text-muted">
                  {paragraphsOf(part.text).map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div data-reveal className="glow-card prose-case p-7 text-lg leading-relaxed sm:p-10">
              {fallback.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          {project.highlights.length > 0 && (
            <section data-reveal className="glow-card p-7 sm:p-9">
              <h2 className="font-display text-2xl font-semibold">{tp.highlights}</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {project.highlights.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_12px_var(--glow)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <dl data-reveal className="glow-card divide-y divide-border px-7" style={reveal(120)}>
            <div className="py-5">
              <dt className="text-sm text-muted">{tp.stack}</dt>
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
                <dt className="text-sm text-muted">{tp.year}</dt>
                <dd className="mt-1">{project.year}</dd>
              </div>
            )}
            <div className="py-5">
              <dt className="text-sm text-muted">{tp.links}</dt>
              <dd className="mt-1 flex flex-col gap-2 font-medium">
                {project.liveUrl && (
                  <TrackedLink
                    event={`project_live:${project.slug}`}
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-text underline underline-offset-4"
                  >
                    {tp.viewLive}
                  </TrackedLink>
                )}
                {project.repoPrivate ? (
                  <span className="inline-flex items-start gap-2 font-normal text-muted">
                    <span className="mt-1">
                      <LockIcon />
                    </span>
                    {/* Only promise a demo when there is a live link to show. */}
                    {project.liveUrl ? (project.liveLogin ? tp.privateCodeHintLogin : tp.privateCodeHint) : tp.privateCodeHintNoDemo}
                  </span>
                ) : (
                  project.repoUrl && (
                    <TrackedLink
                      event={`project_repo:${project.slug}`}
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-text underline underline-offset-4"
                    >
                      {tp.viewCode}
                    </TrackedLink>
                  )
                )}
              </dd>
            </div>
          </dl>

          {project.forSale && (
            <div data-reveal className="glow-card p-7" style={reveal(200)}>
              <p className="text-sm text-accent-text">{tp.forSale}</p>
              <p className="mt-2 font-display text-3xl font-bold">{project.priceLabel || tp.priceOnRequest}</p>
              {project.saleNote && <p className="mt-3 leading-relaxed text-muted">{project.saleNote}</p>}
              <a
                href="#interesse"
                className="mt-5 inline-flex rounded-full bg-accent px-6 py-3 font-medium text-accent-fg shadow-[0_10px_30px_-12px_var(--glow)] transition-opacity hover:opacity-90"
              >
                {tp.buyCta}
              </a>
            </div>
          )}
        </aside>
      </div>

      {project.gallery.length > 0 && (
        <section className="mt-16" aria-labelledby="galeria-titulo">
          <h2 id="galeria-titulo" data-reveal className="mb-6 font-display text-3xl font-semibold">
            {tp.gallery}
          </h2>
          <ProjectGallery
            title={project.title}
            images={project.gallery}
            labels={{ open: tp.galleryOpen, close: tp.galleryClose, prev: tp.galleryPrev, next: tp.galleryNext }}
          />
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="mt-16" aria-labelledby="depoimento-titulo">
          <h2 id="depoimento-titulo" data-reveal className="mb-6 font-display text-3xl font-semibold">
            {t.testimonials.onProject}
          </h2>
          <div className={testimonials.length > 1 ? 'grid gap-6 md:grid-cols-2' : 'max-w-3xl'}>
            {testimonials.map((item) => (
              <TestimonialCard key={item.id} testimonial={item} ratingLabel={t.testimonials.ratingLabel} />
            ))}
          </div>
        </section>
      )}

      <section id="interesse" className="mt-16 scroll-mt-10" aria-labelledby="interesse-titulo">
        <div data-reveal className="glow-card grid gap-8 p-7 sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="interesse-titulo" className="night-gradient font-display text-3xl font-bold leading-tight">
              {tp.interestTitle}
            </h2>
            <p className="mt-4 leading-relaxed text-muted">{tp.interestText}</p>
          </div>
          <div className="lg:col-span-8">
            <ContactForm
              t={t.contact.form}
              project={{ slug: project.slug, title: project.title, forSale: project.forSale }}
              defaultIntent={primaryIntent}
            />
          </div>
        </div>
      </section>
    </article>
  );
}
