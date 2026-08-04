import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

// Goes at: src/app/[lang]/programs/discipleship/page.tsx
export const revalidate = 60

async function getSettings() {
  const { data } = await supabase.from('site_settings').select('key, value')
  const s: Record<string, string> = {}
  for (const row of data || []) s[row.key] = row.value
  return s
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const pg = dict.programsPage
  const names = pg.names as Record<string, string>

  const s = await getSettings()
  const sv = (key: string): string =>
    lang === 'en' ? (s[key] || '') : (s[`${key}_${lang}`] || s[key] || '')

  const key = 'discipleship'
  const title = sv(`prog_${key}_title`) || names[key]
  const subtitle = sv(`prog_${key}_subtitle`)
  const content = sv(`prog_${key}_content`)
  const photo = s[`prog_${key}_photo`] || ''

  const others = [
    { key: 'missions', href: '/programs/missions' },
    { key: 'care', href: '/programs/care-philanthropy' },
  ]

  return (
    <>
      {photo ? (
        <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
          <img src={photo} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,26,0.85) 0%, rgba(13,13,26,0.2) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 32px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <Link href={`/${lang}/programs`} style={{ color: '#F5A623', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← {pg.allPrograms}</Link>
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: 'white', marginTop: 12, lineHeight: 1.2 }}>{title}</h1>
              {subtitle && <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', marginTop: 10, fontStyle: 'italic' }}>{subtitle}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)', padding: '72px 24px', textAlign: 'center' }}>
          <Link href={`/${lang}/programs`} style={{ color: '#F5A623', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'block', marginBottom: 16 }}>← {pg.allPrograms}</Link>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: 'white', marginBottom: 12 }}>{title}</h1>
          <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 16px' }} />
          {subtitle && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', fontStyle: 'italic' }}>{subtitle}</p>}
        </div>
      )}
      <div style={{ background: '#f5f0e8', padding: '56px 20px' }}>
        <article style={{ maxWidth: 800, margin: '0 auto', background: 'white', borderRadius: 12, padding: '48px 40px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          {photo && <Link href={`/${lang}/programs`} style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'block', marginBottom: 24 }}>← {pg.allPrograms}</Link>}
          <div style={{ width: 50, height: 3, background: '#F5A623', marginBottom: 32 }} />
          <div style={{ fontSize: '1.05rem', lineHeight: 2, color: '#222', fontFamily: 'Georgia, serif', whiteSpace: 'pre-wrap' }}>{content}</div>
        </article>
      </div>
      <section style={{ background: '#1A0A2E', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24, textAlign: 'center' }}>{pg.otherPrograms}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {others.map(o => (
              <Link key={o.key} href={`/${lang}${o.href}`} style={{ background: 'linear-gradient(135deg, #0D0D1A, #16213E)', border: '1px solid rgba(123,47,190,0.3)', borderRadius: 12, padding: '20px 24px', textDecoration: 'none', display: 'block' }}>
                <h3 style={{ fontWeight: 700, color: '#F5A623', fontSize: '0.95rem', marginBottom: 6 }}>{sv(`prog_${o.key}_title`) || names[o.key]}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontStyle: 'italic' }}>{sv(`prog_${o.key}_subtitle`)}</p>
                <p style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, marginTop: 12 }}>{pg.learnMore} →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #F5A623 100%)', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 16 }}>{pg.supportProgram}</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.8 }}>{pg.supportProgramText}</p>
        <Link href={`/${lang}/contact`} style={{ background: 'white', color: '#7B2FBE', padding: '13px 32px', borderRadius: 30, fontSize: 14, fontWeight: 800, letterSpacing: 1, display: 'inline-block', textDecoration: 'none', textTransform: 'uppercase' }}>{pg.getInTouch}</Link>
      </section>
    </>
  )
}