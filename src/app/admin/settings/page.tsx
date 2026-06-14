'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const SETTINGS_FIELDS = [
  { key: 'church_name', label: 'Organization Name', type: 'text' },
  { key: 'tagline', label: 'Tagline / Motto', type: 'text' },
  { key: 'email', label: 'Contact Email', type: 'text' },
  { key: 'phone1', label: 'Phone 1', type: 'text' },
  { key: 'phone2', label: 'Phone 2', type: 'text' },
  { key: 'address', label: 'Address', type: 'text' },
  { key: 'facebook_url', label: 'Facebook URL', type: 'text' },
  { key: 'whatsapp_channel', label: 'WhatsApp Channel URL', type: 'text' },
  { key: 'about_text', label: 'About Us Summary', type: 'textarea' },
  { key: 'stat_souls', label: 'Stat — Souls Reached (e.g. 1,500+)', type: 'text' },
  { key: 'stat_islands', label: 'Stat — Islands Visited (e.g. 6)', type: 'text' },
  { key: 'stat_days', label: 'Stat — Days in the Field (e.g. 61)', type: 'text' },
  { key: 'stat_years', label: 'Stat — Years of Ministry (e.g. 10+)', type: 'text' },
  { key: 'bank1_name', label: 'Bank 1 — Bank Name', type: 'text' },
  { key: 'bank1_account_name', label: 'Bank 1 — Account Name', type: 'text' },
  { key: 'bank1_account_number', label: 'Bank 1 — Account Number', type: 'text' },
  { key: 'bank1_branch', label: 'Bank 1 — Branch', type: 'text' },
  { key: 'bank2_name', label: 'Bank 2 — Bank Name', type: 'text' },
  { key: 'bank2_account_name', label: 'Bank 2 — Account Name', type: 'text' },
  { key: 'bank2_account_number', label: 'Bank 2 — Account Number', type: 'text' },
  { key: 'bank2_branch', label: 'Bank 2 — Branch', type: 'text' },
  { key: 'momo_network', label: 'Mobile Money — Network (e.g. MTN)', type: 'text' },
  { key: 'momo_name', label: 'Mobile Money — Name', type: 'text' },
  { key: 'momo_number', label: 'Mobile Money — Number', type: 'text' },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid #ddd',
    borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif',
    marginTop: 6, outline: 'none', boxSizing: 'border-box', color:'#000', background: '#fff'
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4, marginBottom: 8 }}>Site Settings</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>Update your organization&apos;s contact info and social links.</p>

      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, padding: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #f0ebe0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {SETTINGS_FIELDS.map(({ key, label, type }) => (
              <div key={key}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 0 }}>{label}</label>
                {type === 'textarea' ? (
                  <textarea rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    value={settings[key] || ''}
                    onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} />
                ) : (
                  <input
                    style={inputStyle}
                    value={settings[key] || ''}
                    onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSave} disabled={saving}
            style={{
              marginTop: 28, width: '100%', background: saved ? '#1a3a2a' : '#c9a84c',
              color: saved ? 'white' : '#0f2419', padding: '14px',
              border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              opacity: saving ? 0.7 : 1, transition: 'background 0.3s'
            }}>
            {saving ? 'Saving...' : saved ? '✓ Settings Saved!' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  )
}
