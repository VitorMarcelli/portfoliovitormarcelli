import SectionWrapper from '@/components/SectionWrapper';

const STACK_GROUPS = [
  {
    label: 'Frontend',
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    label: 'Backend',
    items: ['Node.js', 'Express', 'Python', 'REST APIs', 'WebSockets'],
  },
  {
    label: 'Banco de Dados',
    items: ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma'],
  },
  {
    label: 'Automação & IA',
    items: ['Playwright', 'Puppeteer', 'OpenAI API', 'LangChain'],
  },
  {
    label: 'Cloud & DevOps',
    items: ['Vercel', 'Docker', 'GitHub Actions', 'Linux'],
  },
  {
    label: 'Ferramentas',
    items: ['Git', 'VS Code', 'Figma', 'Postman'],
  },
] as const;

export default function Stack() {
  return (
    <SectionWrapper id="stack">
      <span className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/40">
        Tecnologias
      </span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Stack técnica
      </h2>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {STACK_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/50">
              {group.label}
            </h3>
            <ul className="flex flex-col gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="text-sm text-foreground/70 border-l-2 border-foreground/10 pl-3 transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
