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
      <body className="night flex min-h-screen items-center overflow-hidden bg-background text-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed right-[-10vmin] top-1/2 h-[70vmin] w-[70vmin] -translate-y-1/2 rounded-full opacity-80 blur-[2px]"
          style={{
            background: 'radial-gradient(circle at 34% 30%, #cfe4ff 0%, #96c8ff 18%, #3b82f6 52%, #1e3a8a 100%)',
            boxShadow: '0 0 160px 40px rgba(59,130,246,0.35)',
          }}
        />
        <main className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
          <p className="night-gradient font-display text-[clamp(6rem,20vw,12rem)] font-extrabold leading-none tracking-tighter">404</p>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Página não encontrada</h1>
          <p className="mt-3 text-lg text-muted">Page not found.</p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 font-medium text-accent-fg shadow-[0_10px_30px_-12px_var(--glow)] transition-opacity hover:opacity-90"
          >
            Voltar ao início
          </Link>
        </main>
      </body>
    </html>
  );
}
