'use client';

import SectionWrapper from '@/components/SectionWrapper';
import { useLanguage } from '@/components/LanguageProvider';

export default function About() {
  const { t } = useLanguage();

  return (
    <SectionWrapper id="about" className="bg-inv-bg text-inv-fg py-32 md:py-48">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
        
        <div className="md:col-span-4 lg:col-span-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">
            {t.about.title}
          </h2>
        </div>

        <div className="md:col-span-8 lg:col-span-7 flex flex-col gap-8 text-xl md:text-2xl lg:text-3xl font-medium leading-[1.3] text-inv-fg/80">
          <p className="text-inv-fg">{t.about.paragraphs[0]}</p>
          <p>{t.about.paragraphs[1]}</p>
          <p>{t.about.paragraphs[2]}</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
