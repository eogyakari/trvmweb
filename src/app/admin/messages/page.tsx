'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Message = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  read: boolean
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Message | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  async function markRead(id: string) {
    await supabase.from('contact_messages').update({ read: true }).eq('id', id)
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: true } : m))
    if (selected?.id === id) setSelected(s => s ? { ...s, read: true } : null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this message?')) return
    await supabase.from('contact_messages').delete().eq('id', id)
    setMessages(msgs => msgs.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  function openMessage(msg: Message) {
    setSelected(msg)
    if (!msg.read) markRead(msg.id)
  }

  const filtered = filter === 'unread' ? messages.filter(m => !m.read) : messages
  const unreadCount = messages.filter(m => !m.read).length

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>
            Messages
            {unreadCount > 0 && (
              <span style={{ marginLeft: 10, background: '#e53e3e', color: 'white', borderRadius: 12, padding: '2px 10px', fontSize: 13 }}>
                {unreadCount} new
              </span>
            )}
          </h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{messages.length} total message{messages.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Georgia, serif', border: 'none',
              background: filter === f ? '#0f2419' : '#f0ebe0',
              color: filter === f ? 'white' : '#0f2419',
              textTransform: 'capitalize'
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.4fr' : '1fr', gap: 20 }}>
        {/* Message list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
              <p>{filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}</p>
            </div>
          ) : (
            filtered.map(msg => (
              <div key={msg.id} onClick={() => openMessage(msg)} style={{
                background: selected?.id === msg.id ? '#f0ebe0' : 'white',
                borderRadius: 8, padding: '14px 18px',
                cursor: 'pointer', border: `1px solid ${selected?.id === msg.id ? '#c9a84c' : '#f0ebe0'}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                borderLeft: !msg.read ? '3px solid #c9a84c' : '3px solid transparent',
                transition: 'all 0.15s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {!msg.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a84c', flexShrink: 0, display: 'inline-block' }} />}
                      <p style={{ fontWeight: !msg.read ? 700 : 600, color: '#0f2419', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {msg.name}
                      </p>
                    </div>
                    <p style={{ fontSize: 12, color: '#888', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.subject}
                    </p>
                    <p style={{ fontSize: 12, color: '#bbb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.message.substring(0, 60)}...
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: '#aaa', flexShrink: 0, marginTop: 2 }}>
                    {new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message detail */}
        {selected && (
          <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f0ebe0', position: 'sticky', top: 80, height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <h2 style={{ fontWeight: 700, color: '#0f2419', fontSize: '1.1rem' }}>{selected.subject}</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0ebe0' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#aaa', width: 60, flexShrink: 0 }}>From</span>
                <span style={{ fontSize: 13, color: '#0f2419', fontWeight: 600 }}>{selected.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#aaa', width: 60, flexShrink: 0 }}>Email</span>
                <a href={`mailto:${selected.email}`} style={{ fontSize: 13, color: '#1a3a2a', fontWeight: 600 }}>{selected.email}</a>
              </div>
              {selected.phone && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#aaa', width: 60, flexShrink: 0 }}>Phone</span>
                  <a href={`tel:${selected.phone}`} style={{ fontSize: 13, color: '#1a3a2a', fontWeight: 600 }}>{selected.phone}</a>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#aaa', width: 60, flexShrink: 0 }}>Date</span>
                <span style={{ fontSize: 13, color: '#555' }}>
                  {new Date(selected.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div style={{ fontSize: 14, lineHeight: 1.9, color: '#333', whiteSpace: 'pre-wrap', marginBottom: 28 }}>
              {selected.message}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                style={{ background: '#1a3a2a', color: 'white', padding: '9px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Reply by Email
              </a>
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  style={{ background: '#25D366', color: 'white', padding: '9px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  WhatsApp
                </a>
              )}
              <button onClick={() => handleDelete(selected.id)} style={{
                background: '#e53e3e', color: 'white', padding: '9px 20px',
                border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Georgia, serif'
              }}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
