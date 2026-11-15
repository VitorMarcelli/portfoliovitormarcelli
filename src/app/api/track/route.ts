import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin, hasSupabaseAdmin } from '@/lib/supabase/admin';

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|vercel/i;

const schema = z.object({
  type: z.enum(['pageview', 'click']),
  path: z.string().max(300),
  label: z.string().max(120).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  visitorId: z.string().max(64).optional(),
});

function deviceFrom(ua: string) {
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  if (/mobi|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

/** Keeps only the referring host, and drops self-referrals. */
function referrerHost(referrer: string | null | undefined, ownHost: string | null) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    return host === ownHost?.replace(/^www\./, '') ? null : host;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const ua = request.headers.get('user-agent') || '';
  if (!hasSupabaseAdmin() || BOT_UA.test(ua)) return new NextResponse(null, { status: 204 });

  let body: unknown;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success || parsed.data.path.startsWith('/admin')) {
    return new NextResponse(null, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from('events')
    .insert({
      type: parsed.data.type,
      path: parsed.data.path,
      label: parsed.data.label ?? null,
      referrer: referrerHost(parsed.data.referrer, request.headers.get('host')),
      country: request.headers.get('x-vercel-ip-country'),
      device: deviceFrom(ua),
      visitor_id: parsed.data.visitorId ?? null,
    });
  if (error) console.error('[track]', error.message);

  return new NextResponse(null, { status: 204 });
}
