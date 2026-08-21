'use client'
import { useRef, useState, useEffect } from 'react'

export default function MissionCarousel({ country, count, label }: { country: string; count: number; label?: string }) {
  const scroller = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const photos = Array.from({ length: count }, (_, i) => `/missions/${country}/${country}-${i + 1}.jpg`)

  const update = () => {
    const el = scroller.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }
  useEffect(() => { update() }, [])

  const scrollBy = (dir: number) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'relative' }}>
      {label && <p style={{ color: '#F5A623', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>{label}</p>}
      <div
        ref={scroller}
        onScroll={update}
        className="mc-scroller"
        style={{
          display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory',
          paddingBottom: 12, scrollbarWidth: 'thin',
        }}
      >
        {photos.map((src, i) => (
          <div key={src} style={{
            flex: '0 0 auto', width: 'clamp(260px, 42vw, 440px)', aspectRatio: '4/3',
            scrollSnapAlign: 'start', borderRadius: 12, overflow: 'hidden',
            background: 'linear-gradient(135deg, #1A0A2E, #2A1145)', boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          }}>
            <img src={src} alt={`${country} ${i + 1}`} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button onClick={() => scrollBy(-1)} aria-label="Previous" disabled={!canLeft}
        style={arrow('left', canLeft)}>‹</button>
      <button onClick={() => scrollBy(1)} aria-label="Next" disabled={!canRight}
        style={arrow('right', canRight)}>›</button>

      <style>{`
        .mc-scroller::-webkit-scrollbar { height: 6px; }
        .mc-scroller::-webkit-scrollbar-thumb { background: rgba(245,166,35,0.4); border-radius: 3px; }
        .mc-scroller::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  )
}

function arrow(side: 'left' | 'right', enabled: boolean): React.CSSProperties {
  return {
    position: 'absolute', top: 'calc(50% - 12px)', transform: 'translateY(-50%)',
    [side]: -6, zIndex: 3, width: 44, height: 44, borderRadius: '50%', border: 'none',
    cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0.25,
    background: 'rgba(13,13,26,0.75)', color: '#F5A623', fontSize: 26, lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
    boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
  }
}