import { supabase } from '@/lib/supabase'
import TeamBio from './TeamBio'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'

export const revalidate = 60

async function getData() {
  const [{ data: settingsData }, { data: teamData }] = await Promise.all([
    supabase.from('site_settings').select('key, value'),
    supabase.from('team_members').select('*').order('sort_order', { ascending: true })
  ])
  const s: Record<string, string> = {}
  for (const row of settingsData || []) s[row.key] = row.value
  return { s, team: teamData || [] }
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const a = dict.aboutPage

  const { s, team } = await getData()
  // Per-language settings value: prefer about_x_id / about_x_sw, fall back to English about_x.
  const sv = (key: string) => s[`${key}_${lang}`] || s[key] || ''

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)', padding: '72px 24px', textAlign: 'center' }}>
        <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>✝ {a.eyebrow}</p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
          {a.heroTitle}
        </h1>
        <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.8 }}>
          {a.heroTagline}
        </p>
      </div>

      {/* Stats Banner */}
      <div style={{ background: '#F5A623', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            { num: s.stat_souls || '10,000+', label: a.statSouls },
            { num: s.stat_islands || '6', label: a.statIslands },
            { num: s.stat_days || '61', label: a.statDays },
            { num: s.stat_years || '10+', label: a.statYears },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#0D0D1A' }}>{stat.num}</div>
              <div style={{ fontSize: 12, color: '#0D0D1A', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Missions Banner */}
      <div style={{ background: '#1A0A2E', padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
          🌍 {a.missionsIn} <span style={{ color: '#F5A623', fontWeight: 700 }}>{sv('about_missions_banner') || 'Liberia · Kenya · Ghana · Indonesia (6 Islands)'}</span>
        </p>
      </div>

      {/* Our Story */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 56, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '3/4', border: '3px solid #F5A623', background: 'linear-gradient(135deg, #1A0A2E, #0D0D1A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.about_story_photo ? (
                <img src={s.about_story_photo} alt="Our Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 40 }}>
                  <div style={{ fontSize: 64, marginBottom: 12 }}>🌍</div>
                  <p style={{ fontSize: 13 }}>Story photo</p>
                </div>
              )}
            </div>
            {team.length > 0 && (
              <div style={{ position: 'absolute', bottom: -20, right: -20, background: '#F5A623', borderRadius: 8, padding: '12px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#0D0D1A' }}>{team[0].name}</p>
                <p style={{ fontSize: 11, color: '#0D0D1A', marginTop: 2 }}>{team[0].title}</p>
              </div>
            )}
          </div>
          <div>
            <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>{a.ourStory}</p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: 'white', marginBottom: 20, lineHeight: 1.3 }}>
              {sv('about_story_title') || a.calledToNations}
            </h2>
            <div style={{ width: 40, height: 3, background: '#F5A623', marginBottom: 24 }} />
            <div style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: '1rem' }}>
              {sv('about_story_p1') && <p style={{ marginBottom: 16 }}>{sv('about_story_p1')}</p>}
              {sv('about_story_p2') && <p style={{ marginBottom: 16 }}>{sv('about_story_p2')}</p>}
              {sv('about_story_p3') && <p>{sv('about_story_p3')}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section style={{ background: '#1A0A2E', padding: '56px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: 'white', fontStyle: 'italic', maxWidth: 700, margin: '0 auto', lineHeight: 1.9 }}>
          &ldquo;{a.scripture}&rdquo;
        </p>
        <p style={{ color: '#F5A623', marginTop: 16, fontWeight: 700, letterSpacing: '0.1em', fontSize: 14 }}>— {a.scriptureRef}</p>
      </section>

      {/* Mission Vision Values */}
      <section style={{ padding: '72px 24px', background: '#0D0D1A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, textAlign: 'center', color: 'white', marginBottom: 8 }}>{a.ourFoundation}</h2>
          <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 48px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            {[
              { icon: '🎯', title: a.mission, key: 'about_mission_text' },
              { icon: '👁️', title: a.vision, key: 'about_vision_text' },
              { icon: '🌱', title: a.values, key: 'about_values_text' },
            ].map(item => (
              <div key={item.title} style={{ background: 'linear-gradient(135deg, #1A0A2E, #16213E)', border: '1px solid rgba(245, 166, 35, 0.3)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 42, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontWeight: 800, color: '#F5A623', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>{sv(item.key)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section style={{ padding: '72px 24px', background: '#1A0A2E' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>{a.theTeam}</p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: 'white', marginBottom: 8 }}>{a.teamHeading}</h2>
          <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 48px' }} />

          {team.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{a.teamComingSoon}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 28 }}>
              {team.map(member => (
                <div key={member.id} style={{ background: 'linear-gradient(135deg, #0D0D1A, #16213E)', border: '1px solid rgba(245, 166, 35, 0.3)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ height: 240, background: 'linear-gradient(135deg, #1A0A2E, #0D0D1A)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #F5A623', overflow: 'hidden' }}>
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                        <div style={{ fontSize: 56 }}>👤</div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px 16px' }}>
                    <h3 style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>{member.name}</h3>
                    <p style={{ color: '#F5A623', fontSize: 12, marginTop: 6, fontWeight: 600 }}>{member.title}</p>
                     {(member[`bio_${lang}`] || member.bio) && (
                      <TeamBio
                        bio={member[`bio_${lang}`] || member.bio}
                        readMoreLabel={a.readMore}
                        readLessLabel={a.readLess}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 40, fontStyle: 'italic' }}>
            {a.unitedBy}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #F5A623 100%)', padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 16 }}>{a.partnerWithUs}</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.8, fontSize: '1.05rem' }}>
          {a.partnerText}
        </p>
        <a href={`/${lang}/contact`} style={{ background: 'white', color: '#7B2FBE', padding: '14px 36px', borderRadius: 30, fontSize: 14, fontWeight: 800, letterSpacing: 1, display: 'inline-block', textDecoration: 'none' }}>
          {a.getInTouch.toUpperCase()}
        </a>
      </section>
    </>
  )
}