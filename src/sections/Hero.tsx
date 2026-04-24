'use client';

import { motion, Variants } from 'framer-motion';
import { useLanguage } from '@/components/LanguageProvider';

export default function Hero() {
  const { t } = useLanguage();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-end pb-12 px-6 md:px-12 md:pb-24 lg:px-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full flex flex-col"
      >
        <motion.div variants={itemVariants} className="overflow-hidden mb-8 md:mb-12 max-w-2xl">
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-muted mb-4 border-l-2 border-accent pl-4">
            {t.hero.role}
          </p>
          <p className="text-xl md:text-3xl font-medium leading-[1.3] text-foreground/90 max-w-xl">
            {t.hero.manifesto}
          </p>
        </motion.div>

        <div className="flex flex-col uppercase font-bold tracking-tighter leading-[0.8] text-[16vw] md:text-[14vw] lg:text-[12vw] -ml-[1vw]">
          <motion.div className="overflow-hidden flex">
            <motion.span variants={itemVariants} className="inline-block hover:text-accent transition-colors duration-500 cursor-default">Vitor</motion.span>
          </motion.div>
          <motion.div className="overflow-hidden flex">
            <motion.span variants={itemVariants} className="inline-block hover:text-accent transition-colors duration-500 cursor-default">Marcelli<span className="text-accent">.</span></motion.span>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="mt-16 md:mt-24 pt-6 border-t border-border flex flex-col gap-6 sm:flex-row sm:items-center justify-between">
          <div className="flex items-center gap-4 text-xs md:text-sm font-medium uppercase tracking-widest text-muted">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(255,51,51,0.5)]"></span>
            {t.hero.status}
          </div>
          
          <a
            href="#projects"
            className="group relative inline-flex items-center justify-center overflow-hidden bg-foreground text-background px-8 py-5 font-bold uppercase tracking-widest text-xs md:text-sm outline-none transition-all hover:bg-accent hover:text-white"
          >
            <span className="absolute inset-0 bg-accent translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"></span>
            <span className="relative z-10 flex items-center gap-4">
              {t.hero.cta}
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:translate-x-1"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
