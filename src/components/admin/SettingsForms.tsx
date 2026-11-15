'use client';

/* eslint-disable @next/next/no-img-element -- the QR code is a data URL returned by the API */
import { useActionState, useState, useTransition } from 'react';
import {
  saveAiSettings,
  saveProfileSettings,
  whatsappConnect,
  whatsappLogout,
  whatsappSetWebhook,
  whatsappStatus,
  type SettingsFormState,
  type WhatsappActionResult,
} from '@/actions/admin/settings';
import type { SettingsRow } from '@/lib/types';
import { buttonPrimary, buttonSecondary, Field, inputClass } from './ui';

function Feedback({ state, okText }: { state: SettingsFormState; okText: string }) {
  if (state.error)
    return (
      <p role="alert" className="text-sm text-danger">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p role="status" className="text-sm text-success">
        {okText}
      </p>
    );
  return null;
}

export function ProfileForm({ settings }: { settings: SettingsRow }) {
  const [state, action, pending] = useActionState(saveProfileSettings, {});
  return (
    <form action={action} className="grid gap-4">
      <label className="flex items-center gap-3 text-sm font-medium">
        <input type="checkbox" name="available" defaultChecked={settings.available} className="h-4 w-4" />
        Mostrar “Aceitando novos projetos” no site
      </label>
      <Field label="WhatsApp do botão do site" hint="com DDI e DDD, só números">
        <input name="whatsapp_number" inputMode="numeric" placeholder="5511999998888" defaultValue={settings.whatsapp_number ?? ''} className={inputClass} />
      </Field>
      <div className="text-sm">
        <p className="font-medium">Currículo (PDF)</p>
        {settings.cv_url ? (
          <p className="mt-1 text-muted">
            <a href={settings.cv_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              Ver currículo atual
            </a>
            <label className="ml-4 inline-flex items-center gap-2">
              <input type="checkbox" name="remove_cv" className="h-4 w-4" /> remover
            </label>
          </p>
        ) : (
          <p className="mt-1 text-muted">Nenhum enviado. O botão de download só aparece no site depois do envio.</p>
        )}
        <input name="cv" type="file" accept="application/pdf" className="mt-2 block w-full" />
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? 'Salvando…' : 'Salvar perfil'}
        </button>
        <Feedback state={state} okText="Perfil atualizado no site." />
      </div>
    </form>
  );
}

export function AiForm({ settings, aiConfigured }: { settings: SettingsRow; aiConfigured: boolean }) {
  const [state, action, pending] = useActionState(saveAiSettings, {});
  return (
    <form action={action} className="grid gap-4">
      {!aiConfigured && (
        <p className="rounded-md border border-accent bg-accent/10 px-3 py-2 text-sm">
          ANTHROPIC_API_KEY não está definida na Vercel. Enquanto isso, toda conversa nova fica esperando você.
        </p>
      )}
      <label className="flex items-center gap-3 text-sm font-medium">
        <input type="checkbox" name="ai_enabled" defaultChecked={settings.ai_enabled} className="h-4 w-4" />
        IA responde automaticamente as conversas novas
      </label>
      <Field label="Instruções extras para a IA" hint="opcional">
        <textarea
          name="ai_instructions"
          rows={7}
          defaultValue={settings.ai_instructions ?? ''}
          placeholder={'Ex.: Atendo de segunda a sexta, das 9h às 18h.\nProjetos começam a partir de R$ 3.000, mas só eu passo valores.\nPrefiro reuniões por Google Meet.'}
          className={inputClass}
        />
      </Field>
      <p className="text-sm text-muted">
        A IA já conhece seus serviços e os projetos publicados. Ela nunca passa preço ou prazo por conta própria: quando o
        cliente pede, a conversa é transferida para você.
      </p>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? 'Salvando…' : 'Salvar atendimento'}
        </button>
        <Feedback state={state} okText="Atendimento atualizado." />
      </div>
    </form>
  );
}

const STATE_LABEL: Record<string, string> = {
  open: 'Conectado',
  close: 'Desconectado',
  connecting: 'Conectando',
  unknown: 'Estado desconhecido',
};

export function WhatsappPanel({ initial }: { initial: WhatsappActionResult }) {
  const [result, setResult] = useState<WhatsappActionResult>(initial);
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<WhatsappActionResult>) =>
    startTransition(async () => {
      const res = await fn();
      setResult((prev) => ({ ...prev, ...res, qr: res.qr ?? (res.state === 'open' ? null : prev.qr) }));
    });

  const state = result.state;

  return (
    <div className="grid gap-4">
      <p className="flex items-center gap-2.5">
        <span
          className={`h-2.5 w-2.5 rounded-full ${state === 'open' ? 'bg-success' : state === 'connecting' ? 'bg-accent' : 'bg-muted'}`}
          aria-hidden="true"
        />
        <span className="font-medium">{state ? STATE_LABEL[state] : 'Sem conexão com a Evolution API'}</span>
      </p>

      {result.qr && state !== 'open' && (
        <div className="w-max rounded-lg bg-white p-3">
          <img src={result.qr} alt="QR code para conectar o WhatsApp" width={240} height={240} />
        </div>
      )}
      {result.pairingCode && state !== 'open' && (
        <p className="text-sm">
          Ou use o código de pareamento: <strong className="tracking-widest">{result.pairingCode}</strong>
        </p>
      )}
      {result.message && <p className="text-sm text-muted">{result.message}</p>}
      {result.error && (
        <p role="alert" className="text-sm text-danger">
          {result.error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {state !== 'open' && (
          <button type="button" disabled={pending} onClick={() => run(whatsappConnect)} className={buttonPrimary}>
            Conectar com QR code
          </button>
        )}
        <button type="button" disabled={pending} onClick={() => run(whatsappStatus)} className={buttonSecondary}>
          Atualizar status
        </button>
        <button type="button" disabled={pending} onClick={() => run(whatsappSetWebhook)} className={buttonSecondary}>
          Registrar webhook
        </button>
        {state === 'open' && (
          <button
            type="button"
            disabled={pending}
            onClick={() => confirm('Desconectar o WhatsApp do painel?') && run(whatsappLogout)}
            className={buttonSecondary}
          >
            Desconectar
          </button>
        )}
      </div>
    </div>
  );
}
