-- Client links: /projetos/<slug>?c=<client> tags every event of that visit, so the panel can show
-- whether the person the link was sent to opened it.
alter table public.events add column if not exists campaign text;
create index if not exists events_campaign_idx on public.events (campaign, created_at desc) where campaign is not null;
create index if not exists events_path_idx on public.events (path, created_at desc);
