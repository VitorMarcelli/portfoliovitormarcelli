-- Portfolio platform schema: projects, career timeline, analytics, leads, WhatsApp inbox, settings.
create extension if not exists pgcrypto;

-- ───────────────────────── admins ─────────────────────────
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create policy "admins read self" on public.admins
  for select to authenticated using (user_id = auth.uid());

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────── projects ─────────────────────────
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_pt text not null,
  title_en text,
  summary_pt text not null,
  summary_en text,
  body_pt text,
  body_en text,
  category_pt text,
  category_en text,
  technologies text[] not null default '{}',
  cover_url text,
  live_url text,
  repo_url text,
  year int,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();
alter table public.projects enable row level security;
create policy "public reads published projects" on public.projects
  for select to anon, authenticated using (published or public.is_admin());
create policy "admin writes projects" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── career timeline ─────────────────────────
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'work' check (kind in ('work', 'education')),
  title_pt text not null,
  title_en text,
  organization text not null,
  description_pt text,
  description_en text,
  start_date date not null,
  end_date date,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger experiences_touch before update on public.experiences
  for each row execute function public.touch_updated_at();
alter table public.experiences enable row level security;
create policy "public reads published experiences" on public.experiences
  for select to anon, authenticated using (published or public.is_admin());
create policy "admin writes experiences" on public.experiences
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── settings (single row) ─────────────────────────
create table public.settings (
  id int primary key default 1 check (id = 1),
  available boolean not null default true,
  whatsapp_number text,
  cv_url text,
  ai_enabled boolean not null default true,
  ai_instructions text,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1);
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();
alter table public.settings enable row level security;
create policy "admin manages settings" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── analytics ─────────────────────────
create table public.events (
  id bigint generated always as identity primary key,
  type text not null check (type in ('pageview', 'click')),
  path text not null,
  label text,
  referrer text,
  country text,
  device text,
  visitor_id text,
  created_at timestamptz not null default now()
);
create index events_created_at_idx on public.events (created_at desc);
create index events_type_created_idx on public.events (type, created_at desc);
alter table public.events enable row level security;
create policy "admin reads events" on public.events
  for select to authenticated using (public.is_admin());

-- ───────────────────────── leads ─────────────────────────
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  message text,
  source text not null default 'site' check (source in ('site', 'whatsapp')),
  status text not null default 'novo'
    check (status in ('novo', 'em_contato', 'proposta', 'fechado', 'perdido')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_created_at_idx on public.leads (created_at desc);
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();
alter table public.leads enable row level security;
create policy "admin manages leads" on public.leads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── WhatsApp inbox ─────────────────────────
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  wa_jid text not null unique,
  phone text,
  contact_name text,
  mode text not null default 'ai' check (mode in ('ai', 'human', 'closed')),
  needs_attention boolean not null default false,
  handoff_reason text,
  unread_count int not null default 0,
  last_message_at timestamptz not null default now(),
  last_message_preview text,
  lead_id uuid references public.leads (id) on delete set null,
  created_at timestamptz not null default now()
);
create index conversations_last_message_idx on public.conversations (last_message_at desc);
alter table public.conversations enable row level security;
create policy "admin manages conversations" on public.conversations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  direction text not null check (direction in ('in', 'out')),
  author text not null check (author in ('contact', 'ai', 'admin', 'system')),
  body text not null,
  wa_message_id text unique,
  status text not null default 'sent' check (status in ('received', 'sent', 'failed')),
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);
alter table public.messages enable row level security;
create policy "admin manages messages" on public.messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Realtime for the inbox
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;

-- ───────────────────────── dashboard summary ─────────────────────────
create or replace function public.analytics_summary(days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  since timestamptz := date_trunc('day', now()) - make_interval(days => days - 1);
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  with ev as (select * from public.events where created_at >= since),
  pv as (select * from ev where type = 'pageview')
  select jsonb_build_object(
    'pageviews', (select count(*) from pv),
    'visitors', (select count(distinct visitor_id) from pv),
    'whatsapp_clicks', (select count(*) from ev where type = 'click' and label = 'whatsapp'),
    'leads', (select count(*) from public.leads where created_at >= since),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'views', coalesce(c.views, 0), 'visitors', coalesce(c.visitors, 0)) order by d), '[]'::jsonb)
      from generate_series(since, date_trunc('day', now()), interval '1 day') d
      left join (
        select date_trunc('day', created_at) as day, count(*) as views, count(distinct visitor_id) as visitors
        from pv group by 1
      ) c on c.day = d
    ),
    'referrers', (
      select coalesce(jsonb_agg(r), '[]'::jsonb) from (
        select coalesce(nullif(referrer, ''), 'Direto') as name, count(*) as total
        from pv group by 1 order by 2 desc limit 8
      ) r
    ),
    'pages', (
      select coalesce(jsonb_agg(p), '[]'::jsonb) from (
        select path as name, count(*) as total from pv group by 1 order by 2 desc limit 8
      ) p
    ),
    'countries', (
      select coalesce(jsonb_agg(c), '[]'::jsonb) from (
        select coalesce(country, '??') as name, count(distinct visitor_id) as total
        from pv group by 1 order by 2 desc limit 8
      ) c
    ),
    'devices', (
      select coalesce(jsonb_agg(dv), '[]'::jsonb) from (
        select coalesce(device, 'desktop') as name, count(distinct visitor_id) as total
        from pv group by 1 order by 2 desc
      ) dv
    ),
    'clicks', (
      select coalesce(jsonb_agg(k), '[]'::jsonb) from (
        select label as name, count(*) as total
        from ev where type = 'click' group by 1 order by 2 desc limit 8
      ) k
    )
  ) into result;

  return result;
end;
$$;
revoke all on function public.analytics_summary(int) from public, anon;
grant execute on function public.analytics_summary(int) to authenticated;

-- ───────────────────────── storage ─────────────────────────
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

create policy "admin uploads assets" on storage.objects
  for insert to authenticated with check (bucket_id = 'public-assets' and public.is_admin());
create policy "admin updates assets" on storage.objects
  for update to authenticated using (bucket_id = 'public-assets' and public.is_admin());
create policy "admin deletes assets" on storage.objects
  for delete to authenticated using (bucket_id = 'public-assets' and public.is_admin());
