import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

// Goes at: src/app/[lang]/programs/page.tsx
export const revalidate = 60

async function getSettings() {
  const { data } = await supabase.from('site_settings').select('key, value')
  const s: Record<string, string> = {}
  for (const row of data || []) s[row.key] = row.value
  return s
}

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const p = dict.programsPage
  const names = p.names as Record<string, string>

  const s = await getSettings()
  // Program settings value for the current language, English fallback.
  const sv = (key: string): string =>
    lang === 'en' ? (s[key] || '') : (s[`${key}_${lang}`] || s[key] || '')

  const programs = [
    { key: 'missions', icon: '✝', href: '/programs/missions', color: '#7B2FBE' },
    { key: 'care', icon: '🤝', href: '/programs/care-philanthropy', color: '#E8860A' },
    { key: 'discipleship', icon: '📖', href: '/programs/discipleship', color: '#1a4a7a' },
  ]

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)', padding: '72px 24px', textAlign: 'center' }}>
        <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>✝ {p.eyebrow}</p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>{p.title}</h1>
        <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.8 }}>
          {p.subtitle}
        </p>
      </div>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28 }}>
          {programs.map(prog => (
            <Link key={prog.key} href={`/${lang}${prog.href}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: 'linear-gradient(135deg, #1A0A2E, #16213E)',
                border: '1px solid rgba(123,47,190,0.3)',
                borderRadius: 16, overflow: 'hidden', height: '100%'
              }}>
                {sv(`prog_${prog.key}_photo`) ? (
                  <div style={{ height: 220, overflow: 'hidden' }}>
                    <img src={sv(`prog_${prog.key}_photo`)} alt={sv(`prog_${prog.key}_title`) || names[prog.key]}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ height: 140, background: `linear-gradient(135deg, ${prog.color}33, #0D0D1A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>
                    {prog.icon}
                  </div>
                )}
                <div style={{ padding: 28 }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F5A623', marginBottom: 10 }}>
                    {sv(`prog_${prog.key}_title`) || names[prog.key]}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: 12 }}>
                    {sv(`prog_${prog.key}_subtitle`)}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
                    {(sv(`prog_${prog.key}_content`) || '').substring(0, 150)}...
                  </p>
                  <span style={{ color: '#F5A623', fontSize: 13, fontWeight: 700 }}>{p.learnMore} →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #F5A623 100%)', padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 16 }}>{p.getInvolved}</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.8 }}>
          {p.getInvolvedText}
        </p>
        <Link href={`/${lang}/contact`} style={{ background: 'white', color: '#7B2FBE', padding: '14px 36px', borderRadius: 30, fontSize: 14, fontWeight: 800, letterSpacing: 1, display: 'inline-block', textDecoration: 'none', textTransform: 'uppercase' }}>
          {p.contactUs}
        </Link>
      </section>
    </>
  )
}