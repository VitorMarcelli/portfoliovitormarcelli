import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden border border-foreground/10 bg-foreground/[0.02] transition-colors hover:border-foreground/20 hover:bg-foreground/[0.04]">
      {/* Cover placeholder — will be replaced with real images in Phase 2 */}
      <div className="aspect-video w-full bg-foreground/5" />

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
            {project.category}
          </span>
          {project.featured && (
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Destaque
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold leading-snug text-foreground">
          {project.title}
        </h3>

        <p className="text-sm leading-relaxed text-foreground/60">
          {project.shortDescription}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-xs font-medium text-foreground/50 border border-foreground/10 px-2 py-1"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
