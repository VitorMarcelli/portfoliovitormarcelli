import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return (
    <a href={project.links.live || project.links.repository || '#'} target="_blank" rel="noopener noreferrer" className="group block relative w-full overflow-hidden border border-border bg-background transition-colors hover:bg-foreground hover:text-background">
      {/* Cover image with hover zoom */}
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-muted/10">
        <img src={`${basePath}${project.coverImage}`} alt={project.title} className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-foreground/10 transition-colors duration-700 ease-out group-hover:bg-transparent" />
        {project.featured && (
          <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 text-xs font-bold uppercase tracking-widest z-10">
            Destaque
          </div>
        )}
      </div>

      <div className="flex flex-col p-6 md:p-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-50">
            {project.category}
          </span>
          <span className="text-xs font-mono opacity-30">
            {project.updatedAt.split('-')[0]}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold leading-none mb-4 tracking-tight">
          {project.title}
        </h3>

        <p className="text-sm md:text-base leading-relaxed opacity-70 mb-8 max-w-lg">
          {project.shortDescription}
        </p>

        <div className="mt-auto flex flex-wrap gap-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-xs font-medium border border-current px-3 py-1 uppercase tracking-wider opacity-60 transition-opacity group-hover:opacity-100"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
