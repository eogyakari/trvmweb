'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Book } from '@/lib/types'
import Link from 'next/link'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd',
  borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif',
  marginTop: 6, outline: 'none', boxSizing: 'border-box', color: '#000', background: '#fff'
}
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#444', display: 'block'
}

export default function AdminBooksPage() {
  const [items, setItems] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)
  const [form, setForm] = useState({ title: '', author: '', description: '', pdf_url: '', cover_image: '', published_date: '', is_free: false, price: '', currency: 'GHS' })
  const [saving, setSaving] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  async function uploadFile(file: File, folder: string): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('trvm-media').upload(path, file, { upsert: true })
    if (error) { alert('Upload failed: ' + error.message); return null }
    return supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
  }

  function openNew() {
    setEditing(null)
    setForm({ title: '', author: '', description: '', pdf_url: '', cover_image: '', published_date: '', is_free: false, price: '', currency: 'GHS' })
    setPdfFile(null); setCoverFile(null)
    setShowForm(true)
  }

  function openEdit(b: Book) {
    setEditing(b)
    setForm({ title: b.title, author: b.author, description: b.description || '', pdf_url: b.pdf_url || '', cover_image: b.cover_image || '', published_date: b.published_date || '', is_free: b.is_free || false, price: b.price?.toString() || '', currency: b.currency || 'GHS' })
    setPdfFile(null); setCoverFile(null)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title || !form.author) { alert('Title and Author are required.'); return }
    setSaving(true)
    const pdfUrl = pdfFile ? await uploadFile(pdfFile, 'books/pdf') : form.pdf_url
    const coverUrl = coverFile ? await uploadFile(coverFile, 'books/covers') : form.cover_image
    const payload = { title: form.title, author: form.author, description: form.description || null, pdf_url: pdfUrl || null, cover_image: coverUrl || null, published_date: form.published_date || null, is_free: form.is_free, price: parseFloat(form.price) || 0, currency: form.currency }

    if (editing) {
      const { error } = await supabase.from('books').update(payload).eq('id', editing.id)
      if (error) { alert(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('books').insert(payload)
      if (error) { alert(error.message); setSaving(false); return }
    }
    setSaving(false); setShowForm(false); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this book?')) return
    await supabase.from('books').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Books</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{items.length} book{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} style={{
          background: '#c9a84c', color: '#0f2419', padding: '10px 24px',
          border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
          cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>+ New Book</button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 40, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 700, color: '#0f2419', marginBottom: 24, fontSize: '1.2rem' }}>
              {editing ? 'Edit Book' : 'New Book'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Author *</label>
                  <input style={inputStyle} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Published Date</label>
                  <input type="date" style={inputStyle} value={form.published_date} onChange={e => setForm(f => ({ ...f, published_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Price</label>
                  <input type="number" min="0" step="0.01" style={inputStyle} placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select style={{ ...inputStyle, marginTop: 6 }} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                    <option value="GHS">GHS</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 22 }}>
                  <input type="checkbox" id="book-free" checked={form.is_free} onChange={e => setForm(f => ({ ...f, is_free: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  <label htmlFor="book-free" style={{ fontSize: 13, fontWeight: 600, color: '#444', cursor: 'pointer' }}>Free</label>
                </div>
              </div>
              <div>
                <label style={labelStyle}>PDF — Upload file</label>
                <input type="file" accept=".pdf" style={{ marginTop: 8 }} onChange={e => setPdfFile(e.target.files?.[0] || null)} />
                <label style={{ ...labelStyle, marginTop: 10 }}>OR paste Google Drive / external URL</label>
                <input style={inputStyle} placeholder="https://drive.google.com/..." value={form.pdf_url} onChange={e => setForm(f => ({ ...f, pdf_url: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Cover Image</label>
                <input type="file" accept="image/*" style={{ marginTop: 8 }} onChange={e => setCoverFile(e.target.files?.[0] || null)} />
                {form.cover_image && !coverFile && (
                  <img src={form.cover_image} alt="cover" style={{ height: 80, marginTop: 10, borderRadius: 6, objectFit: 'cover' }} />
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#c9a84c', padding: '10px 24px', border: '2px solid #c9a84c', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ background: '#c9a84c', color: '#0f2419', padding: '10px 28px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <p>No books yet. Click <strong>+ New Book</strong> to add one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(b => (
            <div key={b.id} style={{ background: 'white', borderRadius: 8, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 12, border: '1px solid #f0ebe0' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {b.cover_image && <img src={b.cover_image} alt={b.title} style={{ width: 40, height: 52, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />}
                <div>
                  <h3 style={{ fontWeight: 700, color: '#0f2419', fontSize: '0.95rem' }}>{b.title}</h3>
                  <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>by {b.author}{b.published_date ? ' · ' + new Date(b.published_date).getFullYear() : ''}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(b)} style={{ padding: '7px 18px', background: '#1a3a2a', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif' }}>Edit</button>
                <button onClick={() => handleDelete(b.id)} style={{ padding: '7px 18px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
