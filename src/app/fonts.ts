import localFont from 'next/font/local';

/*
 * Fonts are self-hosted from Fontsource packages (variable files, Latin subset: covers PT, ES and EN),
 * so the build never downloads from Google Fonts. A failed download there broke a Vercel deploy.
 */

export const displayFont = localFont({
  src: '../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
  weight: '200 800',
  variable: '--font-display',
  display: 'swap',
});

export const bodyFont = localFont({
  src: '../../node_modules/@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2',
  weight: '100 700',
  variable: '--font-body',
  display: 'swap',
});

/** Hero fonts, same as the reference design (Outfit for headings, Inter for text). */
export const heroDisplayFont = localFont({
  src: '../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2',
  weight: '100 900',
  variable: '--font-hero-display',
  display: 'swap',
});

export const heroBodyFont = localFont({
  src: '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  weight: '100 900',
  variable: '--font-hero-body',
  display: 'swap',
});

export const fontVariables = `${displayFont.variable} ${bodyFont.variable} ${heroDisplayFont.variable} ${heroBodyFont.variable}`;
