import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { fontVariables } from './fonts';
import ThemeScript from '@/components/ThemeScript';

export const metadata: Metadata = {
  title: 'Página não encontrada | Vitor Marcelli',
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="pt-BR" className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen items-center">
        <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <p className="font-display text-[clamp(5rem,20vw,12rem)] font-extrabold leading-none tracking-tighter text-accent-text">404</p>
          <h1 className="mt-4 font-display text-3xl font-bold">Página não encontrada</h1>
          <p className="mt-2 text-muted">Page not found.</p>
          <Link href="/" className="mt-8 inline-flex rounded-full bg-foreground px-6 py-3 font-medium text-background">
            Voltar ao início
          </Link>
        </main>
      </body>
    </html>
  );
}
