import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import { getDict } from '@/i18n/client'

export default function CinematicHero({ lang }: { lang: Locale }) {
  const dict = getDict(lang)
  const h = dict.cinematicHero
  const L = (href: string) => `/${lang}${href}`

  return (
    <section style={{ position: 'relative', width: '100%', height: '100vh', minHeight: 560, overflow: 'hidden' }}>
      {/* Background photo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/hero-mission.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      {/* Cinematic wash: darker top (nav), darker bottom-left (text) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          linear-gradient(180deg, rgba(26,10,46,0.78) 0%, rgba(26,10,46,0.18) 32%, rgba(42,17,69,0.45) 72%, rgba(13,13,26,0.92) 100%),
          linear-gradient(90deg, rgba(26,10,46,0.72) 0%, rgba(42,17,69,0.12) 55%, transparent 100%)
        `,
      }} />

      {/* Content — lower-left */}
      <div className="cine-hero-inner" style={{
        position: 'relative', zIndex: 2, height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        maxWidth: 1280, margin: '0 auto', padding: '0 clamp(24px, 5vw, 64px) clamp(56px, 9vh, 110px)',
      }}>
        <p style={{
          color: '#F5A623', fontSize: 'clamp(12px, 1.6vw, 17px)', fontWeight: 700,
          letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 20,
        }}>
          {h.eyebrow}
        </p>

        <h1 style={{
          color: 'white', fontFamily: 'Georgia, serif', fontWeight: 400,
          fontSize: 'clamp(24px, 3.4vw, 44px)', lineHeight: 1.3, margin: 0, marginBottom: 40,
          maxWidth: 720, letterSpacing: '0.005em',
          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}>
          <span style={{ display: 'block' }}>{h.line1}</span>
          <span style={{ display: 'block', color: 'rgba(255,255,255,0.82)' }}>{h.line2}</span>
        </h1>

        <Link href={L('/programs/missions')} style={{
          alignSelf: 'flex-start',
          display: 'inline-flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#1A0A2E',
          padding: 'clamp(14px, 1.8vw, 18px) clamp(28px, 3.5vw, 44px)',
          borderRadius: 40, fontSize: 'clamp(13px, 1.5vw, 16px)', fontWeight: 800,
          letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
          fontFamily: 'Georgia, serif', boxShadow: '0 10px 40px rgba(245,166,35,0.35)',
        }}>
          {h.cta} <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Scroll hint */}
      <div aria-hidden className="cine-scroll" style={{
        position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)',
        zIndex: 2, color: 'rgba(255,255,255,0.5)', fontSize: 22,
      }}>↓</div>

      <style>{`
        @keyframes cineBounce { 0%,100%{ transform: translate(-50%,0);} 50%{ transform: translate(-50%,8px);} }
        .cine-scroll { animation: cineBounce 2s ease-in-out infinite; }
        @media (max-height: 620px) { .cine-scroll { display: none; } }
      `}</style>
    </section>
  )
}