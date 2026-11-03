'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'

  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState<string>('')
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    if (isLoginPage) { setChecking(false); return }
    let active = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/admin/login'); return }
      const { data: adminRow } = await supabase
        .from('admin_users').select('role, email').eq('id', session.user.id).maybeSingle()
      if (!active) return
      if (!adminRow) {
        // Signed in but not an approved admin — sign out and bounce.
        await supabase.auth.signOut()
        router.replace('/admin/login?denied=1')
        return
      }
      setEmail((adminRow.email as string) || session.user.email || '')
      setRole((adminRow.role as string) || 'editor')
      setChecking(false)
    })()
    return () => { active = false }
  }, [isLoginPage, pathname, router])

  // Login page renders on its own, no shell.
  if (isLoginPage) return <>{children}</>

  if (checking) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a2a', fontFamily: 'Georgia, serif' }}>
        Loading…
      </div>
    )
  }

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  return (
    <>
      {/* Admin top bar */}
      <div style={{ background: '#0f2419', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, background: '#c9a84c', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#0f2419', fontWeight: 900 }}>✝</div>
          <div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>TRVM</span>
            <span style={{ color: '#c9a84c', fontSize: 13 }}> · Admin Panel</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
            {email}{role === 'owner' ? ' · Owner' : ' · Editor'}
          </span>
          <a href="/" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>View Site ↗</a>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)', fontSize: 12, padding: '4px 12px', borderRadius: 5, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            Log out
          </button>
        </div>
      </div>

      <div>{children}</div>
    </>
  )
}