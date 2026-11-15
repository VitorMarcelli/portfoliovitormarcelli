import { Bricolage_Grotesque, IBM_Plex_Sans } from 'next/font/google';

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

export const fontVariables = `${displayFont.variable} ${bodyFont.variable}`;
