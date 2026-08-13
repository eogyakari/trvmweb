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
    <>
      {row.cover_image ? (
        <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
          <img src={row.cover_image} alt={picked.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,26,0.9) 0%, rgba(13,13,26,0.25) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 32px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <Link href={`/${lang}/news`} style={{ color: '#F5A623', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{v.backToNews}</Link>
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 900, color: 'white', marginTop: 12, lineHeight: 1.2 }}>{picked.title}</h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: 10, fontSize: 14 }}>
                {v.by} {row.author} · {new Date(row.published_date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)', padding: '64px 24px', textAlign: 'center' }}>
          <Link href={`/${lang}/news`} style={{ color: '#F5A623', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'block', marginBottom: 16 }}>{v.backToNews}</Link>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 900, color: 'white', marginBottom: 12, maxWidth: 800, margin: '0 auto' }}>{picked.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 12, fontSize: 14 }}>
            {v.by} {row.author} · {new Date(row.published_date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      <div style={{ background: '#f5f0e8', padding: '56px 20px' }}>
        <article style={{ maxWidth: 800, margin: '0 auto', background: 'white', borderRadius: 12, padding: '48px 40px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 50, height: 3, background: '#F5A623', marginBottom: 32 }} />
          <div
            className="news-body"
            style={{ fontSize: '1.05rem', lineHeight: 2, color: '#222', fontFamily: 'Georgia, serif' }}
            dangerouslySetInnerHTML={{ __html: picked.body }}
          />
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #e5ddd0' }}>
            <Link href={`/${lang}/news`} style={{ color: '#1a3a2a', fontWeight: 600, fontSize: 14 }}>{v.backToNews}</Link>
          </div>
        </article>
      </div>
    </>
  )
}