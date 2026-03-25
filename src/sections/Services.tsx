import SectionWrapper from '@/components/SectionWrapper';

const SERVICES = [
  {
    title: 'Desenvolvimento Web',
    description:
      'Sites, landing pages e aplicações web completas com foco em performance e experiência.',
  },
  {
    title: 'Sistemas Sob Medida',
    description:
      'Soluções personalizadas que atendem necessidades reais do negócio, do backend ao frontend.',
  },
  {
    title: 'Automações',
    description:
      'Scripts e sistemas que automatizam processos complexos e repetitivos com confiabilidade.',
  },
  {
    title: 'Integrações & APIs',
    description:
      'Conexão entre sistemas, serviços externos e APIs governamentais com tratamento robusto.',
  },
  {
    title: 'Inteligência Artificial',
    description:
      'Aplicação prática de IA em fluxos de trabalho e produtos reais.',
  },
  {
    title: 'Aplicativos & Soluções',
    description:
      'Produtos digitais completos — da ideia ao deploy — com arquitetura escalável.',
  },
] as const;

export default function Services() {
  return (
    <SectionWrapper id="services">
      <span className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/40">
        Serviços
      </span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        O que eu faço
      </h2>

      <div className="mt-12 grid gap-px border border-foreground/10 bg-foreground/10 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <div
            key={service.title}
            className="flex flex-col gap-3 bg-background p-8 transition-colors hover:bg-foreground/[0.02]"
          >
            <h3 className="text-base font-semibold text-foreground">
              {service.title}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/60">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
