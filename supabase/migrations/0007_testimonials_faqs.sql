-- Testimonials (social proof) and FAQ, both managed in the panel. Each site section stays hidden
-- while it has nothing published.

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role_pt text,
  author_role_en text,
  quote_pt text not null,
  quote_en text,
  rating smallint check (rating between 1 and 5),
  project_slug text,
  source text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists testimonials_touch on public.testimonials;
create trigger testimonials_touch before update on public.testimonials
  for each row execute function public.touch_updated_at();
alter table public.testimonials enable row level security;
drop policy if exists "public reads published testimonials" on public.testimonials;
create policy "public reads published testimonials" on public.testimonials
  for select to anon, authenticated using (published or public.is_admin());
drop policy if exists "admin writes testimonials" on public.testimonials;
create policy "admin writes testimonials" on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question_pt text not null,
  question_en text,
  answer_pt text not null,
  answer_en text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists faqs_touch on public.faqs;
create trigger faqs_touch before update on public.faqs
  for each row execute function public.touch_updated_at();
alter table public.faqs enable row level security;
drop policy if exists "public reads published faqs" on public.faqs;
create policy "public reads published faqs" on public.faqs
  for select to anon, authenticated using (published or public.is_admin());
drop policy if exists "admin writes faqs" on public.faqs;
create policy "admin writes faqs" on public.faqs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Drafts (unpublished): commercial terms are confirmed in the panel before going live.
insert into public.faqs (sort_order, question_pt, answer_pt, question_en, answer_en)
select * from (values
  (10,
   'Quanto custa um sistema sob medida?',
   'Depende do tamanho do processo. Depois de uma conversa curta sobre a rotina, envio uma proposta com escopo, fases e valor fechado de cada fase, sem custo para orçar.',
   'How much does a custom system cost?',
   'It depends on the size of the process. After a short conversation about the routine, I send a proposal with scope, phases and a fixed price per phase, free of charge.'),
  (20,
   'Quanto tempo leva?',
   'A primeira fase usável costuma ficar pronta em poucas semanas. O prazo de cada fase vem escrito na proposta e você acompanha o sistema funcionando desde o início.',
   'How long does it take?',
   'The first usable phase is usually ready within a few weeks. Each phase has its deadline written in the proposal and you see the system working from the start.'),
  (30,
   'Como funciona o pagamento?',
   'Por fase entregue: você paga cada etapa conforme ela fica pronta e testada. Também atendo pelo 99Freelas, com o pagamento protegido pela plataforma.',
   'How does payment work?',
   'Per delivered phase: you pay for each stage as it is finished and tested. I also work through freelance platforms, with payment protected by the platform.'),
  (40,
   'O código e os dados ficam com quem?',
   'Com você. Ao final o código, o banco de dados e os acessos são transferidos para a sua conta, com documentação para outro desenvolvedor continuar se precisar.',
   'Who owns the code and the data?',
   'You do. At the end the code, the database and all access are transferred to your account, with documentation so another developer can continue if needed.'),
  (50,
   'E depois que o sistema entra no ar?',
   'Acompanho erros e uso em produção e corrijo o que aparecer no período combinado. Depois disso, ajustes e novas funções podem seguir num plano mensal ou por demanda.',
   'What happens after launch?',
   'I monitor errors and usage in production and fix whatever comes up during the agreed period. After that, changes and new features can continue monthly or on demand.'),
  (60,
   'Dá para integrar com o que eu já uso?',
   'Na maioria dos casos, sim: WhatsApp, planilhas, ERPs, portais fiscais, e-mail e APIs de terceiros. Se não houver API, avalio automação do próprio navegador.',
   'Can it integrate with the tools I already use?',
   'In most cases, yes: WhatsApp, spreadsheets, ERPs, tax portals, email and third-party APIs. When there is no API, I look at automating the browser itself.')
) as v(sort_order, question_pt, answer_pt, question_en, answer_en)
where not exists (select 1 from public.faqs);
