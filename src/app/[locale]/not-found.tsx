import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-4 pb-32 sm:px-6" data-scene-x="0.7" data-scene-y="0.45" data-scene-scale="0.8">
      <p className="night-gradient font-display text-[clamp(6rem,20vw,12rem)] font-extrabold leading-none tracking-tighter">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-lg text-muted">O endereço pode ter mudado ou o projeto saiu do ar. Page not found.</p>
      <Link
        href="/"
        className="mt-8 inline-flex w-max rounded-full bg-accent px-6 py-3 font-medium text-accent-fg shadow-[0_10px_30px_-12px_var(--glow)] transition-opacity hover:opacity-90"
      >
        Voltar ao início
      </Link>
    </section>
  );
}
