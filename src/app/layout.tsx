import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import ThemeProvider from '@/components/ThemeProvider';
import LanguageProvider from '@/components/LanguageProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vitor Marcelli | Desenvolvedor Full Stack',
  description:
    'Portfólio profissional de Vitor Marcelli, Desenvolvedor Full Stack especializado em sistemas web, automações, integrações, IA, APIs, WordPress, React, Next.js, Python e soluções digitais para empresas.',
  keywords: [
    'desenvolvedor fullstack',
    'portfólio',
    'Vitor Marcelli',
    'Next.js',
    'TypeScript',
    'automações',
    'sistemas',
  ],
  authors: [{ name: 'Vitor Marcelli' }],
  openGraph: {
    title: 'Vitor Marcelli | Desenvolvedor Full Stack',
    description:
      'Portfólio profissional de Vitor Marcelli, Desenvolvedor Full Stack especializado em sistemas web, automações, integrações, IA, APIs, WordPress, React, Next.js, Python e soluções digitais para empresas.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex flex-col">{children}</main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

