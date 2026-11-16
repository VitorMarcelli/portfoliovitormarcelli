'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from '@/actions/admin/auth';
import ThemeToggle from '@/components/ThemeToggle';

interface AdminNavProps {
  email: string;
  attention: number;
  newLeads: number;
}

const ITEMS = [
  { href: '/admin', label: 'Visão geral', exact: true },
  { href: '/admin/conversas', label: 'Conversas', badge: 'attention' as const },
  { href: '/admin/leads', label: 'Leads', badge: 'leads' as const },
  { href: '/admin/projetos', label: 'Projetos' },
  { href: '/admin/depoimentos', label: 'Depoimentos' },
  { href: '/admin/perguntas', label: 'Perguntas' },
  { href: '/admin/trajetoria', label: 'Trajetória' },
  { href: '/admin/configuracoes', label: 'Configurações' },
];

export default function AdminNav({ email, attention, newLeads }: AdminNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const counts = { attention, leads: newLeads };

  const links = (
    <ul className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const count = item.badge ? counts[item.badge] : 0;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-[15px] transition-colors ${
                active ? 'bg-foreground text-background' : 'text-muted hover:bg-surface-2 hover:text-foreground'
              }`}
            >
              {item.label}
              {count > 0 && (
                <span className="min-w-6 rounded-full bg-accent px-1.5 text-center text-xs font-semibold leading-5 text-accent-fg">
                  {count}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const footer = (
    <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm">
      <p className="truncate text-muted" title={email}>
        {email}
      </p>
      <div className="flex items-center justify-between">
        <Link href="/" target="_blank" className="text-muted hover:text-foreground">
          Ver site
        </Link>
        <ThemeToggle toLightLabel="Usar tema claro" toDarkLabel="Usar tema escuro" />
      </div>
      <form action={signOut}>
        <button type="submit" className="text-muted hover:text-foreground">
          Sair
        </button>
      </form>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <Link href="/admin" className="font-display font-bold">
          Painel
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-menu"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
          {attention > 0 && !open && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />}
        </button>
      </div>
      {open && (
        <div id="admin-menu" className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col justify-between bg-background p-4 lg:hidden">
          {links}
          {footer}
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-border bg-surface p-4 lg:flex">
        <div>
          <Link href="/admin" className="mb-6 block px-3 font-display text-lg font-bold">
            Vitor Marcelli
          </Link>
          {links}
        </div>
        {footer}
      </aside>
    </>
  );
}
