'use client';

import { useActionState } from 'react';
import { signIn, type LoginState } from '@/actions/admin/auth';

const field =
  'mt-2 block w-full rounded-md border border-border bg-surface px-3.5 py-3 text-base focus:border-foreground focus:outline-none';

export default function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, { error: initialError });

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <label className="text-sm font-medium">
        E-mail
        <input name="email" type="email" required autoComplete="username" className={field} />
      </label>
      <label className="text-sm font-medium">
        Senha
        <input name="password" type="password" required autoComplete="current-password" className={field} />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-foreground px-6 py-3 font-medium text-background disabled:opacity-60"
      >
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
