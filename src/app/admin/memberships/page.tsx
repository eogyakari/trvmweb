'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Member = {
  id: string
  full_name: string
  email: string
  phone: string
  location: string
  home_church: string | null
  how_heard: string | null
  interests: string | null
  message: string | null
  created_at: string
}

export default function AdminMembershipsPage() {
  const [rows, setRows] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('memberships').select('*').order('created_at', { ascending: false })
    setRows(data || [])
    setLoading(false)
  }

  function exportCsv() {
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Home Church', 'How Heard', 'Interests', 'Message', 'Date']
    const lines = rows.map(r => [r.full_name, r.email, r.phone, r.location, r.home_church || '', r.how_heard || '', r.interests || '', (r.message || '').replace(/\n/g, ' '), new Date(r.created_at).toLocaleDateString()]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const csv = [headers.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `trvm-memberships-${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Memberships</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{rows.length} member{rows.length !== 1 ? 's' : ''}</p>
        </div>
        {rows.length > 0 && (
          <button onClick={exportCsv} style={{ background: '#c9a84c', color: '#0f2419', padding: '10px 24px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <p>No memberships yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(r => (
            <div key={r.id} style={{ background: 'white', borderRadius: 8, padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f0ebe0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ fontWeight: 700, color: '#0f2419', fontSize: '1rem' }}>{r.full_name}</h3>
                <span style={{ fontSize: 12, color: '#888' }}>{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <p style={{ fontSize: 13, color: '#555', marginTop: 6 }}>
                {r.email} · {r.phone} · {r.location}
                {r.home_church && <> · {r.home_church}</>}
              </p>
              {(r.interests || r.how_heard || r.message) && (
                <p style={{ fontSize: 12, color: '#888', marginTop: 6, lineHeight: 1.6 }}>
                  {r.interests && <>Interests: {r.interests}. </>}
                  {r.how_heard && <>Heard via: {r.how_heard}. </>}
                  {r.message && <>“{r.message}”</>}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}