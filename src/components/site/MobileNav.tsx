'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { DockLabels } from './Dock';
import {
  ChatIcon,
  FolderIcon,
  GithubIcon,
  HomeIcon,
  LanguagesIcon,
  LinkedinIcon,
  MailIcon,
  SunMoonIcon,
  WhatsappIcon,
} from './navIcons';
import { track } from './Tracker';

interface MobileNavProps {
  ready: boolean;
  labels: DockLabels;
  home: string;
  onHome: boolean;
  github: string;
  linkedin: string;
  email: string;
  whatsappHref: string | null;
  onSwitchLanguage: () => void;
  onToggleTheme: () => void;
}

type Section = 'inicio' | 'projetos' | 'contato' | null;

const EASE = [0.22, 1, 0.36, 1] as const;
const glass =
  'border border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_74%,transparent)] backdrop-blur-xl backdrop-saturate-150';

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

/** Which of the three anchors crosses the middle of the screen (home page only). */
function currentSection(): Section {
  const mid = window.innerHeight * 0.45;
  for (const id of ['contato', 'projetos'] as const) {
    const rect = document.getElementById(id)?.getBoundingClientRect();
    if (rect && rect.top <= mid && rect.bottom >= mid) return id;
  }
  return window.scrollY < window.innerHeight * 0.6 ? 'inicio' : null;
}

/**
 * Phone navigation: a glass pill with the three destinations plus "More", which opens a bottom sheet
 * with profiles and preferences. It slides away while scrolling down and comes back on scroll up.
 */
export default function MobileNav({
  ready,
  labels,
  home,
  onHome,
  github,
  linkedin,
  email,
  whatsappHref,
  onSwitchLanguage,
  onToggleTheme,
}: MobileNavProps) {
  const router = useRouter();
  const [section, setSection] = useState<Section>(onHome ? 'inicio' : null);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const keepVisibleUntil = useRef(0);

  // Active section and hide-on-scroll, measured at most once per frame.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      // A tab tap scrolls the page down on its own; keep the pill in view while that happens.
      if (performance.now() < keepVisibleUntil.current) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(y - lastY) > 8) {
        setHidden(y > lastY && y > 240);
        lastY = y;
      }
      setSection(onHome ? currentSection() : null);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [onHome]);

  // Sheet: Esc closes, the page behind does not scroll, focus returns to "More" afterwards.
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) moreRef.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function goTo(id: 'inicio' | 'projetos' | 'contato', tappedAt: number) {
    keepVisibleUntil.current = tappedAt + 1600;
    if (!onHome) return router.push(id === 'inicio' ? home : `${home}#${id}`);
    if (id === 'inicio') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function external(href: string, event: string) {
    track('click', event);
    setOpen(false);
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  const tabs: { id: 'inicio' | 'projetos' | 'contato'; label: string; icon: ReactNode }[] = [
    { id: 'inicio', label: labels.home, icon: <HomeIcon /> },
    { id: 'projetos', label: labels.projects, icon: <FolderIcon /> },
    { id: 'contato', label: labels.contact, icon: <ChatIcon /> },
  ];

  const sheetItems: { key: string; label: string; icon: ReactNode; action: () => void }[] = [
    { key: 'github', label: labels.github, icon: <GithubIcon />, action: () => external(github, 'github') },
    { key: 'linkedin', label: labels.linkedin, icon: <LinkedinIcon />, action: () => external(linkedin, 'linkedin') },
    ...(whatsappHref
      ? [{ key: 'whatsapp', label: labels.whatsapp, icon: <WhatsappIcon />, action: () => external(whatsappHref, 'whatsapp') }]
      : []),
    {
      key: 'email',
      label: labels.email,
      icon: <MailIcon />,
      action: () => {
        track('click', 'email');
        setOpen(false);
        window.location.href = `mailto:${email}`;
      },
    },
    {
      key: 'language',
      label: labels.language,
      icon: <LanguagesIcon />,
      action: () => {
        setOpen(false);
        onSwitchLanguage();
      },
    },
    { key: 'theme', label: labels.theme, icon: <SunMoonIcon />, action: onToggleTheme },
  ];

  const shown = ready && (!hidden || open);

  return (
    <>
      <motion.nav
        aria-label={labels.toolbar}
        initial={false}
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 110 }}
        transition={{ duration: ready && !hidden ? 0.6 : 0.35, ease: EASE }}
        style={{ pointerEvents: shown ? 'auto' : 'none', paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 md:hidden"
      >
        <div className={`${glass} relative flex w-full max-w-[420px] rounded-full p-1.5 shadow-[0_14px_40px_-12px_var(--glow)]`}>
          {/* Thin light along the top edge, like a glass rim. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--beam)] to-transparent opacity-60"
          />
          {tabs.map((tab) => {
            const active = section === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={(e) => goTo(tab.id, e.timeStamp)}
                aria-current={active ? 'location' : undefined}
                className={`relative flex flex-1 flex-col items-center gap-1 rounded-full px-1 pb-1.5 pt-2 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
                  active ? 'text-accent-text' : 'text-muted'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-accent/15"
                    aria-hidden="true"
                  >
                    <span className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-accent-text shadow-[0_0_8px_var(--beam)]" />
                  </motion.span>
                )}
                <span className="relative h-[22px] w-[22px]">{tab.icon}</span>
                <span className="relative">{tab.label}</span>
              </motion.button>
            );
          })}
          <motion.button
            ref={moreRef}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="relative flex flex-1 flex-col items-center gap-1 rounded-full px-1 pb-1.5 pt-2 text-[11px] font-medium text-muted outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            <span className="relative h-[22px] w-[22px]">
              <MoreIcon />
            </span>
            <span className="relative">{labels.more}</span>
          </motion.button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-[rgba(3,6,15,0.55)] backdrop-blur-[2px] md:hidden"
              aria-hidden="true"
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label={labels.moreTitle}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.7 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 90 || info.velocity.y > 500) setOpen(false);
              }}
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
              className={`${glass} fixed inset-x-0 bottom-0 z-[61] rounded-t-[28px] border-b-0 px-5 pt-3 shadow-[0_-20px_60px_-20px_var(--glow)] md:hidden`}
            >
              <div className="mx-auto h-1.5 w-10 rounded-full bg-[var(--border)]" aria-hidden="true" />
              <div className="mt-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">{labels.moreTitle}</h2>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setOpen(false)}
                  aria-label={labels.close}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-muted outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-3">
                {sheetItems.map((item, i) => (
                  <motion.li
                    key={item.key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.035, duration: 0.35, ease: EASE }}
                    className={i === sheetItems.length - 1 && sheetItems.length % 2 === 1 ? 'col-span-2' : undefined}
                  >
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={item.action}
                      className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-surface px-4 py-3.5 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                    >
                      <span className="h-5 w-5 shrink-0 text-accent-text">{item.icon}</span>
                      {item.label}
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
