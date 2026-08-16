import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

export const revalidate = 60

const dateLocales: Record<Locale, string> = { en: 'en-GB', id: 'id-ID', sw: 'sw-TZ' }

export default async function FeaturedEventPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const e = dict.eventPage
  const dl = dateLocales[lang]

  const { data } = await supabase.from('featured_event').select('*').eq('is_active', true).limit(1).maybeSingle()

  if (!data) {
    return (
      <div style={{ background: '#0D0D1A', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>{e.none}</p>
      </div>
    )
  }

  const ev = data as any
  const dateRange = ev.start_date && ev.end_date
    ? `${new Date(ev.start_date).toLocaleDateString(dl, { day: 'numeric', month: 'long' })} – ${new Date(ev.end_date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}`
    : ev.duration_text || ''

  const asList = (s: string | null) => (s || '').split('\n').map(x => x.trim()).filter(Boolean)

  return (
    <>
      {/* Hero */}
      <div style={{ position: 'relative', minHeight: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '64px 24px', overflow: 'hidden' }}>
        {ev.cover_image && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${ev.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(26,10,46,0.85), rgba(42,17,69,0.9))' }} />
        <div style={{ position: 'relative', maxWidth: 760 }}>
          <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>✝ {e.eyebrow}</p>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>{ev.title}</h1>
          {ev.tagline && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', fontStyle: 'italic', lineHeight: 1.7 }}>{ev.tagline}</p>}
          {dateRange && (
            <div style={{ display: 'inline-block', marginTop: 22, background: '#F5A623', color: '#1A0A2E', padding: '10px 24px', borderRadius: 30, fontWeight: 800, fontSize: 14 }}>
              📅 {dateRange}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: '#0D0D1A', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
          {ev.overview && (
            <section>
              <h2 style={sectionH}>{e.overview}</h2>
              <p style={bodyText}>{ev.overview}</p>
            </section>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {(ev.duration_text || dateRange) && (
              <div style={card}><h3 style={cardH}>⏳ {e.duration}</h3><p style={cardBody}>{ev.duration_text || dateRange}</p></div>
            )}
            {ev.locations && (
              <div style={card}><h3 style={cardH}>📍 {e.locations}</h3><p style={cardBody}>{ev.locations}</p></div>
            )}
          </div>

          {asList(ev.activities).length > 0 && (
            <section>
              <h2 style={sectionH}>{e.activities}</h2>
              <ul style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 2, paddingLeft: 20 }}>
                {asList(ev.activities).map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </section>
          )}

          {asList(ev.partners).length > 0 && (
            <section>
              <h2 style={sectionH}>{e.partners}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {asList(ev.partners).map((p, i) => (
                  <span key={i} style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623', padding: '8px 18px', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>{p}</span>
                ))}
              </div>
            </section>
          )}

          {ev.extra_info && (
            <section>
              <h2 style={sectionH}>{e.moreInfo}</h2>
              <p style={bodyText}>{ev.extra_info}</p>
            </section>
          )}

          <div style={{ textAlign: 'center', paddingTop: 12 }}>
            <Link href={`/${lang}/contact`} style={{ background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#1A0A2E', padding: '15px 40px', borderRadius: 30, fontWeight: 800, fontSize: 15, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>
              {e.cta}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

const sectionH: React.CSSProperties = { color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 16, borderLeft: '4px solid #F5A623', paddingLeft: 14 }
const bodyText: React.CSSProperties = { color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: '1.02rem', whiteSpace: 'pre-wrap' }
const card: React.CSSProperties = { background: 'linear-gradient(135deg, #1A0A2E, #16213E)', border: '1px solid rgba(123,47,190,0.3)', borderRadius: 14, padding: 24 }
const cardH: React.CSSProperties = { color: '#F5A623', fontSize: 15, fontWeight: 700, marginBottom: 8 }
const cardBody: React.CSSProperties = { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.6 }