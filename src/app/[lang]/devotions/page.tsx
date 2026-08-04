import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Devotion } from '@/lib/types'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

export const revalidate = 60

// A devotion row plus whatever translation rows Supabase embeds for it.
type TrRow = { locale: string; title: string | null; body: string | null }
type DevotionRow = Devotion & { devotion_translations?: TrRow[] | null }

async function getDevotions(): Promise<DevotionRow[]> {
  const { data } = await supabase
    .from('devotions')
    .select('*, devotion_translations(locale, title, body)')
    .order('date', { ascending: false })
  return (data || []) as unknown as DevotionRow[]
}

// Pick the title/body for the requested language, falling back to the row's
// own English text when a translation is missing.
function pick(d: DevotionRow, lang: string) {
  const list = d.devotion_translations || []
  const match = list.find((t) => t.locale === lang) || list.find((t) => t.locale === 'en')
  return {
    title: match?.title || d.title,
    content: match?.body || d.content,
  }
}

// Plain-text preview from HTML content (list cards show a snippet, not markup).
function stripHtml(html: string): string {
  return (html || '')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ').trim()
}

const dateLocales: Record<Locale, string> = { en: 'en-GB', id: 'id-ID', sw: 'sw-TZ' }

export default async function DevotionsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const t = dict.devotionsPage
  const dl = dateLocales[lang]

  const devotions = await getDevotions()

  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2419 0%, #1a3a2a 100%)',
        padding: '64px 24px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#c9a84c', fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          ✝ {t.eyebrow}
        </p>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', marginBottom: 16 }}>
          {t.title}
        </h1>
        <div style={{ width: 50, height: 3, background: '#c9a84c', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 500, margin: '0 auto', fontStyle: 'italic' }}>
          {t.subtitle}
        </p>
      </div>

      {/* Content */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 20px' }}>
        {devotions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📖</div>
            <p style={{ fontSize: '1.1rem' }}>{t.comingSoon}</p>
          </div>
        ) : (
          <>
            {/* Featured — latest devotion */}
            <p style={{ fontSize: 12, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>
              {t.latest}
            </p>
            {(() => {
              const first = devotions[0]
              const ft = pick(first, lang)
              return (
                <Link href={`/${lang}/devotions/${first.slug}`} style={{
                  display: 'block',
                  background: 'white',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                  textDecoration: 'none',
                  border: '1px solid #ede8de',
                  marginBottom: 48
                }}>
                  {first.cover_image && (
                    <div style={{ height: 260, overflow: 'hidden' }}>
                      <img src={first.cover_image} alt={ft.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '28px 24px' }}>
                    <p style={{ fontSize: 12, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>
                      {new Date(first.date).toLocaleDateString(dl, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f2419', marginBottom: 14, lineHeight: 1.3 }}>
                      {ft.title}
                    </h2>
                    <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, marginBottom: 16 }}>
                      {stripHtml(ft.content).substring(0, 200)}...
                    </p>
                    <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>{t.by} {first.author}</p>
                    <span style={{
                      display: 'inline-block', background: '#c9a84c', color: '#0f2419',
                      padding: '11px 28px', borderRadius: 4, fontWeight: 700,
                      fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {t.readDevotion} →
                    </span>
                  </div>
                </Link>
              )
            })()}

            {/* Rest of devotions */}
            {devotions.length > 1 && (
              <>
                <p style={{ fontSize: 12, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20 }}>
                  {t.previous}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  {devotions.slice(1).map(d => {
                    const dt = pick(d, lang)
                    return (
                      <Link key={d.id} href={`/${lang}/devotions/${d.slug}`} style={{
                        background: 'white', borderRadius: 10, overflow: 'hidden',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.07)', textDecoration: 'none',
                        border: '1px solid #ede8de', display: 'block'
                      }}>
                        {d.cover_image && (
                          <div style={{ height: 180, overflow: 'hidden' }}>
                            <img src={d.cover_image} alt={dt.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ padding: '20px' }}>
                          <p style={{ fontSize: 11, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                            {new Date(d.date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f2419', marginBottom: 10, lineHeight: 1.4 }}>
                            {dt.title}
                          </h3>
                          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 14 }}>
                            {stripHtml(dt.content).substring(0, 110)}...
                          </p>
                          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 10 }}>{t.by} {d.author}</p>
                          <p style={{ color: '#c9a84c', fontSize: 13, fontWeight: 700 }}>{dict.common.readMore} →</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </>
  )
}