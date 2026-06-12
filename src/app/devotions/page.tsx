import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Devotion } from '@/lib/types'

export const revalidate = 60

async function getDevotions(): Promise<Devotion[]> {
  const { data } = await supabase
    .from('devotions')
    .select('*')
    .order('date', { ascending: false })
  return data || []
}

export default async function DevotionsPage() {
  const devotions = await getDevotions()

  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2419 0%, #1a3a2a 100%)',
        padding: '64px 24px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#c9a84c', fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          ✝ Daily Nourishment
        </p>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', marginBottom: 16 }}>
          Devotions
        </h1>
        <div style={{ width: 50, height: 3, background: '#c9a84c', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 500, margin: '0 auto', fontStyle: 'italic' }}>
          Daily spiritual nourishment from God&apos;s Word
        </p>
      </div>

      {/* Content */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 20px' }}>
        {devotions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📖</div>
            <p style={{ fontSize: '1.1rem' }}>Devotions coming soon. Check back daily.</p>
          </div>
        ) : (
          <>
            {/* Featured — latest devotion */}
            <p style={{ fontSize: 12, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>
              Latest Devotion
            </p>
            <Link href={`/devotions/${devotions[0].slug}`} style={{
              display: 'block',
              background: 'white',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
              textDecoration: 'none',
              border: '1px solid #ede8de',
              marginBottom: 48
            }}>
              {/* Image full width on all screens */}
              {devotions[0].cover_image && (
                <div style={{ height: 260, overflow: 'hidden' }}>
                  <img src={devotions[0].cover_image} alt={devotions[0].title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              {/* Text below image */}
              <div style={{ padding: '28px 24px' }}>
                <p style={{ fontSize: 12, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>
                  {new Date(devotions[0].date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f2419', marginBottom: 14, lineHeight: 1.3 }}>
                  {devotions[0].title}
                </h2>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, marginBottom: 16 }}>
                  {devotions[0].content.substring(0, 200)}...
                </p>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>By {devotions[0].author}</p>
                <span style={{
                  display: 'inline-block', background: '#c9a84c', color: '#0f2419',
                  padding: '11px 28px', borderRadius: 4, fontWeight: 700,
                  fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  Read Devotion →
                </span>
              </div>
            </Link>

            {/* Rest of devotions */}
            {devotions.length > 1 && (
              <>
                <p style={{ fontSize: 12, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20 }}>
                  Previous Devotions
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  {devotions.slice(1).map(d => (
                    <Link key={d.id} href={`/devotions/${d.slug}`} style={{
                      background: 'white', borderRadius: 10, overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.07)', textDecoration: 'none',
                      border: '1px solid #ede8de', display: 'block'
                    }}>
                      {d.cover_image && (
                        <div style={{ height: 180, overflow: 'hidden' }}>
                          <img src={d.cover_image} alt={d.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ padding: '20px' }}>
                        <p style={{ fontSize: 11, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                          {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f2419', marginBottom: 10, lineHeight: 1.4 }}>
                          {d.title}
                        </h3>
                        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 14 }}>
                          {d.content.substring(0, 110)}...
                        </p>
                        <p style={{ fontSize: 12, color: '#aaa', marginBottom: 10 }}>By {d.author}</p>
                        <p style={{ color: '#c9a84c', fontSize: 13, fontWeight: 700 }}>Read More →</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </>
  )
}