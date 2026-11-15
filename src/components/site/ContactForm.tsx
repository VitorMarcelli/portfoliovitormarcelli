'use client';

import { useActionState, useState } from 'react';
import { submitContact, type ContactState } from '@/actions/contact';
import type { Dictionary } from '@/i18n/dictionaries';
import { track } from './Tracker';

const fieldClass =
  'mt-2 block w-full rounded-md border border-border bg-surface px-3.5 py-3 text-base text-foreground placeholder:text-muted/70 focus:border-foreground focus:outline-none';

export default function ContactForm({ t }: { t: Dictionary['contact']['form'] }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { status: 'idle' });
  const [startedAt] = useState(() => Date.now());

  if (state.status === 'success') {
    return (
      <p role="status" className="rounded-lg border border-success/40 bg-success/10 p-6 text-lg text-foreground">
        {t.success}
      </p>
    );
  }

  return (
    <form action={action} onSubmit={() => track('click', 'contact_form')} className="grid gap-5 sm:grid-cols-2" noValidate={false}>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="block text-sm font-medium">
        {t.name}
        <input name="name" required minLength={2} maxLength={120} autoComplete="name" className={fieldClass} />
      </label>
      <label className="block text-sm font-medium">
        {t.email}
        <input name="email" type="email" required maxLength={200} autoComplete="email" className={fieldClass} />
      </label>
      <label className="block text-sm font-medium">
        {t.phone} <span className="font-normal text-muted">({t.phoneHint})</span>
        <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={fieldClass} />
      </label>
      <label className="block text-sm font-medium">
        {t.company} <span className="font-normal text-muted">({t.companyHint})</span>
        <input name="company" maxLength={120} autoComplete="organization" className={fieldClass} />
      </label>
      <label className="block text-sm font-medium sm:col-span-2">
        {t.message}
        <textarea name="message" required minLength={10} maxLength={4000} rows={5} className={`${fieldClass} resize-y`} />
      </label>

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3.5 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? t.sending : t.submit}
        </button>
        {state.status === 'error' && (
          <p role="alert" className="text-sm text-danger">
            {t.error}
          </p>
        )}
        {state.status === 'invalid' && (
          <p role="alert" className="text-sm text-danger">
            {t.invalid}
          </p>
        )}
      </div>
    </form>
  );
}
