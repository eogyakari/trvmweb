import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

// Goes at: src/app/[lang]/videos/page.tsx
export default async function VideosPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const v = dict.videosPage

  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)',
        padding: '72px 24px', textAlign: 'center'
      }}>
        <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          ✝ {v.eyebrow}
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
          {dict.nav.videos}
        </h1>
        <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.8 }}>
          {v.subtitle}
        </p>
      </div>

      {/* Coming Soon */}
      <div style={{ background: '#0D0D1A', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🎬</div>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.8rem', marginBottom: 16 }}>{v.comingSoon}</h2>
          <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 24px' }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, fontSize: '1rem', marginBottom: 32 }}>
            {v.comingSoonText}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontStyle: 'italic' }}>
            &ldquo;{v.scripture}&rdquo; — {v.scriptureRef}
          </p>

          {/* Subscribe nudge */}
          <div style={{ marginTop: 48, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 12, padding: 28 }}>
            <p style={{ color: '#F5A623', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{v.notifyTitle}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>{v.notifyText}</p>
            <a href={`/${lang}#subscribe`} style={{
              background: 'linear-gradient(135deg, #F5A623, #E8860A)',
              color: '#0D0D1A', padding: '10px 28px', borderRadius: 6,
              fontWeight: 700, fontSize: 13, textDecoration: 'none',
              textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block'
            }}>
              {dict.common.subscribe}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}