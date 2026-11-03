'use client'
import { useEffect, useState, createContext, useContext } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { canAccess, ADMIN_SECTION_LIST, ADMIN_GROUP_ORDER } from '@/lib/adminSections'

type AdminAuth = { email: string; role: string; permissions: string[] }
const AdminAuthContext = createContext<AdminAuth | null>(null)
export const useAdminAuth = () => useContext(AdminAuthContext)

const GOLD = '#c9a84c'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'

  const [checking, setChecking] = useState(true)
  const [auth, setAuth] = useState<AdminAuth | null>(null)
  const [navOpen, setNavOpen] = useState(false)

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

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setNavOpen(false) }, [pathname])

  if (isLoginPage) return <>{children}</>

  if (checking || !auth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontFamily: 'Georgia, serif', background: '#f8fafc' }}>
        Loading…
      </div>
    )
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

  // Build the sidebar nav, grouped and filtered by permission.
  const groups = ADMIN_GROUP_ORDER.map((g) => ({
    name: g,
    items: ADMIN_SECTION_LIST.filter(
      (s) => s.group === g && canAccess(auth.role, auth.permissions, s.key)
    ),
  })).filter((g) => g.items.length > 0)

  // Page title for the top strip.
  const current = ADMIN_SECTION_LIST.find((s) => s.key === seg)
  const pageTitle = isDashboard ? 'Dashboard' : isEditors ? 'Manage Editors' : (current?.label || 'Admin')

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : (pathname === href || pathname.startsWith(href + '/'))

  async function logout() { await supabase.auth.signOut(); router.replace('/admin/login') }

  return (
    <AdminAuthContext.Provider value={auth}>
      <style>{`
        .ad-shell { display:flex; min-height:100vh; background:#f8fafc; color:#0f172a; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        .ad-side {
          width:256px; flex-shrink:0; background:#ffffff; border-right:1px solid #e2e8f0;
          display:flex; flex-direction:column; position:sticky; top:0; height:100vh; z-index:200;
        }
        .ad-brand { display:flex; align-items:center; gap:11px; padding:20px 20px 18px; border-bottom:1px solid #f1f5f9; }
        .ad-logo { width:36px; height:36px; border-radius:9px; background:#fff; border:1px solid #f1f5f9; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; }
        .ad-logo img { width:100%; height:100%; object-fit:contain; }
        .ad-brand-txt b { font-size:14px; font-weight:800; letter-spacing:.3px; color:#0f172a; display:block; line-height:1.1; }
        .ad-brand-txt span { font-size:11px; color:#94a3b8; letter-spacing:.4px; }
        .ad-nav { flex:1; overflow-y:auto; padding:14px 12px 20px; }
        .ad-nav::-webkit-scrollbar { width:6px; } .ad-nav::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:3px; }
        .ad-group-label { font-size:10.5px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94a3b8; padding:14px 12px 6px; }
        .ad-link {
          display:flex; align-items:center; gap:11px; padding:9px 12px; margin:1px 0; border-radius:8px;
          text-decoration:none; color:#475569; font-size:13.5px; font-weight:500; cursor:pointer;
          border-left:3px solid transparent; transition:background .12s, color .12s;
        }
        .ad-link .ad-ico { width:20px; text-align:center; font-size:15px; filter:grayscale(.25); }
        .ad-link:hover { background:#f8fafc; color:#0f172a; }
        .ad-link.active { background:#fbf7ec; color:#0f172a; font-weight:700; border-left-color:${GOLD}; }
        .ad-link.active .ad-ico { filter:none; }
        .ad-foot { border-top:1px solid #f1f5f9; padding:14px 16px; }
        .ad-user { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
        .ad-avatar { width:32px; height:32px; border-radius:50%; background:#0f172a; color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }
        .ad-user-txt { min-width:0; } .ad-user-txt b { font-size:12.5px; color:#0f172a; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ad-badge { display:inline-block; font-size:10px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; padding:1px 7px; border-radius:20px; margin-top:2px; }
        .ad-badge.owner { background:#fbf7ec; color:#8a6d1f; border:1px solid #ecdcae; }
        .ad-badge.editor { background:#f1f5f9; color:#64748b; border:1px solid #e2e8f0; }
        .ad-logout { width:100%; background:#fff; border:1px solid #e2e8f0; color:#475569; font-size:12.5px; font-weight:600; padding:8px; border-radius:8px; cursor:pointer; transition:all .12s; }
        .ad-logout:hover { border-color:#cbd5e1; background:#f8fafc; color:#0f172a; }
        .ad-main { flex:1; min-width:0; display:flex; flex-direction:column; }
        .ad-top { height:60px; position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:0 clamp(16px,3.5vw,34px); background:rgba(248,250,252,.82); backdrop-filter:blur(8px); border-bottom:1px solid #e2e8f0; }
        .ad-top h2 { font-size:16px; font-weight:800; color:#0f172a; letter-spacing:.2px; }
        .ad-viewsite { font-size:12.5px; color:#64748b; text-decoration:none; font-weight:600; }
        .ad-viewsite:hover { color:#0f172a; }
        .ad-burger { display:none; width:38px; height:38px; border:1px solid #e2e8f0; background:#fff; border-radius:9px; cursor:pointer; align-items:center; justify-content:center; font-size:17px; color:#0f172a; }
        .ad-content { flex:1; }
        .ad-backdrop { display:none; }
        @media (max-width:860px) {
          .ad-side { position:fixed; left:0; top:0; transform:translateX(-100%); transition:transform .25s ease; box-shadow:0 20px 50px rgba(15,23,42,.18); }
          .ad-side.open { transform:none; }
          .ad-burger { display:inline-flex; }
          .ad-backdrop.show { display:block; position:fixed; inset:0; background:rgba(15,23,42,.42); z-index:150; }
        }
      `}</style>

      <div className="ad-shell">
        {/* Sidebar */}
        <aside className={`ad-side ${navOpen ? 'open' : ''}`}>
          <div className="ad-brand">
            <div className="ad-logo"><img src="/logo.png" alt="TRVM" /></div>
            <div className="ad-brand-txt"><b>TRVM</b><span>Admin Panel</span></div>
          </div>

          <nav className="ad-nav">
            <a href="/admin" className={`ad-link ${isActive('/admin') ? 'active' : ''}`}>
              <span className="ad-ico">▦</span> Dashboard
            </a>

            {groups.map((g) => (
              <div key={g.name}>
                <div className="ad-group-label">{g.name}</div>
                {g.items.map((s) => (
                  <a key={s.key} href={s.href} className={`ad-link ${isActive(s.href) ? 'active' : ''}`}>
                    <span className="ad-ico">{s.icon}</span> {s.label}
                  </a>
                ))}
              </div>
            ))}

            {auth.role === 'owner' && (
              <div>
                <div className="ad-group-label">Administration</div>
                <a href="/admin/editors" className={`ad-link ${isActive('/admin/editors') ? 'active' : ''}`}>
                  <span className="ad-ico">🔑</span> Manage Editors
                </a>
              </div>
            )}
          </nav>

          <div className="ad-foot">
            <div className="ad-user">
              <div className="ad-avatar">{(auth.email[0] || 'A').toUpperCase()}</div>
              <div className="ad-user-txt">
                <b>{auth.email}</b>
                <span className={`ad-badge ${auth.role === 'owner' ? 'owner' : 'editor'}`}>{auth.role === 'owner' ? 'Owner' : 'Editor'}</span>
              </div>
            </div>
            <button className="ad-logout" onClick={logout}>Log out</button>
          </div>
        </aside>

        {/* Mobile backdrop */}
        <div className={`ad-backdrop ${navOpen ? 'show' : ''}`} onClick={() => setNavOpen(false)} />

        {/* Main */}
        <div className="ad-main">
          <header className="ad-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="ad-burger" onClick={() => setNavOpen(true)} aria-label="Open menu">☰</button>
              <h2>{pageTitle}</h2>
            </div>
            <a className="ad-viewsite" href="/" target="_blank" rel="noreferrer">View Site ↗</a>
          </header>

          <div className="ad-content">
            {denied ? (
              <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 46, marginBottom: 16 }}>🔒</div>
                <h1 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, marginBottom: 10 }}>No access</h1>
                <p style={{ color: '#64748b', lineHeight: 1.7 }}>You don&apos;t have permission to manage this section. Ask an owner if you need access.</p>
                <a href="/admin" style={{ color: '#8a6d1f', fontWeight: 700, display: 'inline-block', marginTop: 24, textDecoration: 'none' }}>← Back to Dashboard</a>
              </div>
            ) : children}
          </div>
        </div>
      </div>
    </AdminAuthContext.Provider>
  )
}