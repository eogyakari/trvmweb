import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Devotion } from '@/lib/types'
import type { Metadata } from 'next'
import ShareButtons from './ShareButtons'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

export const revalidate = 60

type TrRow = { locale: string; title: string | null; body: string | null }
type DevotionRow = Devotion & { devotion_translations?: TrRow[] | null }

// Pick title/body for a language, falling back to the row's English text.
function pick(d: DevotionRow, lang: string) {
  const list = d.devotion_translations || []
  const match = list.find((t) => t.locale === lang) || list.find((t) => t.locale === 'en')
  return {
    title: match?.title || d.title,
    content: match?.body || d.content,
  }
}

const dateLocales: Record<Locale, string> = { en: 'en-GB', id: 'id-ID', sw: 'sw-TZ' }

async function getDevotion(slug: string): Promise<DevotionRow | null> {
  const { data } = await supabase
    .from('devotions')
    .select('*, devotion_translations(locale, title, body)')
    .eq('slug', slug)
    .single()
  return (data as unknown as DevotionRow) || null
}

async function getRelated(currentId: string): Promise<DevotionRow[]> {
  const { data } = await supabase
    .from('devotions')
    .select('*, devotion_translations(locale, title, body)')
    .neq('id', currentId)
    .order('date', { ascending: false })
    .limit(3)
  return (data || []) as unknown as DevotionRow[]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const devotion = await getDevotion(slug)
  if (!devotion) return {}

  const picked = pick(devotion, lang)
  const summary = picked.content.substring(0, 160)
  const url = `https://trvmissions.com/${lang}/devotions/${devotion.slug}`

  return {
    title: `${picked.title} | TRVM Devotions`,
    description: summary,
    openGraph: {
      title: picked.title,
      description: summary,
      url,
      siteName: 'The Righteous Vine Missions',
      images: devotion.cover_image ? [{ url: devotion.cover_image, width: 1200, height: 630, alt: picked.title }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: picked.title,
      description: summary,
      images: devotion.cover_image ? [devotion.cover_image] : [],
    },
  }
}

export default async function DevotionPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang: rawLang, slug } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const t = dict.devotionsPage
  const dl = dateLocales[lang]

  const devotion = await getDevotion(slug)
  if (!devotion) return notFound()

  const picked = pick(devotion, lang)
  const related = await getRelated(devotion.id)

  return (
    <>
      {/* Hero */}
      {devotion.cover_image ? (
        <div style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
          <img src={devotion.cover_image} alt={picked.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,36,25,0.85) 0%, rgba(15,36,25,0.2) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 32px' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <p style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>
                {new Date(devotion.date).toLocaleDateString(dl, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', lineHeight: 1.3 }}>
                {picked.title}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, #0f2419 0%, #1a3a2a 100%)', padding: '64px 24px', textAlign: 'center' }}>
          <p style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
            {new Date(devotion.date).toLocaleDateString(dl, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', maxWidth: 700, margin: '0 auto', lineHeight: 1.3 }}>
            {picked.title}
          </h1>
        </div>
      )}

      {/* Article on light background */}
      <div style={{ background: '#f5f0e8', padding: '48px 20px' }}>
        <article style={{
          maxWidth: 760, margin: '0 auto',
          background: 'white', borderRadius: 12,
          padding: '48px 40px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
        }}>
          {/* Back + meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <Link href={`/${lang}/devotions`} style={{ color: '#1a3a2a', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              ← {t.allDevotions}
            </Link>
            <p style={{ fontSize: 13, color: '#888' }}>{t.by} {devotion.author}</p>
          </div>

          <div style={{ width: 50, height: 3, background: '#c9a84c', marginBottom: 36 }} />

          {/* Content (rich HTML from the editor) */}
          <div
            className="devotion-body"
            style={{ fontSize: '1.05rem', lineHeight: 2, color: '#222', fontFamily: 'Georgia, serif' }}
            dangerouslySetInnerHTML={{ __html: picked.content }}
          />

          {/* Share */}
          <ShareButtons title={picked.title} slug={devotion.slug} />
        </article>
      </div>

      {/* Related devotions */}
      {related.length > 0 && (
        <section style={{ background: '#ede8de', padding: '56px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <p style={{ fontSize: 12, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24 }}>
              {t.moreDevotions}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {related.map(d => {
                const rt = pick(d, lang)
                return (
                  <Link key={d.id} href={`/${lang}/devotions/${d.slug}`} style={{
                    background: 'white', borderRadius: 8, overflow: 'hidden',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.07)', textDecoration: 'none',
                    border: '1px solid #ede8de', display: 'block'
                  }}>
                    {d.cover_image && (
                      <div style={{ height: 140, overflow: 'hidden' }}>
                        <img src={d.cover_image} alt={rt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: 20 }}>
                      <p style={{ fontSize: 11, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                        {new Date(d.date).toLocaleDateString(dl, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f2419', lineHeight: 1.4 }}>{rt.title}</h3>
                      <p style={{ marginTop: 10, color: '#c9a84c', fontSize: 13, fontWeight: 700 }}>{dict.common.read} →</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}