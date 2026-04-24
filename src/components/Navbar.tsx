'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from './LanguageProvider';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { label: t.nav.work, href: '#projects' },
    { label: t.nav.services, href: '#services' },
    { label: t.nav.stack, href: '#stack' },
    { label: t.nav.contact, href: '#contact' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 z-50 w-full mix-blend-difference text-white transition-all duration-500`}
    >
      <nav className="flex items-center justify-between px-6 py-6 md:px-12">
        <a
          href="#hero"
          className="text-lg font-bold tracking-tighter uppercase"
        >
          VM<span className="text-accent text-2xl leading-none">.</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-10 md:flex">
          <ul className="flex items-center gap-10">
            {NAV_ITEMS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-sm font-medium uppercase tracking-widest opacity-60 transition-opacity hover:opacity-100"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-[5px] md:hidden z-50 mix-blend-difference text-white"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-[2px] w-6 bg-current transition-transform duration-300 ${
              mobileOpen ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-[2px] w-6 bg-current transition-opacity duration-300 ${
              mobileOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-[2px] w-6 bg-current transition-transform duration-300 ${
              mobileOpen ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background text-foreground md:hidden"
          >
            <ul className="flex flex-col items-center gap-8">
              {NAV_ITEMS.map(({ label, href }) => (
                <li key={href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="text-4xl font-bold uppercase tracking-tight hover:text-accent transition-colors"
                    >
                      {label}
                    </a>
                  </motion.div>
                </li>
              ))}
            </ul>
            <div className="mt-12 flex items-center gap-6">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
