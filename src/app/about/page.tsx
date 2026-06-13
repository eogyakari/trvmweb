import { supabase } from '@/lib/supabase'

export const revalidate = 60

async function getStats() {
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['stat_souls', 'stat_islands', 'stat_days', 'stat_years'])
  const map: Record<string, string> = {}
  for (const row of data || []) map[row.key] = row.value
  return map
}

export default async function AboutPage() {
  const stats = await getStats()

  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)',
        padding: '72px 24px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          ✝ Who We Are
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
          About The Righteous Vine Missions
        </h1>
        <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.8 }}>
          Rooted in faith. Growing in love. Bearing fruit for God&apos;s kingdom.
        </p>
      </div>

      {/* Stats Banner */}
      <div style={{ background: '#F5A623', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            { num: stats.stat_souls || '10,000+', label: 'Souls Won for the Kingdom' },
            { num: stats.stat_islands || '6', label: 'Islands in Indonesia' },
            { num: stats.stat_days || '61', label: 'Days in the Field' },
            { num: stats.stat_years || '10+', label: 'Years of Ministry' },
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
          🌍 Missions in <span style={{ color: '#F5A623', fontWeight: 700 }}>Liberia · Kenya · Ghana · Indonesia (6 Islands)</span>
        </p>
      </div>

      {/* Our Story */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 56, alignItems: 'center' }}>
          {/* Photo */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1A0A2E, #0D0D1A)',
              borderRadius: 12, overflow: 'hidden',
              aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid #F5A623'
            }}>
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 40 }}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>👤</div>
                <p style={{ fontSize: 13 }}>Leadership photo</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>Upload via Admin → Settings</p>
              </div>
            </div>
            <div style={{
              position: 'absolute', bottom: -20, right: -20,
              background: '#F5A623', borderRadius: 8, padding: '12px 20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#0D0D1A' }}>Eugene Owusu Gyakari</p>
              <p style={{ fontSize: 11, color: '#0D0D1A', marginTop: 2 }}>Founder & Head of Missions</p>
            </div>
          </div>

          {/* Text */}
          <div>
            <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Our Story</p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: 'white', marginBottom: 20, lineHeight: 1.3 }}>
              Called to the Nations
            </h2>
            <div style={{ width: 40, height: 3, background: '#F5A623', marginBottom: 24 }} />
            <div style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: '1rem' }}>
              <p style={{ marginBottom: 16 }}>
                The Righteous Vine Missions was founded with a singular vision: to extend the love and truth of Jesus Christ to every corner of the world. Inspired by John 15:5, we believe that as branches of the True Vine, we are called to bear much fruit.
              </p>
              <p style={{ marginBottom: 16 }}>
                From our base in Ghana, we have conducted missions across Africa — in Liberia, Kenya, and Ghana — and as far as the six islands of Indonesia, preaching the Gospel, feeding the hungry, empowering communities, and making disciples of all nations.
              </p>
              <p>
                Every program we run is undergirded by prayer, Scripture, and a deep commitment to the Great Commission. To date, over 10,000 souls have been won for the Kingdom of God.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section style={{ background: '#1A0A2E', padding: '56px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: 'white', fontStyle: 'italic', maxWidth: 700, margin: '0 auto', lineHeight: 1.9 }}>
          &ldquo;I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing.&rdquo;
        </p>
        <p style={{ color: '#F5A623', marginTop: 16, fontWeight: 700, letterSpacing: '0.1em', fontSize: 14 }}>— John 15:5</p>
      </section>

      {/* Mission Vision Values */}
      <section style={{ padding: '72px 24px', background: '#0D0D1A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, textAlign: 'center', color: 'white', marginBottom: 8 }}>Our Foundation</h2>
          <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 48px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            {[
              { icon: '🎯', title: 'Mission', content: 'To preach the Gospel of Jesus Christ, make disciples of all nations, and serve communities through acts of compassion and love.' },
              { icon: '👁️', title: 'Vision', content: 'A world transformed by the power of the Gospel — where every person has heard the Good News and communities flourish under God\'s grace.' },
              { icon: '🌱', title: 'Values', content: 'Faith. Integrity. Compassion. Excellence. Unity. We are guided by these values in everything we do as servants of God.' },
            ].map(item => (
              <div key={item.title} style={{
                background: 'linear-gradient(135deg, #1A0A2E, #16213E)',
                border: '1px solid rgba(245, 166, 35, 0.3)',
                borderRadius: 16, padding: 32, textAlign: 'center'
              }}>
                <div style={{ fontSize: 42, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontWeight: 800, color: '#F5A623', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section style={{ padding: '72px 24px', background: '#1A0A2E' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>The Team</p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: 'white', marginBottom: 8 }}>Leadership</h2>
          <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 48px' }} />

          {/* Founder card */}
          <div style={{ display: 'inline-block', maxWidth: 320 }}>
            <div style={{
              background: 'linear-gradient(135deg, #0D0D1A, #16213E)',
              border: '1px solid rgba(245, 166, 35, 0.3)',
              borderRadius: 16, overflow: 'hidden'
            }}>
              <div style={{
                height: 280, background: 'linear-gradient(135deg, #1A0A2E, #0D0D1A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: '2px solid #F5A623'
              }}>
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ fontSize: 72 }}>👤</div>
                  <p style={{ fontSize: 12, marginTop: 8 }}>Photo coming soon</p>
                </div>
              </div>
              <div style={{ padding: '24px 20px' }}>
                <h3 style={{ fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>Eugene Owusu Gyakari</h3>
                <p style={{ color: '#F5A623', fontSize: 13, marginTop: 6, fontWeight: 600 }}>Founder & Head of Missions</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 12, lineHeight: 1.7 }}>
                  Leading TRVM with a heart for the unreached and a passion for the Gospel of Jesus Christ.
                </p>
              </div>
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 40, fontStyle: 'italic' }}>
            Our leadership team brings together diverse gifts, experiences, and callings — united by one Lord, one faith, one baptism.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #7B2FBE 0%, #F5A623 100%)',
        padding: '72px 24px', textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 16 }}>Partner With Us</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.8, fontSize: '1.05rem' }}>
          Your support enables us to reach more souls, feed more families, and build stronger communities for God&apos;s glory.
        </p>
        <a href="/contact" style={{
          background: 'white', color: '#7B2FBE',
          padding: '14px 36px', borderRadius: 30,
          fontSize: 14, fontWeight: 800, letterSpacing: 1,
          display: 'inline-block', textDecoration: 'none'
        }}>GET IN TOUCH</a>
      </section>
    </>
  )
}