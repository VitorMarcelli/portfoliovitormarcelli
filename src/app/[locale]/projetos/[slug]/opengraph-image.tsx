import { ImageResponse } from 'next/og';
import { getDictionary, isLocale } from '@/i18n/dictionaries';
import { getProject } from '@/lib/data';

export const alt = 'Vitor Marcelli';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

/**
 * Share card of a project (what shows up when the link is pasted in WhatsApp, LinkedIn or a chat):
 * night style, category, title, badges and the "how it works" steps.
 */
export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : 'pt';
  const t = getDictionary(locale).projects;
  const project = await getProject(slug, locale);

  const title = project?.title ?? 'Vitor Marcelli';
  const badges = project
    ? [t.status[project.status], project.repoPrivate ? t.privateCode : null, project.forSale ? t.forSale : null].filter(Boolean)
    : [];
  const steps = (project?.flow ?? []).slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 68px',
          position: 'relative',
          background: 'radial-gradient(circle at 88% 12%, #10224a 0%, #050a18 58%)',
          color: '#eef2ff',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -90,
            top: -90,
            width: 330,
            height: 330,
            borderRadius: 330,
            background: 'radial-gradient(circle at 34% 30%, #cfe4ff 0%, #96c8ff 18%, #3b82f6 52%, #1e3a8a 100%)',
            boxShadow: '0 0 140px 30px rgba(59,130,246,0.4)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 24, letterSpacing: 5, textTransform: 'uppercase', color: '#96c8ff' }}>
            {project?.category ?? ''}
          </div>
          <div style={{ display: 'flex', marginTop: 18, maxWidth: 900, fontSize: title.length > 40 ? 60 : 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            {title}
          </div>
          {badges.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
              {badges.map((b) => (
                <div
                  key={b}
                  style={{
                    display: 'flex',
                    padding: '8px 18px',
                    borderRadius: 999,
                    border: '1.5px solid rgba(150,200,255,0.45)',
                    fontSize: 22,
                    color: '#cfe4ff',
                  }}
                >
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>

        {steps.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {steps.map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {i > 0 && <div style={{ display: 'flex', width: 34, height: 3, borderRadius: 3, background: '#3b82f6' }} />}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: 220,
                    padding: '14px 18px',
                    borderRadius: 16,
                    border: '1.5px solid rgba(150,200,255,0.3)',
                    background: 'rgba(16,28,56,0.85)',
                  }}
                >
                  <div style={{ display: 'flex', fontSize: 16, color: '#96c8ff', letterSpacing: 2 }}>{String(i + 1).padStart(2, '0')}</div>
                  <div style={{ display: 'flex', marginTop: 4, fontSize: 22, lineHeight: 1.2, color: '#eef2ff' }}>{step}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, color: '#9fb0d0' }}>
          <div style={{ display: 'flex', width: 12, height: 12, borderRadius: 12, background: '#96c8ff', boxShadow: '0 0 16px #3b82f6' }} />
          Vitor Marcelli · {getDictionary(locale).hero.role}
        </div>
      </div>
    ),
    size,
  );
}
