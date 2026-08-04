import { supabase } from '@/lib/supabase'
import type { Book, Magazine, Newsletter } from '@/lib/types'
import PublicationsClient from './PublicationsClient'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

// Goes at: src/app/[lang]/publications/page.tsx
export const revalidate = 60

async function getData() {
  const [{ data: books }, { data: magazines }, { data: newsletters }] = await Promise.all([
    supabase.from('books').select('*').order('created_at', { ascending: false }),
    supabase.from('magazines').select('*').order('published_date', { ascending: false }),
    supabase.from('newsletters').select('*').order('date', { ascending: false }),
  ])
  return {
    books: (books || []) as Book[],
    magazines: (magazines || []) as Magazine[],
    newsletters: (newsletters || []) as Newsletter[],
  }
}

export default async function PublicationsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const p = dict.publicationsPage

  const { books, magazines, newsletters } = await getData()

  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)',
        padding: '72px 24px', textAlign: 'center'
      }}>
        <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          ✝ {p.eyebrow}
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
          {dict.nav.publications}
        </h1>
        <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.8 }}>
          {p.subtitle}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          {[
            { label: dict.pub.books, href: '#books' },
            { label: dict.pub.magazines, href: '#magazines' },
            { label: dict.pub.newsletters, href: '#newsletters' },
          ].map(tab => (
            <a key={tab.href} href={tab.href} style={{
              background: 'rgba(245,166,35,0.15)', color: '#F5A623',
              padding: '8px 22px', borderRadius: 20, fontSize: 13,
              fontWeight: 700, textDecoration: 'none',
              border: '1px solid rgba(245,166,35,0.4)',
              letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>{tab.label}</a>
          ))}
        </div>
      </div>

      <PublicationsClient lang={lang} books={books} magazines={magazines} newsletters={newsletters} />
    </>
  )
}