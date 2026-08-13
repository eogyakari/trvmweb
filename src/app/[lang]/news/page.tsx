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

type Row = { id: string; title: string; slug: string; body: string; excerpt: string | null; cover_image: string | null; author: string; published_date: string }
type Tr = { news_id: string; locale: string; title: string | null; body: string | null; excerpt: string | null }

// Merge base (English) with translation for `lang`.
function pick(row: Row, trs: Tr[], lang: Locale) {
  if (lang === 'en') return { title: row.title, body: row.body, excerpt: row.excerpt }
  const t = trs.find(x => x.news_id === row.id && x.locale === lang)
  return {
    title: t?.title || row.title,
    body: t?.body || row.body,
    excerpt: t?.excerpt || row.excerpt,
  }
}

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const v = dict.newsPage
  const dl = dateLocales[lang]
  const L = (href: string) => `/${lang}${href}`

  const { data: news } = await supabase
    .from('news').select('*')
    .eq('is_published', true)
    .order('published_date', { ascending: false })

  const rows = (news || []) as Row[]
  let trs: Tr[] = []
  if (lang !== 'en' && rows.length) {
    const { data } = await supabase
      .from('news_translations')
      .select('news_id, locale, title, body, excerpt')
      .in('news_id', rows.map(r => r.id))
      .eq('locale', lang)
    trs = (data || []) as Tr[]
  }

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)', padding: '72px 24px', textAlign: 'center' }}>
        <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>✝ {v.eyebrow}</p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>{v.title}</h1>
        <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.8 }}>{v.subtitle}</p>
      </div>

      <div style={{ background: '#0D0D1A', padding: '64px 24px', minHeight: '40vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {rows.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontStyle: 'italic' }}>{v.noNews}</p>
          ) : (
            <div className="news-grid" style={{ display: 'grid', gap: 24 }}>
              {rows.map(row => {
                const c = pick(row, trs, lang)
                return (
                  <Link key={row.id} href={L(`/news/${row.slug}`)} style={{ background: 'linear-gradient(135deg, #1A0A2E, #16213E)', border: '1px solid rgba(123,47,190,0.3)', borderRadius: 16, overflow: 'hidden', textDecoration: 'none', display: 'block' }}>
                    {row.cover_image && (
                      <div style={{ height: 180, overflow: 'hidden' }}>
                        <img src={row.cover_image} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: 24 }}>
                      <div style={{ fontSize: 11, color: '#9B59B6', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                        {new Date(row.published_date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <h2 style={{ fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 12, lineHeight: 1.35 }}>{c.title}</h2>
                      <p style={{ color: '#a0a0b0', fontSize: 13, lineHeight: 1.8 }}>
                        {(c.excerpt || stripHtml(c.body)).substring(0, 130)}...
                      </p>
                      <div style={{ marginTop: 16, color: '#F5A623', fontSize: 13, fontWeight: 600 }}>{v.readMore} →</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .news-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 900px) { .news-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .news-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}