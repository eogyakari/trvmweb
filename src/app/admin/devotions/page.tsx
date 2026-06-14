'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Devotion } from '@/lib/types'
import Link from 'next/link'

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd',
  borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif',
  marginTop: 6, outline: 'none', boxSizing: 'border-box',
  color: '#000', background: '#fff'
}
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#444', display: 'block'
}

export default function AdminDevotionsPage() {
  const [devotions, setDevotions] = useState<Devotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Devotion | null>(null)
  const [form, setForm] = useState({ title: '', slug: '', content: '', author: '', date: '', cover_image: '' })
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('devotions').select('*').order('date', { ascending: false })
    setDevotions(data || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ title: '', slug: '', content: '', author: 'TRVM', date: new Date().toISOString().split('T')[0], cover_image: '' })
    setImageFile(null)
    setShowForm(true)
  }

  function openEdit(d: Devotion) {
    setEditing(d)
    setForm({ title: d.title, slug: d.slug, content: d.content, author: d.author, date: d.date, cover_image: d.cover_image || '' })
    setImageFile(null)
    setShowForm(true)
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return form.cover_image || null
    setUploading(true)
    const ext = imageFile.name.split('.').pop()
    const path = `devotions/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('trvm-media').upload(path, imageFile, { upsert: true })
    setUploading(false)
    if (error) { alert('Image upload failed: ' + error.message); return null }
    return supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
  }

  async function handleSave() {
    if (!form.title || !form.content || !form.author || !form.date) {
      alert('Please fill in Title, Content, Author and Date.')
      return
    }
    setSaving(true)
    const imageUrl = await uploadImage()
    const slug = form.slug || slugify(form.title)
    const payload = { title: form.title, slug, content: form.content, author: form.author, date: form.date, cover_image: imageUrl }

    if (editing) {
      const { error } = await supabase.from('devotions').update(payload).eq('id', editing.id)
      if (error) { alert('Error: ' + error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('devotions').insert(payload)
      if (error) { alert('Error: ' + error.message); setSaving(false); return }

      // Auto-notify subscribers for new devotions only
      const notify = confirm('Devotion saved! Notify subscribers by email?')
      if (notify) {
        const summary = form.content.substring(0, 200) + '...'
        const devotionUrl = `https://trvmissions.com/devotions/${slug}`
        await fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: `Daily Devotion: ${form.title}`,
            message: `${summary}\n\nRead the full devotion here:\n${devotionUrl}`
          })
        })
        alert('Subscribers notified!')
      }
    }
    setSaving(false)
    setShowForm(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this devotion? This cannot be undone.')) return
    await supabase.from('devotions').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Devotions</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{devotions.length} devotion{devotions.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} style={{
          background: '#c9a84c', color: '#0f2419', padding: '10px 24px',
          border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
          cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          + New Devotion
        </button>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: 'white', borderRadius: 12, padding: 40,
            width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ fontWeight: 700, color: '#0f2419', marginBottom: 24, fontSize: '1.2rem' }}>
              {editing ? 'Edit Devotion' : 'New Devotion'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input style={inputStyle} value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Author *</label>
                  <input style={inputStyle} value={form.author}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input type="date" style={inputStyle} value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Slug (URL) — auto-generated if left blank</label>
                <input style={inputStyle} placeholder="e.g. walking-by-faith" value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>

              <div>
                <label style={labelStyle}>Content *</label>
                <textarea rows={10} style={{ ...inputStyle, resize: 'vertical' }} value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
              </div>

              <div>
                <label style={labelStyle}>Cover Image (optional)</label>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <label style={{
                    display: 'inline-block', padding: '9px 20px', background: '#1a3a2a',
                    color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Georgia, serif'
                  }}>
                    Choose Image
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => setImageFile(e.target.files?.[0] || null)} />
                  </label>
                  {imageFile && (
                    <span style={{ fontSize: 13, color: '#1a3a2a', fontWeight: 600 }}>
                      ✓ {imageFile.name}
                    </span>
                  )}
                </div>
                {form.cover_image && !imageFile && (
                  <img src={form.cover_image} alt="current"
                    style={{ height: 80, marginTop: 10, borderRadius: 6, objectFit: 'cover', display: 'block' }} />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{
                background: 'transparent', color: '#c9a84c', padding: '10px 24px',
                border: '2px solid #c9a84c', borderRadius: 6, fontWeight: 700,
                fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif'
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading} style={{
                background: '#c9a84c', color: '#0f2419', padding: '10px 28px',
                border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif',
                opacity: saving ? 0.7 : 1
              }}>
                {saving || uploading ? 'Saving...' : 'Save Devotion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
      ) : devotions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
          <p>No devotions yet. Click <strong>+ New Devotion</strong> to add the first one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {devotions.map(d => (
            <div key={d.id} style={{
              background: 'white', borderRadius: 8, padding: '16px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 12,
              border: '1px solid #f0ebe0'
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {d.cover_image && (
                  <img src={d.cover_image} alt={d.title}
                    style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div>
                  <h3 style={{ fontWeight: 700, color: '#0f2419', fontSize: '0.95rem' }}>{d.title}</h3>
                  <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                    {d.author} · {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(d)} style={{
                  padding: '7px 18px', background: '#1a3a2a', color: 'white',
                  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif'
                }}>Edit</button>
                <button onClick={() => handleDelete(d.id)} style={{
                  padding: '7px 18px', background: '#e53e3e', color: 'white',
                  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif'
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}