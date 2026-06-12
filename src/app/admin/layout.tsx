import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — TRVM',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0ede6',
      fontFamily: 'Georgia, serif'
    }}>
      {/* Admin top bar */}
      <div style={{
        background: '#0f2419',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 30, height: 30,
            background: '#c9a84c',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#0f2419', fontWeight: 900
          }}>✝</div>
          <div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>TRVM</span>
            <span style={{ color: '#c9a84c', fontSize: 13 }}> · Admin Panel</span>
          </div>
        </div>
        <a href="/" target="_blank" rel="noreferrer"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>
          View Site ↗
        </a>
      </div>

      {/* Page content */}
      <div>{children}</div>
    </div>
  )
}