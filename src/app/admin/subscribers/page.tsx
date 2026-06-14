'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Subscriber = {
  id: string
  email: string
  name: string | null
  subscribed_at: string
  active: boolean
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcast, setBroadcast] = useState({ subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })
    setSubscribers(data || [])
    setLoading(false)
  }

  async function handleUnsubscribe(id: string) {
    await supabase.from('subscribers').update({ active: false }).eq('id', id)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this subscriber permanently?')) return
    await supabase.from('subscribers').delete().eq('id', id)
    load()
  }

  async function handleBroadcast() {
    if (!broadcast.subject || !broadcast.message) {
      alert('Subject and message are required.')
      return
    }
    if (!confirm(`Send to ${activeCount} active subscribers?`)) return

    setSending(true)
    setSendResult(null)

    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcast)
      })
      const data = await res.json()
      if (res.ok) {
        setSendResult({ sent: data.sent, failed: data.failed })
        setBroadcast({ subject: '', message: '' })
      } else {
        alert('Error: ' + data.error)
      }
    } catch {
      alert('Failed to send broadcast.')
    }
    setSending(false)
  }

  const activeCount = subscribers.filter(s => s.active).length

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid #ddd',
    borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif',
    marginTop: 6, outline: 'none', boxSizing: 'border-box',
    color: '#000', background: '#fff'
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Subscribers</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
            {subscribers.length} total · {activeCount} active
          </p>
        </div>
        <button onClick={() => setShowBroadcast(!showBroadcast)} style={{
          background: '#c9a84c', color: '#0f2419', padding: '10px 24px',
          border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
          cursor: 'pointer', fontFamily: 'Georgia, serif',
          textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          📨 Send Broadcast
        </button>
      </div>

      {/* Broadcast panel */}
      {showBroadcast && (
        <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 28, border: '1px solid #f0ebe0' }}>
          <h2 style={{ fontWeight: 700, color: '#0f2419', fontSize: '1.1rem', marginBottom: 20 }}>
            Send to {activeCount} Active Subscribers
          </h2>

          {sendResult && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ color: '#166534', fontWeight: 700 }}>
                ✓ Sent to {sendResult.sent} subscribers{sendResult.failed > 0 ? ` (${sendResult.failed} failed)` : ''}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }}>Subject *</label>
              <input style={inputStyle} placeholder="e.g. New Devotion: Walking by Faith"
                value={broadcast.subject} onChange={e => setBroadcast(b => ({ ...b, subject: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }}>Message *</label>
              <textarea rows={8} style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Write your message here..."
                value={broadcast.message} onChange={e => setBroadcast(b => ({ ...b, message: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowBroadcast(false)} style={{
                background: 'transparent', color: '#c9a84c', padding: '10px 24px',
                border: '2px solid #c9a84c', borderRadius: 6, fontWeight: 700,
                fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif'
              }}>Cancel</button>
              <button onClick={handleBroadcast} disabled={sending || activeCount === 0} style={{
                background: '#c9a84c', color: '#0f2419', padding: '10px 28px',
                border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13,
                cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif',
                opacity: sending || activeCount === 0 ? 0.7 : 1
              }}>
                {sending ? 'Sending...' : `Send to ${activeCount} Subscribers`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscribers list */}
      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
      ) : subscribers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <p>No subscribers yet. The signup form is live on your homepage and footer.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f0ebe0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9f6f0' }}>
                {['Name', 'Email', 'Subscribed', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid #f0ebe0' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#0f2419', fontWeight: 600 }}>{s.name || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#555' }}>{s.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#888' }}>
                    {new Date(s.subscribed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: s.active ? '#dcfce7' : '#fee2e2',
                      color: s.active ? '#166534' : '#991b1b',
                      padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700
                    }}>
                      {s.active ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {s.active && (
                        <button onClick={() => handleUnsubscribe(s.id)} style={{
                          padding: '4px 12px', background: '#f0ebe0', color: '#0f2419',
                          border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'Georgia, serif'
                        }}>Unsubscribe</button>
                      )}
                      <button onClick={() => handleDelete(s.id)} style={{
                        padding: '4px 12px', background: '#e53e3e', color: 'white',
                        border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'Georgia, serif'
                      }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
