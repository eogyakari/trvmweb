'use client'
import { useState } from 'react'
import { getDict } from '@/i18n/client'
import type { Locale } from '@/i18n/config'

// Goes at: src/app/[lang]/discipleship/DiscipleshipClient.tsx
export default function DiscipleshipClient({ lang }: { lang: Locale }) {
  const dict = getDict(lang)
  const m = dict.discipleshipPage

  const [form, setForm] = useState({ full_name: '', email: '', phone: '', location: '', track: '', availability: '', why_interested: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/discipleship', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSubmitted(true)
      else { const d = await res.json(); setError(d.error || m.errorGeneric) }
    } catch { setError(m.errorGeneric) }
    setSubmitting(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', border: '1px solid rgba(123,47,190,0.3)',
    borderRadius: 8, fontSize: 14, fontFamily: 'Georgia, serif',
    background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }
  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  if (submitted) {
    return (
      <div style={{ background: '#0D0D1A', padding: '80px 24px', textAlign: 'center', minHeight: '50vh' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 16, padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📖</div>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem', marginBottom: 12 }}>{m.successTitle}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>{m.successText}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#0D0D1A', padding: '56px 24px 80px' }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: 620, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={labelStyle}>{m.fullName} *</label><input required style={inputStyle} value={form.full_name} onChange={set('full_name')} /></div>
          <div><label style={labelStyle}>{m.phone} *</label><input required style={inputStyle} value={form.phone} onChange={set('phone')} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={labelStyle}>{m.email} *</label><input required type="email" style={inputStyle} value={form.email} onChange={set('email')} /></div>
          <div><label style={labelStyle}>{m.location} *</label><input required style={inputStyle} value={form.location} onChange={set('location')} /></div>
        </div>
        <div><label style={labelStyle}>{m.track}</label><input style={inputStyle} value={form.track} onChange={set('track')} placeholder={m.trackHint} /></div>
        <div><label style={labelStyle}>{m.availability}</label><input style={inputStyle} value={form.availability} onChange={set('availability')} placeholder={m.availabilityHint} /></div>
        <div><label style={labelStyle}>{m.whyInterested}</label><textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.why_interested} onChange={set('why_interested')} /></div>
        <div><label style={labelStyle}>{m.message}</label><textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.message} onChange={set('message')} /></div>

        {error && <p style={{ color: '#f87171', fontSize: 13, background: 'rgba(248,113,113,0.1)', padding: '10px 14px', borderRadius: 6 }}>{error}</p>}

        <button type="submit" disabled={submitting} style={{
          background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#1A0A2E',
          padding: '15px', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 15,
          cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif',
          textTransform: 'uppercase', letterSpacing: '0.05em', opacity: submitting ? 0.7 : 1,
        }}>{submitting ? m.submitting : m.submit}</button>
      </form>
    </div>
  )
}