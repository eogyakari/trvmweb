'use client'
import { useState } from 'react'
import { getDict } from '@/i18n/client'
import type { Locale } from '@/i18n/config'

// Goes at: src/app/[lang]/videos/VideosClient.tsx
// Grid of the channel's latest videos with an in-page player (lightbox iframe),
// so viewers watch without leaving the site.

type Video = { id: string; title: string; published: string }

const dateLocales: Record<Locale, string> = { en: 'en-GB', id: 'id-ID', sw: 'sw-TZ' }

export default function VideosClient({
  lang, videos, channelId,
}: {
  lang: Locale
  videos: Video[]
  channelId: string
}) {
  const dict = getDict(lang)
  const v = dict.videosPage
  const dl = dateLocales[lang]
  const [playing, setPlaying] = useState<Video | null>(null)

  return (
    <div style={{ background: '#0D0D1A', padding: '56px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: 'white' }}>{v.latestVideos}</h2>
          {channelId && (
            <a href={`https://www.youtube.com/channel/${channelId}`} target="_blank" rel="noreferrer" style={{
              background: '#FF0000', color: 'white', padding: '9px 20px',
              borderRadius: 24, fontSize: 13, fontWeight: 700, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}>
              ▶ {v.watchOnYoutube}
            </a>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {videos.map(video => (
            <div key={video.id} onClick={() => setPlaying(video)} style={{
              background: 'linear-gradient(135deg, #1A0A2E, #16213E)',
              border: '1px solid rgba(123,47,190,0.3)',
              borderRadius: 14, overflow: 'hidden', cursor: 'pointer'
            }}>
              <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                <img
                  src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.15)'
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(255,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ color: 'white', fontSize: 24, marginLeft: 4 }}>▶</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <h3 style={{ color: 'white', fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 6,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {video.title}
                </h3>
                {video.published && (
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                    {new Date(video.published).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Player lightbox */}
      {playing && (
        <div
          onClick={() => setPlaying(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <button onClick={() => setPlaying(null)} style={{
            position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.12)',
            border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%',
            fontSize: 20, cursor: 'pointer', zIndex: 10
          }}>✕</button>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 960 }}>
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', borderRadius: 12, overflow: 'hidden' }}>
              <iframe
                src={`https://www.youtube.com/embed/${playing.id}?autoplay=1&rel=0`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
            <p style={{ color: 'white', fontSize: 15, fontWeight: 600, marginTop: 14, textAlign: 'center' }}>{playing.title}</p>
          </div>
        </div>
      )}
    </div>
  )
}