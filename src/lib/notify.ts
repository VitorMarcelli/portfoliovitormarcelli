import 'server-only';
import { CONTACT, SITE_URL } from '@/lib/env';
import type { LeadIntent } from '@/lib/types';

interface LeadEmail {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  intent: LeadIntent;
  projectTitle: string | null;
}

const INTENT_LABEL: Record<LeadIntent, string> = {
  contato: 'Contato',
  compra: 'Quer comprar ou licenciar',
  demonstracao: 'Quer uma demonstração',
};

function escape(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export function isLeadEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * E-mails Vitor about a new lead through Resend (https://resend.com). Silent no-op when
 * RESEND_API_KEY is not set; failures are logged and never block the visitor.
 */
export async function sendLeadEmail(lead: LeadEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const to = process.env.LEAD_NOTIFY_EMAIL || CONTACT.email;
  const from = process.env.RESEND_FROM || 'Portfólio Vitor Marcelli <onboarding@resend.dev>';
  const subjectProject = lead.projectTitle ? ` sobre ${lead.projectTitle}` : '';
  const rows: [string, string | null][] = [
    ['Intenção', INTENT_LABEL[lead.intent]],
    ['Projeto', lead.projectTitle],
    ['Nome', lead.name],
    ['E-mail', lead.email],
    ['WhatsApp', lead.phone],
    ['Empresa', lead.company],
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#0f172a">
      <h2 style="margin:0 0 12px">Novo lead${escape(subjectProject)}</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows
          .filter(([, v]) => v)
          .map(([k, v]) => `<tr><td style="color:#64748b">${k}</td><td><strong>${escape(v as string)}</strong></td></tr>`)
          .join('')}
      </table>
      ${lead.message ? `<p style="white-space:pre-line;margin:16px 0;padding:12px;background:#f1f5f9;border-radius:8px">${escape(lead.message)}</p>` : ''}
      <p><a href="${SITE_URL}/admin/leads">Abrir no painel</a></p>
    </div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Novo lead${subjectProject}: ${lead.name}`,
        html,
        ...(lead.email ? { reply_to: lead.email } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error('[notify] Resend', res.status, (await res.text()).slice(0, 200));
  } catch (e) {
    console.error('[notify] Resend failed', (e as Error).message);
  }
}
