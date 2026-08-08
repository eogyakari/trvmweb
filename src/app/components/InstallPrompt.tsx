'use client'
import { useEffect, useState } from 'react'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const DISMISS_KEY = 'trvm-install-dismissed'
const DISMISS_DAYS = 30

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Already installed? (standalone display mode) -> never show.
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    if (standalone) return

    // Recently dismissed? -> stay quiet.
    try {
      const until = Number(localStorage.getItem(DISMISS_KEY) || 0)
      if (until && Date.now() < until) return
    } catch {}

    // Detect iOS Safari (no install event there).
    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream
    const isSafari = ios && /safari/.test(ua) && !/crios|fxios/.test(ua)

    if (ios) {
      setIsIOS(true)
      // show iOS hint after a short delay so it doesn't interrupt first paint
      const t = setTimeout(() => setShow(true), 2500)
      return () => clearTimeout(t)
    }

    // Android/Chrome: wait for the browser's install event.
    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)
    // If it installs, hide.
    const onInstalled = () => setShow(false)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismiss() {
    setShow(false)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 864e5))
    } catch {}
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    try { await deferred.userChoice } catch {}
    setDeferred(null)
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 4000,
      maxWidth: 460, margin: '0 auto',
      background: 'linear-gradient(135deg, #1A0A2E, #2A1043)',
      border: '1px solid rgba(245,166,35,0.4)',
      borderRadius: 16, padding: '16px 18px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', gap: 14,
      fontFamily: 'Georgia, serif',
    }}>
      <img src="/icon-192.png" alt="TRVM" width={48} height={48}
        style={{ borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {isIOS ? (
          <>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
              Add TRVM to your Home Screen
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5, lineHeight: 1.5 }}>
              Tap the Share icon <span style={{ color: '#F5A623' }}>⎋</span>, then
              &ldquo;Add to Home Screen&rdquo;.
            </p>
          </>
        ) : (
          <>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
              Install the TRVM app
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5, lineHeight: 1.5 }}>
              Daily devotions and more, right on your home screen.
            </p>
          </>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        {!isIOS && (
          <button onClick={install} style={{
            background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#1A0A2E',
            border: 'none', borderRadius: 20, padding: '8px 18px',
            fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Georgia, serif',
          }}>
            Install
          </button>
        )}
        <button onClick={dismiss} style={{
          background: 'transparent', color: 'rgba(255,255,255,0.5)',
          border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'Georgia, serif',
          padding: isIOS ? '6px 10px' : '2px',
        }}>
          {isIOS ? 'Got it' : 'Not now'}
        </button>
      </div>
    </div>
  )
}