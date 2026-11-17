'use client';

import { useFormStatus } from 'react-dom';
import { buttonSecondary } from './ui';

/** Locks after the first click: importing takes a couple of seconds and repeated clicks used to create duplicates. */
export default function ImportButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${buttonSecondary} disabled:cursor-wait disabled:opacity-60`}>
      {pending ? 'Importando…' : 'Importar como rascunho'}
    </button>
  );
}
