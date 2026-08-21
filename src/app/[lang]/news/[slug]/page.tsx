import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'
import type { Metadata } from 'next'

// Goes at: src/app/[lang]/news/[slug]/page.tsx
export const revalidate = 60

const dateLocales: Record<Locale, string> = { en: 'en-GB', id: 'id-ID', sw: 'sw-TZ' }

type Row = { id: string; title: string; slug: string; body: string; excerpt: string | null; cover_image: string | null; author: string; published_date: string }

async function getArticle(slug: string, lang: Locale) {
  const { data } = await supabase.from('news').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()
  if (!data) return null
  const row = data as Row
  let picked = { title: row.title, body: row.body }
  if (lang !== 'en') {
    const { data: tr } = await supabase
      .from('news_translations')
      .select('title, body')
      .eq('news_id', row.id).eq('locale', lang).maybeSingle()
    if (tr) picked = { title: (tr.title as string) || row.title, body: (tr.body as string) || row.body }
  }
  return { row, picked }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: rawLang, slug } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const article = await getArticle(slug, lang)
  if (!article) return { title: 'News — TRVM' }
  return { title: `${article.picked.title} — TRVM News` }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: rawLang, slug } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const v = dict.newsPage
  const dl = dateLocales[lang]

  const article = await getArticle(slug, lang)

  if (!article) {
    return (
      <div style={{ background: '#0D0D1A', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>{v.noNews}</p>
          <Link href={`/${lang}/news`} style={{ color: '#F5A623', fontWeight: 600 }}>{v.backToNews}</Link>
        </div>
      </div>
    )
  }

  const { row, picked } = article

  return (
    <div style={{ background: '#0D0D1A' }}>
      {row.cover_image ? (
        <div style={{ position: 'relative', height: 'clamp(360px, 52vh, 520px)', overflow: 'hidden' }}>
          <img src={row.cover_image} alt={picked.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0D0D1A 2%, rgba(13,13,26,0.4) 55%, rgba(13,13,26,0.55) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(40px, 6vw, 72px) 24px clamp(36px, 4vw, 52px)' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <Link href={`/${lang}/news`} style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em', textTransform: 'uppercase' }}>← {v.backToNews}</Link>
              <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(30px, 5.5vw, 52px)', fontWeight: 800, color: 'white', marginTop: 14, lineHeight: 1.15 }}>{picked.title}</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 14, fontSize: 14 }}>
                {v.by} {row.author} · {new Date(row.published_date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <header style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2A1145 100%)', padding: 'calc(72px + clamp(40px, 7vw, 80px)) 24px clamp(40px, 5vw, 64px)', textAlign: 'center' }}>
          <Link href={`/${lang}/news`} style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'block', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>← {v.backToNews}</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(30px, 5.5vw, 52px)', fontWeight: 800, color: 'white', maxWidth: 760, margin: '0 auto', lineHeight: 1.15 }}>{picked.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 14, fontSize: 14 }}>
            {v.by} {row.author} · {new Date(row.published_date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </header>
      )}

      {/* Article body — dark, de-boxed, clean reading column */}
      <div style={{ background: '#0D0D1A', padding: 'clamp(48px, 7vw, 80px) 24px clamp(64px, 9vw, 100px)' }}>
        <article style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ width: 56, height: 2, background: '#F5A623', marginBottom: 'clamp(32px, 4vw, 44px)' }} />
          <div
            className="news-body"
            style={{ fontSize: '1.12rem', lineHeight: 1.95, color: 'rgba(255,255,255,0.82)', fontFamily: 'Georgia, serif' }}
            dangerouslySetInnerHTML={{ __html: picked.body }}
          />
          <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <Link href={`/${lang}/news`} style={{ color: '#F5A623', fontWeight: 700, fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}>← {v.backToNews}</Link>
          </div>
        </article>
      </div>

      {/* Dark-theme styling for the article's HTML content */}
      <style>{`
        .news-body h1, .news-body h2, .news-body h3 { color: #fff; font-family: var(--font-playfair), Georgia, serif; line-height: 1.25; margin: 1.6em 0 0.5em; }
        .news-body h2 { font-size: 1.6rem; } .news-body h3 { font-size: 1.3rem; }
        .news-body p { margin: 0 0 1.3em; }
        .news-body a { color: #F5A623; text-decoration: underline; }
        .news-body blockquote { border-left: 3px solid #F5A623; margin: 1.6em 0; padding: 4px 0 4px 22px; color: rgba(255,255,255,0.7); font-style: italic; }
        .news-body img { max-width: 100%; height: auto; border-radius: 10px; margin: 1.6em 0; }
        .news-body ul, .news-body ol { padding-left: 1.4em; margin: 0 0 1.3em; }
        .news-body li { margin: 0.4em 0; }
        .news-body strong { color: #fff; }
      `}</style>
    </div>
  )
}