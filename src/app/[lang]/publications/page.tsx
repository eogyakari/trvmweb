import { supabase } from '@/lib/supabase'
import type { Book, Magazine, Newsletter } from '@/lib/types'
import PublicationsClient from './PublicationsClient'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

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
        background: 'linear-gradient(135deg, #1A0A2E 0%, #2A1145 100%)',
        padding: 'calc(72px + clamp(48px, 8vw, 90px)) 24px clamp(48px, 8vw, 80px)', textAlign: 'center'
      }}>
        <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          ✝ {p.eyebrow}
        </p>
         <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(34px, 6vw, 60px)', fontWeight: 800, color: 'white', marginBottom: 18, lineHeight: 1.1 }}>
          {dict.nav.publications}
        </h1>
        <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(15px, 2vw, 18px)', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.6 }}>
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