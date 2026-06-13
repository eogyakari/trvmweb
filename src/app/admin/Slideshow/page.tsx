'use client'
//slideshow admin

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Slide = {
  id: string
  image_url: string
  caption: string | null
  sort_order: number
  created_at: string
}

export default function AdminSlideshowPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Slide | null>(null)
  const [caption, setCaption] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('slideshow').select('*').order('sort_order', { ascending: true })
    setSlides(data || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setCaption('')
    setSortOrder(slides.length)
    setImageFile(null)
    setPreview(null)
    setShowForm(true)
  }

  function openEdit(s: Slide) {
    setEditing(s)
    setCaption(s.caption || '')
    setSortOrder(s.sort_order)
    setImageFile(null)
    setPreview(s.image_url)
    setShowForm(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!editing && !imageFile) { alert('Please select an image.'); return }
    setSaving(true)

    let imageUrl = editing?.image_url || ''

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `slideshow/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('trvm-media').upload(path, imageFile, { upsert: true })
      if (error) { alert('Upload failed: ' + error.message); setSaving(false); return }
      imageUrl = supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
    }

    const payload = { image_url: imageUrl, caption: caption || null, sort_order: sortOrder }

    if (editing) {
      const { error } = await supabase.from('slideshow').update(payload).eq('id', editing.id)
      if (error) { alert(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('slideshow').insert(payload)
      if (error) { alert(error.message); setSaving(false); return }
    }

    setSaving(false)
    setShowForm(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this slide?')) return
    await supabase.from('slideshow').delete().eq('id', id)
    load()
  }

  async function moveUp(slide: Slide, index: number) {
    if (index === 0) return
    const prev = slides[index - 1]
    await supabase.from('slideshow').update({ sort_order: prev.sort_order }).eq('id', slide.id)
    await supabase.from('slideshow').update({ sort_order: slide.sort_order }).eq('id', prev.id)
    load()
  }

  async function moveDown(slide: Slide, index: number) {
    if (index === slides.length - 1) return
    const next = slides[index + 1]
    await supabase.from('slideshow').update({ sort_order: next.sort_order }).eq('id', slide.id)
    await supabase.from('slideshow').update({ sort_order: slide.sort_order }).eq('id', next.id)
    load()
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Homepage Slideshow</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{slides.length} slide{slides.length !== 1 ? 's' : ''} · auto-advances every 5 seconds</p>
        </div>
        <button onClick={openNew} style={{
          background: '#c9a84c', color: '#0f2419', padding: '10px 24px',
          border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
          cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>+ Add Slide</button>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 40, width: '100%', maxWidth: 520 }}>
            <h2 style={{ fontWeight: 700, color: '#0f2419', marginBottom: 24, fontSize: '1.2rem' }}>
              {editing ? 'Edit Slide' : 'New Slide'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                  {editing ? 'Replace Image (optional)' : 'Image *'}
                </label>
                <div onClick={() => fileInputRef.current?.click()} style={{
                  border: '2px dashed #ddd', borderRadius: 8, padding: 24,
                  textAlign: 'center', cursor: 'pointer', background: '#fafafa'
                }}>
                  {preview ? (
                    <img src={preview} alt="preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 6, objectFit: 'contain' }} />
                  ) : (
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                      <p style={{ fontSize: 13, color: '#888' }}>Click to select an image</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Caption (optional)</label>
                <input
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif', color: '#000', background: '#fff', boxSizing: 'border-box' }}
                  placeholder="e.g. Mission trip to the Northern Islands"
                  value={caption}
                  onChange={e => setCaption(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Order (0 = first)</label>
                <input
                  type="number" min={0}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif', color: '#000', background: '#fff', boxSizing: 'border-box' }}
                  value={sortOrder}
                  onChange={e => setSortOrder(Number(e.target.value))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{
                background: 'transparent', color: '#c9a84c', padding: '10px 24px',
                border: '2px solid #c9a84c', borderRadius: 6, fontWeight: 700,
                fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif'
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                background: '#c9a84c', color: '#0f2419', padding: '10px 28px',
                border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif',
                opacity: saving ? 0.7 : 1
              }}>
                {saving ? 'Saving...' : editing ? 'Update Slide' : 'Add Slide'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLIDES LIST */}
      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
      ) : slides.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
          <p>No slides yet. Click <strong>+ Add Slide</strong> to add the first one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {slides.map((slide, index) => (
            <div key={slide.id} style={{
              background: 'white', borderRadius: 8, overflow: 'hidden',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f0ebe0',
              display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
              flexWrap: 'wrap'
            }}>
              <img src={slide.image_url} alt={slide.caption || ''}
                style={{ width: 100, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 150 }}>
                <p style={{ fontWeight: 600, color: '#0f2419', fontSize: 14 }}>
                  {slide.caption || <span style={{ color: '#aaa', fontStyle: 'italic' }}>No caption</span>}
                </p>
                <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Order: {slide.sort_order}</p>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => moveUp(slide, index)} disabled={index === 0}
                  style={{ padding: '6px 10px', background: '#f0ebe0', border: 'none', borderRadius: 4, cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: 14, opacity: index === 0 ? 0.4 : 1 }}>↑</button>
                <button onClick={() => moveDown(slide, index)} disabled={index === slides.length - 1}
                  style={{ padding: '6px 10px', background: '#f0ebe0', border: 'none', borderRadius: 4, cursor: index === slides.length - 1 ? 'not-allowed' : 'pointer', fontSize: 14, opacity: index === slides.length - 1 ? 0.4 : 1 }}>↓</button>
                <button onClick={() => openEdit(slide)} style={{ padding: '7px 16px', background: '#1a3a2a', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif' }}>Edit</button>
                <button onClick={() => handleDelete(slide.id)} style={{ padding: '7px 16px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
