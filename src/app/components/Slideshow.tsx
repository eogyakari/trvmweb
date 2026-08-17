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
  const [prev, setPrev] = useState<number | null>(null)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setPrev(current)
      setCurrent(c => (c + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [current, slides.length])

  if (slides.length === 0) return null

  return (
    <div className="trvm-slideshow" style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#0D0D1A' }}>
      {/* Previous slide fading out */}
      {prev !== null && (
        <div key={`prev-${prev}`} style={{
          position: 'absolute', inset: 0,
          animation: 'fadeOut 1.2s ease-in-out forwards',
        }}>
          <img
            src={slides[prev].image_url}
            alt={slides[prev].caption || ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition:'center', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,26,0.75) 0%, rgba(13,13,26,0.1) 60%)' }} />
        </div>
      )}

      {/* Current slide fading in with zoom */}
      <div key={`curr-${current}`} style={{
        position: 'absolute', inset: 0,
        animation: 'fadeInZoom 1.2s ease-in-out forwards',
      }}>
        <img
          src={slides[current].image_url}
          alt={slides[current].caption || ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,26,0.75) 0%, rgba(13,13,26,0.1) 60%)' }} />

        {/* Caption */}
        {slides[current].caption && (
          <div className="trvm-slide-caption" style={{
            position: 'absolute', bottom: 56, left: 0, right: 0,
            textAlign: 'center', padding: '0 40px',
            animation: 'captionUp 1.4s ease-out forwards',
          }}>
            <p style={{
              color: 'white', fontSize: '1.05rem', fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
              maxWidth: 700, margin: '0 auto'
            }}>
              {slides[current].caption}
            </p>
          </div>
        )}
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 20, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 8, zIndex: 10
        }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => { setPrev(current); setCurrent(i) }} style={{
              width: i === current ? 28 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === current ? '#F5A623' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.4s', padding: 0
            }} />
          ))}
        </div>
      )}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={() => { setPrev(current); setCurrent(c => (c - 1 + slides.length) % slides.length) }}
            style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', width: 44, height: 44, borderRadius: '50%',
              fontSize: 20, cursor: 'pointer', zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s'
            }}>‹</button>
          <button onClick={() => { setPrev(current); setCurrent(c => (c + 1) % slides.length) }}
            style={{
              position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', width: 44, height: 44, borderRadius: '50%',
              fontSize: 20, cursor: 'pointer', zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s'
            }}>›</button>
        </>
      )}

      <style>{`
        /* Portrait phones: 'contain' shows the whole image resized to fit,
           with the dark container as slim framing. 16/9 keeps bars minimal. */
         .trvm-slideshow { aspect-ratio: 16 / 9; max-height: 620px; }
        @media (max-width: 900px) { .trvm-slideshow { aspect-ratio: 16 / 9; } }
        @media (max-width: 600px) {
          .trvm-slideshow { aspect-ratio: 16 / 9; }
          .trvm-slide-caption { bottom: 40px !important; padding: 0 20px !important; }
          .trvm-slide-caption p { font-size: 0.9rem !important; }
        }

        @keyframes fadeInZoom {
          0% { opacity: 0; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes captionUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}