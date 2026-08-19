import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Devotion } from '@/lib/types'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

export const revalidate = 60

type TrRow = { locale: string; title: string | null; body: string | null }
type DevotionRow = Devotion & { devotion_translations?: TrRow[] | null }

async function getDevotions(): Promise<DevotionRow[]> {
  const { data } = await supabase
    .from('devotions')
    .select('*, devotion_translations(locale, title, body)')
    .order('date', { ascending: false })
  return (data || []) as unknown as DevotionRow[]
}

function pick(d: DevotionRow, lang: string) {
  const list = d.devotion_translations || []
  const match = list.find((t) => t.locale === lang) || list.find((t) => t.locale === 'en')
  return { title: match?.title || d.title, content: match?.body || d.content }
}

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

export default async function DevotionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const t = dict.devotionsPage
  const dl = dateLocales[lang]
  const devotions = await getDevotions()

  return (
    <div style={{ background: '#0D0D1A', minHeight: '100vh' }}>
      {/* Header — editorial, clears the fixed nav via top padding */}
      <header style={{
        background: 'linear-gradient(135deg, #1A0A2E 0%, #2A1145 100%)',
        padding: 'calc(72px + clamp(56px, 9vw, 100px)) 24px clamp(56px, 8vw, 90px)',
        textAlign: 'center',
      }}>
        <p style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 18 }}>
          ✝ {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(34px, 6vw, 60px)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 20 }}>
          {t.title}
        </h1>
        <div style={{ width: 56, height: 2, background: '#F5A623', margin: '0 auto 22px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(15px, 2vw, 18px)', maxWidth: 540, margin: '0 auto', fontStyle: 'italic', fontFamily: 'var(--font-playfair), Georgia, serif', lineHeight: 1.6 }}>
          {t.subtitle}
        </p>
      </header>

      <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(56px, 8vw, 90px) 24px' }}>
        {devotions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📖</div>
            <p style={{ fontSize: '1.1rem' }}>{t.comingSoon}</p>
          </div>
        ) : (
          <>
            {/* Featured — latest devotion, image-forward editorial */}
            <p style={{ fontSize: 12, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 24 }}>
              {t.latest}
            </p>
            {(() => {
              const first = devotions[0]
              const ft = pick(first, lang)
              return (
                <Link href={`/${lang}/devotions/${first.slug}`} className="dev-featured" style={{ display: 'grid', gap: 'clamp(24px, 4vw, 48px)', textDecoration: 'none', marginBottom: 'clamp(56px, 8vw, 90px)', alignItems: 'center' }}>
                  {first.cover_image && (
                    <div style={{ aspectRatio: '16/11', borderRadius: 12, overflow: 'hidden' }}>
                      <img src={first.cover_image} alt={ft.title} className="dev-feat-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} />
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: 12, color: '#9B59B6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 14 }}>
                      {new Date(first.date).toLocaleDateString(dl, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(24px, 3.4vw, 38px)', fontWeight: 800, color: 'white', marginBottom: 18, lineHeight: 1.2 }}>
                      {ft.title}
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.9, marginBottom: 18 }}>
                      {stripHtml(ft.content).substring(0, 220)}...
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>{t.by} {first.author}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#F5A623', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '2px solid #F5A623', paddingBottom: 4 }}>
                      {t.readDevotion} →
                    </span>
                  </div>
                </Link>
              )
            })()}

            {/* Previous — de-boxed grid with gold top-rules */}
            {devotions.length > 1 && (
              <>
                <p style={{ fontSize: 12, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 28 }}>
                  {t.previous}
                </p>
                <div className="dev-grid" style={{ display: 'grid', gap: 'clamp(32px, 4vw, 48px)' }}>
                  {devotions.slice(1).map(d => {
                    const dt = pick(d, lang)
                    return (
                      <Link key={d.id} href={`/${lang}/devotions/${d.slug}`} className="dev-item" style={{ display: 'block', textDecoration: 'none', borderTop: '2px solid rgba(245,166,35,0.35)', paddingTop: 22 }}>
                        {d.cover_image && (
                          <div style={{ aspectRatio: '16/10', borderRadius: 10, overflow: 'hidden', marginBottom: 18 }}>
                            <img src={d.cover_image} alt={dt.title} className="dev-item-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }} />
                          </div>
                        )}
                        <p style={{ fontSize: 11, color: '#9B59B6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                          {new Date(d.date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(18px, 2.2vw, 22px)', fontWeight: 700, color: 'white', marginBottom: 12, lineHeight: 1.3 }}>
                          {dt.title}
                        </h3>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 14 }}>
                          {stripHtml(dt.content).substring(0, 110)}...
                        </p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>{t.by} {d.author}</p>
                        <span className="dev-more" style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                          {dict.common.readMore} <span className="dev-arrow" style={{ transition: 'transform 0.2s' }}>→</span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </section>

      <style>{`
        .dev-featured { grid-template-columns: 1.1fr 1fr; }
        .dev-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 820px) { .dev-featured { grid-template-columns: 1fr; } .dev-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 540px) { .dev-grid { grid-template-columns: 1fr; } }
        .dev-featured:hover .dev-feat-img { transform: scale(1.04); }
        .dev-item:hover .dev-item-img { transform: scale(1.05); }
        .dev-item:hover .dev-arrow { transform: translateX(5px); }
        .dev-item { transition: border-color 0.2s; }
        .dev-item:hover { border-top-color: #F5A623; }
      `}</style>
    </div>
  )
}