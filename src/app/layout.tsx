import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vitor Marcelli — Desenvolvedor Fullstack & Construtor de Soluções',
  description:
    'Portfólio profissional de Vitor Marcelli. Desenvolvimento web, sistemas sob medida, automações, APIs e soluções digitais com execução técnica e visão de produto.',
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
    title: 'Vitor Marcelli — Desenvolvedor Fullstack',
    description:
      'Portfólio profissional. Sistemas, automações, APIs e soluções digitais completas.',
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
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <Navbar />
        <main className="flex flex-col">{children}</main>
      </body>
    </html>
  );
}
