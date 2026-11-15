import { ImageResponse } from 'next/og';
import { getDictionary, isLocale } from '@/i18n/dictionaries';

export const alt = 'Vitor Marcelli';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0f1b2d',
          color: '#f4f5f1',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, color: '#a7b1c0' }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: '#e8a33d' }} />
          {t.hero.role}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 150, fontWeight: 800, lineHeight: 0.9, letterSpacing: -6 }}>
          <span>Vitor</span>
          <span>Marcelli</span>
        </div>
        <div style={{ fontSize: 30, color: '#a7b1c0', maxWidth: 980 }}>{t.services.items.map((s) => s.title).join('  /  ')}</div>
      </div>
    ),
    size,
  );
}
