'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Goes at: src/app/admin/login/page.tsx
function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const denied = params.get('denied')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(denied ? 'That account is not an authorized admin.' : '')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) { setErr(error?.message || 'Login failed.'); setBusy(false); return }
    // Must be an approved admin.
    const { data: adminRow } = await supabase
      .from('admin_users').select('role').eq('id', data.session.user.id).maybeSingle()
    if (!adminRow) {
      await supabase.auth.signOut()
      setErr('That account is not an authorized admin.'); setBusy(false); return
    }
    router.replace('/admin')
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: '1px solid #d8cfbf', borderRadius: 8,
    fontSize: 15, fontFamily: 'Georgia, serif', marginTop: 6, outline: 'none',
    boxSizing: 'border-box', color: '#000', background: '#fff'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0ede6', fontFamily: 'Georgia, serif', padding: 24 }}>
      <form onSubmit={submit} style={{ background: 'white', borderRadius: 14, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, background: '#c9a84c', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#0f2419', fontWeight: 900, marginBottom: 12 }}>✝</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f2419' }}>Admin Login</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>The Righteous Vine Missions</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={input} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={input} />
        </div>
        {err && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 16, background: '#fbecea', padding: '10px 12px', borderRadius: 6 }}>{err}</p>}
        <button type="submit" disabled={busy} style={{ width: '100%', background: '#c9a84c', color: '#0f2419', padding: '13px', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default function AdminLoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>
}