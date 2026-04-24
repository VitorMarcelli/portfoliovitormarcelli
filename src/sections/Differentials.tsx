'use client';

import SectionWrapper from '@/components/SectionWrapper';
import { useLanguage } from '@/components/LanguageProvider';

export default function Differentials() {
  const { t } = useLanguage();

  return (
    <SectionWrapper id="differentials" className="py-32 md:py-48 bg-inv-bg text-inv-fg">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
        <div className="md:col-span-4 lg:col-span-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">
            {t.differentials.title}
          </h2>
        </div>

        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-24">
          {t.differentials.items.map((diff, i) => (
            <div key={diff.title} className="flex flex-col group">
              <span className="text-8xl md:text-9xl font-bold tracking-tighter text-inv-fg opacity-20 transition-opacity duration-500 group-hover:opacity-100 group-hover:text-accent leading-none -ml-2">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="mt-6 border-t border-inv-border pt-6">
                <h3 className="text-xl md:text-2xl font-bold mb-4 tracking-tight">
                  {diff.title}
                </h3>
                <p className="text-base md:text-lg leading-relaxed opacity-70">
                  {diff.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
