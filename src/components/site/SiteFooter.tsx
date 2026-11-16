import Link from 'next/link';
import type { Dictionary } from '@/i18n/dictionaries';
import { CONTACT } from '@/lib/env';
import type { Locale } from '@/lib/types';

/**
 * Footer: the name as giant outlined letters that light up under the mouse (a slow sweep of light
 * on touch screens), a star that takes you back to the top, and the usual links.
 */
export default function SiteFooter({ t }: { locale: Locale; t: Dictionary }) {
  return (
    <footer className="relative overflow-hidden border-t border-border">
      <div className="mx-auto max-w-6xl px-4 pb-36 pt-14 sm:px-6">
        <div className="flex items-center justify-between gap-6">
          <p className="font-display text-lg text-muted sm:text-xl">{t.footer.tagline}</p>
          <a
            href="#"
            aria-label={t.footer.backToTop}
            title={t.footer.backToTop}
            className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:border-[var(--beam)]"
          >
            <span className="absolute inset-0 rounded-full opacity-0 shadow-[0_0_30px_6px_var(--glow)] transition-opacity group-hover:opacity-100" aria-hidden="true" />
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-accent-text transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[72deg]"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2l2.6 6.9L22 9.3l-5.8 4.6 2.1 7.1L12 16.9 5.7 21l2.1-7.1L2 9.3l7.4-.4z" />
            </svg>
          </a>
        </div>

        <p
          data-mouse-light
          aria-hidden="true"
          className="footer-name mt-8 select-none whitespace-nowrap font-display text-[clamp(3rem,13.5vw,11.5rem)] font-extrabold leading-[0.9] tracking-tight"
        >
          Vitor Marcelli
        </p>

        <div className="mt-10 flex flex-col gap-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Vitor Marcelli. {t.footer.rights}
          </p>
          <ul className="flex flex-wrap items-center gap-6">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="hover:text-foreground">
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                GitHub
              </a>
            </li>
            <li>
              <Link href="/admin" prefetch={false} className="hover:text-foreground">
                {t.footer.admin}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
