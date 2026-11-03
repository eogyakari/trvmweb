import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'
import type { Metadata } from 'next'

export const revalidate = 60

const dateLocales: Record<Locale, string> = { en: 'en-GB', id: 'id-ID', sw: 'sw-TZ' }

type EventRow = {
  id: string; title: string; slug: string; type: string; description: string | null
  cover_image: string | null; start_at: string | null; end_at: string | null
  location: string | null; is_online: boolean
  registration_type: string; price: number; currency: string
  youtube_video_id: string | null; zoom_join_url: string | null; recording_url: string | null
}

async function getEvent(slug: string, lang: Locale) {
  const { data } = await supabase.from('events').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()
  if (!data) return null
  const row = data as EventRow
  let picked = { title: row.title, description: row.description }
  if (lang !== 'en') {
    const { data: tr } = await supabase.from('event_translations').select('title, description').eq('event_id', row.id).eq('locale', lang).maybeSingle()
    if (tr) picked = { title: (tr.title as string) || row.title, description: (tr.description as string) || row.description }
  }
  return { row, picked }
}

function status(row: EventRow): 'live' | 'upcoming' | 'past' {
  const now = Date.now()
  const s = row.start_at ? new Date(row.start_at).getTime() : 0
  const en = row.end_at ? new Date(row.end_at).getTime() : s + 2 * 3600 * 1000
  if (now >= s && now <= en) return 'live'
  if (now < s) return 'upcoming'
  return 'past'
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: rawLang, slug } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const ev = await getEvent(slug, lang)
  if (!ev) return { title: 'Conferences — TRVM' }
  return { title: `${ev.picked.title} — TRVM` }
}

export default async function ConferenceDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: rawLang, slug } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const c = dict.conferencesPage
  const dl = dateLocales[lang]
  const L = (href: string) => `/${lang}${href}`

  const ev = await getEvent(slug, lang)
  if (!ev) {
    return (
      <div style={{ background: '#0D0D1A', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>{c.none}</p>
          <Link href={L('/conferences')} style={{ color: '#F5A623', fontWeight: 600 }}>{c.back}</Link>
        </div>
      </div>
    )
  }

  const { row, picked } = ev
  const st = status(row)
  const yt = row.youtube_video_id
  const showLive = st === 'live' && yt
  const showRecording = st === 'past' && yt
  const showJoin = row.type === 'meeting' && row.zoom_join_url && (st === 'live' || st === 'upcoming')

  const dateStr = row.start_at
    ? new Date(row.start_at).toLocaleDateString(dl, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  const timeStr = row.start_at
    ? new Date(row.start_at).toLocaleTimeString(dl, { hour: '2-digit', minute: '2-digit' })
    : ''

  const pill: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#1A0A2E',
    padding: '15px 40px', borderRadius: 40, fontSize: 15, fontWeight: 800,
    letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
    fontFamily: 'Georgia, serif', boxShadow: '0 12px 34px rgba(245,166,35,0.35)',
  }

  return (
    <div style={{ background: '#0D0D1A' }}>
      {/* Hero */}
      {row.cover_image ? (
        <div style={{ position: 'relative', minHeight: 'clamp(360px, 52vh, 520px)', overflow: 'hidden' }}>
          <img src={row.cover_image} alt={picked.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0D0D1A 3%, rgba(13,13,26,0.45) 55%, rgba(26,10,46,0.55) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(40px, 6vw, 72px) 24px clamp(36px, 4vw, 52px)' }}>
            <div style={{ maxWidth: 820, margin: '0 auto' }}>
              <Link href={L('/conferences')} style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.back}</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 10px' }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#1A0A2E', background: '#F5A623', padding: '3px 10px', borderRadius: 5 }}>{row.type === 'meeting' ? c.meeting : c.conference}</span>
                {st === 'live' && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: '#fff', background: '#e53e3e', padding: '3px 10px', borderRadius: 5 }}>{c.liveNow}</span>}
              </div>
              <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(30px, 5.5vw, 56px)', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>{picked.title}</h1>
            </div>
          </div>
        </div>
      ) : (
        <header style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2A1145 100%)', padding: 'calc(72px + clamp(40px, 7vw, 80px)) 24px clamp(40px, 5vw, 64px)', textAlign: 'center' }}>
          <Link href={L('/conferences')} style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'block', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.back}</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(30px, 5.5vw, 56px)', fontWeight: 800, color: 'white', maxWidth: 820, margin: '0 auto', lineHeight: 1.1 }}>{picked.title}</h1>
        </header>
      )}

      <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(48px, 7vw, 80px) 24px clamp(64px, 9vw, 100px)' }}>
        {/* Live / Recording embed */}
        {(showLive || showRecording) && (
          <div style={{ marginBottom: 44 }}>
            <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>
              {showLive ? c.watchLive : c.watchRecording}
            </p>
            <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${yt}`}
                title={picked.title}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* When / Where */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
          <div style={{ borderTop: '2px solid rgba(245,166,35,0.4)', paddingTop: 16 }}>
            <p style={{ color: '#F5A623', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>{c.when}</p>
            <p style={{ color: '#fff', fontSize: 16, fontFamily: 'var(--font-playfair), Georgia, serif' }}>{dateStr}</p>
            {timeStr && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>{timeStr}</p>}
          </div>
          <div style={{ borderTop: '2px solid rgba(245,166,35,0.4)', paddingTop: 16 }}>
            <p style={{ color: '#F5A623', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>{c.where}</p>
            <p style={{ color: '#fff', fontSize: 16, fontFamily: 'var(--font-playfair), Georgia, serif' }}>{row.is_online ? c.online : (row.location || c.online)}</p>
            {row.location && row.is_online && row.location !== c.online && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>{row.location}</p>}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
          {showJoin && <a href={row.zoom_join_url!} target="_blank" rel="noreferrer" style={pill}>{c.join} →</a>}
          {row.registration_type !== 'none' && st !== 'past' && (
            <Link href={L('/contact')} style={{ ...pill, background: 'transparent', color: '#F5A623', border: '2px solid #F5A623', boxShadow: 'none' }}>{c.register} →</Link>
          )}
        </div>

        {/* About */}
        {picked.description && (
          <section>
            <div style={{ width: 56, height: 2, background: '#F5A623', marginBottom: 28 }} />
            <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 18 }}>{c.about}</p>
            {picked.description.split('\n\n').map((para, i) => (
              <p key={i} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.9, marginBottom: 16, fontFamily: 'Georgia, serif' }}>{para}</p>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}