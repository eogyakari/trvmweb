import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import { getDict, localize } from '@/i18n/client'

export default function MissionContinues({ lang }: { lang: Locale }) {
  const dict = getDict(lang)
  const m = dict.missionContinues
  const L = (href: string) => localize(href, lang)

  // S-wave across a 1000x600 box: start left at y=230, dip and rise, end right at y=370
  const wave = 'M0,230 C 250,140 420,300 560,300 S 830,420 1000,360'
  // Closed path for the photo region (below the wave): wave line, then down the right, across the bottom, up the left
  const photoClip = 'M0,230 C 250,140 420,300 560,300 S 830,420 1000,360 L1000,600 L0,600 Z'

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)',
      minHeight: 'clamp(560px, 66vw, 760px)',
    }}>
      {/* SVG defines the photo clip + draws the gold wave line. Fills the whole section. */}
      <svg viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <defs>
          <clipPath id="mcWave" clipPathUnits="userSpaceOnUse">
            <path d={photoClip} />
          </clipPath>
          <pattern id="mcImg" patternUnits="userSpaceOnUse" width="1000" height="600">
            <image href="/mission-continues/mission-family.jpg" x="0" y="0" width="1000" height="600"
              preserveAspectRatio="xMidYMin slice" />
          </pattern>
        </defs>
        {/* Photo, clipped to below the wave */}
        <rect x="0" y="0" width="1000" height="600" fill="url(#mcImg)" clipPath="url(#mcWave)" />
        {/* subtle dark scrim over the photo bottom-left for depth (optional, light) */}
        <rect x="0" y="0" width="1000" height="600" clipPath="url(#mcWave)" fill="rgba(13,13,26,0.12)" />
        {/* The thin gold wavy line ON the divide */}
        <path d={wave} fill="none" stroke="#F5A623" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* Text — upper-left, above the wave */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1280, margin: '0 auto',
        padding: 'clamp(56px, 8vw, 96px) clamp(24px, 5vw, 64px) 0',
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
            fontStyle: 'italic', fontSize: 'clamp(20px, 3vw, 30px)', lineHeight: 1.3, margin: 0, marginBottom: 32,
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
    </section>
  )
}