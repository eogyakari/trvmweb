'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const FIELDS = [
  { section: 'Stats', fields: [
    { key: 'stat_souls', label: 'Souls Won', placeholder: '10,000+' },
    { key: 'stat_islands', label: 'Islands Visited', placeholder: '6' },
    { key: 'stat_days', label: 'Days in the Field', placeholder: '61' },
    { key: 'stat_years', label: 'Years of Ministry', placeholder: '10+' },
    { key: 'about_missions_banner', label: 'Missions Countries Banner', placeholder: 'Liberia · Kenya · Ghana · Indonesia (6 Islands)' },
  ]},
  { section: 'Our Story', fields: [
    { key: 'about_story_title', label: 'Story Title', placeholder: 'Called to the Nations' },
    { key: 'about_story_p1', label: 'Paragraph 1', placeholder: '', textarea: true },
    { key: 'about_story_p2', label: 'Paragraph 2', placeholder: '', textarea: true },
    { key: 'about_story_p3', label: 'Paragraph 3', placeholder: '', textarea: true },
  ]},
  { section: 'Mission · Vision · Values', fields: [
    { key: 'about_mission_text', label: 'Mission Statement', placeholder: '', textarea: true },
    { key: 'about_vision_text', label: 'Vision Statement', placeholder: '', textarea: true },
    { key: 'about_values_text', label: 'Values', placeholder: '', textarea: true },
  ]},
  { section: 'Leadership', fields: [
    { key: 'about_leader_name', label: 'Leader Name', placeholder: 'Eugene Owusu Gyakari' },
    { key: 'about_leader_title', label: 'Leader Title', placeholder: 'Founder & Head of Missions' },
    { key: 'about_leader_bio', label: 'Leader Bio', placeholder: '', textarea: true },
  ]},
]

export default function AdminAboutPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingStory, setUploadingStory] = useState(false)
  const [uploadingLeader, setUploadingLeader] = useState(false)
  const storyPhotoRef = useRef<HTMLInputElement>(null)
  const leaderPhotoRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('site_settings').select('*')
    const map: Record<string, string> = {}
    for (const row of data || []) map[row.key] = row.value
    setSettings(map)
    setLoading(false)
  }

  async function uploadPhoto(file: File, key: string, setUploading: (v: boolean) => void) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `about/${key}_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('trvm-media').upload(path, file, { upsert: true })
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return }
    const url = supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
    await supabase.from('site_settings').upsert({ key, value: url }, { onConflict: 'key' })
    setSettings(s => ({ ...s, [key]: url }))
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    const allKeys = FIELDS.flatMap(s => s.fields.map(f => f.key))
    for (const key of allKeys) {
      await supabase.from('site_settings').upsert({ key, value: settings[key] || '' }, { onConflict: 'key' })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid #ddd',
    borderRadius: 6, fontSize: 14, fontFamily: 'Georgia, serif',
    marginTop: 6, outline: 'none', boxSizing: 'border-box',
    color: '#000', background: '#fff'
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: '#888', fontFamily: 'Georgia, serif' }}>Loading...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin" style={{ color: '#1a3a2a', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2419', marginTop: 4 }}>About Page Editor</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Edit all content on the About page</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          background: saved ? '#1a3a2a' : '#c9a84c', color: saved ? 'white' : '#0f2419',
          padding: '10px 28px', border: 'none', borderRadius: 6,
          fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em',
          opacity: saving ? 0.7 : 1, transition: 'background 0.3s'
        }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Photos */}
      <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 24, border: '1px solid #f0ebe0' }}>
        <h2 style={{ fontWeight: 700, color: '#0f2419', fontSize: '1rem', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Photos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

          {/* Story photo */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 8 }}>Story Section Photo</label>
            {settings.about_story_photo && (
              <img src={settings.about_story_photo} alt="story" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
            )}
            <label style={{
              display: 'inline-block', padding: '9px 20px', background: '#1a3a2a',
              color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Georgia, serif'
            }}>
              {uploadingStory ? 'Uploading...' : settings.about_story_photo ? 'Replace Photo' : 'Upload Photo'}
              <input type="file" accept="image/*" style={{ display: 'none' }} ref={storyPhotoRef}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f, 'about_story_photo', setUploadingStory) }} />
            </label>
          </div>

          {/* Leader photo */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 8 }}>Leader / Founder Photo</label>
            {settings.about_leader_photo && (
              <img src={settings.about_leader_photo} alt="leader" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
            )}
            <label style={{
              display: 'inline-block', padding: '9px 20px', background: '#1a3a2a',
              color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Georgia, serif'
            }}>
              {uploadingLeader ? 'Uploading...' : settings.about_leader_photo ? 'Replace Photo' : 'Upload Photo'}
              <input type="file" accept="image/*" style={{ display: 'none' }} ref={leaderPhotoRef}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f, 'about_leader_photo', setUploadingLeader) }} />
            </label>
          </div>
        </div>
      </div>

      {/* Sections */}
      {FIELDS.map(section => (
        <div key={section.section} style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 20, border: '1px solid #f0ebe0' }}>
          <h2 style={{ fontWeight: 700, color: '#0f2419', fontSize: '1rem', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 12, borderBottom: '2px solid #f0ebe0' }}>
            {section.section}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {section.fields.map(field => (
              <div key={field.key}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }}>{field.label}</label>
                {(field as any).textarea ? (
                  <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder={field.placeholder}
                    value={settings[field.key] || ''}
                    onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))} />
                ) : (
                  <input style={inputStyle}
                    placeholder={field.placeholder}
                    value={settings[field.key] || ''}
                    onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save button bottom */}
      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', background: saved ? '#1a3a2a' : '#c9a84c',
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
