import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'
import MissionCarousel from '@/app/components/MissionCarousel'

export const revalidate = 300

const COUNTS: Record<string, number> = { ghana: 11, liberia: 10, indonesia: 15, kenya: 14 }
const ORDER = ['ghana', 'liberia', 'indonesia', 'kenya'] as const

export default async function MissionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const m = dict.missionsPage

  return (
    <div style={{ background: '#0D0D1A' }}>
      {/* Header — clears fixed nav */}
      <header style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2A1145 100%)', padding: 'calc(72px + clamp(56px, 9vw, 100px)) 24px clamp(56px, 8vw, 90px)', textAlign: 'center' }}>
        <p style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 18 }}>✝ {m.eyebrow}</p>
        <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(38px, 7vw, 72px)', fontWeight: 800, color: 'white', lineHeight: 1.05 }}>{m.title}</h1>
      </header>

      {/* Scripture */}
      <section style={{ padding: 'clamp(64px, 10vw, 120px) 24px', background: '#0D0D1A', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', top: 'clamp(10px,3vw,40px)', left: '50%', transform: 'translateX(-50%)', fontFamily: 'Georgia, serif', fontSize: 'clamp(120px, 20vw, 260px)', lineHeight: 1, color: 'rgba(245,166,35,0.08)', pointerEvents: 'none' }}>“</div>
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(17px, 2.4vw, 24px)', lineHeight: 1.7, color: 'rgba(255,255,255,0.9)', marginBottom: 26 }}>
            {m.scripture}
          </p>
          <div style={{ width: 50, height: 2, background: '#F5A623', margin: '0 auto 18px' }} />
          <p style={{ color: '#F5A623', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{m.scriptureRef}</p>
        </div>
      </section>

      {/* Introduction */}
      <section style={{ padding: '0 24px clamp(48px, 7vw, 80px)', background: '#0D0D1A' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, color: 'white', marginBottom: 22, lineHeight: 1.15 }}>{m.introTitle}</h2>
          {m.intro.split('\n\n').map((para: string, i: number) => (
            <p key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.9, marginBottom: i < m.intro.split('\n\n').length - 1 ? 20 : 0 }}>{para}</p>
          ))}
        </div>
      </section>

      {/* Country sections */}
      {ORDER.map((key, idx) => {
        const c = m.countries[key]
        const bg = idx % 2 === 0 ? '#1A0A2E' : '#0D0D1A'
        return (
          <section key={key} style={{ background: bg, padding: 'clamp(56px, 8vw, 100px) 0' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ padding: '0 24px', marginBottom: 'clamp(32px, 4vw, 48px)', maxWidth: 780 }}>
                <p style={{ color: '#F5A623', fontSize: 'clamp(12px, 1.6vw, 15px)', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>{c.name}</p>
                <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 800, color: 'white', lineHeight: 1.12, marginBottom: 20 }}>{c.title}</h2>
                {c.body.split('\n\n').map((para: string, i: number) => (
                  <p key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.9, marginBottom: i < c.body.split('\n\n').length - 1 ? 16 : 0 }}>{para}</p>
                ))}
              </div>
              <div style={{ padding: '0 24px' }}>
                <MissionCarousel country={key} count={COUNTS[key]} label={m.photosLabel} />
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}