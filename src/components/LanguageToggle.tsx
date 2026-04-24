'use client';

import { useLanguage } from './LanguageProvider';

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      aria-label={`Switch to ${locale === 'pt' ? 'English' : 'Português'}`}
      className="relative flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors"
    >
      <span className={`transition-opacity duration-300 ${locale === 'pt' ? 'opacity-100' : 'opacity-30'}`}>
        PT
      </span>
      <span className="opacity-20">/</span>
      <span className={`transition-opacity duration-300 ${locale === 'en' ? 'opacity-100' : 'opacity-30'}`}>
        EN
      </span>
    </button>
  );
}
