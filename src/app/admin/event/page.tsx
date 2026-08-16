'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6,
  fontSize: 14, fontFamily: 'Georgia, serif', marginTop: 6, boxSizing: 'border-box', color: '#000', background: '#fff',
}
const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }

type EventRow = {
  id?: string; is_active: boolean; strip_text: string; title: string; slug: string
  tagline: string; cover_image: string; overview: string; start_date: string; end_date: string
  duration_text: string; locations: string; activities: string; partners: string; extra_info: string
}

const empty: EventRow = {
  is_active: false, strip_text: '', title: '', slug: 'featured-event', tagline: '', cover_image: '',
  overview: '', start_date: '', end_date: '', duration_text: '', locations: '', activities: '', partners: '', extra_info: '',
}

export default function AdminEventPage() {
  const [form, setForm] = useState<EventRow>(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('featured_event').select('*').limit(1).maybeSingle()
    if (data) setForm({ ...empty, ...data, start_date: data.start_date || '', end_date: data.end_date || '' } as EventRow)
    setLoading(false)
  }

  const set = (k: keyof EventRow) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function uploadImage(): Promise<string> {
    if (!imageFile) return form.cover_image || ''
    const ext = imageFile.name.split('.').pop()
    const path = `events/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('trvm-media').upload(path, imageFile, { upsert: true })
    if (error) { alert('Image upload failed: ' + error.message); return form.cover_image || '' }
    return supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
  }

  async function handleSave() {
    if (!form.title) { alert('Title is required.'); return }
    setSaving(true)
    const cover = await uploadImage()
    const payload = {
      ...form, cover_image: cover,
      start_date: form.start_date || null, end_date: form.end_date || null,
      updated_at: new Date().toISOString(),
    }
    let error
    if (form.id) ({ error } = await supabase.from('featured_event').update(payload).eq('id', form.id))
    else ({ error } = await supabase.from('featured_event').insert(payload))
    setSaving(false)
    if (error) { alert('Error: ' + error.message); return }
    setSaved(true); setTimeout(() => setSaved(false), 3000)
    load()
  }

  if (loading) return <p style={{ textAlign: 'center', padding: 60, fontFamily: 'Georgia, serif' }}>Loading...</p>

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', margin: '4px 0 24px' }}>Featured Event</h1>

      {/* Active toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: 16, background: form.is_active ? '#e8f5e9' : '#f5f5f5', borderRadius: 8 }}>
        <span style={{ fontWeight: 700, color: '#333' }}>Show on homepage</span>
        <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} style={{
          position: 'relative', width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
          background: form.is_active ? '#2e7d32' : '#bbb',
        }}>
          <span style={{ position: 'absolute', top: 3, left: form.is_active ? 27 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
        </button>
        <span style={{ fontWeight: 700, color: form.is_active ? '#2e7d32' : '#999' }}>{form.is_active ? 'LIVE' : 'OFF'}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label style={label}>Event Title *</label><input style={inputStyle} value={form.title} onChange={set('title')} placeholder="Mission 2026" /></div>
        <div><label style={label}>Banner Strip Text (short — shows at top of homepage)</label><input style={inputStyle} value={form.strip_text} onChange={set('strip_text')} placeholder="Mission 2026 — September, Indonesia" /></div>
        <div><label style={label}>Tagline</label><input style={inputStyle} value={form.tagline} onChange={set('tagline')} /></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={label}>Start Date</label><input type="date" style={inputStyle} value={form.start_date} onChange={set('start_date')} /></div>
          <div><label style={label}>End Date</label><input type="date" style={inputStyle} value={form.end_date} onChange={set('end_date')} /></div>
        </div>
        <div><label style={label}>Duration (free text, optional)</label><input style={inputStyle} value={form.duration_text} onChange={set('duration_text')} placeholder="10 days" /></div>
        <div><label style={label}>Locations</label><input style={inputStyle} value={form.locations} onChange={set('locations')} placeholder="Java · Bali · Sumatra" /></div>

        <div><label style={label}>Overview (paragraph)</label><textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.overview} onChange={set('overview')} /></div>
        <div><label style={label}>Activities (one per line)</label><textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.activities} onChange={set('activities')} placeholder={"Open-air crusade\nDiscipleship training\nCommunity outreach"} /></div>
        <div><label style={label}>Partner Ministries (one per line)</label><textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.partners} onChange={set('partners')} /></div>
        <div><label style={label}>Extra Information</label><textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.extra_info} onChange={set('extra_info')} /></div>

        <div>
          <label style={label}>Cover Image</label>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ padding: '9px 20px', background: '#1a3a2a', color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Choose Image
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImageFile(e.target.files?.[0] || null)} />
            </label>
            {imageFile && <span style={{ fontSize: 13, color: '#1a3a2a', fontWeight: 600 }}>✓ {imageFile.name}</span>}
            {form.cover_image && !imageFile && <img src={form.cover_image} alt="cover" style={{ height: 60, borderRadius: 6, objectFit: 'cover' }} />}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', background: saved ? '#1a3a2a' : '#c9a84c', color: saved ? 'white' : '#0f2419',
          padding: 14, border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 8,
        }}>{saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Event'}</button>
      </div>
    </div>
  )
}