import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContactForm from '@/components/site/ContactForm';
import ProjectCover from '@/components/site/ProjectCover';
import TrackedLink from '@/components/site/TrackedLink';
import WelcomeLoader from '@/components/site/WelcomeLoader';
import { getDictionary, isLocale, localePath, type Dictionary } from '@/i18n/dictionaries';
import { getExperiences, getProjects, getPublicSettings } from '@/lib/data';
import { CONTACT } from '@/lib/env';
import type { Experience, Locale, Project, PublicSettings } from '@/lib/types';
import { whatsappLink } from '@/lib/whatsapp/link';

export const revalidate = 3600;

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  const [projects, experiences, settings] = await Promise.all([
    getProjects(locale),
    getExperiences(locale),
    getPublicSettings(),
  ]);

  return (
    <>
      <WelcomeLoader subtitle="Loading Portfolio..." />
      <Hero t={t} settings={settings} />
      <Projects t={t} locale={locale} projects={projects} />
      <About t={t} />
      <Services t={t} />
      <Career t={t} locale={locale} experiences={experiences} cvUrl={settings.cvUrl} />
      <Stack t={t} />
      <Approach t={t} />
      <Contact t={t} settings={settings} />
    </>
  );
}

const container = 'mx-auto max-w-6xl px-4 sm:px-6';

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
      {children}
    </h2>
  );
}

function Hero({ t, settings }: { t: Dictionary; settings: PublicSettings }) {
  const wa = settings.whatsappNumber ? whatsappLink(settings.whatsappNumber, t.contact.whatsappMessage) : null;

  return (
    <section className={`${container} flex min-h-[72svh] flex-col justify-end pb-14 pt-12 sm:min-h-[calc(100svh-4rem)] sm:pb-20 sm:pt-16`}>
      <p className="rise flex items-center gap-2.5 text-sm text-muted" style={{ '--delay': '0ms' } as React.CSSProperties}>
        <span
          className={`h-2 w-2 rounded-full ${settings.available ? 'bg-success' : 'bg-muted'}`}
          aria-hidden="true"
        />
        {settings.available ? t.hero.available : t.hero.unavailable}
      </p>

      <h1 className="mt-6 font-display font-extrabold leading-[0.86] tracking-[-0.045em] text-[clamp(3.6rem,15vw,12.5rem)]">
        <span className="rise block" style={{ '--delay': '80ms' } as React.CSSProperties}>
          Vitor
        </span>
        <span className="rise block" style={{ '--delay': '180ms' } as React.CSSProperties}>
          Marcelli
        </span>
      </h1>

      <div
        className="rise mt-10 grid gap-8 border-t border-border pt-8 md:grid-cols-[1fr_auto] md:items-end"
        style={{ '--delay': '320ms' } as React.CSSProperties}
      >
        <div className="max-w-2xl">
          <p className="text-base font-medium text-accent-text">{t.hero.role}</p>
          <p className="mt-3 text-xl leading-snug sm:text-2xl">{t.hero.manifesto}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#projetos"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3.5 font-medium text-background transition-opacity hover:opacity-90"
          >
            {t.hero.primaryCta}
          </a>
          {wa && (
            <TrackedLink
              event="whatsapp"
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              {t.hero.whatsappCta}
            </TrackedLink>
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectLinks({ project, t }: { project: Project; t: Dictionary }) {
  return (
    <>
      {project.liveUrl && (
        <TrackedLink
          event={`project_live:${project.slug}`}
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          {t.projects.viewLive}
        </TrackedLink>
      )}
      {project.repoUrl && (
        <TrackedLink
          event={`project_repo:${project.slug}`}
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          {t.projects.viewCode}
        </TrackedLink>
      )}
    </>
  );
}

function Projects({ t, locale, projects }: { t: Dictionary; locale: Locale; projects: Project[] }) {
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <section aria-labelledby="projetos" className="scroll-mt-20 border-t border-border py-20 sm:py-28">
      <div className={container}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <SectionTitle id="projetos">{t.projects.title}</SectionTitle>
          <p className="max-w-md text-muted">{t.projects.subtitle}</p>
        </div>

        {projects.length === 0 && <p className="mt-12 text-lg text-muted">{t.projects.empty}</p>}

        <div className="mt-14 flex flex-col gap-20">
          {featured.map((project, idx) => {
            const caseHref = localePath(locale, `/projetos/${project.slug}`);
            return (
              <article key={project.slug} className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <Link
                  href={caseHref}
                  className={`block lg:col-span-7 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <ProjectCover project={project} priority={idx === 0} />
                </Link>
                <div className={`lg:col-span-5 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <p className="text-sm text-muted">
                    {[project.category, project.year].filter(Boolean).join(', ')}
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                    <Link href={caseHref} className="hover:text-accent-text">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed text-muted">{project.summary}</p>
                  <p className="mt-5 text-sm">{project.technologies.join(', ')}</p>
                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-medium">
                    {project.body && (
                      <Link href={caseHref} className="underline decoration-accent decoration-2 underline-offset-4">
                        {t.projects.viewCase}
                      </Link>
                    )}
                    <ProjectLinks project={project} t={t} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {others.length > 0 && (
          <div className="mt-24">
            <h3 className="font-display text-xl font-semibold">{t.projects.more}</h3>
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {others.map((project) => (
                <li key={project.slug} className="grid gap-2 py-6 md:grid-cols-12 md:gap-6">
                  <div className="md:col-span-4">
                    <Link
                      href={localePath(locale, `/projetos/${project.slug}`)}
                      className="font-display text-xl font-semibold hover:text-accent-text"
                    >
                      {project.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted">{project.category}</p>
                  </div>
                  <p className="text-muted md:col-span-6">{project.summary}</p>
                  <div className="flex gap-4 text-sm font-medium md:col-span-2 md:justify-end">
                    <ProjectLinks project={project} t={t} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function About({ t }: { t: Dictionary }) {
  return (
    <section aria-labelledby="sobre" className="bg-ink py-20 text-ink-fg sm:py-28">
      <div className={`${container} grid gap-10 md:grid-cols-12`}>
        <h2 id="sobre" className="font-display text-3xl font-bold tracking-tight md:col-span-3">
          {t.about.title}
        </h2>
        <div className="flex max-w-3xl flex-col gap-6 text-xl leading-relaxed md:col-span-9 sm:text-2xl">
          {t.about.paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? '' : 'text-ink-muted'}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services({ t }: { t: Dictionary }) {
  return (
    <section aria-labelledby="servicos" className="scroll-mt-20 py-20 sm:py-28">
      <div className={container}>
        <SectionTitle id="servicos">{t.services.title}</SectionTitle>
        <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {t.services.items.map((s) => (
            <div key={s.title} className="border-t-2 border-foreground pt-5">
              <h3 className="font-display text-2xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 max-w-md text-lg leading-relaxed text-muted">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatPeriod(e: Experience, locale: Locale, present: string) {
  const fmt = new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  const start = fmt.format(new Date(e.startDate));
  const end = e.endDate ? fmt.format(new Date(e.endDate)) : present;
  return `${start} – ${end}`;
}

function Career({
  t,
  locale,
  experiences,
  cvUrl,
}: {
  t: Dictionary;
  locale: Locale;
  experiences: Experience[];
  cvUrl: string | null;
}) {
  if (experiences.length === 0 && !cvUrl) return null;
  const groups = [
    { label: t.experience.work, items: experiences.filter((e) => e.kind === 'work') },
    { label: t.experience.education, items: experiences.filter((e) => e.kind === 'education') },
  ].filter((g) => g.items.length > 0);

  return (
    <section aria-labelledby="trajetoria" className="scroll-mt-20 border-t border-border py-20 sm:py-28">
      <div className={container}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle id="trajetoria">{t.experience.title}</SectionTitle>
          {cvUrl && (
            <TrackedLink
              event="cv_download"
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline decoration-accent decoration-2 underline-offset-4"
            >
              {t.experience.downloadCv}
            </TrackedLink>
          )}
        </div>
        <div className="mt-12 grid gap-14 lg:grid-cols-2">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-semibold text-muted">{group.label}</h3>
              <ol className="mt-4 border-l border-border">
                {group.items.map((e) => (
                  <li key={e.id} className="relative pb-8 pl-6 last:pb-0">
                    <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
                    <p className="text-sm text-muted">{formatPeriod(e, locale, t.experience.present)}</p>
                    <p className="mt-1 font-display text-xl font-semibold">{e.title}</p>
                    <p className="text-muted">{e.organization}</p>
                    {e.description && <p className="mt-2 leading-relaxed">{e.description}</p>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stack({ t }: { t: Dictionary }) {
  return (
    <section aria-labelledby="ferramentas" className="border-t border-border py-20 sm:py-28">
      <div className={`${container} grid gap-10 md:grid-cols-12`}>
        <div className="md:col-span-4">
          <SectionTitle id="ferramentas">{t.stack.title}</SectionTitle>
        </div>
        <dl className="divide-y divide-border md:col-span-8">
          {t.stack.groups.map((g) => (
            <div key={g.label} className="grid gap-2 py-5 sm:grid-cols-3">
              <dt className="font-semibold">{g.label}</dt>
              <dd className="text-muted sm:col-span-2">{g.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Approach({ t }: { t: Dictionary }) {
  return (
    <section aria-labelledby="metodo" className="bg-surface-2 py-20 sm:py-28">
      <div className={container}>
        <SectionTitle id="metodo">{t.approach.title}</SectionTitle>
        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.approach.items.map((item, i) => (
            <li key={item.title}>
              <span className="font-display text-5xl font-bold text-accent-text" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Contact({ t, settings }: { t: Dictionary; settings: PublicSettings }) {
  const wa = settings.whatsappNumber ? whatsappLink(settings.whatsappNumber, t.contact.whatsappMessage) : null;

  return (
    <section aria-labelledby="contato" className="scroll-mt-20 py-20 sm:py-28">
      <div className={`${container} grid gap-14 lg:grid-cols-12`}>
        <div className="lg:col-span-5">
          <h2 id="contato" className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            {t.contact.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">{t.contact.subtitle}</p>
          {wa && (
            <TrackedLink
              event="whatsapp"
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" />
              </svg>
              {t.contact.whatsapp}
            </TrackedLink>
          )}
          <div className="mt-10">
            <p className="text-sm font-semibold text-muted">{t.contact.channels}</p>
            <ul className="mt-3 flex flex-col gap-2 text-lg">
              <li>
                <TrackedLink event="email" href={`mailto:${CONTACT.email}`} className="underline decoration-border underline-offset-4 hover:decoration-foreground">
                  {CONTACT.email}
                </TrackedLink>
              </li>
              <li>
                <TrackedLink event="linkedin" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className="underline decoration-border underline-offset-4 hover:decoration-foreground">
                  LinkedIn
                </TrackedLink>
              </li>
              <li>
                <TrackedLink event="github" href={CONTACT.github} target="_blank" rel="noopener noreferrer" className="underline decoration-border underline-offset-4 hover:decoration-foreground">
                  GitHub
                </TrackedLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="lg:col-span-7">
          <p className="mb-6 text-sm font-semibold text-muted">{t.contact.or}</p>
          <ContactForm t={t.contact.form} />
        </div>
      </div>
    </section>
  );
}
