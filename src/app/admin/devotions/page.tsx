'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Devotion } from '@/lib/types'
import Link from 'next/link'
import RichTextEditor from '../components/RichTextEditor'
import { useAdminAuth } from '../AdminGuard'

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Turn the editor's HTML into a clean plain-text excerpt for emails / Facebook.
function toPlainText(html: string, max = 200): string {
  const text = html
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? text.substring(0, max) + '...' : text
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

const monthKeyOf = (d: string) => (d || '').slice(0, 7)
const currentMonthKey = () => {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}
const monthLabel = (key: string) =>
  new Date(`${key}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

export default function AdminDevotionsPage() {
  const auth = useAdminAuth()
  const isOwner = auth?.role === 'owner'

  const [devotions, setDevotions] = useState<Devotion[]>([])
  const [months, setMonths] = useState<string[]>([])
  const [month, setMonth] = useState<string>(currentMonthKey())
  const [loading, setLoading] = useState(true)
  const [purging, setPurging] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Devotion | null>(null)
  const [form, setForm] = useState({ title: '', slug: '', content: '', author: '', date: '', cover_image: '' })
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Light query: just the dates, to build the month picker.
  const loadMonths = useCallback(async () => {
    const { data } = await supabase.from('devotions').select('date').order('date', { ascending: false })
    const seen = new Set<string>()
    const list: string[] = []
    for (const r of (data || []) as { date: string | null }[]) {
      if (!r.date) continue
      const k = r.date.slice(0, 7)
      if (!seen.has(k)) { seen.add(k); list.push(k) }
    }
    // Always offer the current month so you can add to it even when empty.
    const cur = currentMonthKey()
    if (!seen.has(cur)) list.unshift(cur)
    list.sort((a, b) => (a < b ? 1 : -1))
    setMonths(list)
    return list
  }, [])

  // Heavy query scoped to one month.
  const loadMonth = useCallback(async (key: string) => {
    setLoading(true)
    const [y, m] = key.split('-').map(Number)
    const start = `${y}-${String(m).padStart(2, '0')}-01`
    const nextY = m === 12 ? y + 1 : y
    const nextM = m === 12 ? 1 : m + 1
    const end = `${nextY}-${String(nextM).padStart(2, '0')}-01`
    const { data } = await supabase
      .from('devotions').select('*')
      .gte('date', start).lt('date', end)
      .order('date', { ascending: false })
    setDevotions(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    (async () => {
      const list = await loadMonths()
      const initial = list.includes(currentMonthKey()) ? currentMonthKey() : (list[0] || currentMonthKey())
      setMonth(initial)
      await loadMonth(initial)
    })()
  }, [loadMonths, loadMonth])

  function changeMonth(key: string) {
    setMonth(key)
    loadMonth(key)
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
    if (!form.title || !toPlainText(form.content, 999999) || !form.author || !form.date) {
      alert('Please fill in Title, Content, Author and Date.')
      return
    }
    setSaving(true)
    const imageUrl = await uploadImage()
    const slug = form.slug || slugify(form.title)
    const payload = { title: form.title, slug, content: form.content, author: form.author, date: form.date, cover_image: imageUrl }

    let devotionId: string

    if (editing) {
      const { error } = await supabase.from('devotions').update(payload).eq('id', editing.id)
      if (error) { alert('Error: ' + error.message); setSaving(false); return }
      devotionId = editing.id
    } else {
      const { data, error } = await supabase.from('devotions').insert(payload).select('id').single()
      if (error || !data) { alert('Error: ' + (error?.message || 'insert failed')); setSaving(false); return }
      devotionId = (data as { id: string }).id

      // Auto-notify subscribers for new devotions only
      const notify = confirm('Devotion saved! Notify subscribers by email?')
      if (notify) {
        const summary = toPlainText(form.content) // plain text, no HTML tags
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

      // Auto-post to Facebook
      const postToFacebook = confirm('Post this devotion to TRVM Facebook page?')
      if (postToFacebook) {
        const summary = toPlainText(form.content) // plain text, no HTML tags
        const res = await fetch('/api/facebook/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            summary,
            slug,
            imageUrl: imageUrl || null,
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

    // Generate Indonesian + Swahili translations (both new and edited devotions)
    try {
      const res = await fetch(`/api/content/devotion/${devotionId}/publish`, { method: 'POST' })
      const result = await res.json()
      if (!res.ok) {
        alert('Saved, but translation failed: ' + (result.error || 'unknown error'))
      } else if ((result.translated || []).length) {
        alert(`Translated → ${result.translated.join(', ')}`)
      }
    } catch (e: any) {
      alert('Saved, but translation request failed: ' + e.message)
    }

    setSaving(false)
    setShowForm(false)
    // Jump to the month of the devotion we just saved so it's visible.
    const savedMonth = monthKeyOf(form.date)
    await loadMonths()
    setMonth(savedMonth)
    await loadMonth(savedMonth)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this devotion? This cannot be undone.')) return
    await supabase.from('devotion_translations').delete().eq('devotion_id', id)
    await supabase.from('devotions').delete().eq('id', id)
    await loadMonths()
    loadMonth(month)
  }

  // Owner-only backup for the yearly auto-purge.
  async function clearPreviousYears() {
    const year = new Date().getFullYear()
    const cutoff = `${year}-01-01`
    if (!confirm(`Permanently delete ALL devotions dated before 1 Jan ${year}? This cannot be undone.`)) return
    setPurging(true)
    const { data: old } = await supabase.from('devotions').select('id').lt('date', cutoff)
    const ids = (old || []).map((r: { id: string }) => r.id)
    if (ids.length === 0) { setPurging(false); alert('No devotions from previous years to clear.'); return }
    await supabase.from('devotion_translations').delete().in('devotion_id', ids)
    const { error } = await supabase.from('devotions').delete().lt('date', cutoff)
    setPurging(false)
    if (error) { alert('Error clearing: ' + error.message); return }
    alert(`Cleared ${ids.length} devotion${ids.length !== 1 ? 's' : ''} from previous years.`)
    const list = await loadMonths()
    const initial = list.includes(currentMonthKey()) ? currentMonthKey() : (list[0] || currentMonthKey())
    setMonth(initial)
    loadMonth(initial)
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Devotions</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
            {loading ? 'Loading…' : `${devotions.length} devotion${devotions.length !== 1 ? 's' : ''} in ${monthLabel(month)}`}
          </p>
        </div>
        <button onClick={openNew} style={{
          background: '#c9a84c', color: '#0f2419', padding: '10px 24px',
          border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
          cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          + New Devotion
        </button>
      </div>

      {/* Month toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>Month</label>
          <select
            value={month}
            onChange={e => changeMonth(e.target.value)}
            style={{ ...inputStyle, width: 'auto', marginTop: 0, minWidth: 190, cursor: 'pointer' }}
          >
            {months.map(k => (
              <option key={k} value={k}>{monthLabel(k)}</option>
            ))}
          </select>
        </div>
        {isOwner && (
          <button onClick={clearPreviousYears} disabled={purging} style={{
            background: 'transparent', color: '#b91c1c', padding: '8px 16px',
            border: '1px solid #e2b4b4', borderRadius: 6, fontWeight: 600, fontSize: 12.5,
            cursor: purging ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', opacity: purging ? 0.6 : 1
          }}>
            {purging ? 'Clearing…' : '🗑 Clear previous years'}
          </button>
        )}
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
                <RichTextEditor value={form.content} onChange={html => setForm(f => ({ ...f, content: html }))} />
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
          <p>No devotions in {monthLabel(month)}. Click <strong>+ New Devotion</strong> to add one.</p>
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