const KEY = 'vm_skip_welcome';
/** The flag only applies to the navigation that set it. */
const VALID_FOR_MS = 5000;

/** Called right before an in-site language switch, so the welcome screen does not play again. */
export function skipNextWelcome() {
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // storage unavailable: the welcome screen simply plays
  }
}

/**
 * True if a language switch just happened. Read-only on purpose: React may render a component
 * and discard that render during navigation, so clearing happens after commit (clearSkipWelcome).
 */
export function shouldSkipWelcome(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const at = Number(sessionStorage.getItem(KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at < VALID_FOR_MS;
  } catch {
    return false;
  }
}

export function clearSkipWelcome() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
