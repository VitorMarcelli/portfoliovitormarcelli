import SectionWrapper from '@/components/SectionWrapper';

export default function Hero() {
  return (
    <SectionWrapper id="hero" className="min-h-screen flex items-center pt-20">
      <div className="flex flex-col gap-6">
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/40">
          Desenvolvedor Fullstack &amp; Construtor de Soluções
        </span>

        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-foreground md:text-7xl lg:text-8xl">
          Vitor
          <br />
          Marcelli
        </h1>

        <p className="max-w-lg text-lg leading-relaxed text-foreground/60 md:text-xl">
          Transformo ideias em soluções digitais completas — do conceito à
          entrega. Sistemas, automações, APIs e produtos web com execução
          técnica e visão de negócio.
        </p>

        <div className="flex flex-wrap gap-4 pt-4">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Ver projetos
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 border border-foreground/20 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/40"
          >
            Entrar em contato
          </a>
        </div>
      </div>
    </SectionWrapper>
  );
}
