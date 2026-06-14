'use client'
import { useState } from 'react'

type Props = {
  compact?: boolean
}

export default function SubscribeForm({ compact = false }: Props) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'already' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })

      if (res.ok) {
        setStatus('success')
        setEmail('')
        setName('')
      } else if (res.status === 409) {
        setStatus('already')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }

    setSubmitting(false)
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: compact ? '12px 0' : '24px 0' }}>
        <p style={{ color: '#F5A623', fontWeight: 700, fontSize: compact ? 13 : 15 }}>
          ✓ Subscribed! Check your email for a welcome message.
        </p>
      </div>
    )
  }

  if (status === 'already') {
    return (
      <div style={{ textAlign: 'center', padding: compact ? '12px 0' : '24px 0' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: compact ? 13 : 15 }}>
          You&apos;re already subscribed. Thank you!
        </p>
      </div>
    )
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email" required placeholder="Your email address"
          value={email} onChange={e => setEmail(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: '10px 14px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 6, color: 'white', fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none'
          }}
        />
        <button type="submit" disabled={submitting} style={{
          background: '#F5A623', color: '#0D0D1A', padding: '10px 20px',
          border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13,
          cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif',
          textTransform: 'uppercase', letterSpacing: '0.05em', opacity: submitting ? 0.7 : 1
        }}>
          {submitting ? '...' : 'Subscribe'}
        </button>
        {status === 'error' && <p style={{ width: '100%', color: '#f87171', fontSize: 12, margin: 0 }}>Something went wrong. Please try again.</p>}
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480, margin: '0 auto' }}>
      <input
        type="text" placeholder="Your name (optional)"
        value={name} onChange={e => setName(e.target.value)}
        style={{
          padding: '12px 16px', background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
          color: 'white', fontSize: 14, fontFamily: 'Georgia, serif', outline: 'none'
        }}
      />
      <input
        type="email" required placeholder="Your email address"
        value={email} onChange={e => setEmail(e.target.value)}
        style={{
          padding: '12px 16px', background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
          color: 'white', fontSize: 14, fontFamily: 'Georgia, serif', outline: 'none'
        }}
      />
      <button type="submit" disabled={submitting} style={{
        background: 'linear-gradient(135deg, #F5A623, #E8860A)',
        color: '#0D0D1A', padding: '14px', border: 'none', borderRadius: 8,
        fontWeight: 800, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer',
        fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em',
        opacity: submitting ? 0.7 : 1
      }}>
        {submitting ? 'Subscribing...' : 'Subscribe to Updates'}
      </button>
      {status === 'error' && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>Something went wrong. Please try again.</p>}
    </form>
  )
}
