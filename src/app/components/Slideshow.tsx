'use client'

type Slide = {
  id: string
  image_url: string
  caption: string | null
  sort_order: number
}

export default function Slideshow({ slides }: { slides: Slide[] }) {
  if (slides.length === 0) return null

  // Duplicate slides for seamless loop
  const doubled = [...slides, ...slides]

  return (
    <div style={{ background: '#0D0D1A', padding: '40px 0', overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        {/* Track */}
        <div
          className="slideshow-track"
          style={{
            display: 'flex',
            gap: 16,
            width: 'max-content',
            animation: `scrollLeft ${slides.length * 4}s linear infinite`,
          }}
        >
          {doubled.map((slide, i) => (
            <div key={`${slide.id}-${i}`} style={{ flexShrink: 0, width: 220, textAlign: 'center' }}>
              <div style={{
                width: 220, height: 220,
                borderRadius: 12, overflow: 'hidden',
                border: '2px solid rgba(245, 166, 35, 0.3)',
              }}>
                <img
                  src={slide.image_url}
                  alt={slide.caption || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              {slide.caption && (
                <p style={{
                  color: 'rgba(255,255,255,0.65)', fontSize: 12,
                  marginTop: 10, fontStyle: 'italic',
                  fontFamily: 'Georgia, serif', lineHeight: 1.4,
                  maxWidth: 220
                }}>
                  {slide.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .slideshow-track {
          animation-play-state: running;
        }
        .slideshow-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}