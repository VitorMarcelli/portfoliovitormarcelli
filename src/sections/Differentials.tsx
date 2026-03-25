import SectionWrapper from '@/components/SectionWrapper';

const DIFFERENTIALS = [
  {
    title: 'Entrega ponta a ponta',
    description:
      'Do levantamento de requisitos ao deploy. Um parceiro técnico, não apenas um executor de tarefas.',
  },
  {
    title: 'Visão de produto',
    description:
      'Penso como produto, não como código. Cada decisão técnica serve ao resultado de negócio.',
  },
  {
    title: 'Sistemas reais',
    description:
      'Experiência com sistemas em produção, automações governamentais e integrações sensíveis.',
  },
  {
    title: 'Execução com qualidade',
    description:
      'Código limpo, arquitetura escalável e atenção aos detalhes que fazem a diferença.',
  },
] as const;

export default function Differentials() {
  return (
    <SectionWrapper id="differentials">
      <span className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/40">
        Por que escolher
      </span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Diferenciais
      </h2>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {DIFFERENTIALS.map((diff, i) => (
          <div
            key={diff.title}
            className="flex gap-4 border-l-2 border-foreground/10 pl-6 transition-colors hover:border-foreground/30"
          >
            <span className="text-3xl font-bold text-foreground/10">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {diff.title}
              </h3>
              <p className="text-sm leading-relaxed text-foreground/60">
                {diff.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
