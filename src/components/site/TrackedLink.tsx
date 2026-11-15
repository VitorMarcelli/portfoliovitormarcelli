'use client';

import type { AnchorHTMLAttributes } from 'react';
import { track } from './Tracker';

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  event: string;
}

/** External link that records a click event for the admin dashboard. */
export default function TrackedLink({ event, onClick, ...props }: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track('click', event);
        onClick?.(e);
      }}
    />
  );
}
