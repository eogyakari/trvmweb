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
]

type TeamMember = {
  id: string
  name: string
  title: string
  bio: string | null
  photo_url: string | null
  sort_order: number
}

export default function AdminAboutPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingStory, setUploadingStory] = useState(false)
  const [team, setTeam] = useState<TeamMember[]>([])
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [memberForm, setMemberForm] = useState({ name: '', title: '', bio: '', sort_order: 0 })
  const [memberPhoto, setMemberPhoto] = useState<File | null>(null)
  const [memberPhotoPreview, setMemberPhotoPreview] = useState<string | null>(null)
  const [savingMember, setSavingMember] = useState(false)
  const storyPhotoRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: settingsData }, { data: teamData }] = await Promise.all([
      supabase.from('site_settings').select('*'),
      supabase.from('team_members').select('*').order('sort_order', { ascending: true })
    ])
    const map: Record<string, string> = {}
    for (const row of settingsData || []) map[row.key] = row.value
    setSettings(map)
    setTeam(teamData || [])
    setLoading(false)
  }

  async function uploadPhoto(file: File, key: string, setUploading: (v: boolean) => void): Promise<string | null> {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `about/${key}_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('trvm-media').upload(path, file, { upsert: true })
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return null }
    const url = supabase.storage.from('trvm-media').getPublicUrl(path).data.publicUrl
    setUploading(false)
    return url
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

  function openNewMember() {
    setEditingMember(null)
    setMemberForm({ name: '', title: '', bio: '', sort_order: team.length })
    setMemberPhoto(null)
    setMemberPhotoPreview(null)
    setShowTeamForm(true)
  }

  function openEditMember(m: TeamMember) {
    setEditingMember(m)
    setMemberForm({ name: m.name, title: m.title, bio: m.bio || '', sort_order: m.sort_order })
    setMemberPhoto(null)
    setMemberPhotoPreview(m.photo_url)
    setShowTeamForm(true)
  }

  async function handleSaveMember() {
    if (!memberForm.name || !memberForm.title) { alert('Name and title are required.'); return }
    setSavingMember(true)
    let photoUrl = editingMember?.photo_url || null
    if (memberPhoto) {
      photoUrl = await uploadPhoto(memberPhoto, `team_${Date.now()}`, () => {})
    }
    const payload = { name: memberForm.name, title: memberForm.title, bio: memberForm.bio || null, photo_url: photoUrl, sort_order: memberForm.sort_order }
    if (editingMember) {
      await supabase.from('team_members').update(payload).eq('id', editingMember.id)
    } else {
      await supabase.from('team_members').insert(payload)
    }
    setSavingMember(false)
    setShowTeamForm(false)
    load()
  }

  async function handleDeleteMember(id: string) {
    if (!confirm('Delete this team member?')) return
    await supabase.from('team_members').delete().eq('id', id)
    load()
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

      {/* Story Photo */}
      <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 20, border: '1px solid #f0ebe0' }}>
        <h2 style={{ fontWeight: 700, color: '#0f2419', fontSize: '1rem', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Story Section Photo</h2>
        {settings.about_story_photo && (
          <img src={settings.about_story_photo} alt="story" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
        )}
        <label style={{ display: 'inline-block', padding: '9px 20px', background: '#1a3a2a', color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
          {uploadingStory ? 'Uploading...' : settings.about_story_photo ? 'Replace Photo' : 'Upload Photo'}
          <input type="file" accept="image/*" style={{ display: 'none' }} ref={storyPhotoRef}
            onChange={async e => {
              const f = e.target.files?.[0]
              if (!f) return
              const url = await uploadPhoto(f, 'about_story_photo', setUploadingStory)
              if (url) {
                await supabase.from('site_settings').upsert({ key: 'about_story_photo', value: url }, { onConflict: 'key' })
                setSettings(s => ({ ...s, about_story_photo: url }))
              }
            }} />
        </label>
      </div>

      {/* Settings Sections */}
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

      {/* Team Members */}
      <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 20, border: '1px solid #f0ebe0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid #f0ebe0' }}>
          <h2 style={{ fontWeight: 700, color: '#0f2419', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Leadership Team ({team.length}/5)
          </h2>
          {team.length < 5 && (
            <button onClick={openNewMember} style={{
              background: '#c9a84c', color: '#0f2419', padding: '8px 18px',
              border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'Georgia, serif'
            }}>+ Add Member</button>
          )}
        </div>

        {team.length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center', padding: '24px 0', fontSize: 14 }}>No team members yet. Add up to 5.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {team.map(member => (
              <div key={member.id} style={{
                display: 'flex', gap: 16, alignItems: 'center',
                padding: '12px 16px', background: '#fafafa',
                borderRadius: 8, border: '1px solid #f0ebe0', flexWrap: 'wrap'
              }}>
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name}
                    style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#1a3a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, flexShrink: 0 }}>👤</div>
                )}
                <div style={{ flex: 1, minWidth: 150 }}>
                  <p style={{ fontWeight: 700, color: '#0f2419', fontSize: 14 }}>{member.name}</p>
                  <p style={{ fontSize: 12, color: '#c9a84c', marginTop: 2 }}>{member.title}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEditMember(member)} style={{ padding: '6px 14px', background: '#1a3a2a', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'Georgia, serif' }}>Edit</button>
                  <button onClick={() => handleDeleteMember(member.id)} style={{ padding: '6px 14px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'Georgia, serif' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Member Modal */}
      {showTeamForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 40, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 700, color: '#0f2419', marginBottom: 24, fontSize: '1.2rem' }}>
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {memberPhotoPreview && (
                    <img src={memberPhotoPreview} alt="preview"
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  <label style={{ display: 'inline-block', padding: '8px 16px', background: '#1a3a2a', color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                    Choose Photo
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        setMemberPhoto(f)
                        setMemberPhotoPreview(URL.createObjectURL(f))
                      }} />
                  </label>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }}>Full Name *</label>
                <input style={inputStyle} value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }}>Title / Role *</label>
                <input style={inputStyle} placeholder="e.g. Head of Missions" value={memberForm.title} onChange={e => setMemberForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }}>Bio</label>
                <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={memberForm.bio} onChange={e => setMemberForm(f => ({ ...f, bio: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block' }}>Order (0 = first)</label>
                <input type="number" min={0} style={inputStyle} value={memberForm.sort_order} onChange={e => setMemberForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowTeamForm(false)} style={{ background: 'transparent', color: '#c9a84c', padding: '10px 24px', border: '2px solid #c9a84c', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Cancel</button>
              <button onClick={handleSaveMember} disabled={savingMember} style={{ background: '#c9a84c', color: '#0f2419', padding: '10px 28px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: savingMember ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', opacity: savingMember ? 0.7 : 1 }}>
                {savingMember ? 'Saving...' : 'Save Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save bottom */}
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
