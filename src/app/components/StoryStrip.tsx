'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Locale } from '@/i18n/config'
import { getDict } from '@/i18n/client'

const IMAGES = [
  '/story/story-ghana.jpg',
  '/story/story-liberia.jpg',
  '/story/story-indonesia.jpg',
  '/story/story-kenya.jpg',
]
const AUTO_MS = 5000

export default function StoryStrip({ lang }: { lang: Locale }) {
  const dict = getDict(lang)
  const s = dict.storyStrip
  // total frames = 4 country slides + 1 final text slide
  const total = s.slides.length + 1
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  const go = useCallback((n: number) => setI((n + total) % total), [total])
  const next = useCallback(() => setI(p => (p + 1) % total), [total])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, AUTO_MS)
    return () => clearInterval(t)
  }, [next, paused, i])

  const isFinal = i === s.slides.length

  return (
    <section
      style={{ background: '#0D0D1A', padding: 'clamp(64px, 9vw, 110px) 0 0' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Title above */}
      <div style={{ textAlign: 'center', padding: '0 24px', marginBottom: 'clamp(36px, 5vw, 56px)' }}>
        <h2 style={{
          color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 800,
          fontSize: 'clamp(28px, 5vw, 54px)', letterSpacing: '0.02em', lineHeight: 1.1, margin: 0,
        }}>
          {s.title}
        </h2>
      </div>

      {/* Photo strip */}
      <div style={{ position: 'relative', width: '100%', height: 'clamp(420px, 70vh, 680px)', overflow: 'hidden' }}>
        {/* Country image frames (cross-fade) */}
        {IMAGES.map((src, idx) => (
          <div key={src} aria-hidden={i !== idx} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: i === idx ? 1 : 0, transition: 'opacity 1s ease-in-out',
          }} />
        ))}
        {/* Final text slide background (deep gradient) */}
        <div aria-hidden={!isFinal} style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #1A0A2E 0%, #2A1145 50%, #0D0D1A 100%)',
          opacity: isFinal ? 1 : 0, transition: 'opacity 1s ease-in-out',
        }} />

        {/* Cinematic dark wash (over photos, for text legibility) */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(13,13,26,0.35) 0%, rgba(13,13,26,0.1) 40%, rgba(13,13,26,0.75) 100%)',
        }} />

        {/* Text overlay */}
        <div style={{
          position: 'relative', zIndex: 2, height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: isFinal ? 'center' : 'flex-start',
          textAlign: isFinal ? 'center' : 'left',
          maxWidth: 1200, margin: '0 auto', padding: '0 clamp(24px, 5vw, 64px) clamp(56px, 8vh, 90px)',
        }}>
          {isFinal ? (
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(22px, 3.5vw, 40px)', lineHeight: 1.25, margin: 0 }}>
                {s.finalHeadline}
              </h3>
              <p style={{ color: '#F5A623', fontFamily: 'Georgia, serif', fontWeight: 800, fontSize: 'clamp(30px, 5.5vw, 64px)', lineHeight: 1.1, margin: '10px 0 0' }}>
                {s.finalText}
              </p>
            </div>
          ) : (
            <div key={i}>
              <p style={{ color: '#F5A623', fontSize: 'clamp(12px, 1.6vw, 16px)', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 14 }}>
                {s.slides[i].country}
              </p>
              <h3 style={{ color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 800, fontSize: 'clamp(26px, 4.5vw, 52px)', lineHeight: 1.12, margin: 0, marginBottom: 14, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
                {s.slides[i].headline}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(15px, 2.2vw, 22px)', lineHeight: 1.6, margin: 0, maxWidth: 620, textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}>
                {s.slides[i].text}
              </p>
            </div>
          )}
        </div>

        {/* Arrows */}
        <button onClick={() => go(i - 1)} aria-label="Previous" style={arrowStyle('left')}>‹</button>
        <button onClick={() => go(i + 1)} aria-label="Next" style={arrowStyle('right')}>›</button>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', gap: 10 }}>
          {Array.from({ length: total }).map((_, idx) => (
            <button key={idx} onClick={() => go(idx)} aria-label={`Slide ${idx + 1}`} style={{
              width: i === idx ? 28 : 10, height: 10, borderRadius: 5, border: 'none', cursor: 'pointer',
              background: i === idx ? '#F5A623' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
    </section>
  )
}

function arrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: 16, zIndex: 3,
    width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
    background: 'rgba(0,0,0,0.35)', color: '#fff', fontSize: 28, lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  }
}