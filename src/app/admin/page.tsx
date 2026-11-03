'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ADMIN_SECTION_LIST, canAccess } from '@/lib/adminSections'
import { useAdminAuth } from './AdminGuard'

const COUNT_TABLES: Record<string, string> = {
  devotions: 'devotions', books: 'books', magazines: 'magazines', newsletters: 'newsletters',
  videos: 'videos', gallery: 'gallery', slideshow: 'slideshow', messages: 'contact_messages',
  subscribers: 'subscribers', quotes: 'quotes', events: 'events',
}
// Order of preference for the big headline tiles at the top.
const HEADLINE_ORDER = ['subscribers', 'devotions', 'events', 'messages', 'gallery', 'videos']

export default function AdminPage() {
  const auth = useAdminAuth()
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const out: Record<string, number> = {}
    for (const [key, table] of Object.entries(COUNT_TABLES)) {
      try {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
        out[key] = count || 0
      } catch { /* table may not exist yet */ }
    }
    setCounts(out)
  }

  const role = auth?.role || 'editor'
  const permissions = auth?.permissions || []
  const firstName = (auth?.email || '').split('@')[0].split(/[.\-_]/)[0]
  const greetName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : 'there'

  // Accessible sections (used for quick-access cards).
  const visible = ADMIN_SECTION_LIST.filter(s => canAccess(role, permissions, s.key))

  // Headline tiles: accessible, counted sections in preference order (up to 4).
  const headline = HEADLINE_ORDER
    .filter(k => canAccess(role, permissions, k) && k in COUNT_TABLES)
    .map(k => ADMIN_SECTION_LIST.find(s => s.key === k)!)
    .filter(Boolean)
    .slice(0, 4)

  return (
    <>
      <style>{`
        .dash { max-width:1120px; margin:0 auto; padding:clamp(28px,4vw,44px) clamp(16px,3.5vw,34px); font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        .dash-hi h1 { font-size:clamp(1.5rem,3vw,1.9rem); font-weight:800; color:#0f172a; letter-spacing:-.3px; }
        .dash-hi p { color:#64748b; font-size:13.5px; margin-top:4px; }
        .stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin:30px 0 40px; }
        .stat { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:20px 22px; position:relative; overflow:hidden; transition:box-shadow .15s, transform .15s; text-decoration:none; display:block; }
        .stat:hover { box-shadow:0 8px 24px rgba(15,23,42,.08); transform:translateY(-2px); }
        .stat::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#c9a84c; opacity:.0; transition:opacity .15s; }
        .stat:hover::before { opacity:1; }
        .stat .lbl { font-size:11px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; color:#94a3b8; display:flex; align-items:center; gap:7px; }
        .stat .num { font-size:2rem; font-weight:800; color:#0f172a; margin-top:8px; line-height:1; }
        .stat .sub { font-size:12px; color:#64748b; margin-top:5px; font-weight:600; }
        .sec-label { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94a3b8; margin-bottom:14px; }
        .qa-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:14px; }
        .qa { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; align-items:center; gap:14px; text-decoration:none; transition:border-color .15s, box-shadow .15s, transform .15s; }
        .qa:hover { border-color:#cbd5e1; box-shadow:0 6px 18px rgba(15,23,42,.07); transform:translateY(-2px); }
        .qa-ico { width:42px; height:42px; border-radius:11px; background:#f8fafc; border:1px solid #f1f5f9; display:flex; align-items:center; justify-content:center; font-size:19px; flex-shrink:0; }
        .qa:hover .qa-ico { background:#fbf7ec; border-color:#ecdcae; }
        .qa b { font-size:13.5px; font-weight:700; color:#0f172a; display:block; }
        .qa span { font-size:12px; color:#94a3b8; }
        .qa.owner .qa-ico { background:#fbf7ec; border-color:#ecdcae; }
      `}</style>

      <div className="dash">
        <div className="dash-hi">
          <h1>Welcome back, {greetName}</h1>
          <p>Here&apos;s what&apos;s happening across The Righteous Vine Missions.</p>
        </div>

        {headline.length > 0 && (
          <div className="stat-grid">
            {headline.map(s => {
              const n = s.key in counts ? counts[s.key] : null
              return (
                <Link key={s.key} href={s.href} className="stat">
                  <div className="lbl"><span>{s.icon}</span> {s.label}</div>
                  <div className="num">{n === null ? '—' : n.toLocaleString()}</div>
                  <div className="sub">{n === null ? 'Loading…' : `${n === 1 ? 'entry' : 'entries'} total`}</div>
                </Link>
              )
            })}
          </div>
        )}

        <div className="sec-label">Quick access</div>
        <div className="qa-grid">
          {visible.map(s => {
            const n = s.key in counts ? counts[s.key] : null
            return (
              <Link key={s.key} href={s.href} className="qa">
                <div className="qa-ico">{s.icon}</div>
                <div>
                  <b>{s.label}</b>
                  <span>{n === null ? 'Manage →' : `${n} ${n === 1 ? 'item' : 'items'}`}</span>
                </div>
              </Link>
            )
          })}

          {role === 'owner' && (
            <Link href="/admin/editors" className="qa owner">
              <div className="qa-ico">🔑</div>
              <div>
                <b>Manage Editors</b>
                <span>Accounts &amp; roles</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </>
  )
}