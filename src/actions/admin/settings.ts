'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { SITE_URL } from '@/lib/env';
import { onlyDigits } from '@/lib/whatsapp/link';
import {
  createInstance,
  getConnectionState,
  getPairingQr,
  logoutInstance,
  setWebhook,
  type ConnectionState,
} from '@/lib/whatsapp/evolution';
import { revalidatePublicSite, text, uploadPublicFile } from './shared';

export interface SettingsFormState {
  ok?: boolean;
  error?: string;
}

export async function saveProfileSettings(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const { supabase } = await requireAdmin();
  const number = onlyDigits(text(formData, 'whatsapp_number') || '');
  if (number && (number.length < 12 || number.length > 13)) {
    return { error: 'Informe o WhatsApp com DDI e DDD, por exemplo 5511999998888.' };
  }

  let cvUrl: string | null | undefined;
  try {
    cvUrl = await uploadPublicFile(supabase, formData.get('cv'), 'cv', 'curriculo-vitor-marcelli', 8 * 1024 * 1024);
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (!cvUrl && formData.get('remove_cv') === 'on') cvUrl = null;

  const { error } = await supabase
    .from('settings')
    .update({
      available: formData.get('available') === 'on',
      whatsapp_number: number || null,
      ...(cvUrl !== undefined ? { cv_url: cvUrl } : {}),
    })
    .eq('id', 1);
  if (error) return { error: error.message };

  revalidatePublicSite();
  revalidatePath('/admin/configuracoes');
  return { ok: true };
}

export async function saveAiSettings(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const { supabase } = await requireAdmin();
  const instructions = text(formData, 'ai_instructions');
  if (instructions && instructions.length > 6000) return { error: 'Instruções muito longas (máximo 6000 caracteres).' };

  const { error } = await supabase
    .from('settings')
    .update({ ai_enabled: formData.get('ai_enabled') === 'on', ai_instructions: instructions })
    .eq('id', 1);
  if (error) return { error: error.message };
  revalidatePath('/admin/configuracoes');
  return { ok: true };
}

export async function changePassword(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const { supabase } = await requireAdmin();
  const password = String(formData.get('password') || '');
  const confirmation = String(formData.get('confirmation') || '');
  if (password.length < 10) return { error: 'Use pelo menos 10 caracteres.' };
  if (password !== confirmation) return { error: 'As duas senhas não são iguais.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { ok: true };
}

export interface WhatsappActionResult {
  state?: ConnectionState;
  qr?: string | null;
  pairingCode?: string | null;
  message?: string;
  error?: string;
}

export async function whatsappStatus(): Promise<WhatsappActionResult> {
  await requireAdmin();
  try {
    return { state: await getConnectionState() };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function whatsappConnect(): Promise<WhatsappActionResult> {
  await requireAdmin();
  try {
    try {
      await getConnectionState();
    } catch {
      await createInstance();
    }
    const { qr, pairingCode } = await getPairingQr();
    return { qr, pairingCode, message: qr ? 'Abra o WhatsApp no celular, Aparelhos conectados, e leia o QR code.' : 'Instância já conectada.' };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function whatsappSetWebhook(): Promise<WhatsappActionResult> {
  await requireAdmin();
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (!secret) return { error: 'Defina WHATSAPP_WEBHOOK_SECRET nas variáveis de ambiente da Vercel.' };
  if (SITE_URL.includes('localhost')) return { error: 'Defina NEXT_PUBLIC_SITE_URL com o endereço público do site antes de registrar o webhook.' };
  try {
    await setWebhook(`${SITE_URL}/api/whatsapp/webhook?secret=${encodeURIComponent(secret)}`);
    return { message: 'Webhook registrado. As mensagens recebidas já chegam ao painel.' };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function whatsappLogout(): Promise<WhatsappActionResult> {
  await requireAdmin();
  try {
    await logoutInstance();
    return { state: 'close', message: 'WhatsApp desconectado.' };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
