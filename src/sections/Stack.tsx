'use client';

import SectionWrapper from '@/components/SectionWrapper';
import { useLanguage } from '@/components/LanguageProvider';

const STACK_ITEMS = [
  ['React', 'Next.js', 'Framer Motion', 'Tailwind CSS', 'TypeScript'],
  ['Node.js', 'Express', 'Python', 'WebSockets', 'REST'],
  ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma ORM'],
  ['Playwright', 'Puppeteer', 'OpenAI SDK', 'LangChain'],
  ['Vercel', 'Docker', 'Linux', 'GitHub Actions'],
];

export default function Stack() {
  const { t } = useLanguage();

  return (
    <SectionWrapper id="stack" className="bg-inv-bg text-inv-fg py-32 md:py-64">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">
        <div className="lg:col-span-4 flex flex-col gap-6 pr-8">
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight">
            {t.stack.title}
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-inv-muted">
            {t.stack.intro}
          </p>
        </div>

        <div className="lg:col-span-8 flex flex-col w-full">
          {t.stack.groups.map((group, idx) => (
            <div key={group.label} className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-inv-border py-8 md:py-12 group transition-colors hover:border-inv-fg/30">
              <div className="md:w-1/3 flex items-start gap-4">
                 <span className="text-sm font-mono opacity-40 group-hover:text-accent group-hover:opacity-100 transition-colors">[{String(idx + 1).padStart(2, '0')}]</span>
                 <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                   {group.label}
                 </h3>
              </div>
              <div className="md:w-2/3 flex flex-wrap gap-2 mt-4 md:mt-0">
                {STACK_ITEMS[idx]?.map((item) => (
                  <span
                    key={item}
                    className="text-sm md:text-base font-medium border border-inv-border px-4 py-2 opacity-70 group-hover:opacity-100 transition-opacity cursor-default"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
