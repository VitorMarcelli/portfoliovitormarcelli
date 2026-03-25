import SectionWrapper from '@/components/SectionWrapper';

export default function About() {
  return (
    <SectionWrapper id="about">
      <div className="grid gap-12 md:grid-cols-[1fr_1.5fr]">
        <div>
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/40">
            Sobre mim
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Quem é Vitor Marcelli
          </h2>
        </div>

        <div className="flex flex-col gap-6 text-base leading-relaxed text-foreground/70">
          <p>
            Desenvolvedor fullstack com foco em construir soluções que
            funcionam de verdade. Atuo desde a concepção até a entrega,
            unindo execução técnica, visão de produto e senso estético.
          </p>
          <p>
            Minha prática envolve sistemas sob medida, automações complexas,
            integrações com APIs governamentais, pipelines de dados e
            interfaces de alto impacto visual.
          </p>
          <p>
            Busco entregar com qualidade de produto, não apenas código. Cada
            solução precisa resolver o problema real do cliente com
            elegância e eficiência.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
