export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

/** wa.me deep link with a prefilled message. */
export function whatsappLink(number: string, text: string) {
  return `https://wa.me/${onlyDigits(number)}?text=${encodeURIComponent(text)}`;
}

/** Formats a Brazilian WhatsApp number for display: +55 11 99999-9999 */
export function formatPhone(raw: string | null | undefined) {
  if (!raw) return '';
  const d = onlyDigits(raw);
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) {
    const ddd = d.slice(2, 4);
    const rest = d.slice(4);
    return `+55 ${ddd} ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
  }
  return `+${d}`;
}
