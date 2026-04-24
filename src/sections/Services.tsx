'use client';

import SectionWrapper from '@/components/SectionWrapper';
import { useLanguage } from '@/components/LanguageProvider';

export default function Services() {
  const { t } = useLanguage();

  return (
    <SectionWrapper id="services" className="py-32 md:py-48">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
        <div className="md:col-span-4 lg:col-span-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">
            {t.services.title}
          </h2>
        </div>

        <div className="md:col-span-8 lg:col-span-9 w-full flex flex-col">
          {t.services.items.map((service, idx) => (
            <div
              key={service.title}
              className={`group flex flex-col md:flex-row gap-4 border-t border-border py-8 md:py-12 transition-colors hover:border-foreground ${idx === t.services.items.length - 1 ? 'border-b' : ''}`}
            >
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground transition-transform duration-500 ease-out group-hover:translate-x-4 md:w-1/2">
                {service.title}
              </h3>
              <p className="text-lg md:text-xl leading-relaxed text-muted md:w-1/2 pt-2 md:pt-0">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
