import type { Metadata } from 'next'
import AdminGuard from './AdminGuard'

export const metadata: Metadata = {
  title: 'Admin — TRVM',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f0ede6', fontFamily: 'Georgia, serif' }}>
      <AdminGuard>{children}</AdminGuard>
    </div>
  )
}