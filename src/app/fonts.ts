import { Bricolage_Grotesque, IBM_Plex_Sans, Inter, Outfit } from 'next/font/google';

export const displayFont = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const bodyFont = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

/** Hero fonts, same as the reference design (Outfit for headings, Inter for text). */
export const heroDisplayFont = Outfit({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-hero-display',
  display: 'swap',
});

export const heroBodyFont = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-hero-body',
  display: 'swap',
});

export const fontVariables = `${displayFont.variable} ${bodyFont.variable} ${heroDisplayFont.variable} ${heroBodyFont.variable}`;
