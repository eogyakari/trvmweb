'use client'
import { useEffect } from 'react'

// Goes at: src/app/components/PwaRegister.tsx
// Registers the service worker so the site is installable + works offline-lite.
export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const onLoad = () => navigator.serviceWorker.register('/sw.js').catch(() => {})
      window.addEventListener('load', onLoad)
      return () => window.removeEventListener('load', onLoad)
    }
  }, [])
  return null
}