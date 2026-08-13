'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import RichTextEditor from '../components/RichTextEditor'

type NewsItem = {
  id: string
  title: string
  slug: string
  body: string
  excerpt: string | null
  cover_image: string | null
  author: string
  published_date: string
  is_published: boolean
  created_at: string
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Strip HTML to a clean plain-text excerpt for email / Facebook.
function toPlainText(html: string, max = 200): string {
  const text = html
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ').trim()
  return text.length > max ? text.substring(0, max) + '...' : text
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd',
  borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif',
  marginTop: 6, outline: 'none', boxSizing: 'border-box', color: '#000', background: '#fff',
}
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#444', display: 'block',
}

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [form, setForm] = useState({ title: '', slug: '', body: '', excerpt: '', author: '', published_date: '', cover_image: '' })
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('news').select('*').order('published_date', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ title: '', slug: '', body: '', excerpt: '', author: 'TRVM', published_date: new Date().toISOString().split('T')[0], cover_image: '' })
    setImageFile(null)
    setShowForm(true)
  }

  function openEdit(d: NewsItem) {
    setEditing(d)
    setForm({ title: d.title, slug: d.slug, body: d.body, excerpt: d.excerpt || '', author: d.author, published_date: d.published_date, cover_image: d.cover_image || '' })
    setImageFile(null)
    setShowForm(true)
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return form.cover_image || null
    setUploading(true)
    const ext = imageFile.name.split('.').pop()
    const path = `news/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('trvm-media').upload(path, imageFile, { upsert: true })
    setUploading(false)
    if (error) { alert('Image upload failed: ' + error.message); return null }
    return supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
  }

  async function handleSave() {
    if (!form.title || !toPlainText(form.body, 999999) || !form.author || !form.published_date) {
      alert('Please fill in Title, Body, Author and Date.')
      return
    }
    setSaving(true)
    const imageUrl = await uploadImage()
    const slug = form.slug || slugify(form.title)
    const excerpt = form.excerpt || toPlainText(form.body, 200)
    const payload = {
      title: form.title, slug, body: form.body, excerpt,
      author: form.author, published_date: form.published_date, cover_image: imageUrl,
    }

    let newsId: string

    if (editing) {
      const { error } = await supabase.from('news').update(payload).eq('id', editing.id)
      if (error) { alert('Error: ' + error.message); setSaving(false); return }
      newsId = editing.id
    } else {
      const { data, error } = await supabase.from('news').insert(payload).select('id').single()
      if (error || !data) { alert('Error: ' + (error?.message || 'insert failed')); setSaving(false); return }
      newsId = (data as { id: string }).id

      // Optional: notify subscribers (new items only)
      const notify = confirm('News saved! Notify subscribers by email?')
      if (notify) {
        const summary = toPlainText(form.body)
        const url = `https://trvmissions.com/news/${slug}`
        await fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: `TRVM News: ${form.title}`,
            message: `${summary}\n\nRead the full story here:\n${url}`,
          }),
        })
        alert('Subscribers notified!')
      }

      // Optional: post to Facebook
      const postToFacebook = confirm('Post this news to TRVM Facebook page?')
      if (postToFacebook) {
        const summary = toPlainText(form.body)
        const res = await fetch('/api/facebook/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: form.title, summary, slug, imageUrl: imageUrl || null }),
        })
        const data = await res.json()
        if (data.success) alert('Posted to Facebook successfully!')
        else alert('Facebook post failed: ' + (data.error || 'Unknown error'))
      }
    }

    // Generate Indonesian + Swahili translations (new and edited)
    try {
      const res = await fetch(`/api/content/news/${newsId}/publish`, { method: 'POST' })
      const result = await res.json()
      if (!res.ok) alert('Saved, but translation failed: ' + (result.error || 'unknown error'))
      else if ((result.translated || []).length) alert(`Translated → ${result.translated.join(', ')}`)
    } catch (e: any) {
      alert('Saved, but translation request failed: ' + e.message)
    }

    setSaving(false)
    setShowForm(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this news item? This cannot be undone.')) return
    await supabase.from('news').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Ministry News</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} style={{
          background: '#c9a84c', color: '#0f2419', padding: '10px 24px',
          border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
          cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>+ New Article</button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 40, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 700, color: '#0f2419', marginBottom: 24, fontSize: '1.2rem' }}>
              {editing ? 'Edit Article' : 'New Article'}
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
                  <input type="date" style={inputStyle} value={form.published_date}
                    onChange={e => setForm(f => ({ ...f, published_date: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Slug (URL) — auto-generated if left blank</label>
                <input style={inputStyle} placeholder="e.g. annual-conference-2026" value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>

              <div>
                <label style={labelStyle}>Body *</label>
                <RichTextEditor value={form.body} onChange={html => setForm(f => ({ ...f, body: html }))} />
              </div>

              <div>
                <label style={labelStyle}>Excerpt (optional — auto-generated from body if blank)</label>
                <input style={inputStyle} value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
              </div>

              <div>
                <label style={labelStyle}>Cover Image (optional)</label>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-block', padding: '9px 20px', background: '#1a3a2a', color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                    Choose Image
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => setImageFile(e.target.files?.[0] || null)} />
                  </label>
                  {imageFile && <span style={{ fontSize: 13, color: '#1a3a2a', fontWeight: 600 }}>✓ {imageFile.name}</span>}
                </div>
                {form.cover_image && !imageFile && (
                  <img src={form.cover_image} alt="current" style={{ height: 80, marginTop: 10, borderRadius: 6, objectFit: 'cover', display: 'block' }} />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#c9a84c', padding: '10px 24px', border: '2px solid #c9a84c', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading} style={{ background: '#c9a84c', color: '#0f2419', padding: '10px 28px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', opacity: saving ? 0.7 : 1 }}>
                {saving || uploading ? 'Saving...' : 'Save Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
          <p>No news yet. Click <strong>+ New Article</strong> to add the first one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(d => (
            <div key={d.id} style={{ background: 'white', borderRadius: 8, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 12, border: '1px solid #f0ebe0' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {d.cover_image && <img src={d.cover_image} alt={d.title} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
                <div>
                  <h3 style={{ fontWeight: 700, color: '#0f2419', fontSize: '0.95rem' }}>{d.title}</h3>
                  <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                    {d.author} · {new Date(d.published_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {!d.is_published && <span style={{ color: '#e08a12', marginLeft: 8 }}>• Draft</span>}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(d)} style={{ padding: '7px 18px', background: '#1a3a2a', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif' }}>Edit</button>
                <button onClick={() => handleDelete(d.id)} style={{ padding: '7px 18px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}