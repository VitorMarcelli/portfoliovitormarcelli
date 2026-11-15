import Image from 'next/image';
import type { Project } from '@/lib/types';

interface ProjectCoverProps {
  project: Project;
  priority?: boolean;
  sizes?: string;
}

/**
 * Real screenshot when one was uploaded in the panel; otherwise a typographic cover
 * built from the project's own name and stack, so nothing fake is shown.
 */
export default function ProjectCover({ project, priority, sizes = '(min-width: 1024px) 60vw, 100vw' }: ProjectCoverProps) {
  if (project.coverUrl) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-surface-2">
        <Image src={project.coverUrl} alt={project.title} fill sizes={sizes} priority={priority} className="object-cover object-top" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="relative flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-lg bg-ink p-6 text-ink-fg sm:p-8"
    >
      <div className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(0deg,currentColor_0_1px,transparent_1px_28px)]" />
      <span className="relative text-sm text-ink-muted">{project.category}</span>
      <div className="relative">
        <p className="font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl">{project.title}</p>
        <p className="mt-4 text-sm text-ink-muted">{project.technologies.slice(0, 4).join(' / ')}</p>
      </div>
      <span className="absolute right-6 top-6 h-3 w-3 rounded-full bg-accent sm:right-8 sm:top-8" />
    </div>
  );
}
