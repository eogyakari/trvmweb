import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Devotion } from '@/lib/types'

export const revalidate = 60

async function getDevotion(slug: string): Promise<Devotion | null> {
  const { data } = await supabase
    .from('devotions')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

async function getRelated(currentId: string): Promise<Devotion[]> {
  const { data } = await supabase
    .from('devotions')
    .select('*')
    .neq('id', currentId)
    .order('date', { ascending: false })
    .limit(3)
  return data || []
}

export default async function DevotionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const devotion = await getDevotion(slug)

  if (!devotion) return notFound()

  const related = await getRelated(devotion.id)

  return (
    <>
      {/* Hero */}
      {devotion.cover_image ? (
        <div style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
          <img src={devotion.cover_image} alt={devotion.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,36,25,0.85) 0%, rgba(15,36,25,0.2) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 32px' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <p style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>
                {new Date(devotion.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', lineHeight: 1.3 }}>
                {devotion.title}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, #0f2419 0%, #1a3a2a 100%)', padding: '64px 24px', textAlign: 'center' }}>
          <p style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
            {new Date(devotion.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', maxWidth: 700, margin: '0 auto', lineHeight: 1.3 }}>
            {devotion.title}
          </h1>
        </div>
      )}

      {/* Article */}
      <article style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px', background: 'white', color: '#333' }}>
        {/* Back + meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
          <Link href="/devotions" style={{ color: '#1a3a2a', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            ← All Devotions
          </Link>
          <p style={{ fontSize: 13, color: '#888' }}>By {devotion.author}</p>
        </div>

        <div style={{ width: 50, height: 3, background: '#c9a84c', marginBottom: 36 }} />

        {/* Content */}
        <div style={{
          fontSize: '1.05rem', lineHeight: 2, color: '#222',
          fontFamily: 'Georgia, serif', whiteSpace: 'pre-wrap'
        }}>
          {devotion.content}
        </div>

        {/* Share */}
        <div style={{
          marginTop: 56, paddingTop: 32, borderTop: '1px solid #ede8de',
          display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: 14, color: '#888', fontWeight: 600 }}>Share:</span>
          <a href={`https://wa.me/?text=${encodeURIComponent(devotion.title + ' - https://trvmissions.com/devotions/' + devotion.slug)}`}
            target="_blank" rel="noreferrer"
            style={{ background: '#25D366', color: 'white', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            WhatsApp
          </a>
          <a href={`https://t.me/share/url?url=${encodeURIComponent('https://trvmissions.com/devotions/' + devotion.slug)}&text=${encodeURIComponent(devotion.title)}`}
            target="_blank" rel="noreferrer"
            style={{ background: '#229ED9', color: 'white', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Telegram
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://trvmissions.com/devotions/' + devotion.slug)}`}
            target="_blank" rel="noreferrer"
            style={{ background: '#1877F2', color: 'white', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Facebook
          </a>
        </div>
      </article>

      {/* Related devotions */}
      {related.length > 0 && (
        <section style={{ background: '#f5f0e8', padding: '56px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <p style={{ fontSize: 12, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24 }}>
              More Devotions
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {related.map(d => (
                <Link key={d.id} href={`/devotions/${d.slug}`} style={{
                  background: 'white', borderRadius: 8, overflow: 'hidden',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.07)', textDecoration: 'none',
                  border: '1px solid #ede8de', display: 'block'
                }}>
                  {d.cover_image && (
                    <div style={{ height: 140, overflow: 'hidden' }}>
                      <img src={d.cover_image} alt={d.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 11, color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                      {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f2419', lineHeight: 1.4 }}>{d.title}</h3>
                    <p style={{ marginTop: 10, color: '#c9a84c', fontSize: 13, fontWeight: 700 }}>Read →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
