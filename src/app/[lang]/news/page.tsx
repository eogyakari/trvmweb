import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

export const revalidate = 60

const dateLocales: Record<Locale, string> = { en: 'en-GB', id: 'id-ID', sw: 'sw-TZ' }

function stripHtml(html: string): string {
  return (html || '')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ').trim()
}

type Row = { id: string; title: string; slug: string; body: string; excerpt: string | null; cover_image: string | null; author: string; published_date: string; category: string }
type Tr = { news_id: string; locale: string; title: string | null; body: string | null; excerpt: string | null }

function pick(row: Row, trs: Tr[], lang: Locale) {
  if (lang === 'en') return { title: row.title, excerpt: row.excerpt, body: row.body }
  const t = trs.find(x => x.news_id === row.id && x.locale === lang)
  return { title: t?.title || row.title, excerpt: t?.excerpt || row.excerpt, body: t?.body || row.body }
}

export default async function NewsPage({
  params, searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { lang: rawLang } = await params
  const { type } = await searchParams
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const v = dict.newsPage
  const dl = dateLocales[lang]
  const L = (href: string) => `/${lang}${href}`

  const activeType = type === 'press' || type === 'news' ? type : 'all'

  let query = supabase.from('news').select('*').eq('is_published', true)
  if (activeType !== 'all') query = query.eq('category', activeType)
  const { data: news } = await query.order('published_date', { ascending: false })

  const rows = (news || []) as Row[]
  let trs: Tr[] = []
  if (lang !== 'en' && rows.length) {
    const { data } = await supabase
      .from('news_translations').select('news_id, locale, title, body, excerpt')
      .in('news_id', rows.map(r => r.id)).eq('locale', lang)
    trs = (data || []) as Tr[]
  }

  const tabs = [
    { key: 'all', label: v.filterAll, href: L('/news') },
    { key: 'news', label: v.filterNews, href: L('/news?type=news') },
    { key: 'press', label: v.filterPress, href: L('/news?type=press') },
  ]

  return (
    <div style={{ background: '#0D0D1A', minHeight: '100vh' }}>
      {/* Header — editorial, clears the fixed nav */}
      <header style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2A1145 100%)', padding: 'calc(72px + clamp(48px, 8vw, 90px)) 24px clamp(48px, 7vw, 80px)', textAlign: 'center' }}>
        <p style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 18 }}>✝ {v.eyebrow}</p>
        <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(34px, 6vw, 60px)', fontWeight: 800, color: 'white', marginBottom: 20, lineHeight: 1.1 }}>{v.title}</h1>
        <div style={{ width: 56, height: 2, background: '#F5A623', margin: '0 auto 22px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(15px, 2vw, 18px)', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.6 }}>{v.subtitle}</p>
      </header>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(48px, 7vw, 80px) 24px' }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 'clamp(36px, 5vw, 56px)', flexWrap: 'wrap' }}>
          {tabs.map(t => {
            const active = activeType === t.key
            return (
              <Link key={t.key} href={t.href} style={{
                padding: '8px 22px', borderRadius: 22, fontSize: 13, fontWeight: 700,
                textDecoration: 'none', fontFamily: 'Georgia, serif',
                background: active ? '#F5A623' : 'transparent',
                color: active ? '#1A0A2E' : 'rgba(255,255,255,0.7)',
                border: active ? 'none' : '1px solid rgba(255,255,255,0.2)',
              }}>{t.label}</Link>
            )
          })}
        </div>

        {rows.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontStyle: 'italic' }}>{v.noNews}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rows.map((row, i) => {
              const c = pick(row, trs, lang)
              const isPress = row.category === 'press'
              return (
                <Link key={row.id} href={L(`/news/${row.slug}`)} className="news-row" style={{
                  display: 'flex', alignItems: 'center', gap: 24, padding: '24px 0',
                  textDecoration: 'none', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}>
                  {/* Round thumbnail */}
                  <div style={{ width: 92, height: 92, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #1A0A2E, #2A1145)', border: '2px solid rgba(245,166,35,0.4)' }}>
                    {row.cover_image && (
                      <img src={row.cover_image} alt={c.title} className="news-row-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }} />
                    )}
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                      {isPress && <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#1A0A2E', background: '#F5A623', padding: '2px 7px', borderRadius: 4 }}>{v.pressBadge}</span>}
                      <span style={{ fontSize: 11, color: '#9B59B6', letterSpacing: 2, textTransform: 'uppercase' }}>
                        {new Date(row.published_date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(18px, 2.2vw, 22px)', fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{c.title}</h2>
                    <p className="news-row-excerpt" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      {(c.excerpt || stripHtml(c.body)).substring(0, 120)}...
                    </p>
                  </div>
                  <span className="news-row-arrow" style={{ color: '#F5A623', fontSize: 22, flexShrink: 0, transition: 'transform 0.2s' }}>→</span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <style>{`
        .news-row:hover .news-row-img { transform: scale(1.08); }
        .news-row:hover .news-row-arrow { transform: translateX(5px); }
        @media (max-width: 560px) { .news-row { gap: 16px !important; } .news-row-excerpt { display: none !important; } }
      `}</style>
    </div>
  )
}