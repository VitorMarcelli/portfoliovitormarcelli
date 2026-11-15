'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import type { Dictionary } from '@/i18n/dictionaries';
import { localePath } from '@/i18n/dictionaries';
import type { Locale } from '@/lib/types';

interface SiteHeaderProps {
  locale: Locale;
  nav: Dictionary['nav'];
}

function alternatePath(pathname: string, locale: Locale) {
  if (locale === 'pt') return pathname === '/' ? '/en' : `/en${pathname}`;
  const stripped = pathname.replace(/^\/en(?=\/|$)/, '');
  return stripped || '/';
}

export default function SiteHeader({ locale, nav }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const home = localePath(locale);
  const items = [
    { label: nav.projects, href: `${home}#projetos` },
    { label: nav.services, href: `${home}#servicos` },
    { label: nav.experience, href: `${home}#trajetoria` },
    { label: nav.contact, href: `${home}#contato` },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
      >
        {nav.skip}
      </a>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Principal">
        <Link href={home} className="font-display text-lg font-bold tracking-tight">
          Vitor Marcelli
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {items.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="text-sm text-muted transition-colors hover:text-foreground">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <Link
            href={alternatePath(pathname, locale)}
            hrefLang={locale === 'pt' ? 'en' : 'pt-BR'}
            aria-label={nav.switchLanguageLabel}
            className="hidden rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground sm:inline-flex"
          >
            {nav.switchLanguage}
          </Link>
          <ThemeToggle toLightLabel={nav.themeToLight} toDarkLabel={nav.themeToDark} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? nav.closeMenu : nav.menu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-2 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="menu-mobile" className="fixed inset-x-0 top-16 bottom-0 z-40 bg-background px-6 py-8 md:hidden">
          <ul className="flex flex-col gap-6">
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setOpen(false)} className="font-display text-3xl font-semibold">
                  {item.label}
                </a>
              </li>
            ))}
            <li className="border-t border-border pt-6">
              <Link href={alternatePath(pathname, locale)} onClick={() => setOpen(false)} className="text-lg text-muted">
                {nav.switchLanguage}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
