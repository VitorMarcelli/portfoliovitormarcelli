-- Projects v2: private repositories, sale offers, structured case studies, gallery; leads tied to projects.

-- ───────────────────────── projects: public presentation fields ─────────────────────────
alter table public.projects
  add column status text not null default 'completed'
    check (status in ('live', 'mvp', 'in_progress', 'completed')),
  add column repo_private boolean not null default false,
  add column for_sale boolean not null default false,
  add column price_label text,
  add column sale_note_pt text,
  add column sale_note_en text,
  add column challenge_pt text,
  add column challenge_en text,
  add column solution_pt text,
  add column solution_en text,
  add column results_pt text,
  add column results_en text,
  add column highlights_pt text[] not null default '{}',
  add column highlights_en text[] not null default '{}',
  -- [{ "url": "...", "caption_pt": "...", "caption_en": "..." }]
  add column gallery jsonb not null default '[]'::jsonb;

-- A private repository must never expose its address through the public table.
alter table public.projects
  add constraint projects_private_repo_hidden check (not repo_private or repo_url is null);

-- ───────────────────────── project_private: admin-only data ─────────────────────────
create table public.project_private (
  project_id uuid primary key references public.projects (id) on delete cascade,
  repo_url text,
  github_full_name text,
  internal_price text,
  notes text,
  updated_at timestamptz not null default now()
);
create trigger project_private_touch before update on public.project_private
  for each row execute function public.touch_updated_at();
alter table public.project_private enable row level security;
create policy "admin manages project private data" on public.project_private
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── leads: which project, and what they want ─────────────────────────
alter table public.leads
  add column project_slug text,
  add column intent text not null default 'contato'
    check (intent in ('contato', 'compra', 'demonstracao'));

-- The live demo is already known for one seeded project.
update public.projects set status = 'live' where live_url is not null;
