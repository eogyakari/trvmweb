'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Quote } from '@/lib/types'
import Link from 'next/link'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd',
  borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif',
  marginTop: 6, outline: 'none', boxSizing: 'border-box',
  color: '#000', background: '#fff'
}
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#444', display: 'block'
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Quote | null>(null)
  const [form, setForm] = useState({ text: '', author: '', date: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('quotes').select('*').order('published_date', { ascending: false })
    setQuotes(data || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ text: '', author: 'TRVM', date: new Date().toISOString().split('T')[0] })
    setShowForm(true)
  }

  function openEdit(q: Quote) {
    setEditing(q)
    setForm({ text: q.text, author: q.author || '', date: q.published_date })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.text || !form.date) {
      alert('Please fill in the Quote and Date.')
      return
    }
    setSaving(true)
    const payload = { text: form.text, author: form.author || null, published_date: form.date }

    // 1. Insert or update the English quote.
    let quoteId: string
    if (editing) {
      const { error } = await supabase.from('quotes').update(payload).eq('id', editing.id)
      if (error) { alert('Error: ' + error.message); setSaving(false); return }
      quoteId = editing.id
    } else {
      const { data, error } = await supabase.from('quotes').insert(payload).select('id').single()
      if (error || !data) { alert('Error: ' + (error?.message || 'insert failed')); setSaving(false); return }
      quoteId = (data as { id: string }).id
    }

    // 2. Publish → auto-generate Indonesian + Swahili translations.
    try {
      const res = await fetch(`/api/content/quote/${quoteId}/publish`, { method: 'POST' })
      const result = await res.json()
      if (!res.ok) {
        alert('Saved, but translation failed: ' + (result.error || 'unknown error'))
      } else {
        const done = (result.translated || []).join(', ')
        alert(done ? `Saved and translated → ${done}` : 'Saved.')
      }
    } catch (e: any) {
      alert('Saved, but translation request failed: ' + e.message)
    }

    setSaving(false)
    setShowForm(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this quote? This cannot be undone.')) return
    await supabase.from('quotes').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Quotes</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{quotes.length} quote{quotes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} style={{
          background: '#c9a84c', color: '#0f2419', padding: '10px 24px',
          border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
          cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          + New Quote
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
              {editing ? 'Edit Quote' : 'New Quote'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Quote *</label>
                <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Author</label>
                  <input style={inputStyle} value={form.author}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input type="date" style={inputStyle} value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>

              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                On save, Indonesian and Swahili translations are generated automatically.
              </p>
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
                {saving ? 'Saving & translating...' : 'Save Quote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
      ) : quotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <p>No quotes yet. Click <strong>+ New Quote</strong> to add the first one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {quotes.map(q => (
            <div key={q.id} style={{
              background: 'white', borderRadius: 8, padding: '16px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 12,
              border: '1px solid #f0ebe0'
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontWeight: 600, color: '#0f2419', fontSize: '0.95rem', fontStyle: 'italic' }}>
                  &ldquo;{q.text.length > 120 ? q.text.slice(0, 120) + '…' : q.text}&rdquo;
                </p>
                <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                  {q.author || 'TRVM'} · {new Date(q.published_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(q)} style={{
                  padding: '7px 18px', background: '#1a3a2a', color: 'white',
                  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia, serif'
                }}>Edit</button>
                <button onClick={() => handleDelete(q.id)} style={{
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