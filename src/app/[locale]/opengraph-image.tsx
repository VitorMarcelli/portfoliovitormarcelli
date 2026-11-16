import { ImageResponse } from 'next/og';
import { getDictionary, isLocale } from '@/i18n/dictionaries';

export const alt = 'Vitor Marcelli';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Share card in the night style of the site: deep navy, a glowing blue orb, gradient name. */
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(isLocale(locale) ? locale : 'pt');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'radial-gradient(circle at 78% 42%, #10224a 0%, #050a18 62%)',
          color: '#eef2ff',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 90,
            top: 120,
            width: 390,
            height: 390,
            borderRadius: 400,
            background: 'radial-gradient(circle at 34% 30%, #cfe4ff 0%, #96c8ff 18%, #3b82f6 52%, #1e3a8a 100%)',
            boxShadow: '0 0 160px 30px rgba(59,130,246,0.45)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, color: '#9fb0d0' }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: '#96c8ff', boxShadow: '0 0 18px #3b82f6' }} />
            {t.hero.role}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 132, fontWeight: 800, lineHeight: 0.95, letterSpacing: -5 }}>
            <span>Vitor</span>
            <span style={{ color: '#96c8ff' }}>Marcelli</span>
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: '#9fb0d0', maxWidth: 680 }}>{t.services.items.map((s) => s.title).join('  ·  ')}</div>
        </div>
      </div>
    ),
    size,
  );
}
