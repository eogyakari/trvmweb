'use client'
import { useState } from 'react'
import { getDict } from '@/i18n/client'
import type { Locale } from '@/i18n/config'

type Photo = {
  id: string
  image_url: string
  caption: string | null
  category: string
  created_at: string
}

// Canonical category values — these MUST stay in English because they are
// matched against `photo.category` stored in the database. Only the visible
// label is translated (see catLabel below).
const CATEGORIES = ['All', 'Missions', 'Care & Philanthropy', 'Discipleship', 'Events']

export default function GalleryClient({ lang, photos }: { lang: Locale; photos: Photo[] }) {
  const dict = getDict(lang)
  const gc = dict.galleryClient

  // Map a stored English category value to its translated display label.
  const catLabel = (value: string): string => {
    switch (value) {
      case 'All': return gc.all
      case 'Missions': return dict.programs.missions
      case 'Care & Philanthropy': return dict.programs.carePhilanthropy
      case 'Discipleship': return dict.programs.discipleship
      case 'Events': return gc.events
      default: return value
    }
  }

  const [activeCategory, setActiveCategory] = useState('All')
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const filtered = activeCategory === 'All'
    ? photos
    : photos.filter(p => p.category === activeCategory)

  function openLightbox(photo: Photo, index: number) {
    setLightbox(photo)
    setLightboxIndex(index)
  }

  function closeLightbox() {
    setLightbox(null)
  }

  function prevPhoto() {
    const newIndex = (lightboxIndex - 1 + filtered.length) % filtered.length
    setLightbox(filtered[newIndex])
    setLightboxIndex(newIndex)
  }

  function nextPhoto() {
    const newIndex = (lightboxIndex + 1) % filtered.length
    setLightbox(filtered[newIndex])
    setLightboxIndex(newIndex)
  }

  return (
    <div style={{ background: '#0D0D1A', minHeight: '60vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Category filter tabs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '9px 22px', borderRadius: 24, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Georgia, serif', border: 'none',
              background: activeCategory === cat ? '#F5A623' : 'rgba(255,255,255,0.08)',
              color: activeCategory === cat ? '#0D0D1A' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s'
            }}>
              {catLabel(cat)}
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                ({cat === 'All' ? photos.length : photos.filter(p => p.category === cat).length})
              </span>
            </button>
          ))}
        </div>

        {/* Photo grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🖼️</div>
            <p style={{ fontSize: '1.05rem' }}>{gc.noPhotos}</p>
          </div>
        ) : (
          <div style={{
            columns: '4 220px',
            gap: 12,
          }}>
            {filtered.map((photo, index) => (
              <div key={photo.id} onClick={() => openLightbox(photo, index)}
                style={{
                  breakInside: 'avoid', marginBottom: 12,
                  cursor: 'pointer', borderRadius: 8, overflow: 'hidden',
                  position: 'relative', border: '1px solid rgba(123,47,190,0.2)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                <img src={photo.image_url} alt={photo.caption || ''}
                  style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                {photo.caption && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                    padding: '20px 12px 10px',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }} className="caption-overlay">
                    <p style={{ color: 'white', fontSize: 12, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                      {photo.caption}
                    </p>
                  </div>
                )}
                {/* Category tag */}
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: 'rgba(245,166,35,0.85)', color: '#0D0D1A',
                  padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {catLabel(photo.category)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
            zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20
          }}
        >
          {/* Close button */}
          <button onClick={closeLightbox} style={{
            position: 'absolute', top: 20, right: 20,
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: 'white', width: 44, height: 44, borderRadius: '50%',
            fontSize: 20, cursor: 'pointer', zIndex: 10
          }}>✕</button>

          {/* Prev arrow */}
          {filtered.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prevPhoto() }} style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'white', width: 48, height: 48, borderRadius: '50%',
              fontSize: 24, cursor: 'pointer', zIndex: 10
            }}>‹</button>
          )}

          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', textAlign: 'center' }}>
            <img src={lightbox.image_url} alt={lightbox.caption || ''}
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }} />
            {lightbox.caption && (
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 16, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                {lightbox.caption}
              </p>
            )}
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8 }}>
              {lightboxIndex + 1} / {filtered.length}
            </p>
          </div>

          {/* Next arrow */}
          {filtered.length > 1 && (
            <button onClick={e => { e.stopPropagation(); nextPhoto() }} style={{
              position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'white', width: 48, height: 48, borderRadius: '50%',
              fontSize: 24, cursor: 'pointer', zIndex: 10
            }}>›</button>
          )}
        </div>
      )}

      <style>{`
        div:hover .caption-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  )
}