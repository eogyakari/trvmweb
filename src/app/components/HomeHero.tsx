import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import { getDict } from '@/i18n/client'

export default function HomeHero({ lang }: { lang: Locale }) {
  const dict = getDict(lang)
  const h = dict.homeHero
  const L = (href: string) => `/${lang}${href}`

  return (
    <section style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {/* Background photo */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/hero-worship.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      />
      {/* Purple wash — lighter top, deep at bottom for text + wave */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(26,10,46,0.45) 0%, rgba(26,10,46,0.65) 55%, rgba(13,13,26,0.95) 100%)',
      }} />
      {/* soft center glow */}
      <div style={{
        position: 'absolute', top: '42%', left: '50%', width: 900, height: 560,
        transform: 'translate(-50%,-50%)',
        background: 'radial-gradient(ellipse, rgba(123,47,190,0.25) 0%, transparent 70%)',
      }} />

      {/* Content */}
      <div className="home-hero-inner" style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 24px',
      }}>
        <p style={{
          color: '#F5A623', fontSize: 'clamp(11px, 1.5vw, 15px)', fontWeight: 700,
          letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 18,
        }}>
          {h.eyebrow}
        </p>

        <h1 style={{ margin: 0, lineHeight: 1, marginBottom: 32 }}>
          <span style={{
            display: 'block', fontFamily: 'Georgia, serif', fontStyle: 'italic',
            fontWeight: 400, color: 'rgba(255,255,255,0.92)',
            fontSize: 'clamp(28px, 5vw, 58px)', marginBottom: 6,
          }}>
            {h.line1}
          </span>
          <span style={{
            display: 'block', fontFamily: 'Georgia, serif', fontWeight: 800,
            color: 'white', letterSpacing: '0.02em',
            fontSize: 'clamp(56px, 12vw, 150px)',
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}>
            {h.line2}
          </span>
        </h1>

        <Link href={L('/membership')} style={{
          background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#1A0A2E',
          padding: '16px 44px', borderRadius: 40, fontSize: 'clamp(13px, 1.6vw, 16px)',
          fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
          textDecoration: 'none', fontFamily: 'Georgia, serif',
          boxShadow: '0 8px 30px rgba(245,166,35,0.35)',
        }}>
          {h.cta}
        </Link>
      </div>

      {/* Wave divider into the next (dark) section */}
      <div style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', lineHeight: 0, zIndex: 3 }}>
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ width: '100%', height: 80, display: 'block' }}>
          <path d="M0,40 C360,110 1080,-20 1440,40 L1440,100 L0,100 Z" fill="#0D0D1A" />
        </svg>
      </div>

      <style>{`
        .home-hero-inner { min-height: 640px; }
        @media (max-width: 768px) { .home-hero-inner { min-height: 520px; } }
        @media (max-width: 480px) { .home-hero-inner { min-height: 460px; } }
      `}</style>
    </section>
  )
}