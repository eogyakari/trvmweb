import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'
import VideosClient from './VideosClient'

// Goes at: src/app/[lang]/videos/page.tsx
// Reads the channel id from site_settings ('youtube_channel_id'), pulls the
// channel's public RSS feed (latest ~15 uploads, no API key needed), and shows
// them. Falls back to the "Coming Soon" state when no channel id is set.
export const revalidate = 3600 // refresh hourly

type Video = { id: string; title: string; published: string }

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
}

async function getChannelId(): Promise<string> {
  const { data } = await supabase
    .from('site_settings').select('value').eq('key', 'youtube_channel_id').maybeSingle()
  return ((data?.value as string) || '').trim()
}

async function getVideos(channelId: string): Promise<Video[]> {
  if (!channelId) return []
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const xml = await res.text()
    const entries = xml.split('<entry>').slice(1)
    const vids: Video[] = []
    for (const e of entries) {
      const id = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]
      const title = e.match(/<title>([^<]*)<\/title>/)?.[1]
      const published = e.match(/<published>([^<]+)<\/published>/)?.[1]
      if (id && title) vids.push({ id, title: decodeEntities(title), published: published || '' })
    }
    return vids
  } catch {
    return []
  }
}

export default async function VideosPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const v = dict.videosPage

  const channelId = await getChannelId()
  const videos = await getVideos(channelId)

  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)',
        padding: '72px 24px', textAlign: 'center'
      }}>
        <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>✝ {v.eyebrow}</p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>{dict.nav.videos}</h1>
        <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.8 }}>
          {v.subtitle}
        </p>
      </div>

      {videos.length > 0 ? (
        <VideosClient lang={lang} videos={videos} channelId={channelId} />
      ) : (
        // Coming Soon fallback (no channel id set, or feed unavailable)
        <div style={{ background: '#0D0D1A', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 500 }}>
            <div style={{ fontSize: 72, marginBottom: 24 }}>🎬</div>
            <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.8rem', marginBottom: 16 }}>{v.comingSoon}</h2>
            <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 24px' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, fontSize: '1rem', marginBottom: 32 }}>{v.comingSoonText}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontStyle: 'italic' }}>&ldquo;{v.scripture}&rdquo; — {v.scriptureRef}</p>
          </div>
        </div>
      )}
    </>
  )
}