'use client';

import SectionWrapper from '@/components/SectionWrapper';
import ProjectCard from '@/components/ProjectCard';
import { projects } from '@/data/projects';
import { useLanguage } from '@/components/LanguageProvider';

export default function Projects() {
  const { t } = useLanguage();
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <SectionWrapper id="projects" className="py-32 md:py-64">
      <div className="flex flex-col gap-16 md:gap-32">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-12">
          <h2 className="text-6xl md:text-[8vw] font-bold tracking-tighter uppercase leading-[0.80] whitespace-pre-line">
            {t.projects.title}
          </h2>
          <p className="text-xl text-muted max-w-sm font-medium leading-[1.3]">
            {t.projects.subtitle}
          </p>
        </div>

        {/* Featured projects */}
        <div className="flex flex-col gap-24 md:gap-40">
          {featured.map((project, idx) => {
            const dictProject = t.projects.featured[idx];
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            return (
             <div key={project.id} className={`flex flex-col gap-8 md:gap-16 ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center`}>
                <a href={project.links.live || project.links.repository || '#'} target="_blank" rel="noopener noreferrer" className="w-full md:w-3/5 group relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-muted/10 border border-border flex items-center justify-center">
                  <img src={`${basePath}${project.coverImage}`} alt={dictProject?.title || project.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 mix-blend-luminosity hover:mix-blend-normal" />
                  <div className="absolute inset-0 bg-foreground/10 transition-colors duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-transparent" />
                </a>

                <div className="w-full md:w-2/5 flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                      {project.category}
                    </span>
                    <span className="text-xs font-mono opacity-30">
                      {project.updatedAt.split('-')[0]}
                    </span>
                  </div>

                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 tracking-tight hover:text-accent transition-colors">
                    <a href={project.links.live || project.links.repository || '#'} target="_blank" rel="noopener noreferrer">
                      {dictProject?.title || project.title}
                    </a>
                  </h3>

                  <p className="text-lg md:text-xl leading-relaxed opacity-70 mb-10">
                    {dictProject?.shortDescription || project.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-10">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-medium border border-border px-3 py-1 uppercase tracking-wider opacity-60"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <a href={project.links.live || project.links.repository || '#'} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-4 text-sm font-bold uppercase tracking-[0.2em] relative w-max pb-2">
                     {t.projects.exploreCta}
                     <span className="absolute bottom-0 left-0 w-full h-[1px] bg-foreground transition-transform origin-left scale-x-100 group-hover:scale-x-0 group-hover:origin-right duration-500"></span>
                     <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent transition-transform origin-left scale-x-0 group-hover:scale-x-100 duration-500 delay-150"></span>
                  </a>
                </div>
             </div>
            );
          })}
        </div>

        {/* Other projects Grid */}
        {others.length > 0 && (
          <div className="mt-20 pt-20 border-t border-border">
             <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-12">{t.projects.otherWorks}</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {others.map((project, idx) => {
                 const dictProject = t.projects.other[idx];
                 const localizedProject = {
                   ...project,
                   title: dictProject?.title || project.title,
                   shortDescription: dictProject?.shortDescription || project.shortDescription
                 };
                 return <ProjectCard key={project.id} project={localizedProject} />;
               })}
             </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
