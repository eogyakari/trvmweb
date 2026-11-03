'use client'
import { useEffect, useState, createContext, useContext } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { canAccess } from '@/lib/adminSections'

type AdminAuth = { email: string; role: string; permissions: string[] }
const AdminAuthContext = createContext<AdminAuth | null>(null)
export const useAdminAuth = () => useContext(AdminAuthContext)

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'

  const [checking, setChecking] = useState(true)
  const [auth, setAuth] = useState<AdminAuth | null>(null)

  useEffect(() => {
    if (isLoginPage) { setChecking(false); return }
    let active = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/admin/login'); return }
      const { data: row } = await supabase
        .from('admin_users').select('role, email, permissions').eq('id', session.user.id).maybeSingle()
      if (!active) return
      if (!row) { await supabase.auth.signOut(); router.replace('/admin/login?denied=1'); return }
      setAuth({
        email: (row.email as string) || session.user.email || '',
        role: (row.role as string) || 'editor',
        permissions: (row.permissions as string[]) || [],
      })
      setChecking(false)
    })()
    return () => { active = false }
  }, [isLoginPage, pathname, router])

  if (isLoginPage) return <>{children}</>

  if (checking || !auth) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a2a', fontFamily: 'Georgia, serif' }}>Loading…</div>
  }

  // Which section is this route? Path is /admin or /admin/<seg>/...
  const seg = pathname.split('/')[2] || ''   // '' for the dashboard
  const isDashboard = seg === ''
  const isEditors = seg === 'editors'

  // Enforce access.
  let denied = false
  if (isEditors) {
    denied = auth.role !== 'owner'                 // editors page is owner-only
  } else if (!isDashboard) {
    denied = !canAccess(auth.role, auth.permissions, seg)
  }

  async function logout() { await supabase.auth.signOut(); router.replace('/admin/login') }

  return (
    <AdminAuthContext.Provider value={auth}>
      {/* Admin top bar */}
      <div style={{ background: '#0f2419', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, background: '#c9a84c', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#0f2419', fontWeight: 900 }}>✝</div>
          <div><span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>TRVM</span><span style={{ color: '#c9a84c', fontSize: 13 }}> · Admin Panel</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{auth.email}{auth.role === 'owner' ? ' · Owner' : ' · Editor'}</span>
          <a href="/" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>View Site ↗</a>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)', fontSize: 12, padding: '4px 12px', borderRadius: 5, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Log out</button>
        </div>
      </div>

      {denied ? (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '72px 24px', textAlign: 'center', fontFamily: 'Georgia, serif' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: '1.4rem', color: '#0f2419', fontWeight: 700, marginBottom: 10 }}>No access</h1>
          <p style={{ color: '#888', lineHeight: 1.7 }}>You don&apos;t have permission to manage this section. Ask an owner if you need access.</p>
          <a href="/admin" style={{ color: '#1a3a2a', fontWeight: 600, display: 'inline-block', marginTop: 24 }}>← Back to Dashboard</a>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </AdminAuthContext.Provider>
  )
}