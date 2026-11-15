import Image from 'next/image';
import type { Project } from '@/lib/types';

interface ProjectCoverProps {
  project: Project;
  priority?: boolean;
  sizes?: string;
}

/**
 * Real screenshot when one was uploaded in the panel; otherwise a cover drawn in the night palette
 * from the project's own data (category and stack), so nothing fake is shown.
 */
export default function ProjectCover({ project, priority, sizes = '(min-width: 1024px) 60vw, 100vw' }: ProjectCoverProps) {
  if (project.coverUrl) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface-2">
        <Image src={project.coverUrl} alt={project.title} fill sizes={sizes} priority={priority} className="object-cover object-top" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="relative flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface-2 p-6 sm:p-8"
    >
      {/* A small orb with its beam, echoing the welcome screen */}
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-border shadow-[0_0_60px_2px_var(--glow),inset_0_0_40px_var(--glow)]">
        <div className="absolute inset-[-2px] animate-[spin_9s_linear_infinite] rounded-full">
          <span className="absolute left-1/2 top-0 h-1 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,transparent,var(--beam))] shadow-[0_0_14px_3px_var(--glow)]" />
        </div>
      </div>
      <span className="relative text-sm text-accent-text">{project.category}</span>
      <ul className="relative flex flex-wrap gap-2">
        {project.technologies.slice(0, 5).map((tech) => (
          <li key={tech} className="rounded-full border border-border bg-background/40 px-3 py-1 text-sm text-muted">
            {tech}
          </li>
        ))}
      </ul>
    </div>
  );
}
