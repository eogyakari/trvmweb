'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Editor = { id: string; email: string; role: string; created_at: string }

async function authedFetch(url: string, opts: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || ''
  return fetch(url, { ...opts, headers: { ...(opts.headers || {}), 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } })
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6,
  fontSize: 14, fontFamily: 'Georgia, serif', marginTop: 6, outline: 'none',
  boxSizing: 'border-box', color: '#000', background: '#fff'
}
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }

export default function AdminEditorsPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [editors, setEditors] = useState<Editor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', role: 'editor' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setAllowed(false); return }
    const { data: row } = await supabase.from('admin_users').select('role').eq('id', session.user.id).maybeSingle()
    const ok = row?.role === 'owner'
    setAllowed(ok)
    if (ok) load()
  }

  async function load() {
    setLoading(true)
    const res = await authedFetch('/api/admin/editors')
    const data = await res.json()
    if (res.ok) setEditors(data.editors || [])
    setLoading(false)
  }

  async function addEditor() {
    if (!form.email || !form.password) { setErr('Email and password are required.'); return }
    if (form.password.length < 6) { setErr('Password must be at least 6 characters.'); return }
    setSaving(true); setErr('')
    const res = await authedFetch('/api/admin/editors', { method: 'POST', body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setErr(data.error || 'Failed to add editor.'); return }
    setShowForm(false); setForm({ email: '', password: '', role: 'editor' }); load()
  }

  async function changeRole(id: string, role: string) {
    await authedFetch('/api/admin/editors', { method: 'PATCH', body: JSON.stringify({ id, role }) })
    load()
  }

  async function remove(id: string, email: string) {
    if (!confirm(`Remove ${email}? They will lose admin access immediately.`)) return
    await authedFetch('/api/admin/editors', { method: 'DELETE', body: JSON.stringify({ id }) })
    load()
  }

  if (allowed === null) return <div style={{ padding: 48, textAlign: 'center', color: '#888', fontFamily: 'Georgia, serif' }}>Loading…</div>
  if (!allowed) return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '64px 24px', textAlign: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
      <h1 style={{ fontSize: '1.3rem', color: '#0f2419', fontWeight: 700, marginBottom: 8 }}>Owners only</h1>
      <p style={{ color: '#888' }}>Only an owner can manage editors.</p>
      <Link href="/admin" style={{ color: '#1a3a2a', fontWeight: 600, display: 'inline-block', marginTop: 20 }}>← Dashboard</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Manage Editors</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{editors.length} user{editors.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowForm(true); setErr('') }} style={{ background: '#c9a84c', color: '#0f2419', padding: '10px 24px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          + Add Editor
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 40, width: '100%', maxWidth: 460 }}>
            <h2 style={{ fontWeight: 700, color: '#0f2419', marginBottom: 20, fontSize: '1.2rem' }}>Add Editor</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Temporary Password *</label>
                <input type="text" style={inputStyle} value={form.password} placeholder="At least 6 characters" onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <p style={{ fontSize: 12, color: '#999', marginTop: 6 }}>Share this with the editor; they can sign in with it.</p>
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select style={inputStyle} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="editor">Editor (manage content)</option>
                  <option value="owner">Owner (also manage editors)</option>
                </select>
              </div>
              {err && <p style={{ color: '#c0392b', fontSize: 13, background: '#fbecea', padding: '10px 12px', borderRadius: 6 }}>{err}</p>}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#c9a84c', padding: '10px 24px', border: '2px solid #c9a84c', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
              <button onClick={addEditor} disabled={saving} style={{ background: '#c9a84c', color: '#0f2419', padding: '10px 28px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Adding…' : 'Add Editor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {editors.map(ed => (
            <div key={ed.id} style={{ background: 'white', borderRadius: 8, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 12, border: '1px solid #f0ebe0' }}>
              <div>
                <h3 style={{ fontWeight: 700, color: '#0f2419', fontSize: '0.95rem' }}>{ed.email}</h3>
                <p style={{ fontSize: 12, color: '#888', marginTop: 3, textTransform: 'capitalize' }}>{ed.role}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select value={ed.role} onChange={e => changeRole(ed.id, e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, fontFamily: 'Georgia, serif', background: '#fff', color: '#000' }}>
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </select>
                <button onClick={() => remove(ed.id, ed.email)} style={{ padding: '7px 16px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}