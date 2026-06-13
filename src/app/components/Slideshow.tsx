'use client'
import { useState, useEffect } from 'react'

type Slide = {
  id: string
  image_url: string
  caption: string | null
  sort_order: number
}

export default function Slideshow({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null

  return (
    <div style={{ position: 'relative', height: 520, overflow: 'hidden', background: '#0D0D1A' }}>
      {/* Slides */}
      {slides.map((slide, i) => (
        <div key={slide.id} style={{
          position: 'absolute', inset: 0,
          opacity: i === current ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
        }}>
          <img src={slide.image_url} alt={slide.caption || ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* Dark overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(13,13,26,0.7) 0%, rgba(13,13,26,0.2) 100%)'
          }} />
          {/* Caption */}
          {slide.caption && (
            <div style={{
              position: 'absolute', bottom: 60, left: 0, right: 0,
              textAlign: 'center', padding: '0 24px'
            }}>
              <p style={{
                color: 'white', fontSize: '1.1rem', fontStyle: 'italic',
                fontFamily: 'Georgia, serif', textShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}>
                {slide.caption}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Dots */}
      {slides.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 20, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 8
        }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? 24 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === current ? '#F5A623' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s', padding: 0
            }} />
          ))}
        </div>
      )}

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={() => setCurrent(prev => (prev - 1 + slides.length) % slides.length)}
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white',
              width: 40, height: 40, borderRadius: '50%', fontSize: 18,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>‹</button>
          <button onClick={() => setCurrent(prev => (prev + 1) % slides.length)}
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white',
              width: 40, height: 40, borderRadius: '50%', fontSize: 18,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>›</button>
        </>
      )}
    </div>
  )
}
