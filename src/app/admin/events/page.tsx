'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'


type EventRow = {
  id: string; title: string; slug: string; type: string; description: string | null
  cover_image: string | null; start_at: string | null; end_at: string | null
  location: string | null; is_online: boolean
  registration_type: string; price: number; currency: string
  youtube_video_id: string | null; zoom_join_url: string | null
  is_featured: boolean; is_published: boolean; created_at: string
}

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6,
  fontSize: 14, fontFamily: 'Georgia, serif', marginTop: 6, outline: 'none',
  boxSizing: 'border-box', color: '#000', background: '#fff'
}
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }

const EMPTY = {
  title: '', slug: '', type: 'conference', description: '', cover_image: '',
  start_at: '', end_at: '', location: 'Online', is_online: true,
  registration_type: 'none', price: 0, currency: 'GHS',
  youtube_video_id: '', zoom_join_url: '', is_featured: false, is_published: true,
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<EventRow | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('events').select('*').order('start_at', { ascending: false })
    setEvents((data as EventRow[]) || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null); setForm({ ...EMPTY }); setImageFile(null); setShowForm(true)
  }
  function openEdit(e: EventRow) {
    setEditing(e)
    setForm({
      title: e.title, slug: e.slug, type: e.type || 'conference', description: e.description || '',
      cover_image: e.cover_image || '',
      start_at: e.start_at ? e.start_at.slice(0, 16) : '',
      end_at: e.end_at ? e.end_at.slice(0, 16) : '',
      location: e.location || '', is_online: e.is_online,
      registration_type: e.registration_type || 'none', price: e.price || 0, currency: e.currency || 'GHS',
      youtube_video_id: e.youtube_video_id || '', zoom_join_url: e.zoom_join_url || '',
      is_featured: e.is_featured, is_published: e.is_published,
    })
    setImageFile(null); setShowForm(true)
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return form.cover_image || null
    setUploading(true)
    const ext = imageFile.name.split('.').pop()
    const path = `events/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('trvm-media').upload(path, imageFile, { upsert: true })
    setUploading(false)
    if (error) { alert('Image upload failed: ' + error.message); return null }
    return supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
  }

  async function handleSave() {
    if (!form.title || !form.start_at) { alert('Please fill in at least Title and Start date/time.'); return }
    setSaving(true)
    const imageUrl = await uploadImage()
    const slug = form.slug || slugify(form.title)
    const payload: any = {
      title: form.title, slug, type: form.type, description: form.description,
      cover_image: imageUrl,
      start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
      end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
      location: form.location, is_online: form.is_online,
      registration_type: form.registration_type, price: Number(form.price) || 0, currency: form.currency,
      youtube_video_id: form.youtube_video_id.trim() || null,
      zoom_join_url: form.zoom_join_url.trim() || null,
      is_featured: form.is_featured, is_published: form.is_published,
    }

    // Only one featured event at a time — unset others if this one is featured.
    let eventId: string
    if (editing) {
      const { error } = await supabase.from('events').update(payload).eq('id', editing.id)
      if (error) { alert('Error: ' + error.message); setSaving(false); return }
      eventId = editing.id
    } else {
      const { data, error } = await supabase.from('events').insert(payload).select('id').single()
      if (error || !data) { alert('Error: ' + (error?.message || 'insert failed')); setSaving(false); return }
      eventId = (data as { id: string }).id
    }
    if (form.is_featured) {
      await supabase.from('events').update({ is_featured: false }).neq('id', eventId)
    }

    // Generate ID + SW translations (title + description) via existing pipeline.
    try {
      const res = await fetch(`/api/content/event/${eventId}/publish`, { method: 'POST' })
      const result = await res.json()
      if (res.ok && (result.translated || []).length) {
        // translated silently; no alert needed on every save
      }
    } catch { /* non-fatal */ }

    setSaving(false); setShowForm(false); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event? This cannot be undone.')) return
    await supabase.from('events').delete().eq('id', id)
    load()
  }

  function statusOf(e: EventRow): { label: string; color: string } {
    const now = Date.now()
    const s = e.start_at ? new Date(e.start_at).getTime() : 0
    const en = e.end_at ? new Date(e.end_at).getTime() : s + 2 * 3600 * 1000
    if (now >= s && now <= en) return { label: 'LIVE', color: '#e53e3e' }
    if (now < s) return { label: 'Upcoming', color: '#1a7a3a' }
    return { label: 'Past', color: '#888' }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Conferences & Events</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} style={{ background: '#c9a84c', color: '#0f2419', padding: '10px 24px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          + New Event
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 40, width: '100%', maxWidth: 720, margin: 'auto' }}>
            <h2 style={{ fontWeight: 700, color: '#0f2419', marginBottom: 24, fontSize: '1.2rem' }}>{editing ? 'Edit Event' : 'New Event'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input style={inputStyle} value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select style={inputStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="conference">Conference (broadcast / YouTube Live)</option>
                    <option value="meeting">Meeting (interactive / Zoom)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Slug (auto if blank)</label>
                  <input style={inputStyle} value={form.slug} placeholder="e.g. mission-2026" onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Start date & time *</label>
                  <input type="datetime-local" style={inputStyle} value={form.start_at} onChange={e => setForm(f => ({ ...f, start_at: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>End date & time</label>
                  <input type="datetime-local" style={inputStyle} value={form.end_at} onChange={e => setForm(f => ({ ...f, end_at: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input style={inputStyle} value={form.location} placeholder="Online, or a city/venue" onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 10 }}>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_online} onChange={e => setForm(f => ({ ...f, is_online: e.target.checked }))} /> Online event
                  </label>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>YouTube video/stream ID</label>
                  <input style={inputStyle} value={form.youtube_video_id} placeholder="e.g. dQw4w9WgXcQ" onChange={e => setForm(f => ({ ...f, youtube_video_id: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Zoom join URL (meetings)</label>
                  <input style={inputStyle} value={form.zoom_join_url} placeholder="https://zoom.us/j/..." onChange={e => setForm(f => ({ ...f, zoom_join_url: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Registration</label>
                  <select style={inputStyle} value={form.registration_type} onChange={e => setForm(f => ({ ...f, registration_type: e.target.value }))}>
                    <option value="none">No registration</option>
                    <option value="free">Free (collect details)</option>
                    <option value="paid">Paid (Paystack)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Price</label>
                  <input type="number" min={0} step="0.01" style={inputStyle} value={form.price} disabled={form.registration_type !== 'paid'} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select style={inputStyle} value={form.currency} disabled={form.registration_type !== 'paid'} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                    {['GHS','USD','GBP','EUR'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Cover Image</label>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-block', padding: '9px 20px', background: '#1a3a2a', color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                    Choose Image
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImageFile(e.target.files?.[0] || null)} />
                  </label>
                  {imageFile && <span style={{ fontSize: 13, color: '#1a3a2a', fontWeight: 600 }}>✓ {imageFile.name}</span>}
                </div>
                {form.cover_image && !imageFile && <img src={form.cover_image} alt="current" style={{ height: 80, marginTop: 10, borderRadius: 6, objectFit: 'cover', display: 'block' }} />}
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} /> Featured (show first)
                </label>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} /> Published
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#c9a84c', padding: '10px 24px', border: '2px solid #c9a84c', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading} style={{ background: '#c9a84c', color: '#0f2419', padding: '10px 28px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', opacity: saving ? 0.7 : 1 }}>
                {saving || uploading ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <p>No events yet. Click <strong>+ New Event</strong> to add the first one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map(e => {
            const st = statusOf(e)
            return (
              <div key={e.id} style={{ background: 'white', borderRadius: 8, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 12, border: '1px solid #f0ebe0' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  {e.cover_image && <img src={e.cover_image} alt={e.title} style={{ width: 56, height: 42, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, color: '#0f2419', fontSize: '0.95rem' }}>{e.title}</h3>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'white', background: st.color, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase' }}>{st.label}</span>
                      {e.is_featured && <span style={{ fontSize: 10, fontWeight: 700, color: '#0f2419', background: '#c9a84c', padding: '2px 7px', borderRadius: 4 }}>FEATURED</span>}
                      {!e.is_published && <span style={{ fontSize: 10, color: '#888', border: '1px solid #ccc', padding: '1px 6px', borderRadius: 4 }}>Draft</span>}
                    </div>
                    <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                      {e.type === 'meeting' ? 'Meeting' : 'Conference'} · {e.start_at ? new Date(e.start_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No date'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(e)} style={{ padding: '7px 18px', background: '#1a3a2a', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif' }}>Edit</button>
                  <button onClick={() => handleDelete(e.id)} style={{ padding: '7px 18px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif' }}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}