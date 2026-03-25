import SectionWrapper from '@/components/SectionWrapper';

const CONTACT_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/vitormarcelli',
    icon: '→',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/vitormarcelli',
    icon: '→',
  },
  {
    label: 'E-mail',
    href: 'mailto:contato@vitormarcelli.dev',
    icon: '→',
  },
] as const;

export default function Contact() {
  return (
    <SectionWrapper id="contact">
      <div className="flex flex-col items-center text-center">
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/40">
          Contato
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Vamos conversar?
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/60">
          Se você procura um desenvolvedor que entrega com qualidade,
          visão técnica e compromisso, entre em contato.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-8">
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-base font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="transition-transform group-hover:translate-x-1">
                {link.icon}
              </span>
            </a>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
