'use client';

import { useOptimistic, useTransition } from 'react';
import { setProjectFlag } from '@/actions/admin/projects';

interface ToggleProps {
  id: string;
  field: 'published' | 'featured';
  value: boolean;
  label: string;
}

export function FlagToggle({ id, field, value, label }: ToggleProps) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={label}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await setProjectFlag(id, field, !optimistic);
        })
      }
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        optimistic ? 'bg-success' : 'bg-surface-2 ring-1 ring-border'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${optimistic ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}
