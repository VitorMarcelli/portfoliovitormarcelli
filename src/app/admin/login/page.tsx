import type { Metadata } from 'next';
import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/env';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Entrar' };

export default async function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  const params = await searchParams;
  const next = typeof params.next === 'string' ? params.next : '/admin';
  const error = params.erro === 'acesso' ? 'Esta conta não tem acesso ao painel.' : undefined;

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-ink p-12 text-ink-fg lg:flex">
        <Link href="/" className="font-display text-lg font-bold">
          Vitor Marcelli
        </Link>
        <div>
          <p className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight">
            Visitas, projetos e conversas com clientes em um só lugar.
          </p>
        </div>
        <p className="text-sm text-ink-muted">Acesso restrito.</p>
      </section>
      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold">Entrar no painel</h1>
          <p className="mt-2 text-muted">Use a conta de administrador criada no Supabase.</p>
          <div className="mt-8">
            {isSupabaseConfigured ? (
              <LoginForm next={next} initialError={error} />
            ) : (
              <p className="rounded-md border border-danger/40 bg-danger/10 p-4 text-sm">
                O Supabase ainda não foi configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY nas
                variáveis de ambiente.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
