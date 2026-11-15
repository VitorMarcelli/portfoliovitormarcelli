-- Initial projects (all editable later in /admin/projetos)
insert into public.projects
  (slug, title_pt, title_en, summary_pt, summary_en, body_pt, body_en, category_pt, category_en, technologies, live_url, repo_url, year, featured, published, sort_order)
values
(
  'emissao-guias-icms',
  'Emissão de guias de ICMS por UF', 'State ICMS tax slip issuing engine',
  'Motor que emite guias de ICMS (DARE, DAE, GR-PR, DAR-1) direto nos portais de SP, MT, MG, PR e GO e devolve o PDF pronto para pagamento.',
  'Engine that issues ICMS tax slips (DARE, DAE, GR-PR, DAR-1) on the SP, MT, MG, PR and GO state portals and returns a payment-ready PDF.',
  $$Escritórios contábeis emitem centenas de guias de ICMS por mês, cada estado com um portal, um formulário e um código de receita diferente.

O motor recebe UF, receita, CNPJ ou IE, valor e competência, preenche o portal estadual com Playwright e salva o PDF da guia. As receitas de cada estado ficam mapeadas em cache local, e o código é validado antes de abrir o portal, o que evita emissões erradas.

A instalação no Windows é feita por um único script, pensado para quem não é da área técnica.$$,
  $$Accounting firms issue hundreds of ICMS slips a month, and every state has its own portal, form and revenue codes.

The engine takes the state, revenue code, CNPJ or state registration, amount and period, fills the state portal with Playwright and saves the slip PDF. Each state's revenue codes are cached locally and validated before the portal is opened, which prevents wrong slips.

Windows setup is a single script, built for non-technical operators.$$,
  'Automação fiscal', 'Tax automation',
  array['Python', 'Playwright', 'Automação web', 'PDF'],
  null, 'https://github.com/VitorMarcelli/emiss-oNF_autom-tica', 2026, true, true, 10
),
(
  'crm-condominios',
  'CRM para condomínios', 'Condominium CRM',
  'Central que substitui o atendimento informal por WhatsApp: ocorrências com prioridade, triagem por IA, regras de escalonamento, alertas e auditoria por condomínio.',
  'A hub that replaces informal WhatsApp support: prioritized incidents, AI triage, escalation rules, alerts and per-condominium audit logs.',
  $$Síndicos e administradoras recebem tudo pelo WhatsApp, sem histórico nem responsável definido.

O sistema é multi-tenant por condomínio e cobre blocos, unidades, moradores, ocorrências com status e prioridade, horário comercial e escalonamento automático. O WhatsApp entra pela Evolution API e um agente de IA faz a triagem 24 horas. Os papéis (síndico, atendente, morador) têm permissões configuráveis.

Backend em NestJS com Prisma e PostgreSQL, frontend em Next.js, tudo orquestrado com Docker Compose.$$,
  $$Building managers get everything through WhatsApp, with no history and no clear owner.

The system is multi-tenant per condominium and covers buildings, units, residents, incidents with status and priority, business hours and automatic escalation. WhatsApp comes in through Evolution API and an AI agent triages around the clock. Roles (manager, agent, resident) have configurable permissions.

NestJS backend with Prisma and PostgreSQL, Next.js frontend, orchestrated with Docker Compose.$$,
  'Sistema web', 'Web system',
  array['Next.js', 'NestJS', 'PostgreSQL', 'Prisma', 'Evolution API', 'Docker'],
  null, 'https://github.com/VitorMarcelli/CRM_Condominios', 2026, true, true, 20
),
(
  'frota-saas',
  'Gestão de frotas SaaS', 'Fleet management SaaS',
  'Plataforma multi-tenant para locadoras e gestoras de frotas, com painel por perfil de acesso e isolamento de dados por cliente via Row Level Security.',
  'Multi-tenant platform for rental and fleet management companies, with role-based dashboards and per-customer data isolation through Row Level Security.',
  $$Gestoras de frota precisam de uma visão geral de todos os veículos, enquanto cada cliente deve ver só a própria frota.

O sistema direciona cada usuário para o painel do seu perfil (administrador global, administrador do cliente ou usuário) e protege os dados no próprio banco com políticas RLS do PostgreSQL. Autenticação e banco rodam no Supabase.$$,
  $$Fleet managers need an overview of every vehicle, while each customer must only see its own fleet.

Each user lands on the dashboard for their role (global admin, customer admin or user), and data is protected inside the database with PostgreSQL RLS policies. Auth and database run on Supabase.$$,
  'SaaS', 'SaaS',
  array['React', 'TypeScript', 'Vite', 'Supabase'],
  'https://frota-saa-s.vercel.app', 'https://github.com/VitorMarcelli/FrotaSaaS', 2026, true, true, 30
),
(
  'classificador-emails',
  'Classificador de e-mails com IA', 'AI email classifier',
  'Serviço que lê caixas de e-mail via IMAP, classifica cada mensagem com IA e abre a tarefa certa no Bitrix24, sem processar o mesmo e-mail duas vezes.',
  'Service that reads mailboxes over IMAP, classifies each message with AI and opens the right task in Bitrix24, never processing the same email twice.',
  $$Caixas de suporte misturam pedidos de clientes, cobranças e newsletters.

O serviço varre a caixa de entrada, envia o conteúdo para um modelo de linguagem com resposta em JSON Schema e roteia: suporte vira tarefa no Bitrix24, spam é arquivado e casos incertos ficam para revisão humana. Um controle de idempotência em banco garante que cada mensagem seja processada uma única vez.$$,
  $$Support inboxes mix customer requests, invoices and newsletters.

The service scans the inbox, sends the content to a language model with JSON Schema output and routes it: support becomes a Bitrix24 task, spam is archived and uncertain cases stay for human review. A database idempotency lock makes sure each message is processed exactly once.$$,
  'Automação com IA', 'AI automation',
  array['Python', 'Pydantic', 'SQLAlchemy', 'LLM', 'Bitrix24'],
  null, 'https://github.com/VitorMarcelli/classificacao_inteligente_emails', 2026, false, true, 40
),
(
  'agente-notas-fiscais',
  'Agente de notas fiscais', 'Invoice processing agent',
  'MVP que recebe faturas por e-mail, extrai os dados com IA multimodal, abre um portal de conferência por link seguro quando há divergência e organiza tudo em Drive e Sheets.',
  'MVP that ingests invoices by email, extracts data with multimodal AI, opens a secure-link review portal when something does not match and files everything in Drive and Sheets.',
  $$Demonstração de ponta a ponta para o financeiro: ingestão contínua de e-mails, download do PDF, extração por IA, conferência humana via magic link, arquivamento no Google Drive e espelho no Google Sheets.

As integrações bancárias e de ERP são simuladas, para que o fluxo completo possa ser apresentado sem credenciais de produção. Filas em BullMQ e Redis, banco com Prisma.$$,
  $$End-to-end demo for finance teams: continuous email ingestion, PDF download, AI extraction, human review through a magic link, filing in Google Drive and a Google Sheets mirror.

Bank and ERP integrations are simulated so the whole flow can be demoed without production credentials. BullMQ and Redis queues, Prisma for the database.$$,
  'Automação com IA', 'AI automation',
  array['Next.js', 'TypeScript', 'Prisma', 'BullMQ', 'Gemini'],
  null, 'https://github.com/VitorMarcelli/notasfiscais_api', 2026, false, true, 50
),
(
  'emprestimo-consignado',
  'Originação de empréstimo consignado', 'Payroll loan origination',
  'Fluxo digital de crédito consignado: simulação com Tabela Price, CET e IOF, aceite LGPD, captura de documento e selfie, e painel para aprovar ou recusar propostas.',
  'Digital payroll-loan flow: Price-table simulation with total cost and IOF, LGPD consent, document and selfie capture, and a dashboard to approve or reject proposals.',
  $$O cliente simula, escolhe a condição de pagamento, aceita os termos LGPD, informa os dados bancários e envia documento e selfie. A proposta cai em um painel onde o analista compara as imagens e decide.

Construído com Next.js, Server Actions e Prisma.$$,
  $$The customer simulates, picks a payment plan, accepts the LGPD terms, enters bank details and sends an ID and a selfie. The proposal lands on a dashboard where an analyst compares the images and decides.

Built with Next.js, Server Actions and Prisma.$$,
  'Sistema web', 'Web system',
  array['Next.js', 'React', 'Prisma', 'Tailwind CSS'],
  null, 'https://github.com/VitorMarcelli/emprestimos_consignados_webapp', 2026, false, true, 60
),
(
  'dentro-app',
  'Dentro.app, scanner nutricional', 'Dentro.app nutrition scanner',
  'App mobile que escaneia código de barras, embalagem ou prato e alerta na hora sobre ingredientes que conflitam com as restrições de saúde do usuário.',
  'Mobile app that scans a barcode, a package or a plate and instantly flags ingredients that conflict with the user''s health restrictions.',
  $$A câmera abre direto no scanner: código de barras, OCR de embalagem ou visão computacional para pratos. O app cruza os ingredientes com as restrições do usuário, calcula um score nutricional e sugere alternativas reais quando há alerta.

Mobile em React Native com Expo, backend em FastAPI com PostgreSQL e Redis, login social e cache em camadas.$$,
  $$The camera opens straight into the scanner: barcode, package OCR or computer vision for plates. The app matches ingredients against the user's restrictions, computes a nutrition score and suggests real alternatives when something is flagged.

React Native with Expo on mobile, FastAPI with PostgreSQL and Redis on the backend, social login and layered caching.$$,
  'App mobile', 'Mobile app',
  array['React Native', 'Expo', 'FastAPI', 'PostgreSQL', 'Redis'],
  null, 'https://github.com/VitorMarcelli/projeto_camera_firstv2', 2026, false, true, 70
);
