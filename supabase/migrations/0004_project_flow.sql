-- "How it works" flow of each project: 3 to 5 short steps (input → processing → output).
alter table public.projects
  add column if not exists flow_pt text[] not null default '{}',
  add column if not exists flow_en text[] not null default '{}';

update public.projects set
  flow_pt = array['UF, CNPJ e valor', 'Portal do estado', 'Código de receita validado', 'Guia em PDF pronta'],
  flow_en = array['State, tax ID and amount', 'State tax portal', 'Revenue code checked', 'Payment slip PDF']
where slug = 'emissao-guias-icms';

update public.projects set
  flow_pt = array['Mensagem no WhatsApp', 'Triagem por IA', 'Ocorrência com prioridade', 'Alertas e auditoria'],
  flow_en = array['WhatsApp message', 'AI triage', 'Prioritized ticket', 'Alerts and audit trail']
where slug = 'crm-condominios';

update public.projects set
  flow_pt = array['Locadora entra', 'Perfil de acesso', 'Dados isolados por cliente', 'Painel da frota'],
  flow_en = array['Rental company signs in', 'Access profile', 'Data isolated per tenant', 'Fleet dashboard']
where slug = 'frota-saas';

update public.projects set
  flow_pt = array['Caixa de e-mail (IMAP)', 'Classificação por IA', 'Sem duplicidade', 'Tarefa no Bitrix24'],
  flow_en = array['Mailbox (IMAP)', 'AI classification', 'No duplicates', 'Bitrix24 task']
where slug = 'classificador-emails';

update public.projects set
  flow_pt = array['Fatura por e-mail', 'Leitura com IA', 'Conferência se divergir', 'Drive e Sheets'],
  flow_en = array['Invoice by e-mail', 'AI extraction', 'Review link on mismatch', 'Drive and Sheets']
where slug = 'agente-notas-fiscais';

update public.projects set
  flow_pt = array['Simulação Price, CET e IOF', 'Aceite LGPD', 'Documento e selfie', 'Aprovação no painel'],
  flow_en = array['Loan simulation with fees', 'Privacy consent', 'ID and selfie', 'Approval dashboard']
where slug = 'emprestimo-consignado';

update public.projects set
  flow_pt = array['Código de barras ou foto', 'Leitura dos ingredientes', 'Cruza com suas restrições', 'Alerta na hora'],
  flow_en = array['Barcode or photo', 'Ingredient reading', 'Checked against your restrictions', 'Instant alert']
where slug = 'dentro-app';
