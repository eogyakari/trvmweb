'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Newsletter } from '@/lib/types'
import Link from 'next/link'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd',
  borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif',
  marginTop: 6, outline: 'none', boxSizing: 'border-box', color: '#000', background: '#fff'
}
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#444', display: 'block'
}

export default function AdminNewslettersPage() {
  const [items, setItems] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Newsletter | null>(null)
  const [form, setForm] = useState({ title: '', issue_number: '', pdf_url: '', date: '' })
  const [saving, setSaving] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('newsletters').select('*').order('date', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ title: '', issue_number: '', pdf_url: '', date: new Date().toISOString().split('T')[0] })
    setPdfFile(null); setShowForm(true)
  }

  function openEdit(n: Newsletter) {
    setEditing(n)
    setForm({ title: n.title, issue_number: n.issue_number || '', pdf_url: n.pdf_url || '', date: n.date || '' })
    setPdfFile(null); setShowForm(true)
  }

  async function handleSave() {
    if (!form.title) { alert('Title is required.'); return }
    setSaving(true)

    let pdfUrl = form.pdf_url
    if (pdfFile) {
      const ext = pdfFile.name.split('.').pop()
      const path = `newsletters/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('trvm-media').upload(path, pdfFile, { upsert: true })
      if (error) { alert('Upload failed: ' + error.message); setSaving(false); return }
      pdfUrl = supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
    }

    const payload = { title: form.title, issue_number: form.issue_number || null, pdf_url: pdfUrl || null, date: form.date || null }

    if (editing) {
      const { error } = await supabase.from('newsletters').update(payload).eq('id', editing.id)
      if (error) { alert(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('newsletters').insert(payload)
      if (error) { alert(error.message); setSaving(false); return }

      // Notify subscribers
      const notify = confirm('Newsletter saved! Notify subscribers by email?')
      if (notify) {
        const newsletterUrl = pdfUrl || 'https://trvmissions.com/publications#newsletters'
        await fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: `New Newsletter: ${form.title}`,
            message: `The latest TRVM Newsletter is now available.\n\n${form.title}${form.issue_number ? ` — Issue ${form.issue_number}` : ''}\n\nDownload or read it here:\n${newsletterUrl}`
          })
        })
        alert('Subscribers notified!')
      }

      // Post to Facebook
      const postFb = confirm('Post this newsletter to TRVM Facebook page?')
      if (postFb) {
        const res = await fetch('/api/facebook/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `New Newsletter: ${form.title}`,
            summary: `${form.title}${form.issue_number ? ` — Issue ${form.issue_number}` : ''}. Download the latest TRVM Newsletter now.`,
            slug: '',
            imageUrl: null,
          })
        })
        const data = await res.json()
        if (data.success) {
          alert('Posted to Facebook successfully!')
        } else {
          alert('Facebook post failed: ' + (data.error || 'Unknown error'))
        }
      }
    }
    setSaving(false); setShowForm(false); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this newsletter?')) return
    await supabase.from('newsletters').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Newsletters</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{items.length} newsletter{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} style={{ background: '#c9a84c', color: '#0f2419', padding: '10px 24px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          + New Newsletter
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 40, width: '100%', maxWidth: 540 }}>
            <h2 style={{ fontWeight: 700, color: '#0f2419', marginBottom: 24, fontSize: '1.2rem' }}>
              {editing ? 'Edit Newsletter' : 'New Newsletter'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Issue Number</label>
                  <input style={inputStyle} placeholder="e.g. 24" value={form.issue_number} onChange={e => setForm(f => ({ ...f, issue_number: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>PDF — Upload file</label>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  marginTop: 8, padding: '9px 20px', background: '#1a3a2a', color: 'white',
                  borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Georgia, serif'
                }}>
                  📎 Choose PDF file
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setPdfFile(e.target.files?.[0] || null)} />
                </label>
                {pdfFile && <p style={{ fontSize: 12, color: '#1a3a2a', marginTop: 6, fontWeight: 600 }}>✓ {pdfFile.name}</p>}
                <label style={{ ...labelStyle, marginTop: 10 }}>OR paste Google Drive / external URL</label>
                <input style={inputStyle} placeholder="https://drive.google.com/..." value={form.pdf_url} onChange={e => setForm(f => ({ ...f, pdf_url: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#c9a84c', padding: '10px 24px', border: '2px solid #c9a84c', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ background: '#c9a84c', color: '#0f2419', padding: '10px 28px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Newsletter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <p>No newsletters yet. Click <strong>+ New Newsletter</strong> to add one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(n => (
            <div key={n.id} style={{ background: 'white', borderRadius: 8, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 12, border: '1px solid #f0ebe0' }}>
              <div>
                <h3 style={{ fontWeight: 700, color: '#0f2419', fontSize: '0.95rem' }}>{n.title}</h3>
                <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                  {n.issue_number ? `Issue ${n.issue_number}` : ''}
                  {n.issue_number && n.date ? ' · ' : ''}
                  {n.date ? new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(n)} style={{ padding: '7px 18px', background: '#1a3a2a', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif' }}>Edit</button>
                <button onClick={() => handleDelete(n.id)} style={{ padding: '7px 18px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}