import SectionWrapper from '@/components/SectionWrapper';
import ProjectCard from '@/components/ProjectCard';
import { projects } from '@/data/projects';

export default function Projects() {
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <SectionWrapper id="projects">
      <span className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/40">
        Portfólio
      </span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Projetos selecionados
      </h2>

      {/* Featured projects — larger display */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {featured.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Other projects */}
      {others.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
