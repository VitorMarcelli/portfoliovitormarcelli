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
import MobileNav from './MobileNav';
import { ChatIcon, FolderIcon, GithubIcon, HomeIcon, LanguagesIcon, LinkedinIcon, MailIcon, SunMoonIcon, WhatsappIcon } from './navIcons';
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
  more: string;
  moreTitle: string;
  close: string;
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
    <>
    <MobileNav
      ready={ready}
      labels={labels}
      home={home}
      onHome={onHome}
      github={github}
      linkedin={linkedin}
      email={email}
      whatsappHref={whatsappHref}
      onSwitchLanguage={switchLanguage}
      onToggleTheme={toggleTheme}
    />
    <motion.nav
      aria-label={labels.toolbar}
      initial={false}
      animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: ready ? 0.15 : 0 }}
      style={{ pointerEvents: ready ? 'auto' : 'none' }}
      // Desktop and tablets only: phones get the glass pill (MobileNav).
      className="fixed bottom-4 left-1/2 z-50 mb-4 hidden -translate-x-1/2 md:block"
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
    </>
  );
}
