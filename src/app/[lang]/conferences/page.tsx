import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

export const revalidate = 60

const dateLocales: Record<Locale, string> = { en: 'en-GB', id: 'id-ID', sw: 'sw-TZ' }

type Tr = { event_id: string; locale: string; title: string | null; description: string | null }
type EventRow = {
  id: string; title: string; slug: string; type: string; description: string | null
  cover_image: string | null; start_at: string | null; end_at: string | null
  location: string | null; is_online: boolean; is_featured: boolean
  event_translations?: Tr[] | null
}

function pick(e: EventRow, lang: Locale) {
  if (lang === 'en') return { title: e.title, description: e.description }
  const t = (e.event_translations || []).find(x => x.locale === lang)
  return { title: t?.title || e.title, description: t?.description || e.description }
}

function status(e: EventRow): 'live' | 'upcoming' | 'past' {
  const now = Date.now()
  const s = e.start_at ? new Date(e.start_at).getTime() : 0
  const en = e.end_at ? new Date(e.end_at).getTime() : s + 2 * 3600 * 1000
  if (now >= s && now <= en) return 'live'
  if (now < s) return 'upcoming'
  return 'past'
}

export default async function ConferencesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const c = dict.conferencesPage
  const dl = dateLocales[lang]
  const L = (href: string) => `/${lang}${href}`

  const { data } = await supabase
    .from('events')
    .select('*, event_translations(event_id, locale, title, description)')
    .eq('is_published', true)
    .order('start_at', { ascending: false })

  const all = (data || []) as EventRow[]
  const live = all.filter(e => status(e) === 'live')
  const upcoming = all.filter(e => status(e) === 'upcoming')
    .sort((a, b) => new Date(a.start_at || 0).getTime() - new Date(b.start_at || 0).getTime())
  const past = all.filter(e => status(e) === 'past')

  function Card({ e }: { e: EventRow }) {
    const t = pick(e, lang)
    const st = status(e)
    return (
      <Link href={L(`/conferences/${e.slug}`)} className="cf-card" style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{ aspectRatio: '16/10', borderRadius: 12, overflow: 'hidden', marginBottom: 16, background: 'linear-gradient(135deg, #1A0A2E, #2A1145)', position: 'relative' }}>
          {e.cover_image
            ? <img src={e.cover_image} alt={t.title} className="cf-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'rgba(255,255,255,0.2)' }}>✝</div>}
          {st === 'live' && (
            <span style={{ position: 'absolute', top: 12, left: 12, background: '#e53e3e', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 1, padding: '4px 10px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'inline-block' }} /> {c.liveNow}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#1A0A2E', background: '#F5A623', padding: '2px 8px', borderRadius: 4 }}>
            {e.type === 'meeting' ? c.meeting : c.conference}
          </span>
          <span style={{ fontSize: 11, color: '#9B59B6', letterSpacing: 2, textTransform: 'uppercase' }}>
            {e.start_at ? new Date(e.start_at).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(19px, 2.4vw, 24px)', fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.25 }}>{t.title}</h3>
        {t.description && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>{t.description.slice(0, 110)}{t.description.length > 110 ? '…' : ''}</p>}
        <span style={{ color: '#F5A623', fontSize: 13, fontWeight: 700 }}>{c.viewDetails} →</span>
      </Link>
    )
  }

  function Section({ title, items }: { title: string; items: EventRow[] }) {
    if (items.length === 0) return null
    return (
      <section style={{ marginBottom: 'clamp(48px, 7vw, 80px)' }}>
        <p style={{ color: '#F5A623', fontSize: 'clamp(13px, 1.8vw, 16px)', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'clamp(24px, 3vw, 36px)' }}>{title}</p>
        <div className="cf-grid" style={{ display: 'grid', gap: 'clamp(28px, 4vw, 44px)' }}>
          {items.map(e => <Card key={e.id} e={e} />)}
        </div>
      </section>
    )
  }

  return (
    <div style={{ background: '#0D0D1A', minHeight: '100vh' }}>
      <header style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2A1145 100%)', padding: 'calc(72px + clamp(56px, 9vw, 100px)) 24px clamp(56px, 8vw, 90px)', textAlign: 'center' }}>
        <p style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 18 }}>✝ {c.eyebrow}</p>
        <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(34px, 6vw, 60px)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 20 }}>{c.title}</h1>
        <div style={{ width: 56, height: 2, background: '#F5A623', margin: '0 auto 22px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(15px, 2vw, 18px)', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.6 }}>{c.subtitle}</p>
      </header>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(56px, 8vw, 90px) 24px' }}>
        {all.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontStyle: 'italic', padding: '60px 0' }}>{c.none}</p>
        ) : (
          <>
            <Section title={c.live} items={live} />
            <Section title={c.upcoming} items={upcoming} />
            <Section title={c.past} items={past} />
          </>
        )}
      </div>

      <style>{`
        .cf-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 900px) { .cf-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .cf-grid { grid-template-columns: 1fr; } }
        .cf-card:hover .cf-img { transform: scale(1.05); }
      `}</style>
    </div>
  )
}