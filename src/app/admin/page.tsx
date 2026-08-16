'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  const [stats, setStats] = useState({
    devotions: 0, books: 0, magazines: 0, newsletters: 0, videos: 0, gallery: 0, slideshow: 0, messages: 0, subscribers: 0, quotes: 0
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setChecking(false)
      if (session) loadStats()
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadStats()
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogin(e:any) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    await loadStats()
    setLoading(false)
  }

  async function loadStats() {
    const tables = ['devotions', 'books', 'magazines', 'newsletters', 'videos', 'gallery', 'slideshow', 'contact_messages', 'subscribers'] as const
    const counts: Record<string, number> = {}
    for (const t of tables) {
      const { count } = await supabase.from(t).select('*', { count: 'exact', head: true })
      const key = t === 'contact_messages' ? 'messages' : t
      counts[key] = count || 0
    }
    setStats(prev => ({ ...prev, ...counts }))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#888', fontFamily: 'Georgia, serif' }}>
        Loading...
      </div>
    )
  }

  // LOGIN SCREEN
  if (!session) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f5f0e8', fontFamily: 'Georgia, serif'
      }}>
        <div style={{
          background: 'white', borderRadius: 12, padding: 48,
          width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 60, height: 60, background: '#1a3a2a', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, margin: '0 auto 16px', color: '#c9a84c'
            }}>✝</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f2419' }}>TRVM Admin</h1>
            <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Sign in to manage content</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px', border: '1px solid #ddd',
                  borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif', outline: 'none',
                  color: '#000', background: '#fff'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px', border: '1px solid #ddd',
                  borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif', outline: 'none',
                  color: '#000', background: '#fff'
                }}
              />
            </div>
            {error && (
              <p style={{ color: '#e53e3e', fontSize: 13, background: '#fff5f5', padding: '8px 12px', borderRadius: 6, border: '1px solid #fed7d7' }}>
                {error}
              </p>
            )}
            <button
              type="submit" disabled={loading}
              style={{
                background: '#c9a84c', color: '#0f2419', padding: '13px',
                border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, fontFamily: 'Georgia, serif',
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // DASHBOARD
  const sections = [
    { href: '/admin/devotions', icon: '📖', label: 'Devotions', count: stats.devotions },
    { href: '/admin/books', icon: '📚', label: 'Books', count: stats.books },
    { href: '/admin/magazines', icon: '📰', label: 'Magazines', count: stats.magazines },
    { href: '/admin/newsletters', icon: '✉️', label: 'Newsletters', count: stats.newsletters },
    { href: '/admin/videos', icon: '🎥', label: 'Videos', count: stats.videos },
    { href: '/admin/gallery', icon: '🖼️', label: 'Gallery', count: stats.gallery },
    { href: '/admin/slideshow', icon: '🎞️', label: 'Slideshow', count: stats.slideshow },
    { href: '/admin/messages', icon: '💬', label: 'Messages', count: stats.messages },
    { href: '/admin/subscribers', icon: '📧', label: 'Subscribers', count: stats.subscribers },
    { href: '/admin/about', icon: '📝', label: 'About Page', count: null },
    { href: '/admin/programs', icon: '🌍', label: 'Programs', count: null },
    { href: '/admin/quotes', icon: '💬', label: 'Quotes', count: stats.quotes },
    { href: '/admin/settings', icon: '⚙️', label: 'Site Settings', count: null },
    { href: '/admin/news', label: 'News & Press', icon: '📰' },
    { href: '/admin/memberships', label: 'Memberships', icon: '👥' },
    { href: '/admin/discipleship', label: 'Discipleship', icon: '📖' },
    { href: '/admin/event', label: 'Featured Event', icon: '📣' },
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f2419' }}>Admin Dashboard</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Signed in as {session.user.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: 13, color: '#1a3a2a', fontWeight: 600 }}>
            ← View Site
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent', color: '#c9a84c', padding: '8px 18px',
              border: '2px solid #c9a84c', borderRadius: 4, fontWeight: 700,
              fontSize: 12, cursor: 'pointer', fontFamily: 'Georgia, serif',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Section cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
        {sections.map(s => (
          <Link key={s.href} href={s.href} style={{
            background: 'white', borderRadius: 12, padding: 28,
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'block',
            textAlign: 'center', textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #f0ebe0'
          }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>{s.icon}</div>
            <h3 style={{ fontWeight: 700, color: '#0f2419', fontSize: '1rem', marginBottom: 10 }}>
              {s.label}
            </h3>
            {s.count !== null && (
              <div style={{
                background: '#c9a84c', color: '#0f2419', borderRadius: 20,
                padding: '3px 14px', fontSize: 13, fontWeight: 700, display: 'inline-block'
              }}>
                {s.count} {s.count === 1 ? 'item' : 'items'}
              </div>
            )}
            <p style={{ marginTop: 12, color: '#c9a84c', fontSize: 13, fontWeight: 700 }}>
              Manage →
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
