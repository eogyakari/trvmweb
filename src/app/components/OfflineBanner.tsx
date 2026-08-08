'use client'
import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (!offline) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 5000,
      background: '#F5A623', color: '#1A0A2E',
      textAlign: 'center', padding: '7px 16px',
      fontSize: 13, fontWeight: 700, fontFamily: 'Georgia, serif',
    }}>
      You&rsquo;re offline — showing saved devotions
    </div>
  )
}