import type { Metadata } from 'next';
import { AiForm, PasswordForm, ProfileForm, WhatsappPanel } from '@/components/admin/SettingsForms';
import { PageHeader, Panel } from '@/components/admin/ui';
import { isAiConfigured } from '@/lib/ai/attendant';
import { requireAdmin } from '@/lib/auth';
import { SITE_URL } from '@/lib/env';
import type { SettingsRow } from '@/lib/types';
import { getConnectionState, isEvolutionConfigured } from '@/lib/whatsapp/evolution';

export const metadata: Metadata = { title: 'Configurações' };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
  const settings = data as SettingsRow;

  let whatsappInitial = {};
  if (isEvolutionConfigured()) {
    try {
      whatsappInitial = { state: await getConnectionState() };
    } catch (e) {
      whatsappInitial = { error: (e as Error).message };
    }
  }

  const checks = [
    { label: 'Endereço público do site', ok: !SITE_URL.includes('localhost'), env: 'NEXT_PUBLIC_SITE_URL' },
    { label: 'Supabase (chave secreta do servidor)', ok: Boolean(process.env.SUPABASE_SECRET_KEY), env: 'SUPABASE_SECRET_KEY' },
    { label: 'IA de atendimento', ok: isAiConfigured(), env: 'ANTHROPIC_API_KEY' },
    { label: 'Evolution API', ok: isEvolutionConfigured(), env: 'EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE' },
    { label: 'Segredo do webhook', ok: Boolean(process.env.WHATSAPP_WEBHOOK_SECRET), env: 'WHATSAPP_WEBHOOK_SECRET' },
    { label: 'Aviso de transferência no seu celular', ok: Boolean(process.env.NOTIFY_WHATSAPP_NUMBER), env: 'NOTIFY_WHATSAPP_NUMBER (opcional)' },
  ];

  return (
    <>
      <PageHeader title="Configurações" description="O que aparece no site, como a IA atende e a conexão com o WhatsApp." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Perfil no site">
          <ProfileForm settings={settings} />
        </Panel>
        <Panel title="Atendimento com IA">
          <AiForm settings={settings} aiConfigured={isAiConfigured()} />
        </Panel>
        <Panel title="WhatsApp">
          {isEvolutionConfigured() ? (
            <WhatsappPanel initial={whatsappInitial} />
          ) : (
            <p className="text-sm text-muted">
              Defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE na Vercel para conectar seu número aqui.
            </p>
          )}
        </Panel>
        <Panel title="Segurança">
          <PasswordForm />
        </Panel>
        <Panel title="Variáveis de ambiente">
          <ul className="divide-y divide-border text-sm">
            {checks.map((c) => (
              <li key={c.env} className="flex items-start justify-between gap-4 py-2.5">
                <div>
                  <p className="font-medium">{c.label}</p>
                  <p className="text-muted">{c.env}</p>
                </div>
                <span className={`shrink-0 font-medium ${c.ok ? 'text-success' : 'text-danger'}`}>{c.ok ? 'Configurado' : 'Faltando'}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
