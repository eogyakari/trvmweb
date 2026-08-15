import DiscipleshipClient from './DiscipleshipClient'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

// Goes at: src/app/[lang]/discipleship/page.tsx
export default async function DiscipleshipPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const m = dict.discipleshipPage
  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)', padding: '72px 24px', textAlign: 'center' }}>
        <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>✝ {m.eyebrow}</p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>{m.title}</h1>
        <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.8 }}>{m.subtitle}</p>
      </div>
      <DiscipleshipClient lang={lang} />
    </>
  )
}