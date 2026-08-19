import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import { getDict, localize } from '@/i18n/client'

export default function WelcomeSection({ lang }: { lang: Locale }) {
  const dict = getDict(lang)
  const w = dict.welcomeSection
  const L = (href: string) => localize(href, lang)

  return (
    <section style={{ background: '#ffffff', padding: 'clamp(64px, 9vw, 120px) 0', overflow: 'hidden' }}>
      {/* Top eyebrow, centered */}
      <p style={{
        textAlign: 'center', color: '#7B2FBE', fontSize: 'clamp(12px, 1.6vw, 15px)',
        fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
        marginBottom: 'clamp(40px, 6vw, 64px)', padding: '0 24px',
      }}>
        {w.eyebrow}
      </p>

      {/* 3-column: left collage | center text | right photo */}
      <div className="welcome-grid" style={{
        display: 'grid', alignItems: 'center', gap: 'clamp(24px, 4vw, 56px)',
        maxWidth: 1320, margin: '0 auto', padding: '0 clamp(20px, 4vw, 48px)',
      }}>
        {/* LEFT collage */}
        <div style={{ position: 'relative', minHeight: 340 }}>
          <div style={{
            width: '78%', aspectRatio: '4/5', borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          }}>
            <img src="/welcome/welcome-left-rect.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {/* overlapping square */}
          <div style={{
            position: 'absolute', bottom: -18, right: 0, width: '48%', aspectRatio: '1/1',
            borderRadius: 14, overflow: 'hidden', border: '5px solid #fff',
            boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
          }}>
            <img src="/welcome/welcome-square.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>

        {/* CENTER text */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <h2 style={{
            color: '#1A0A2E', fontFamily: 'var(--font-playfair), Georgia, serif',
            fontWeight: 800, fontSize: 'clamp(26px, 3.4vw, 40px)', lineHeight: 1.2,
            marginBottom: 20,
          }}>
            {w.title}
          </h2>
          <p style={{
            color: '#55506a', fontSize: 'clamp(15px, 1.9vw, 18px)', lineHeight: 1.75,
            marginBottom: 34, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto',
          }}>
            {w.text}
          </p>
          <Link href={L('/discipleship')} style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#1A0A2E',
            padding: '15px 40px', borderRadius: 40, fontSize: 15, fontWeight: 800,
            letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
            fontFamily: 'Georgia, serif', boxShadow: '0 12px 34px rgba(245,166,35,0.4)',
          }}>
            {w.cta}
          </Link>
        </div>

        {/* RIGHT photo */}
        <div style={{
          aspectRatio: '4/5', borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        }}>
          <img src="/welcome/welcome-right-rect.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      <style>{`
        .welcome-grid { grid-template-columns: 1fr 1.15fr 1fr; }
        @media (max-width: 900px) {
          .welcome-grid { grid-template-columns: 1fr; gap: 48px; }
          .welcome-grid > div:first-child { max-width: 420px; margin: 0 auto; width: 100%; }
          .welcome-grid > div:last-child { max-width: 420px; margin: 0 auto; width: 100%; }
        }
      `}</style>
    </section>
  )
}