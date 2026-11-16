import 'server-only';

/**
 * Captures a screenshot of a live site through Microlink (https://microlink.io), free for a few
 * captures a day without an account; MICROLINK_API_KEY raises the limit. Returns the image bytes.
 */
export async function captureScreenshot(url: string): Promise<{ bytes: ArrayBuffer; contentType: string }> {
  const target = new URL(url);
  if (target.protocol !== 'https:' && target.protocol !== 'http:') throw new Error('Endereço inválido.');

  const api = new URL('https://api.microlink.io/');
  api.searchParams.set('url', target.toString());
  api.searchParams.set('screenshot', 'true');
  api.searchParams.set('meta', 'false');
  api.searchParams.set('viewport.width', '1440');
  api.searchParams.set('viewport.height', '900');
  api.searchParams.set('waitForTimeout', '2500');

  const key = process.env.MICROLINK_API_KEY;
  const res = await fetch(api, {
    headers: key ? { 'x-api-key': key } : {},
    cache: 'no-store',
    signal: AbortSignal.timeout(45_000),
  });
  const json = (await res.json().catch(() => null)) as { status?: string; message?: string; data?: { screenshot?: { url?: string } } } | null;
  if (res.status === 429) throw new Error('Limite diário de capturas gratuitas atingido. Tente amanhã ou envie a imagem manualmente.');
  const shotUrl = json?.data?.screenshot?.url;
  if (!res.ok || !shotUrl) throw new Error(`Não foi possível capturar o site${json?.message ? `: ${json.message}` : '.'}`);

  const image = await fetch(shotUrl, { cache: 'no-store', signal: AbortSignal.timeout(30_000) });
  if (!image.ok) throw new Error('A captura foi feita, mas a imagem não pôde ser baixada.');
  return { bytes: await image.arrayBuffer(), contentType: image.headers.get('content-type') || 'image/png' };
}
