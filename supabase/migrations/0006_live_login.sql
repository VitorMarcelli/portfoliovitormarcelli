-- Systems whose live address opens on a login screen: the page offers demo access on request
-- instead of promising an open system.
alter table public.projects add column if not exists live_login boolean not null default false;

update public.projects set live_url = 'https://systemagent-tau.vercel.app', live_login = true where slug = 'systemagent';
update public.projects set live_url = 'https://giro-wine.vercel.app', live_login = true where slug = 'giro-pdv-adegas';
update public.projects set live_url = 'https://plataformprepos.vercel.app', live_login = true where slug = 'acompanhamento-pre-pos-operatorio';
update public.projects set live_url = 'https://vetin-app.vercel.app', live_login = false where slug = 'vetinapp';
