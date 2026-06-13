'use client'
import { useState } from 'react'

const SUBJECTS = [
  'General Enquiry',
  'Invitation / Speaking Engagement',
  'Prayer Request',
  'Partnership / Collaboration',
  'Donation Enquiry',
  'Volunteer',
  'Other',
]

export default function ContactClient() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contact',
          ...form
        }).toString()
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please try again or email us directly.')
      }
    } catch {
      setError('Something went wrong. Please email us at info@trvmissions.com')
    }

    setSubmitting(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', border: '1px solid rgba(123,47,190,0.3)',
    borderRadius: 8, fontSize: 14, fontFamily: 'Georgia, serif',
    background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
    display: 'block', marginBottom: 6
  }

  return (
    <div style={{ background: '#0D0D1A', padding: '64px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 56 }}>

        {/* Contact Info */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>Our Details</h2>
          <div style={{ width: 40, height: 3, background: '#F5A623', marginBottom: 32 }} />

          {[
            { icon: '📧', label: 'Email', value: 'info@trvmissions.com', href: 'mailto:info@trvmissions.com' },
            { icon: '📞', label: 'Phone', value: '+233 244 185 357', href: 'tel:+233244185357' },
            { icon: '📞', label: '', value: '+233 538 854 067', href: 'tel:+233538854067' },
            { icon: '📍', label: 'Location', value: 'Cape Coast, Ghana', href: null },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, background: 'rgba(245,166,35,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                {item.label && <p style={{ fontSize: 11, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{item.label}</p>}
                {item.href ? (
                  <a href={item.href} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, textDecoration: 'none', fontWeight: 500 }}>{item.value}</a>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>{item.value}</p>
                )}
              </div>
            </div>
          ))}

          {/* Social */}
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 11, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Follow Us</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'WhatsApp Channel', href: 'https://whatsapp.com/channel/0029Va8tSmMJ93wYZHZvZk1C', color: '#25D366' },
                { label: 'Facebook', href: 'https://facebook.com', color: '#1877F2' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{
                  background: s.color, color: 'white', padding: '8px 18px',
                  borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none'
                }}>{s.label}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>Send a Message</h2>
          <div style={{ width: 40, height: 3, background: '#F5A623', marginBottom: 32 }} />

          {submitted ? (
            <div style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 12, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', marginBottom: 10 }}>Message Sent!</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                Thank you for reaching out. We will get back to you as soon as possible.
              </p>
              <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' }) }}
                style={{ marginTop: 20, background: '#F5A623', color: '#0D0D1A', padding: '10px 24px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                Send Another
              </button>
            </div>
          ) : (
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
            >
              {/* Hidden field for Netlify */}
              <input type="hidden" name="form-name" value="contact" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input required style={inputStyle} value={form.name} placeholder="Your name"
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} value={form.phone} placeholder="+233..."
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input required type="email" style={inputStyle} value={form.email} placeholder="your@email.com"
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>

              <div>
                <label style={labelStyle}>Subject *</label>
                <select required style={{ ...inputStyle, color: form.subject ? 'white' : 'rgba(255,255,255,0.4)' }}
                  value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                  {SUBJECTS.map(s => <option key={s} value={s} style={{ background: '#1A0A2E', color: 'white' }}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Message *</label>
                <textarea required rows={6} style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              </div>

              {error && <p style={{ color: '#f87171', fontSize: 13, background: 'rgba(248,113,113,0.1)', padding: '10px 14px', borderRadius: 6 }}>{error}</p>}

              <button type="submit" disabled={submitting} style={{
                background: 'linear-gradient(135deg, #F5A623, #E8860A)',
                color: '#0D0D1A', padding: '14px',
                border: 'none', borderRadius: 8, fontWeight: 800,
                fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'Georgia, serif', textTransform: 'uppercase',
                letterSpacing: '0.05em', opacity: submitting ? 0.7 : 1
              }}>
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
