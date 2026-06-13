'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const PROGRAMS = [
  { key: 'missions', label: 'Missions', icon: '✝' },
  { key: 'care', label: 'Care & Philanthropy', icon: '🤝' },
  { key: 'discipleship', label: 'Discipleship', icon: '📖' },
]

export default function AdminProgramsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('missions')
  const [uploading, setUploading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('site_settings').select('*')
    const map: Record<string, string> = {}
    for (const row of data || []) map[row.key] = row.value
    setSettings(map)
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const keys = PROGRAMS.flatMap(p => [
      `prog_${p.key}_title`,
      `prog_${p.key}_subtitle`,
      `prog_${p.key}_content`,
    ])
    for (const key of keys) {
      await supabase.from('site_settings').upsert({ key, value: settings[key] || '' }, { onConflict: 'key' })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, progKey: string) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `programs/${progKey}_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('trvm-media').upload(path, file, { upsert: true })
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return }
    const url = supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
    await supabase.from('site_settings').upsert({ key: `prog_${progKey}_photo`, value: url }, { onConflict: 'key' })
    setSettings(s => ({ ...s, [`prog_${progKey}_photo`]: url }))
    setUploading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid #ddd',
    borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif',
    marginTop: 6, outline: 'none', boxSizing: 'border-box',
    color: '#000', background: '#fff'
  }

  const active = PROGRAMS.find(p => p.key === activeTab)!

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: '#888', fontFamily: 'Georgia, serif' }}>Loading...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>Programs Editor</h1>
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          background: saved ? '#1a3a2a' : '#c9a84c', color: saved ? 'white' : '#0f2419',
          padding: '10px 28px', border: 'none', borderRadius: 6, fontWeight: 700,
          fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em',
          opacity: saving ? 0.7 : 1, transition: 'background 0.3s'
        }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {PROGRAMS.map(p => (
          <button key={p.key} onClick={() => setActiveTab(p.key)} style={{
            padding: '9px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Georgia, serif', border: 'none',
            background: activeTab === p.key ? '#0f2419' : '#f0ebe0',
            color: activeTab === p.key ? 'white' : '#0f2419',
            transition: 'all 0.15s'
          }}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f0ebe0' }}>
        <h2 style={{ fontWeight: 700, color: '#0f2419', fontSize: '1rem', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 12, borderBottom: '2px solid #f0ebe0' }}>
          {active.icon} {active.label}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 8 }}>Program Photo</label>
            {settings[`prog_${activeTab}_photo`] && (
              <img src={settings[`prog_${activeTab}_photo`]} alt={activeTab}
                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
            )}
            <label style={{ display: 'inline-block', padding: '9px 20px', background: '#1a3a2a', color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
              {uploading ? 'Uploading...' : settings[`prog_${activeTab}_photo`] ? 'Replace Photo' : 'Upload Photo'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhotoUpload(e, activeTab)} />
            </label>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }}>Title *</label>
            <input style={inputStyle} value={settings[`prog_${activeTab}_title`] || ''}
              onChange={e => setSettings(s => ({ ...s, [`prog_${activeTab}_title`]: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }}>Subtitle / Tagline</label>
            <input style={inputStyle} value={settings[`prog_${activeTab}_subtitle`] || ''}
              onChange={e => setSettings(s => ({ ...s, [`prog_${activeTab}_subtitle`]: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }}>Content *</label>
            <textarea rows={10} style={{ ...inputStyle, resize: 'vertical' }}
              value={settings[`prog_${activeTab}_content`] || ''}
              onChange={e => setSettings(s => ({ ...s, [`prog_${activeTab}_content`]: e.target.value }))} />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', marginTop: 20,
        background: saved ? '#1a3a2a' : '#c9a84c',
        color: saved ? 'white' : '#0f2419', padding: '14px',
        border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
        cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        opacity: saving ? 0.7 : 1, transition: 'background 0.3s'
      }}>
        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save All Changes'}
      </button>
    </div>
  )
}
