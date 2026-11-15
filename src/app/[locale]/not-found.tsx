import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-4 sm:px-6">
      <p className="font-display text-[clamp(5rem,18vw,10rem)] font-extrabold leading-none tracking-tighter text-accent-text">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">Página não encontrada</h1>
      <Link href="/" className="mt-8 inline-flex w-max rounded-full bg-foreground px-6 py-3 font-medium text-background">
        Voltar ao início
      </Link>
    </section>
  );
}
