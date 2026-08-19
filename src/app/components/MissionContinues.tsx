import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import { getDict, localize } from '@/i18n/client'

export default function MissionContinues({ lang }: { lang: Locale }) {
  const dict = getDict(lang)
  const m = dict.missionContinues
  const L = (href: string) => localize(href, lang)

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)',
      minHeight: 'clamp(520px, 62vw, 680px)',
    }}>
      {/* Photo — upper-right, clipped along a curved wave on its lower-left edge */}
      <div className="mc-photo" style={{
        position: 'absolute', top: 0, right: 0, height: '100%', width: '62%',
        backgroundImage: 'url(/mission-continues/mission-family.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center top',
        // Curved wave clip: straight along top/right, curved sweep on the lower-left
        WebkitClipPath: 'path("M 120,0 L 2000,0 L 2000,2000 L 0,2000 C 40,1400 260,900 120,0 Z")',
        clipPath: 'path("M 120,0 L 2000,0 L 2000,2000 L 0,2000 C 40,1400 260,900 120,0 Z")',
      }} />
      {/* Subtle dark scrim on the photo's left edge so the curve blends into the text side */}
      <div className="mc-photo-scrim" style={{
        position: 'absolute', top: 0, right: 0, height: '100%', width: '62%',
        background: 'linear-gradient(90deg, rgba(13,13,26,0.85) 0%, rgba(13,13,26,0.15) 22%, transparent 45%)',
        WebkitClipPath: 'path("M 120,0 L 2000,0 L 2000,2000 L 0,2000 C 40,1400 260,900 120,0 Z")',
        clipPath: 'path("M 120,0 L 2000,0 L 2000,2000 L 0,2000 C 40,1400 260,900 120,0 Z")',
        pointerEvents: 'none',
      }} />

      {/* Text — lower-left */}
      <div className="mc-text" style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1280, margin: '0 auto', minHeight: 'clamp(520px, 62vw, 680px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 clamp(24px, 5vw, 64px) clamp(56px, 8vw, 96px)',
      }}>
        <div style={{ maxWidth: 440 }}>
          <h2 style={{
            color: '#fff', fontFamily: 'var(--font-playfair), Georgia, serif',
            fontWeight: 800, fontSize: 'clamp(34px, 5.5vw, 60px)', lineHeight: 1.1, margin: 0, marginBottom: 14,
          }}>
            {m.title}
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-playfair), Georgia, serif',
            fontStyle: 'italic', fontSize: 'clamp(20px, 3vw, 30px)', lineHeight: 1.3, margin: 0, marginBottom: 34,
          }}>
            {m.subtitle}
          </p>
          <Link href={L('/programs/missions')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#1A0A2E',
            padding: '15px 38px', borderRadius: 40, fontSize: 15, fontWeight: 800,
            letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
            fontFamily: 'Georgia, serif', boxShadow: '0 12px 34px rgba(245,166,35,0.35)',
          }}>
            {m.cta} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <style>{`
        /* On phones: stack — photo on top (no clip), text below on the dark bg */
        @media (max-width: 760px) {
          .mc-photo, .mc-photo-scrim {
            position: relative !important; width: 100% !important; height: 300px !important;
            -webkit-clip-path: none !important; clip-path: none !important;
          }
          .mc-photo-scrim { display: none !important; }
          .mc-text {
            min-height: 0 !important; justify-content: flex-start !important;
            padding-top: 40px !important; padding-bottom: 56px !important;
          }
        }
      `}</style>
    </section>
  )
}