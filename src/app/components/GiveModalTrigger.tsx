'use client'
import { useState, useEffect } from 'react'
import type { Locale } from '@/i18n/config'
import { getDict } from '@/i18n/client'
import DonateClient from '@/app/[lang]/donate/DonateClient'

export default function GiveModalTrigger({
  lang, bankDetails,
}: {
  lang: Locale
  bankDetails: Record<string, string>
}) {
  const dict = getDict(lang)
  const g = dict.giveSection
  const [open, setOpen] = useState(false)

  // Lock body scroll when modal open, close on Escape
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <>
      {/* Give section */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1A0A2E 0%, #2A1145 55%, #0D0D1A 100%)',
        padding: 'clamp(80px, 12vw, 150px) 24px', textAlign: 'center',
      }}>
        <div aria-hidden style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <p style={{ color: '#F5A623', fontSize: 'clamp(12px,1.6vw,15px)', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 24 }}>
            {g.eyebrow}
          </p>
          <h2 style={{ color: 'white', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(30px, 5vw, 56px)', lineHeight: 1.15, marginBottom: 28 }}>
            {g.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(16px, 2.2vw, 21px)', lineHeight: 1.7, fontStyle: 'italic', fontFamily: 'Georgia, serif', marginBottom: 44, maxWidth: 620, margin: '0 auto 44px' }}>
            {g.subtitle}
          </p>
          <button onClick={() => setOpen(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#1A0A2E',
            padding: 'clamp(15px,2vw,19px) clamp(32px,4vw,52px)', border: 'none', borderRadius: 40,
            fontSize: 'clamp(14px,1.6vw,17px)', fontWeight: 800, letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Georgia, serif',
            boxShadow: '0 12px 40px rgba(245,166,35,0.35)',
          }}>
            {g.cta} <span aria-hidden>→</span>
          </button>
        </div>
      </section>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(5,4,12,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '24px', overflowY: 'auto',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative', width: '100%', maxWidth: 720, margin: 'auto',
              background: 'linear-gradient(135deg, #0D0D1A, #1A0A2E)',
              border: '1px solid rgba(245,166,35,0.3)', borderRadius: 20,
              boxShadow: '0 30px 90px rgba(0,0,0,0.6)', overflow: 'hidden',
            }}
          >
            {/* Close */}
            <button onClick={() => setOpen(false)} aria-label="Close" style={{
              position: 'absolute', top: 16, right: 16, zIndex: 2,
              width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 20,
            }}>✕</button>

            {/* The existing donation interface, inside the modal */}
            <div className="give-modal-body">
              <DonateClient lang={lang} bankDetails={bankDetails} inModal />
            </div>
          </div>
        </div>
      )}
    </>
  )
}