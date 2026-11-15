import type { Dictionary } from '@/i18n/dictionaries';
import type { Project } from '@/lib/types';

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

const pill = 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium';

/** Status, private-code and for-sale markers shown on cards and on the case page. */
export default function ProjectBadges({ project, t }: { project: Project; t: Dictionary['projects'] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      <li className={`${pill} border-border text-muted`}>
        {project.status === 'live' && (
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
        )}
        {t.status[project.status]}
      </li>
      {project.repoPrivate && (
        <li className={`${pill} border-border text-muted`}>
          <LockIcon />
          {t.privateCode}
        </li>
      )}
      {project.forSale && <li className={`${pill} border-accent/50 bg-accent/10 text-accent-text`}>{t.forSale}</li>}
    </ul>
  );
}

export { LockIcon };
