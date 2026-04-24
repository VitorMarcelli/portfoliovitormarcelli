'use client';

import SectionWrapper from '@/components/SectionWrapper';
import { useLanguage } from '@/components/LanguageProvider';

const CONTACT_LINKS = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/vitormarcelli' },
  { label: 'GitHub', href: 'https://github.com/vitormarcelli' },
  { label: 'Email', href: 'mailto:contato@vitormarcelli.dev' },
] as const;

export default function Contact() {
  const { t } = useLanguage();

  return (
    <SectionWrapper id="contact" className="py-48 md:py-64 border-t border-border mt-32 md:mt-48">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-5xl md:text-8xl lg:text-[10vw] font-bold tracking-tighter uppercase leading-[0.85] mb-8 hover:text-accent transition-colors duration-500 whitespace-pre-line">
          {t.contact.title}
        </h2>
        
        <p className="text-xl md:text-2xl text-muted font-medium max-w-2xl mb-16">
          {t.contact.subtitle}
        </p>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg md:text-2xl font-bold uppercase tracking-widest hover:text-accent transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-2 left-0 w-0 h-1 bg-accent transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
