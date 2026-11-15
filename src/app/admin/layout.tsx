import type { Metadata } from 'next';
import '../globals.css';
import { fontVariables } from '../fonts';
import ThemeScript from '@/components/ThemeScript';

export const metadata: Metadata = {
  title: { default: 'Painel', template: '%s | Painel Vitor Marcelli' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
