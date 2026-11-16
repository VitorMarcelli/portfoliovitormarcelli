import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import ContactForm from '@/components/site/ContactForm';
import HomeHero from '@/components/site/HomeHero';
import ProjectBadges, { LockIcon } from '@/components/site/ProjectBadges';
import ProjectFlow from '@/components/site/ProjectFlow';
import ProjectSky, { type SkyStar } from '@/components/site/ProjectSky';
import RevealTitle from '@/components/site/RevealTitle';
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
      <WelcomeLoader locale={locale} />
      <HomeHero t={t.hero} />
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

/* ───────────────────────── Building blocks ───────────────────────── */

const container = 'mx-auto max-w-6xl px-4 sm:px-6';

/** Where the 3D sphere sits while this section is in view (read by NightScene). */
type Scene = { x: number; y?: number; scale: number };

function NightSection({
  id,
  labelledBy,
  scene,
  children,
  className = '',
}: {
  id?: string;
  labelledBy: string;
  scene: Scene;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-scene-x={scene.x}
      data-scene-y={scene.y ?? 0}
      data-scene-scale={scene.scale}
      className={`relative scroll-mt-10 py-24 sm:py-32 ${className}`}
    >
      <div className={container}>{children}</div>
    </section>
  );
}

function SectionHeader({ id, title, subtitle, aside }: { id: string; title: string; subtitle?: string; aside?: ReactNode }) {
  return (
    <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <RevealTitle id={id} text={title} className="night-gradient font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl" />
        {subtitle && (
          <p data-reveal className="mt-4 max-w-xl text-lg text-muted" style={reveal(250)}>
            {subtitle}
          </p>
        )}
      </div>
      {aside}
    </div>
  );
}

const reveal = (delayMs: number) => ({ '--reveal-delay': `${delayMs}ms` }) as CSSProperties;

function ProjectLinks({ project, t }: { project: Project; t: Dictionary }) {
  return (
    <>
      {project.liveUrl && (
        <TrackedLink
          event={`project_live:${project.slug}`}
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-border underline-offset-4 hover:decoration-accent-text"
        >
          {t.projects.viewLive}
        </TrackedLink>
      )}
      {project.repoPrivate ? (
        <span className="inline-flex items-center gap-1.5 text-muted" title={t.projects.privateCodeHint}>
          <LockIcon />
          {t.projects.privateCode}
        </span>
      ) : (
        project.repoUrl && (
          <TrackedLink
            event={`project_repo:${project.slug}`}
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-4 hover:decoration-accent-text"
          >
            {t.projects.viewCode}
          </TrackedLink>
        )
      )}
    </>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full border border-border px-3 py-1 text-sm text-muted">
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ───────────────────────── Sections ───────────────────────── */

function Projects({ t, locale, projects }: { t: Dictionary; locale: Locale; projects: Project[] }) {
  const stars: SkyStar[] = projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category ?? '',
    featured: p.featured,
    live: p.status === 'live',
  }));

  const articles = projects.map((project) => {
    const caseHref = localePath(locale, `/projetos/${project.slug}`);
    return (
      <article key={project.slug} className="glow-card w-full p-6 sm:p-8">
        <p className="text-sm text-accent-text">{[project.category, project.year].filter(Boolean).join(', ')}</p>
        <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          <Link href={caseHref} className="transition-colors hover:text-accent-text">
            {project.title}
          </Link>
        </h3>
        <div className="mt-4">
          <ProjectBadges project={project} t={t.projects} />
        </div>
        <p className="mt-4 leading-relaxed text-muted sm:text-lg">{project.summary}</p>
        {project.flow.length > 1 && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted">{t.projects.howItWorks}</p>
            <ProjectFlow steps={project.flow} label={`${t.projects.howItWorks}: ${project.title}`} />
          </div>
        )}
        <div className="mt-6">
          <Chips items={project.technologies} />
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-medium">
          <Link href={caseHref} className="text-accent-text underline decoration-2 underline-offset-4">
            {t.projects.viewCase}
          </Link>
          <ProjectLinks project={project} t={t} />
        </div>
      </article>
    );
  });

  return (
    <NightSection id="projetos" labelledBy="projetos-titulo" scene={{ x: -0.52, y: 0.05, scale: 0.4 }}>
      <SectionHeader id="projetos-titulo" title={t.projects.title} subtitle={t.projects.subtitle} />
      {projects.length === 0 ? (
        <p className="text-lg text-muted">{t.projects.empty}</p>
      ) : (
        <ProjectSky stars={stars} articles={articles} hint={t.projects.skyHint} label={t.projects.skyLabel} />
      )}
    </NightSection>
  );
}

function About({ t }: { t: Dictionary }) {
  return (
    <NightSection id="sobre" labelledBy="sobre-titulo" scene={{ x: -0.62, scale: 0.45 }}>
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <RevealTitle id="sobre-titulo" text={t.about.title} className="night-gradient font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl" />
        </div>
        <div data-reveal className="glow-card p-7 sm:p-10 md:col-span-8">
          <div className="flex flex-col gap-6 text-lg leading-relaxed sm:text-xl">
            {t.about.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-foreground' : 'text-muted'}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </NightSection>
  );
}

function Services({ t }: { t: Dictionary }) {
  return (
    <NightSection id="servicos" labelledBy="servicos-titulo" scene={{ x: 0.62, scale: 0.4 }}>
      <SectionHeader id="servicos-titulo" title={t.services.title} />
      <div className="grid gap-6 sm:grid-cols-2">
        {t.services.items.map((s, i) => (
          <div key={s.title} data-reveal style={reveal((i % 2) * 120)} className="glow-card p-7 sm:p-8">
            <span className="block h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_14px_var(--glow)]" aria-hidden="true" />
            <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-3 text-lg leading-relaxed text-muted">{s.description}</p>
          </div>
        ))}
      </div>
    </NightSection>
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
    <NightSection id="trajetoria" labelledBy="trajetoria-titulo" scene={{ x: -0.62, scale: 0.4 }}>
      <SectionHeader
        id="trajetoria-titulo"
        title={t.experience.title}
        aside={
          cvUrl && (
            <TrackedLink
              event="cv_download"
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-max items-center rounded-full bg-accent px-6 py-3 font-medium text-accent-fg shadow-[0_10px_30px_-12px_var(--glow)] transition-opacity hover:opacity-90"
            >
              {t.experience.downloadCv}
            </TrackedLink>
          )
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map((group, gi) => (
          <div key={group.label} data-reveal style={reveal(gi * 120)} className="glow-card p-7 sm:p-8">
            <h3 className="text-sm font-semibold text-accent-text">{group.label}</h3>
            <ol className="mt-5 border-l border-border">
              {group.items.map((e) => (
                <li key={e.id} className="relative pb-8 pl-6 last:pb-0">
                  <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_var(--glow)]" aria-hidden="true" />
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
    </NightSection>
  );
}

function Stack({ t }: { t: Dictionary }) {
  return (
    <NightSection id="ferramentas" labelledBy="ferramentas-titulo" scene={{ x: 0.62, scale: 0.38 }}>
      <SectionHeader id="ferramentas-titulo" title={t.stack.title} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {t.stack.groups.map((g, i) => (
          <div
            key={g.label}
            data-reveal
            style={reveal((i % 3) * 110)}
            className={`glow-card p-7 ${i === 0 ? 'lg:col-span-2' : ''}`}
          >
            <h3 className="font-display text-xl font-semibold">{g.label}</h3>
            <div className="mt-5">
              <Chips items={g.items} />
            </div>
          </div>
        ))}
      </div>
    </NightSection>
  );
}

function Approach({ t }: { t: Dictionary }) {
  return (
    <NightSection id="metodo" labelledBy="metodo-titulo" scene={{ x: -0.62, scale: 0.38 }}>
      <SectionHeader id="metodo-titulo" title={t.approach.title} />
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.approach.items.map((item, i) => (
          <li key={item.title} data-reveal style={reveal(i * 110)} className="glow-card p-7">
            <span className="night-gradient font-display text-5xl font-bold" aria-hidden="true">
              {i + 1}
            </span>
            <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{item.description}</p>
          </li>
        ))}
      </ol>
    </NightSection>
  );
}

function Contact({ t, settings }: { t: Dictionary; settings: PublicSettings }) {
  const wa = settings.whatsappNumber ? whatsappLink(settings.whatsappNumber, t.contact.whatsappMessage) : null;

  return (
    <NightSection id="contato" labelledBy="contato-titulo" scene={{ x: 0.62, y: 0.55, scale: 0.35 }}>
      <div className="grid gap-6 lg:grid-cols-12">
        <div data-reveal className="glow-card p-7 sm:p-9 lg:col-span-5">
          <RevealTitle
            id="contato-titulo"
            text={t.contact.title}
            className="night-gradient font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
          />
          <p className="mt-5 text-lg leading-relaxed text-muted">{t.contact.subtitle}</p>
          {wa && (
            <TrackedLink
              event="whatsapp"
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 font-medium text-accent-fg shadow-[0_10px_30px_-12px_var(--glow)] transition-opacity hover:opacity-90"
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
                <TrackedLink event="email" href={`mailto:${CONTACT.email}`} className="underline decoration-border underline-offset-4 hover:decoration-accent-text">
                  {CONTACT.email}
                </TrackedLink>
              </li>
              <li>
                <TrackedLink event="linkedin" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className="underline decoration-border underline-offset-4 hover:decoration-accent-text">
                  LinkedIn
                </TrackedLink>
              </li>
              <li>
                <TrackedLink event="github" href={CONTACT.github} target="_blank" rel="noopener noreferrer" className="underline decoration-border underline-offset-4 hover:decoration-accent-text">
                  GitHub
                </TrackedLink>
              </li>
            </ul>
          </div>
        </div>
        <div data-reveal style={reveal(150)} className="glow-card p-7 sm:p-9 lg:col-span-7">
          <p className="mb-6 text-sm font-semibold text-muted">{t.contact.or}</p>
          <ContactForm t={t.contact.form} />
        </div>
      </div>
    </NightSection>
  );
}
