'use client';

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from 'framer-motion';
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { localePath } from '@/i18n/dictionaries';
import type { Locale } from '@/lib/types';
import { track } from './Tracker';
import { skipNextWelcome } from './welcomeSkip';

/* ───────────────────────── Dock primitives ───────────────────────── */

const SPRING: SpringOptions = { mass: 0.1, stiffness: 150, damping: 12 };
const MAGNIFICATION = 90;
const DISTANCE = 80;
const PANEL_HEIGHT = 64;
const ICON_SIZE = 40;
/** Narrow screens (below Tailwind's sm) get smaller resting icons so eight of them fit. */
const ICON_SIZE_COMPACT = 30;
const COMPACT_QUERY = '(max-width: 639px)';

interface DockContextValue {
  mouseX: MotionValue<number>;
  baseSize: MotionValue<number>;
  /** Items register a function that caches their resting center; the panel calls them on mouse enter. */
  registerMeasure: (measure: () => void) => () => void;
}

const DockContext = createContext<DockContextValue | null>(null);

function useDock() {
  const ctx = useContext(DockContext);
  if (!ctx) throw new Error('DockItem must be used inside Dock');
  return ctx;
}

function DockPanel({ children, label }: { children: ReactNode; label: string }) {
  const mouseX = useMotionValue(Infinity);
  const baseSize = useMotionValue(ICON_SIZE);
  const measures = useRef(new Set<() => void>());

  useEffect(() => {
    const media = window.matchMedia(COMPACT_QUERY);
    const apply = () => baseSize.set(media.matches ? ICON_SIZE_COMPACT : ICON_SIZE);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [baseSize]);

  const context = useMemo<DockContextValue>(
    () => ({
      mouseX,
      baseSize,
      registerMeasure: (measure) => {
        measures.current.add(measure);
        return () => measures.current.delete(measure);
      },
    }),
    [mouseX, baseSize],
  );
  const isHovered = useMotionValue(0);
  const maxHeight = useMemo(() => Math.max(128, MAGNIFICATION + MAGNIFICATION / 2 + 4), []);
  const heightRow = useTransform(isHovered, [0, 1], [PANEL_HEIGHT, maxHeight]);
  const height = useSpring(heightRow, SPRING);

  return (
    <motion.div style={{ height, scrollbarWidth: 'none' }} className="mx-2 flex max-w-full items-end overflow-x-auto">
      <motion.div
        // Magnify only for a real mouse. On touch screens a tap fires emulated mouse enter/move events
        // but never a leave, which left the icons enlarged and the bar stuck open on phones.
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') measures.current.forEach((measure) => measure());
        }}
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return;
          isHovered.set(1);
          mouseX.set(e.clientX);
        }}
        onPointerLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className="mx-auto flex w-fit items-end gap-1.5 rounded-2xl bg-[#f9fafb] px-2.5 pb-3 sm:gap-4 sm:px-4 dark:bg-[#171717]"
        style={{ height: PANEL_HEIGHT }}
        role="toolbar"
        aria-label={label}
      >
        <DockContext.Provider value={context}>{children}</DockContext.Provider>
      </motion.div>
    </motion.div>
  );
}

interface ItemChildProps {
  width?: MotionValue<number>;
  isHovered?: MotionValue<number>;
}

function DockItem({
  children,
  onClick,
  href,
  external,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const { mouseX, baseSize, registerMeasure } = useDock();
  const isHovered = useMotionValue(0);
  const center = useRef<number | null>(null);

  // Measure once per hover (resting position, like the macOS dock) instead of on every mouse move:
  // reading layout while the icons are resizing forced a reflow per item per frame and made fast moves stutter.
  useEffect(
    () =>
      registerMeasure(() => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) center.current = rect.x + rect.width / 2;
      }),
    [registerMeasure],
  );

  const mouseDistance = useTransform(mouseX, (x) => (center.current === null ? Infinity : x - center.current));
  // Same curve as interpolating [-DISTANCE, 0, DISTANCE] → [base, MAGNIFICATION, base], with a responsive base.
  const widthRaw = useTransform([mouseDistance, baseSize], ([distance, base]: number[]) => {
    const closeness = Math.max(0, 1 - Math.abs(distance) / DISTANCE);
    return base + (MAGNIFICATION - base) * closeness;
  });
  const width = useSpring(widthRaw, SPRING);

  const content = Children.map(children, (child) =>
    isValidElement(child) ? cloneElement(child as ReactElement<ItemChildProps>, { width, isHovered }) : child,
  );

  const shared = {
    style: { width },
    onHoverStart: () => isHovered.set(1),
    onHoverEnd: () => isHovered.set(0),
    // Keyboard focus only: a tap focuses the button on Android, and the label would stay up.
    onFocus: (e: FocusEvent<HTMLElement>) => {
      if (e.currentTarget.matches(':focus-visible')) isHovered.set(1);
    },
    // Touch feedback in place of the magnification.
    whileTap: { scale: 0.88 },
    onBlur: () => isHovered.set(0),
    'aria-label': ariaLabel,
    className:
      'relative inline-flex aspect-square items-center justify-center rounded-full bg-[#e5e7eb] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] dark:bg-[#262626]',
  };

  // Buttons, not links, like the reference dock: sweeping the mouse over links makes the browser
  // show and hide its URL status bubble for every icon, which stutters in some browsers (Opera GX).
  function activate() {
    // After a tap, drop focus so nothing stays highlighted on touch screens.
    if (ref.current && !ref.current.matches(':focus-visible')) ref.current.blur();
    onClick?.();
    if (!href) return;
    if (external) window.open(href, '_blank', 'noopener,noreferrer');
    else if (href.startsWith('mailto:')) window.location.href = href;
    else router.push(href);
  }

  return (
    <motion.button ref={ref as Ref<HTMLButtonElement>} type="button" onClick={activate} {...shared}>
      {content}
    </motion.button>
  );
}

function DockDivider() {
  return <span aria-hidden="true" className="mb-1.5 h-7 w-px shrink-0 self-end bg-[#d4d4d4] sm:h-8 dark:bg-[#404040]" />;
}

function DockLabel({ children, isHovered }: { children: ReactNode } & ItemChildProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    return isHovered.on('change', (v) => setVisible(v === 1));
  }, [isHovered]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-[#e5e7eb] bg-[#f3f4f6] px-2 py-0.5 text-xs text-[#404040] dark:border-[#171717] dark:bg-[#262626] dark:text-white"
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, width }: { children: ReactNode } & ItemChildProps) {
  const fallback = useMotionValue(ICON_SIZE);
  const half = useTransform(width ?? fallback, (w) => w / 2);
  return (
    <motion.div style={{ width: half }} className="flex items-center justify-center text-[#525252] dark:text-[#d4d4d4]">
      {children}
    </motion.div>
  );
}

/* ───────────────────────── Icons ───────────────────────── */

const iconClass = 'h-full w-full';

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden="true">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function LanguagesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden="true">
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}


function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden="true">
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3"
      />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.15-1.35A9.9 9.9 0 1 0 12.04 2zm5.8 14.03c-.24.68-1.42 1.3-1.95 1.34-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.93-4.66-4.11-.13-.18-1.1-1.47-1.1-2.81 0-1.33.7-1.99.95-2.26.25-.27.54-.34.72-.34h.52c.17 0 .4-.06.62.47l.86 2.07c.07.14.12.3.02.48-.09.18-.14.3-.27.46l-.41.48c-.14.13-.28.28-.12.55.16.27.7 1.16 1.51 1.88 1.04.93 1.92 1.21 2.19 1.35.27.13.43.11.58-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.58.75 1.85.88.27.14.45.2.52.32.07.11.07.65-.17 1.33z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SunMoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden="true">
      <path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.9 4.9 1.4 1.4" />
      <path d="m17.7 17.7 1.4 1.4" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.3 17.7-1.4 1.4" />
      <path d="m19.1 4.9-1.4 1.4" />
    </svg>
  );
}

/* ───────────────────────── Site dock ───────────────────────── */

export interface DockLabels {
  toolbar: string;
  home: string;
  projects: string;
  contact: string;
  github: string;
  linkedin: string;
  whatsapp: string;
  email: string;
  language: string;
  theme: string;
}

interface SiteDockProps {
  locale: Locale;
  labels: DockLabels;
  github: string;
  linkedin: string;
  email: string;
  whatsappHref: string | null;
}

function toggleTheme() {
  const next = !document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', next);
  try {
    localStorage.setItem('theme', next ? 'dark' : 'light');
  } catch {
    // storage unavailable: the choice lasts for this page view only
  }
}

/** Same page in the other language: "/projetos/x" ↔ "/en/projetos/x". */
function alternatePath(pathname: string, locale: Locale) {
  if (locale === 'pt') return pathname === '/' ? '/en' : `/en${pathname}`;
  return pathname.replace(/^\/en(?=\/|$)/, '') || '/';
}

/**
 * Bottom navigation dock with magnifying icons; it is the site's only navigation bar.
 * Groups: navigate (home, projects, contact) · profiles · preferences (language, theme).
 * While the welcome screen is on top it stays hidden and rises into place once the screen leaves.
 */
export default function SiteDock({ locale, labels, github, linkedin, email, whatsappHref }: SiteDockProps) {
  // Portuguese pages are rendered internally under /pt but served at the root: normalize so the
  // server and the browser agree (a mismatch here re-renders the whole page and drops the theme class).
  const pathname = usePathname().replace(/^\/pt(?=\/|$)/, '') || '/';
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const home = localePath(locale);
  const onHome = pathname === home;

  useEffect(() => {
    if (!document.querySelector('.welcome-loader')) {
      const frame = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(frame);
    }
    const onDone = () => setReady(true);
    window.addEventListener('welcome:done', onDone, { once: true });
    // Safety net, matching the welcome screen failsafe.
    const timer = setTimeout(onDone, 8000);
    return () => {
      window.removeEventListener('welcome:done', onDone);
      clearTimeout(timer);
    };
  }, []);

  function switchLanguage() {
    skipNextWelcome();
    router.push(alternatePath(pathname, locale));
  }

  return (
    <motion.nav
      aria-label={labels.toolbar}
      initial={false}
      animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: ready ? 0.15 : 0 }}
      style={{ pointerEvents: ready ? 'auto' : 'none' }}
      className="fixed bottom-4 left-1/2 z-50 mb-4 -translate-x-1/2"
    >
      <DockPanel label={labels.toolbar}>
        {onHome ? (
          <DockItem ariaLabel={labels.home} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <DockLabel>{labels.home}</DockLabel>
            <DockIcon>
              <HomeIcon />
            </DockIcon>
          </DockItem>
        ) : (
          <DockItem ariaLabel={labels.home} href={home}>
            <DockLabel>{labels.home}</DockLabel>
            <DockIcon>
              <HomeIcon />
            </DockIcon>
          </DockItem>
        )}
        <DockItem ariaLabel={labels.projects} href={`${home}#projetos`}>
          <DockLabel>{labels.projects}</DockLabel>
          <DockIcon>
            <FolderIcon />
          </DockIcon>
        </DockItem>
        <DockItem ariaLabel={labels.contact} href={`${home}#contato`}>
          <DockLabel>{labels.contact}</DockLabel>
          <DockIcon>
            <ChatIcon />
          </DockIcon>
        </DockItem>

        <DockDivider />

        <DockItem ariaLabel={labels.github} href={github} external onClick={() => track('click', 'github')}>
          <DockLabel>{labels.github}</DockLabel>
          <DockIcon>
            <GithubIcon />
          </DockIcon>
        </DockItem>
        <DockItem ariaLabel={labels.linkedin} href={linkedin} external onClick={() => track('click', 'linkedin')}>
          <DockLabel>{labels.linkedin}</DockLabel>
          <DockIcon>
            <LinkedinIcon />
          </DockIcon>
        </DockItem>
        {whatsappHref ? (
          <DockItem ariaLabel={labels.whatsapp} href={whatsappHref} external onClick={() => track('click', 'whatsapp')}>
            <DockLabel>{labels.whatsapp}</DockLabel>
            <DockIcon>
              <WhatsappIcon />
            </DockIcon>
          </DockItem>
        ) : (
          <DockItem ariaLabel={labels.email} href={`mailto:${email}`} onClick={() => track('click', 'email')}>
            <DockLabel>{labels.email}</DockLabel>
            <DockIcon>
              <MailIcon />
            </DockIcon>
          </DockItem>
        )}

        <DockDivider />

        <DockItem ariaLabel={labels.language} onClick={switchLanguage}>
          <DockLabel>{labels.language}</DockLabel>
          <DockIcon>
            <LanguagesIcon />
          </DockIcon>
        </DockItem>
        <DockItem ariaLabel={labels.theme} onClick={toggleTheme}>
          <DockLabel>{labels.theme}</DockLabel>
          <DockIcon>
            <SunMoonIcon />
          </DockIcon>
        </DockItem>
      </DockPanel>
    </motion.nav>
  );
}
