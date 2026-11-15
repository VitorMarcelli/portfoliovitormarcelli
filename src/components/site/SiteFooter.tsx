import Link from 'next/link';
import type { Dictionary } from '@/i18n/dictionaries';
import { CONTACT } from '@/lib/env';
import type { Locale } from '@/lib/types';

export default function SiteFooter({ t }: { locale: Locale; t: Dictionary }) {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-36 pt-10 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between">
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
    </footer>
  );
}
