'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type GalleryPhoto = {
  id: string
  caption: string | null
  image_url: string
  category: string
  created_at: string
}

const CATEGORIES = ['Missions', 'Care & Philanthropy', 'Discipleship', 'Events']

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<GalleryPhoto | null>(null)
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('General')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingBulk, setUploadingBulk] = useState(false)
  const [bulkCategory, setBulkCategory] = useState('General')
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bulkInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
    setPhotos(data || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setCaption('')
    setCategory('General')
    setImageFile(null)
    setPreview(null)
    setShowForm(true)
  }

  function openEdit(p: GalleryPhoto) {
    setEditing(p)
    setCaption(p.caption || '')
    setCategory(p.category)
    setImageFile(null)
    setPreview(p.image_url)
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
      const path = `gallery/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('trvm-media').upload(path, imageFile, { upsert: true })
      if (error) { alert('Upload failed: ' + error.message); setSaving(false); return }
      imageUrl = supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
    }

    const payload = { caption: caption || null, image_url: imageUrl, category }

    if (editing) {
      const { error } = await supabase.from('gallery').update(payload).eq('id', editing.id)
      if (error) { alert(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('gallery').insert(payload)
      if (error) { alert(error.message); setSaving(false); return }
    }

    setSaving(false)
    setShowForm(false)
    load()
  }

  async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploadingBulk(true)
    setBulkProgress({ done: 0, total: files.length })

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()
      const path = `gallery/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('trvm-media').upload(path, file, { upsert: true })
      if (uploadError) { console.error(uploadError); continue }
      const imageUrl = supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
      await supabase.from('gallery').insert({ image_url: imageUrl, category: bulkCategory, caption: null })
      setBulkProgress({ done: i + 1, total: files.length })
    }

    setUploadingBulk(false)
    if (bulkInputRef.current) bulkInputRef.current.value = ''
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this photo? This cannot be undone.')) return
    await supabase.from('gallery').delete().eq('id', id)
    load()
  }

  const filtered = activeCategory === 'All' ? photos : photos.filter(p => p.category === activeCategory)
  const allCategories = ['All', ...CATEGORIES]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Gallery</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} style={{
          background: '#c9a84c', color: '#0f2419', padding: '10px 24px',
          border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
          cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          + Add Photo
        </button>
      </div>

      {/* Bulk upload */}
      <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', marginBottom: 28, border: '1px solid #f0ebe0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontWeight: 700, color: '#0f2419', fontSize: '0.95rem', marginBottom: 14 }}>📤 Bulk Upload Photos</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Category for all photos</label>
            <select value={bulkCategory} onChange={e => setBulkCategory(e.target.value)}
              style={{ padding: '9px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif', outline: 'none', background: 'white' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Select multiple images</label>
            <input ref={bulkInputRef} type="file" accept="image/*" multiple onChange={handleBulkUpload}
              style={{ fontSize: 13 }} disabled={uploadingBulk} />
          </div>
          {uploadingBulk && (
            <div style={{ background: '#f0ebe0', borderRadius: 6, padding: '8px 16px', fontSize: 13, color: '#1a3a2a', fontWeight: 600 }}>
              Uploading {bulkProgress.done} / {bulkProgress.total}...
            </div>
          )}
        </div>
      </div>

      {/* Category filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {allCategories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Georgia, serif',
            background: activeCategory === cat ? '#1a3a2a' : 'white',
            color: activeCategory === cat ? 'white' : '#1a3a2a',
            border: '2px solid #1a3a2a',
            transition: 'all 0.15s'
          }}>
            {cat}
            {cat !== 'All' && (
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.75 }}>
                ({photos.filter(p => p.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 40, width: '100%', maxWidth: 520 }}>
            <h2 style={{ fontWeight: 700, color: '#0f2419', marginBottom: 24, fontSize: '1.2rem' }}>
              {editing ? 'Edit Photo' : 'Add Photo'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Image upload */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                  {editing ? 'Replace Image (optional)' : 'Image *'}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #ddd', borderRadius: 8, padding: '24px',
                    textAlign: 'center', cursor: 'pointer', background: '#fafafa',
                    transition: 'border-color 0.2s'
                  }}>
                  {preview ? (
                    <img src={preview} alt="preview"
                      style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 6, objectFit: 'contain' }} />
                  ) : (
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                      <p style={{ fontSize: 13, color: '#888' }}>Click to select an image</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={handleFileChange} />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif', outline: 'none', background: 'white' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Caption */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Caption (optional)</label>
                <input
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif', marginTop: 0, outline: 'none' }}
                  placeholder="Describe the photo..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)} />
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
                {saving ? 'Saving...' : editing ? 'Update Photo' : 'Upload Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO GRID */}
      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
          <p>{activeCategory === 'All' ? 'No photos yet. Click + Add Photo or use Bulk Upload.' : `No photos in ${activeCategory} yet.`}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {filtered.map(photo => (
            <div key={photo.id} style={{ background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', border: '1px solid #f0ebe0' }}>
              <div style={{ position: 'relative', paddingTop: '75%', background: '#f0ebe0' }}>
                <img src={photo.image_url} alt={photo.caption || ''}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '10px 12px' }}>
                <span style={{ fontSize: 11, background: '#1a3a2a', color: 'white', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                  {photo.category}
                </span>
                {photo.caption && (
                  <p style={{ fontSize: 12, color: '#555', marginTop: 6, lineHeight: 1.4 }}>{photo.caption}</p>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button onClick={() => openEdit(photo)} style={{
                    flex: 1, padding: '5px 0', background: '#1a3a2a', color: 'white',
                    border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'Georgia, serif'
                  }}>Edit</button>
                  <button onClick={() => handleDelete(photo.id)} style={{
                    flex: 1, padding: '5px 0', background: '#e53e3e', color: 'white',
                    border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'Georgia, serif'
                  }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
