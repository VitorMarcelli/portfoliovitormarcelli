import 'server-only';

/**
 * Minimal Evolution API (v2) client: send text, connection state, QR pairing and webhook setup.
 * Docs: https://doc.evolution-api.com
 */

export function evolutionConfig() {
  const url = process.env.EVOLUTION_API_URL?.replace(/\/$/, '');
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  return url && apiKey && instance ? { url, apiKey, instance } : null;
}

export function isEvolutionConfigured() {
  return evolutionConfig() !== null;
}

async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const config = evolutionConfig();
  if (!config) throw new Error('Evolution API não configurada (EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE).');

  const res = await fetch(`${config.url}${path.replace('{instance}', encodeURIComponent(config.instance))}`, {
    method,
    headers: { apikey: config.apiKey, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Evolution API ${res.status}: ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

interface SendTextResponse {
  key?: { id?: string; remoteJid?: string };
}

/** Sends a text message. `to` may be a full JID or only digits with country code. */
export async function sendWhatsappText(to: string, text: string) {
  const res = await call<SendTextResponse>('POST', '/message/sendText/{instance}', { number: to, text });
  return { id: res.key?.id ?? null };
}

export type ConnectionState = 'open' | 'close' | 'connecting' | 'unknown';

export async function getConnectionState(): Promise<ConnectionState> {
  const res = await call<{ instance?: { state?: string }; state?: string }>('GET', '/instance/connectionState/{instance}');
  const state = res.instance?.state ?? res.state;
  return state === 'open' || state === 'close' || state === 'connecting' ? state : 'unknown';
}

/** Returns a QR code (data URL) and pairing code to link the phone. */
export async function getPairingQr() {
  const res = await call<{ base64?: string; pairingCode?: string; code?: string }>('GET', '/instance/connect/{instance}');
  return { qr: res.base64 ?? null, pairingCode: res.pairingCode ?? null };
}

export async function createInstance() {
  const config = evolutionConfig();
  if (!config) throw new Error('Evolution API não configurada.');
  return call('POST', '/instance/create', {
    instanceName: config.instance,
    integration: 'WHATSAPP-BAILEYS',
    qrcode: true,
  });
}

export async function setWebhook(webhookUrl: string) {
  return call('POST', '/webhook/set/{instance}', {
    webhook: {
      enabled: true,
      url: webhookUrl,
      byEvents: false,
      base64: false,
      events: ['MESSAGES_UPSERT'],
    },
  });
}

export async function logoutInstance() {
  const config = evolutionConfig();
  if (!config) throw new Error('Evolution API não configurada.');
  const res = await fetch(`${config.url}/instance/logout/${encodeURIComponent(config.instance)}`, {
    method: 'DELETE',
    headers: { apikey: config.apiKey },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Evolution API ${res.status}`);
}
