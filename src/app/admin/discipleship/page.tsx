'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Enrollee = {
  id: string
  full_name: string
  email: string
  phone: string
  location: string
  track: string | null
  availability: string | null
  why_interested: string | null
  message: string | null
  created_at: string
}

export default function AdminDiscipleshipPage() {
  const [rows, setRows] = useState<Enrollee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('discipleship_enrollments').select('*').order('created_at', { ascending: false })
    setRows(data || [])
    setLoading(false)
  }

  function exportCsv() {
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Track', 'Availability', 'Why Interested', 'Message', 'Date']
    const lines = rows.map(r => [r.full_name, r.email, r.phone, r.location, r.track || '', r.availability || '', r.why_interested || '', (r.message || '').replace(/\n/g, ' '), new Date(r.created_at).toLocaleDateString()]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const csv = [headers.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `trvm-discipleship_enrollments-${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Discipleship</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{rows.length} enrollee{rows.length !== 1 ? 's' : ''}</p>
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
          <p>No discipleship_enrollments yet.</p>
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
                {r.track && <> · {r.track}</>}
              </p>
              {(r.track || r.availability || r.why_interested || r.message) && (
                <p style={{ fontSize: 12, color: '#888', marginTop: 6, lineHeight: 1.6 }}>
                  {r.track && <>Track: {r.track}. </>}
                  {r.availability && <>Available: {r.availability}. </>}
                  {r.why_interested && <>Why: {r.why_interested}. </>}
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