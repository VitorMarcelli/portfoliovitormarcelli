-- Portfolio content: six categories (the constellations), full cases for the existing projects
-- and eleven new projects. Client projects are described by segment, never by name.

-- ───────────── Categories and order of the existing projects ─────────────
update public.projects set category_pt = 'Automação e IA', category_en = 'Automation and AI', sort_order = 30, featured = true
  where slug = 'emissao-guias-icms';
update public.projects set category_pt = 'Atendimento e WhatsApp', category_en = 'Customer service and WhatsApp', sort_order = 70, featured = false
  where slug = 'crm-condominios';
update public.projects set category_pt = 'Gestão sob medida', category_en = 'Custom management systems', sort_order = 60, featured = true
  where slug = 'frota-saas';
update public.projects set category_pt = 'Automação e IA', category_en = 'Automation and AI', sort_order = 100
  where slug = 'classificador-emails';
update public.projects set category_pt = 'Automação e IA', category_en = 'Automation and AI', sort_order = 110
  where slug = 'agente-notas-fiscais';
update public.projects set category_pt = 'Finanças', category_en = 'Finance', sort_order = 160
  where slug = 'emprestimo-consignado';
update public.projects set category_pt = 'Saúde', category_en = 'Healthcare', sort_order = 140
  where slug = 'dentro-app';

-- ───────────── Full cases of the existing projects ─────────────
update public.projects set
  challenge_pt = $$Escritórios contábeis emitem centenas de guias de ICMS por mês. Cada estado tem um portal, um formulário e códigos de receita próprios, e um código errado gera uma guia que não pode ser paga.$$,
  challenge_en = $$Accounting firms issue hundreds of ICMS tax slips every month. Each state has its own portal, form and revenue codes, and a wrong code produces a slip that cannot be paid.$$,
  solution_pt = $$Um motor em Python com Playwright recebe UF, receita, CNPJ ou inscrição estadual, valor e competência, preenche o portal do estado e salva o PDF da guia. As receitas de cada estado ficam mapeadas e são validadas antes de o portal ser aberto. A instalação no Windows é feita por um único script.$$,
  solution_en = $$A Python engine with Playwright takes the state, revenue code, tax ID, amount and period, fills in the state portal and saves the slip as a PDF. Each state's revenue codes are mapped and checked before the portal is even opened. Installing it on Windows takes a single script.$$,
  results_pt = $$A emissão deixa de ser feita guia por guia em cada portal. O motor cobre DARE (SP), DAE (MT e MG), GR-PR e DAR-1 (GO), e uma guia com código inválido é barrada antes de chegar ao estado.$$,
  results_en = $$Slips are no longer issued one by one on each portal. The engine covers DARE (SP), DAE (MT and MG), GR-PR and DAR-1 (GO), and a slip with an invalid code is stopped before it reaches the state.$$,
  highlights_pt = array[$$Cinco portais estaduais em um só motor$$, $$Código de receita validado antes da emissão$$, $$PDF pronto para pagamento$$, $$Instalação automatizada no Windows$$],
  highlights_en = array[$$Five state portals in one engine$$, $$Revenue code checked before issuing$$, $$Payment-ready PDF$$, $$Automated Windows setup$$]
where slug = 'emissao-guias-icms';

update public.projects set
  challenge_pt = $$Administradoras e síndicos atendem moradores pelo WhatsApp pessoal. Pedidos se perdem, ninguém sabe o que está pendente e não existe histórico por condomínio.$$,
  challenge_en = $$Property managers answer residents from their personal WhatsApp. Requests get lost, nobody knows what is pending and there is no history per building.$$,
  solution_pt = $$Uma central web com ocorrências priorizadas, triagem por IA das mensagens que chegam pelo WhatsApp (Evolution API), regras de escalonamento, alertas e auditoria por condomínio. Backend em NestJS com PostgreSQL e Prisma, frontend em Next.js, tudo em Docker.$$,
  solution_en = $$A web hub with prioritized tickets, AI triage of the messages arriving on WhatsApp (Evolution API), escalation rules, alerts and an audit trail per building. NestJS backend with PostgreSQL and Prisma, Next.js frontend, all running on Docker.$$,
  results_pt = $$MVP funcional com autenticação, cadastros, ocorrências, alertas, escalonamento e painel operacional.$$,
  results_en = $$Working MVP with authentication, records, tickets, alerts, escalation and an operations dashboard.$$,
  highlights_pt = array[$$Triagem automática por IA$$, $$Escalonamento por regra e prazo$$, $$Auditoria por condomínio$$, $$Sobe inteiro com Docker Compose$$],
  highlights_en = array[$$Automatic AI triage$$, $$Escalation by rule and deadline$$, $$Audit trail per building$$, $$Runs entirely on Docker Compose$$]
where slug = 'crm-condominios';

update public.projects set
  challenge_pt = $$Locadoras e gestoras de frota controlam veículos, contratos e manutenção em planilhas, e cada cliente da plataforma precisa enxergar apenas os próprios dados.$$,
  challenge_en = $$Rental companies and fleet managers track vehicles, contracts and maintenance in spreadsheets, and each customer of the platform must see only its own data.$$,
  solution_pt = $$SaaS multiempresa em React, TypeScript e Supabase, com painel por perfil de acesso e isolamento de dados por cliente garantido pelo próprio banco, com Row Level Security no PostgreSQL.$$,
  solution_en = $$Multi-tenant SaaS in React, TypeScript and Supabase, with dashboards per access profile and data isolation per customer enforced by the database itself through PostgreSQL Row Level Security.$$,
  results_pt = $$Sistema no ar, com demonstração aberta.$$,
  results_en = $$Live system with an open demo.$$,
  highlights_pt = array[$$Multiempresa com Row Level Security$$, $$Perfis de acesso$$, $$Publicado na Vercel$$],
  highlights_en = array[$$Multi-tenant with Row Level Security$$, $$Access profiles$$, $$Deployed on Vercel$$]
where slug = 'frota-saas';

update public.projects set
  challenge_pt = $$Caixas de e-mail compartilhadas recebem pedidos de todo tipo, e alguém precisa ler cada mensagem para abrir a tarefa certa no CRM.$$,
  challenge_en = $$Shared mailboxes receive all kinds of requests, and someone has to read every message to open the right task in the CRM.$$,
  solution_pt = $$Um serviço em Python lê as caixas via IMAP, classifica cada mensagem com um modelo de linguagem e cria a tarefa no Bitrix24 com o responsável certo. Cada e-mail fica registrado no banco para nunca ser processado duas vezes.$$,
  solution_en = $$A Python service reads the mailboxes over IMAP, classifies each message with a language model and creates the task in Bitrix24 for the right person. Every e-mail is recorded in the database so it is never processed twice.$$,
  results_pt = $$A triagem manual da caixa deixa de existir, e mensagens repetidas ou reenviadas não geram tarefas duplicadas.$$,
  results_en = $$Manual mailbox triage disappears, and repeated or forwarded messages never create duplicate tasks.$$,
  highlights_pt = array[$$Classificação por IA com saída validada$$, $$Integração com o Bitrix24$$, $$Processamento sem duplicidade$$],
  highlights_en = array[$$AI classification with validated output$$, $$Bitrix24 integration$$, $$Duplicate-free processing$$]
where slug = 'classificador-emails';

update public.projects set
  challenge_pt = $$Faturas chegam por e-mail em formatos diferentes, e alguém digita os dados à mão e confere valores e fornecedores um por um.$$,
  challenge_en = $$Invoices arrive by e-mail in different formats, and someone types the data by hand and checks amounts and suppliers one by one.$$,
  solution_pt = $$Um agente recebe as faturas, extrai os dados com IA multimodal (Gemini) e confere as divergências. Quando algo não bate, envia um link seguro para conferência humana. Arquivos e dados são organizados no Drive e no Sheets, com uma fila (BullMQ) para processar em lote.$$,
  solution_en = $$An agent receives the invoices, extracts the data with multimodal AI (Gemini) and checks for mismatches. When something does not add up, it sends a secure link for human review. Files and data are organized in Drive and Sheets, with a queue (BullMQ) for batch processing.$$,
  results_pt = $$MVP que tira a digitação do fluxo e deixa para a pessoa apenas os casos com divergência.$$,
  results_en = $$An MVP that removes typing from the flow and leaves people only the cases with mismatches.$$,
  highlights_pt = array[$$Leitura de PDF e imagem com IA$$, $$Conferência por link seguro$$, $$Fila de processamento$$, $$Organização automática no Drive e no Sheets$$],
  highlights_en = array[$$AI reading of PDFs and images$$, $$Review through a secure link$$, $$Processing queue$$, $$Automatic filing in Drive and Sheets$$]
where slug = 'agente-notas-fiscais';

update public.projects set
  challenge_pt = $$Simular, contratar e aprovar crédito consignado envolvia planilhas de cálculo, documentos enviados por WhatsApp e aprovação manual.$$,
  challenge_en = $$Simulating, signing and approving payroll loans meant spreadsheets, documents sent over WhatsApp and manual approval.$$,
  solution_pt = $$Um fluxo digital completo: simulação com Tabela Price, CET e IOF, aceite da LGPD, captura de documento e selfie, e um painel para aprovar ou recusar propostas.$$,
  solution_en = $$A complete digital flow: simulation with amortization tables, effective rate and tax, privacy consent, document and selfie capture, and a dashboard to approve or reject proposals.$$,
  results_pt = $$A proposta do cliente chega pronta para análise, com o cálculo e os documentos no mesmo lugar.$$,
  results_en = $$Each proposal arrives ready for review, with the calculation and the documents in one place.$$,
  highlights_pt = array[$$Cálculo de CET e IOF$$, $$Captura de documento e selfie$$, $$Painel de aprovação$$],
  highlights_en = array[$$Effective rate and tax calculation$$, $$Document and selfie capture$$, $$Approval dashboard$$]
where slug = 'emprestimo-consignado';

update public.projects set
  challenge_pt = $$Quem tem restrição alimentar precisa ler rótulos inteiros no mercado e ainda corre o risco de deixar passar um ingrediente.$$,
  challenge_en = $$People with dietary restrictions have to read entire labels at the store and can still miss an ingredient.$$,
  solution_pt = $$Um app em React Native e Expo que abre direto na câmera: lê código de barras, embalagem (OCR) ou o prato (visão por IA) e cruza os ingredientes com as restrições do usuário. Backend em FastAPI com PostgreSQL e Redis, nota nutricional de 0 a 100 e alternativas reais via OpenFoodFacts.$$,
  solution_en = $$A React Native and Expo app that opens straight into the camera: it reads the barcode, the package (OCR) or the plate (AI vision) and checks the ingredients against the user's restrictions. FastAPI backend with PostgreSQL and Redis, a 0 to 100 nutrition score and real alternatives from OpenFoodFacts.$$,
  results_pt = $$Alerta na hora quando há conflito, com sugestão de um produto substituto.$$,
  results_en = $$An instant alert when there is a conflict, with a suggested replacement product.$$,
  highlights_pt = array[$$A câmera abre logo no início$$, $$Três formas de leitura$$, $$Nota nutricional$$, $$Alternativas automáticas$$],
  highlights_en = array[$$Camera opens right away$$, $$Three ways to scan$$, $$Nutrition score$$, $$Automatic alternatives$$]
where slug = 'dentro-app';

-- ───────────── New projects ─────────────
insert into public.projects (
  slug, title_pt, title_en, summary_pt, summary_en, category_pt, category_en, technologies, year, featured, published, sort_order,
  status, repo_private, for_sale, challenge_pt, challenge_en, solution_pt, solution_en, results_pt, results_en,
  highlights_pt, highlights_en, flow_pt, flow_en
) values
(
  'systemagent',
  $$SystemAgent, vendas e atendimento no WhatsApp$$, $$SystemAgent, sales and support on WhatsApp$$,
  $$Plataforma multiempresa com um agente de IA que atende, qualifica, agenda e faz follow-up no WhatsApp, com CRM, agenda e indicadores.$$,
  $$Multi-tenant platform with an AI agent that answers, qualifies, books and follows up on WhatsApp, with a CRM, calendar and dashboards.$$,
  'Atendimento e WhatsApp', 'Customer service and WhatsApp',
  array['Next.js', 'TypeScript', 'PostgreSQL', 'Supabase', 'Prisma', 'Inngest', 'Evolution API', 'Vercel AI Gateway'],
  2026, true, true, 10, 'in_progress', true, true,
  $$Pequenas empresas perdem vendas porque ninguém responde o WhatsApp a tempo, esquecem de retomar contatos e não sabem quantos leads viram clientes.$$,
  $$Small businesses lose sales because nobody answers WhatsApp in time, they forget to follow up and they do not know how many leads become customers.$$,
  $$Cada empresa conecta o próprio número e configura o agente a partir de modelos por nicho, como o de clínicas. O agente responde com base no conteúdo da empresa, consulta horários livres, agenda, remarca, envia lembretes e faz follow-up. Quando não sabe responder, passa a conversa para uma pessoa na inbox. Tudo cai em um CRM em kanban com etapas, exportação e ferramentas da LGPD. Feito em Next.js, com PostgreSQL (Supabase) e Row Level Security, fila no Inngest e modelos de IA pelo Vercel AI Gateway.$$,
  $$Each company connects its own number and sets up the agent from niche templates, such as the one for clinics. The agent answers from the company's own content, checks open slots, books, reschedules, sends reminders and follows up. When it does not know the answer, it hands the conversation to a person in the inbox. Everything lands in a kanban CRM with stages, export and privacy tools. Built with Next.js, PostgreSQL (Supabase) with Row Level Security, an Inngest queue and AI models through the Vercel AI Gateway.$$,
  $$As fases de fundação, canal, agente, CRM, agenda, follow-up, painéis e modelos de nicho estão concluídas e em produção, com avaliação automática das conversas do agente e tetos diários e mensais de gasto com IA.$$,
  $$Foundation, channel, agent, CRM, calendar, follow-up, dashboards and niche templates are done and in production, with automated evaluation of the agent's conversations and daily and monthly AI spending caps.$$,
  array[$$Isolamento entre empresas testado automaticamente em toda tabela$$, $$Validador que barra respostas inventadas$$, $$Agenda com lembretes e remarcação pelo próprio agente$$, $$Teto de gasto com IA por dia e por mês$$, $$Webhooks de saída para integrar outros sistemas$$],
  array[$$Isolation between companies tested automatically on every table$$, $$Validator that blocks made-up answers$$, $$Calendar with reminders and rescheduling by the agent itself$$, $$Daily and monthly AI spending caps$$, $$Outgoing webhooks to connect other systems$$],
  array[$$Mensagem no WhatsApp$$, $$Agente consulta a base e a agenda$$, $$Responde, agenda ou transfere$$, $$Lead no CRM com follow-up$$],
  array[$$WhatsApp message$$, $$Agent checks the knowledge base and calendar$$, $$Answers, books or hands off$$, $$Lead in the CRM with follow-up$$]
),
(
  'giro-pdv-adegas',
  $$Giro, PDV e retaguarda para adegas$$, $$Giro, POS and back office for liquor stores$$,
  $$Sistema de varejo especialista em adegas e distribuidoras de bebidas: PDV que vende sem internet, NFC-e, Pix, preço gelado e natural, casco retornável e financeiro completo.$$,
  $$Retail system built for liquor stores and beverage distributors: a POS that sells offline, electronic invoices, Pix, chilled and room-temperature pricing, returnable bottles and full finance.$$,
  'Gestão sob medida', 'Custom management systems',
  array['Next.js', 'React', 'TypeScript', 'Tauri', 'Supabase', 'PostgreSQL', 'PWA'],
  2026, true, true, 20, 'in_progress', true, true,
  $$Os PDVs genéricos não entendem adega: cerveja gelada custa mais que a natural, casco retornável tem saldo por cliente, fardo é vendido por unidade e a internet do balcão cai em plena sexta-feira.$$,
  $$Generic POS systems do not get liquor stores: cold beer costs more than warm beer, returnable bottles carry a balance per customer, packs are sold by the unit and the counter's internet drops on a Friday night.$$,
  $$Um monorepo com retaguarda web em Next.js, PDV em React que funciona offline (no navegador e como app de Windows feito em Tauri) e regras de negócio em TypeScript puro, cobertas por testes. O caixa vende sem internet e sincroniza depois, imprime direto na impressora térmica, abre a gaveta e recebe Pix estático ou dinâmico por vários provedores. A entrada de mercadoria é feita pelo XML da NF-e, com vínculo automático de produtos.$$,
  $$A monorepo with a Next.js back office, a React POS that works offline (in the browser and as a Windows app built with Tauri) and business rules in plain TypeScript covered by tests. The register sells without internet and syncs later, prints straight to the thermal printer, opens the cash drawer and takes static or dynamic Pix through several providers. Stock comes in from the supplier's electronic invoice XML, with products matched automatically.$$,
  $$Em operação piloto. Já tem PDV offline, NFC-e completa em homologação, preço gelado e natural, faixa de atacado, conta do cliente, casco por cliente, contas a pagar, recebíveis de cartão, fluxo de caixa e DRE.$$,
  $$Running in a pilot store. It already has the offline POS, full electronic invoicing in test mode, chilled and room-temperature prices, wholesale tiers, customer accounts, returnable bottles per customer, payables, card receivables, cash flow and an income statement.$$,
  array[$$Vende sem internet e sincroniza sozinho$$, $$App de caixa para Windows com impressão térmica direta$$, $$Pix com Mercado Pago, Efí, Inter e API padrão$$, $$Entrada pelo XML da NF-e que aprende os vínculos$$, $$Relatórios e XMLs prontos para o contador$$],
  array[$$Sells offline and syncs on its own$$, $$Windows register app with direct thermal printing$$, $$Pix through Mercado Pago, Efí, Inter and the standard API$$, $$Stock entry from invoice XML that learns product matches$$, $$Reports and XML files ready for the accountant$$],
  array[$$Produto bipado no caixa$$, $$Preço gelado, fardo ou atacado$$, $$Pix, cartão ou dinheiro$$, $$NFC-e e estoque atualizados$$],
  array[$$Item scanned at the register$$, $$Chilled, pack or wholesale price$$, $$Pix, card or cash$$, $$Invoice issued and stock updated$$]
),
(
  'performance-contabilidades',
  $$Performance operacional para contabilidades$$, $$Operational performance for accounting firms$$,
  $$SaaS para uma consultoria que atende escritórios contábeis: carteira de clientes, entregas por regime tributário, tempo gasto por cliente e oportunidades de venda geradas pela própria operação.$$,
  $$SaaS for a consultancy that serves accounting firms: client portfolios, deliverables by tax regime, time spent per client and sales opportunities raised by the operation itself.$$,
  'Gestão sob medida', 'Custom management systems',
  array['Next.js', 'NestJS', 'Prisma', 'PostgreSQL', 'Supabase Auth', 'Framer Motion'],
  2026, true, true, 40, 'mvp', true, false,
  $$A consultoria acompanhava dezenas de escritórios contábeis por planilhas soltas. Não dava para ver quais clientes davam prejuízo, quem estava sobrecarregado ou quando uma entrega atrasava.$$,
  $$The consultancy followed dozens of accounting firms through scattered spreadsheets. There was no way to see which clients lost money, who was overloaded or when a deliverable was late.$$,
  $$Uma plataforma multiempresa com a hierarquia consultoria, consultores, escritórios, frentes (fiscal, departamento pessoal e contábil) e clientes. Os dados entram por templates padronizados, as entregas são criadas sozinhas todo mês conforme o regime tributário, um cronômetro calcula o custo das horas contra a mensalidade de cada cliente e um CRM gera oportunidades quando a operação passa do contratado.$$,
  $$A multi-tenant platform with the hierarchy consultancy, consultants, firms, departments (tax, payroll and bookkeeping) and clients. Data comes in through standard templates, deliverables are created every month according to each client's tax regime, a timer weighs the cost of the hours against each client's monthly fee and a CRM raises opportunities when the work exceeds what was contracted.$$,
  $$Leituras imediatas de concentração de carteira, gargalos e sobrecarga por colaborador, sem depender de integração com o software de cada escritório.$$,
  $$Instant readings of portfolio concentration, bottlenecks and workload per employee, with no dependency on each firm's software.$$,
  array[$$Entregas mensais geradas por rotina agendada$$, $$Custo da hora contra a mensalidade de cada cliente$$, $$Oportunidades de venda detectadas pela operação$$, $$Permissões por papel$$],
  array[$$Monthly deliverables generated by a scheduled job$$, $$Hourly cost against each client's monthly fee$$, $$Sales opportunities detected from the operation$$, $$Role-based permissions$$],
  array[$$Planilhas da carteira e da equipe$$, $$Entregas do mês por regime$$, $$Horas e custo por cliente$$, $$Gargalos e oportunidades$$],
  array[$$Portfolio and team spreadsheets$$, $$Monthly deliverables by tax regime$$, $$Hours and cost per client$$, $$Bottlenecks and opportunities$$]
),
(
  'acompanhamento-pre-pos-operatorio',
  $$Acompanhamento pré e pós-operatório$$, $$Pre and post-op patient follow-up$$,
  $$Plataforma white-label para clínicas acompanharem pacientes antes e depois de cirurgias, com painel web para a equipe e um app único para paciente e médico.$$,
  $$White-label platform for clinics to follow patients before and after surgery, with a web dashboard for the team and a single app for patients and doctors.$$,
  'Saúde', 'Healthcare',
  array['Next.js', 'Expo', 'React Native', 'Supabase', 'PostgreSQL', 'Zod', 'pgTAP'],
  2026, true, true, 50, 'in_progress', true, false,
  $$Clínicas orientam pacientes de cirurgia pelo WhatsApp pessoal da equipe. Orientações se perdem, ninguém sabe em que etapa cada paciente está, e fotos e documentos ficam espalhados.$$,
  $$Clinics guide surgery patients through the team's personal WhatsApp. Instructions get lost, nobody knows which stage each patient is in, and photos and documents end up scattered.$$,
  $$Um SaaS white-label em que cada clínica tem marca, cores, equipe, procedimentos e protocolos próprios. No painel web a equipe cadastra pacientes, monta o protocolo pré e pós, agenda consultas e retornos, programa orientações automáticas e envia notificações. No app (Expo) o paciente recebe as orientações do dia, conversa com a clínica e o médico e envia fotos, documentos e sinais vitais.$$,
  $$A white-label SaaS where each clinic has its own brand, colors, team, procedures and protocols. On the web dashboard the team registers patients, builds the pre and post-op protocol, books visits and follow-ups, schedules automatic instructions and sends notifications. In the app (Expo) patients get the day's instructions, chat with the clinic and the doctor and send photos, documents and vital signs.$$,
  $$Em desenvolvimento para publicação na App Store e no Google Play, com cinco perfis de acesso e regras de acesso testadas no próprio banco.$$,
  $$In development for release on the App Store and Google Play, with five access profiles and access rules tested in the database itself.$$,
  array[$$Marca própria para cada clínica$$, $$Cinco perfis: plataforma, administrador, equipe, médico e paciente$$, $$Mensagens aguardando resposta destacadas para a equipe$$, $$App em português e inglês$$],
  array[$$Each clinic's own brand$$, $$Five profiles: platform, admin, staff, doctor and patient$$, $$Unanswered messages highlighted for the team$$, $$App in Portuguese and English$$],
  array[$$Paciente entra pelo código da clínica$$, $$Protocolo pré e pós por etapa$$, $$Orientações, chat e fotos$$, $$Equipe acompanha cada etapa$$],
  array[$$Patient joins with the clinic code$$, $$Pre and post-op protocol by stage$$, $$Instructions, chat and photos$$, $$Team follows every stage$$]
),
(
  'vetinapp',
  $$VetinApp, gestão para clínicas veterinárias$$, $$VetinApp, veterinary clinic management$$,
  $$Sistema para clínicas veterinárias com pacientes ligados aos tutores, agenda de consultas e cirurgias, prontuário eletrônico e financeiro.$$,
  $$System for veterinary clinics with patients linked to their owners, a calendar for visits and surgeries, electronic records and finance.$$,
  'Gestão sob medida', 'Custom management systems',
  array['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Auth.js', 'Tailwind CSS'],
  2026, false, true, 80, 'in_progress', true, true,
  $$Muitas clínicas veterinárias ainda trabalham com fichas de papel ou sistemas antigos, sem o histórico do animal à mão na hora da consulta.$$,
  $$Many veterinary clinics still work with paper records or legacy systems, without the animal's history at hand during the visit.$$,
  $$Sistema web em Next.js com Server Actions, Prisma e PostgreSQL. Cadastro de tutores e pets com espécie, raça e evolução do peso, agenda de consultas, cirurgias e retornos, prontuário eletrônico com vacinação, orçamentos e faturamento.$$,
  $$Web system in Next.js with Server Actions, Prisma and PostgreSQL. Owners and pets with species, breed and weight history, a calendar for visits, surgeries and follow-ups, electronic records with vaccinations, quotes and billing.$$,
  $$Cadastro de tutores e pacientes pronto; agenda, prontuário e financeiro seguem nas próximas fases.$$,
  $$Owner and patient records are done; calendar, medical records and finance come in the next phases.$$,
  array[$$Histórico do animal em um só lugar$$, $$Evolução do peso$$, $$Base pronta para um app mobile$$],
  array[$$The animal's history in one place$$, $$Weight history$$, $$Foundation ready for a mobile app$$],
  array[$$Tutor e pet cadastrados$$, $$Consulta ou cirurgia na agenda$$, $$Prontuário e vacinas$$, $$Orçamento e faturamento$$],
  array[$$Owner and pet registered$$, $$Visit or surgery booked$$, $$Medical record and vaccines$$, $$Quote and billing$$]
),
(
  'app-construtor',
  $$App Construtor, diário e gestão de obras$$, $$App Construtor, construction site reports$$,
  $$App de campo para engenheiros registrarem o diário de obra com fotos, e painel web para a construtora aprovar relatórios enquanto o cliente acompanha a evolução.$$,
  $$Field app for engineers to log daily site reports with photos, and a web dashboard for the builder to approve reports while the client follows progress.$$,
  'Gestão sob medida', 'Custom management systems',
  array['React Native', 'Expo', 'Next.js', 'Supabase', 'TypeScript', 'Tailwind CSS'],
  2026, false, true, 90, 'mvp', true, true,
  $$O relatório diário de obra é feito em papel ou por mensagem de WhatsApp, e o cliente só vê o andamento quando visita a obra.$$,
  $$Daily site reports are written on paper or sent over WhatsApp, and clients only see progress when they visit the site.$$,
  $$Um monorepo com app mobile em React Native e Expo para o diário de obra e as fotos de evolução, e painel web em Next.js para gerenciar obras, usuários e aprovações. Tudo integrado em tempo real pelo Supabase (PostgreSQL, Auth e Storage).$$,
  $$A monorepo with a React Native and Expo mobile app for daily reports and progress photos, and a Next.js web dashboard to manage sites, users and approvals. Everything stays in sync in real time through Supabase (PostgreSQL, Auth and Storage).$$,
  $$O engenheiro registra em campo, o escritório aprova no painel e o cliente acompanha a obra pelo app.$$,
  $$Engineers log from the field, the office approves on the dashboard and clients follow the site from the app.$$,
  array[$$Diário de obra no celular com fotos$$, $$Galeria de evolução para o cliente$$, $$Aprovação de relatórios no painel$$, $$Dados em tempo real$$],
  array[$$Daily site report on the phone with photos$$, $$Progress gallery for the client$$, $$Report approval on the dashboard$$, $$Real-time data$$],
  array[$$Engenheiro registra o dia$$, $$Fotos da evolução$$, $$Aprovação no painel$$, $$Cliente acompanha a obra$$],
  array[$$Engineer logs the day$$, $$Progress photos$$, $$Approval on the dashboard$$, $$Client follows the site$$]
),
(
  'freelapilot-ai',
  $$FreelaPilot AI, propostas com IA$$, $$FreelaPilot AI, AI-written proposals$$,
  $$Extensão de navegador que analisa projetos do 99Freelas com IA, pontua cada oportunidade, pesquisa cliente e concorrentes e prepara a proposta no formulário para revisão.$$,
  $$Browser extension that analyzes 99Freelas projects with AI, scores each opportunity, researches the client and competitors and drafts the proposal in the form for review.$$,
  'Automação e IA', 'Automation and AI',
  array['JavaScript', 'Node.js', 'Chrome Extensions', 'Native Messaging', 'OpenAI'],
  2026, false, true, 120, 'completed', true, false,
  $$Responder rápido a projetos de freelancer exige ler cada pedido, avaliar o cliente, calcular o preço e escrever uma proposta, e quem chega primeiro leva vantagem.$$,
  $$Answering freelance projects quickly means reading each request, sizing up the client, pricing the job and writing a proposal, and whoever gets there first has the edge.$$,
  $$Uma extensão para Opera GX e Chromium ligada a um app local em Node (Native Messaging) que usa a IA da assinatura do ChatGPT. Ela dá nota ao projeto, levanta riscos e perguntas, pesquisa o histórico do cliente e os concorrentes, sugere valor e prazo e preenche a proposta. Um monitor vigia novas oportunidades, avisa as que valem a pena e acompanha as propostas enviadas.$$,
  $$An extension for Opera GX and Chromium connected to a local Node app (Native Messaging) that uses the AI from a ChatGPT subscription. It scores the project, lists risks and questions, researches the client's history and the competitors, suggests price and deadline and fills in the proposal. A monitor watches for new opportunities, flags the ones worth it and tracks the proposals already sent.$$,
  $$Em uso diário: nota e análise em cerca de 10 segundos, proposta pronta em cerca de 25, e um funil de propostas enviadas, respondidas e fechadas.$$,
  $$In daily use: score and analysis in about 10 seconds, a ready proposal in about 25, and a funnel of proposals sent, answered and won.$$,
  array[$$Nunca envia sozinho: a pessoa revisa e envia$$, $$Aprende com as propostas que fecharam$$, $$Rascunho de resposta no chat, no tom do usuário$$, $$Liga e desliga com um clique$$],
  array[$$Never sends on its own: you review and send$$, $$Learns from the proposals that won$$, $$Chat reply drafts in the user's own tone$$, $$One-click on and off$$],
  array[$$Projeto aberto no 99Freelas$$, $$Nota, riscos e concorrentes$$, $$Proposta com valor e prazo$$, $$Você revisa e envia$$],
  array[$$Project opened on 99Freelas$$, $$Score, risks and competitors$$, $$Proposal with price and deadline$$, $$You review and send$$]
),
(
  'leitura-comportamental-ia',
  $$Leitura comportamental com IA$$, $$Behavioral insights with AI$$,
  $$Ecossistema SaaS com app mobile em três idiomas, landing page e backoffice: a pessoa escolhe sete cores e recebe uma leitura comportamental calculada por um motor e redigida por IA.$$,
  $$SaaS ecosystem with a mobile app in three languages, a landing page and a back office: people pick seven colors and get a behavioral reading computed by an engine and written by AI.$$,
  'Produtos digitais', 'Digital products',
  array['Expo', 'React Native', 'Next.js', 'Express', 'Prisma', 'PostgreSQL', 'OpenAI', 'Stripe'],
  2026, false, true, 130, 'mvp', true, false,
  $$O cliente tinha um método de leitura comportamental por cores e queria transformá-lo em um produto digital pago, com resultados consistentes e controle total do negócio.$$,
  $$The client had a color-based behavioral reading method and wanted to turn it into a paid digital product, with consistent results and full control of the business.$$,
  $$A matemática da leitura fica em código testado: a ordem das sete cores gera nove posições de forma determinística, e a IA só redige o texto, em um formato conferido pelo servidor. App em Expo (português, espanhol e inglês), landing em Next.js, API em Express com Prisma e backoffice com CRM, financeiro, planos e direitos do titular de dados. Pagamentos com Asaas e Stripe e anúncios com AdMob.$$,
  $$The reading's math lives in tested code: the order of the seven colors produces nine positions deterministically, and the AI only writes the text, in a format checked by the server. Expo app (Portuguese, Spanish and English), Next.js landing page, Express API with Prisma and a back office with CRM, finance, plans and data subject rights. Payments through Asaas and Stripe, ads through AdMob.$$,
  $$A mesma pergunta com as mesmas cores sempre gera a mesma leitura, e o time de negócio controla planos, conteúdo e financeiro sem mexer em código.$$,
  $$The same question with the same colors always gives the same reading, and the business team controls plans, content and finance without touching code.$$,
  array[$$Cálculo separado da redação feita pela IA$$, $$Três idiomas$$, $$Assinaturas com Asaas e Stripe$$, $$Backoffice com LGPD$$],
  array[$$Computation kept apart from the AI's writing$$, $$Three languages$$, $$Subscriptions through Asaas and Stripe$$, $$Back office with privacy tools$$],
  array[$$Contexto e pergunta$$, $$Sete cores escolhidas$$, $$Motor calcula nove posições$$, $$IA redige a leitura$$],
  array[$$Context and question$$, $$Seven colors picked$$, $$Engine computes nine positions$$, $$AI writes the reading$$]
),
(
  'assistente-deficiencia-visual',
  $$Assistente para pessoas com deficiência visual$$, $$Assistant for blind and low-vision people$$,
  $$App mobile que reconhece objetos e obstáculos pela câmera com aviso falado e guia rotas por voz, pensado para ser usado sem depender da tela.$$,
  $$Mobile app that recognizes objects and obstacles through the camera with spoken alerts and guides routes by voice, designed to be used without relying on the screen.$$,
  'Saúde', 'Healthcare',
  array['Flutter', 'Dart', 'TensorFlow Lite', 'FastAPI', 'PostgreSQL'],
  2026, false, true, 150, 'mvp', true, false,
  $$Apps de navegação e de câmera dependem de leitura visual, o que exclui justamente quem mais precisa de ajuda para se locomover.$$,
  $$Navigation and camera apps depend on reading the screen, which shuts out exactly the people who most need help getting around.$$,
  $$Um app em Flutter com visão computacional no próprio aparelho (TensorFlow Lite) identifica objetos e obstáculos e avisa por voz. A navegação por GPS lê as instruções passo a passo, e a última instrução pode ser repetida por comando. Backend em FastAPI com PostgreSQL.$$,
  $$A Flutter app with on-device computer vision (TensorFlow Lite) identifies objects and obstacles and speaks the alerts. GPS navigation reads each step aloud, and the last instruction can be repeated on command. FastAPI backend with PostgreSQL.$$,
  $$MVP técnico das duas funções centrais, com uma interface que depende o mínimo possível de leitura visual.$$,
  $$Technical MVP of the two core features, with an interface that relies as little as possible on reading the screen.$$,
  array[$$Visão computacional no aparelho, sem depender de internet$$, $$Rotas narradas por voz$$, $$Interface pensada para acessibilidade$$],
  array[$$On-device computer vision, no internet needed$$, $$Routes narrated by voice$$, $$Interface designed for accessibility$$],
  array[$$Câmera ou destino$$, $$Detecção no aparelho ou cálculo da rota$$, $$Aviso falado$$, $$Repetir a instrução por comando$$],
  array[$$Camera or destination$$, $$On-device detection or route$$, $$Spoken alert$$, $$Repeat the instruction on command$$]
),
(
  'compra-programada-acoes',
  $$Motor de compra programada de ações$$, $$Recurring stock purchase engine$$,
  $$Backend para uma corretora executar compras mensais programadas de ações para cada cliente, com precisão decimal, sem execução duplicada e com eventos garantidos.$$,
  $$Backend for a brokerage to run scheduled monthly stock purchases for every client, with decimal precision, no duplicate runs and guaranteed events.$$,
  'Finanças', 'Finance',
  array['C#', '.NET 8', 'MySQL', 'Kafka', 'Entity Framework', 'Docker'],
  2026, false, true, 170, 'completed', true, false,
  $$Desafio técnico de uma corretora: comprar ações todo mês para cada cliente seguindo regras rígidas do mercado, sem nunca cobrar duas vezes e sem perder centavos no rateio.$$,
  $$A brokerage's technical challenge: buy stocks every month for each client under strict market rules, never charging twice and never losing cents in the split.$$,
  $$API em .NET 8 com Clean Architecture e DDD. O MySQL é a fonte da verdade, com decimal(18,4) e um índice único por cliente e mês que impede a execução dupla. Os eventos para o Kafka são gravados no mesmo commit (Outbox Pattern) e enviados por um worker com entrega idempotente. Os resíduos de centavos vão para uma conta master por truncamento.$$,
  $$A .NET 8 API with Clean Architecture and DDD. MySQL is the source of truth, with decimal(18,4) and a unique index per client and month that prevents a double run. Kafka events are saved in the same commit (Outbox Pattern) and sent by a worker with idempotent delivery. Leftover cents go to a master account by truncation.$$,
  $$Um disparo duplicado do motor é barrado pelo banco, e nenhum evento é perdido ou enviado duas vezes.$$,
  $$A duplicate run of the engine is blocked by the database, and no event is ever lost or sent twice.$$,
  array[$$Idempotência garantida pelo banco$$, $$Outbox Pattern com Kafka$$, $$Erros no padrão RFC 7807$$, $$Regras de negócio isoladas no domínio$$],
  array[$$Idempotency enforced by the database$$, $$Outbox Pattern with Kafka$$, $$RFC 7807 error responses$$, $$Business rules isolated in the domain$$],
  array[$$Mês de execução$$, $$Compra por cliente com rateio$$, $$Resíduo na conta master$$, $$Evento no Kafka sem duplicar$$],
  array[$$Monthly run$$, $$Purchase per client with split$$, $$Leftover to the master account$$, $$Kafka event, never duplicated$$]
),
(
  'site-escritorio-advocacia',
  $$Site trilíngue para escritório de advocacia$$, $$Trilingual website for a law firm$$,
  $$Novo site estático em Astro para um escritório de advocacia, em português, inglês e espanhol, que puxa notícias e perfis do WordPress que o escritório já usa.$$,
  $$New static Astro website for a law firm, in Portuguese, English and Spanish, pulling news and profiles from the WordPress the firm already uses.$$,
  'Produtos digitais', 'Digital products',
  array['Astro', 'TypeScript', 'WordPress API', 'Vercel'],
  2026, false, true, 180, 'completed', true, false,
  $$O escritório queria um site mais rápido e moderno sem mudar a rotina de publicar notícias no painel de sempre, e sem quebrar os endereços antigos nos três idiomas.$$,
  $$The firm wanted a faster, modern website without changing how it publishes news in its usual dashboard, and without breaking the old addresses in all three languages.$$,
  $$Um site em Astro publicado na Vercel. Um script lê a API pública do WordPress e traz notícias, perfis de advogados, publicações e imagens otimizadas. Os textos em português, inglês e espanhol têm tipagem que acusa tradução faltando, e todos os endereços antigos redirecionam para os novos.$$,
  $$An Astro website deployed on Vercel. A script reads the public WordPress API and brings in news, lawyer profiles, publications and optimized images. The Portuguese, English and Spanish texts are typed so a missing translation is caught, and every old address redirects to the new one.$$,
  $$Páginas estáticas rápidas, conteúdo sempre sincronizado com o painel atual e prévia protegida contra indexação até a troca de domínio.$$,
  $$Fast static pages, content always in sync with the current dashboard and a preview kept out of search engines until the domain switch.$$,
  array[$$Três idiomas com checagem de tradução$$, $$Sincronização com o WordPress$$, $$Redirecionamento dos endereços antigos$$, $$Prévia sem indexação$$],
  array[$$Three languages with translation checks$$, $$WordPress sync$$, $$Old addresses redirected$$, $$Preview hidden from search engines$$],
  array[$$Escritório publica no WordPress$$, $$Sincronização traz o conteúdo$$, $$Build estático na Vercel$$, $$Site rápido em três idiomas$$],
  array[$$Firm publishes on WordPress$$, $$Sync brings the content$$, $$Static build on Vercel$$, $$Fast site in three languages$$]
)
on conflict (slug) do nothing;

-- Private repository addresses stay in the admin-only table.
insert into public.project_private (project_id, repo_url, github_full_name)
select p.id, r.repo_url, r.full_name
from (values
  ('systemagent', 'https://github.com/VitorMarcelli/systemagent', 'VitorMarcelli/systemagent'),
  ('giro-pdv-adegas', 'https://github.com/VitorMarcelli/giroAdegaAPP', 'VitorMarcelli/giroAdegaAPP'),
  ('performance-contabilidades', 'https://github.com/VitorMarcelli/consultoria_sass', 'VitorMarcelli/consultoria_sass'),
  ('acompanhamento-pre-pos-operatorio', 'https://github.com/VitorMarcelli/plataformprepos', 'VitorMarcelli/plataformprepos'),
  ('vetinapp', 'https://github.com/VitorMarcelli/vetinAPP', 'VitorMarcelli/vetinAPP'),
  ('app-construtor', 'https://github.com/VitorMarcelli/construction_app', 'VitorMarcelli/construction_app'),
  ('freelapilot-ai', 'https://github.com/VitorMarcelli/softwarefreelancer', 'VitorMarcelli/softwarefreelancer'),
  ('leitura-comportamental-ia', 'https://github.com/VitorMarcelli/insightdeltagrim', 'VitorMarcelli/insightdeltagrim'),
  ('site-escritorio-advocacia', 'https://github.com/VitorMarcelli/milareadv', 'VitorMarcelli/milareadv')
) as r(slug, repo_url, full_name)
join public.projects p on p.slug = r.slug
on conflict (project_id) do nothing;
