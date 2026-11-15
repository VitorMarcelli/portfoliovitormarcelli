import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '../globals.css';
import { fontVariables } from '../fonts';
import ThemeKeeper from '@/components/ThemeKeeper';
import ThemeScript from '@/components/ThemeScript';
import SiteFooter from '@/components/site/SiteFooter';
import Tracker from '@/components/site/Tracker';
import SiteDock from '@/components/site/Dock';
import { getPublicSettings } from '@/lib/data';
import { whatsappLink } from '@/lib/whatsapp/link';
import { getDictionary, isLocale, localePath, locales } from '@/i18n/dictionaries';
import { CONTACT, SITE_URL } from '@/lib/env';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5f1' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1b2d' },
  ],
};

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: '%s | Vitor Marcelli' },
    description: t.meta.description,
    authors: [{ name: 'Vitor Marcelli', url: CONTACT.linkedin }],
    alternates: {
      canonical: localePath(locale),
      languages: { 'pt-BR': '/', en: '/en' },
    },
    openGraph: {
      type: 'website',
      siteName: 'Vitor Marcelli',
      title: t.meta.title,
      description: t.meta.description,
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
      url: localePath(locale),
    },
    twitter: { card: 'summary_large_image', title: t.meta.title, description: t.meta.description },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const settings = await getPublicSettings();

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Vitor Augusto Marcelli dos Santos',
    alternateName: 'Vitor Marcelli',
    jobTitle: t.hero.role,
    url: SITE_URL,
    email: `mailto:${CONTACT.email}`,
    sameAs: [CONTACT.linkedin, CONTACT.github],
  };

  return (
    <html lang={locale === 'pt' ? 'pt-BR' : 'en'} className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body className="min-h-screen">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
        >
          {t.nav.skip}
        </a>
        <main id="conteudo">{children}</main>
        <SiteFooter locale={locale} t={t} />
        <SiteDock
          locale={locale}
          labels={t.dock}
          github={CONTACT.github}
          linkedin={CONTACT.linkedin}
          email={CONTACT.email}
          whatsappHref={settings.whatsappNumber ? whatsappLink(settings.whatsappNumber, t.contact.whatsappMessage) : null}
        />
        <ThemeKeeper />
        <Tracker />
      </body>
    </html>
  );
}
