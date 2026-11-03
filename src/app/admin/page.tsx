'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ADMIN_SECTION_LIST, canAccess } from '@/lib/adminSections'
import { useAdminAuth } from './AdminGuard'

// Tiles are filtered by the signed-in user's permissions (owners see all).
const COUNT_TABLES: Record<string, string> = {
  devotions: 'devotions', books: 'books', magazines: 'magazines', newsletters: 'newsletters',
  videos: 'videos', gallery: 'gallery', slideshow: 'slideshow', messages: 'contact_messages',
  subscribers: 'subscribers', quotes: 'quotes', events: 'events',
}

export default function AdminPage() {
  const auth = useAdminAuth()
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const out: Record<string, number> = {}
    for (const [key, table] of Object.entries(COUNT_TABLES)) {
      try {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
        out[key] = count || 0
      } catch { /* table may not exist yet */ }
    }
    setCounts(out)
  }

  const role = auth?.role || 'editor'
  const permissions = auth?.permissions || []

  // Visible content tiles = those this user can access.
  const visible = ADMIN_SECTION_LIST.filter(s => canAccess(role, permissions, s.key))

  async function logout() { await supabase.auth.signOut(); window.location.href = '/admin/login' }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f2419' }}>Admin Dashboard</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Signed in as {auth?.email}{role === 'owner' ? ' · Owner' : ' · Editor'}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: 13, color: '#1a3a2a', fontWeight: 600 }}>← View Site</Link>
          <button onClick={logout} style={{ background: 'transparent', color: '#c9a84c', padding: '8px 18px', border: '2px solid #c9a84c', borderRadius: 4, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sign Out</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
        {visible.map(s => {
          const count = s.key in counts ? counts[s.key] : null
          return (
            <Link key={s.key} href={s.href} style={{ background: 'white', borderRadius: 12, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'block', textAlign: 'center', textDecoration: 'none', border: '1px solid #f0ebe0' }}>
              <div style={{ fontSize: 38, marginBottom: 12 }}>{s.icon}</div>
              <h3 style={{ fontWeight: 700, color: '#0f2419', fontSize: '1rem', marginBottom: 10 }}>{s.label}</h3>
              {count !== null && (
                <div style={{ background: '#c9a84c', color: '#0f2419', borderRadius: 20, padding: '3px 14px', fontSize: 13, fontWeight: 700, display: 'inline-block' }}>
                  {count} {count === 1 ? 'item' : 'items'}
                </div>
              )}
              <p style={{ marginTop: 12, color: '#c9a84c', fontSize: 13, fontWeight: 700 }}>Manage →</p>
            </Link>
          )
        })}

        {/* Owner-only: Manage Editors */}
        {role === 'owner' && (
          <Link href="/admin/editors" style={{ background: 'white', borderRadius: 12, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'block', textAlign: 'center', textDecoration: 'none', border: '1px solid #f0ebe0' }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>👤</div>
            <h3 style={{ fontWeight: 700, color: '#0f2419', fontSize: '1rem', marginBottom: 10 }}>Manage Editors</h3>
            <p style={{ marginTop: 12, color: '#c9a84c', fontSize: 13, fontWeight: 700 }}>Manage →</p>
          </Link>
        )}
      </div>
    </div>
  )
}