'use client'
import { useEffect, useRef } from 'react'
import type { Book, Magazine, Newsletter } from '@/lib/types'
import { getDict } from '@/i18n/client'
import type { Locale } from '@/i18n/config'

declare global {
  interface Window { PaystackPop: any }
}

type Props = {
  lang: Locale
  books: Book[]
  magazines: Magazine[]
  newsletters: Newsletter[]
}

const dateLocales: Record<Locale, string> = { en: 'en-GB', id: 'id-ID', sw: 'sw-TZ' }

function usePaystack() {
  const loaded = useRef(false)
  useEffect(() => {
    if (loaded.current) return
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)
    loaded.current = true
  }, [])
}

function handlePayment(
  item: Book | Magazine,
  pdfUrl: string,
  msgs: { emailPrompt: string; invalidEmail: string },
) {
  const email = prompt(msgs.emailPrompt)
  if (!email || !email.includes('@')) { alert(msgs.invalidEmail); return }

  const handler = window.PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email,
    amount: item.price * 100,
    currency: item.currency || 'GHS',
    ref: `TRVM_${Date.now()}`,
    metadata: {
      custom_fields: [{ display_name: 'Item', variable_name: 'item', value: item.title }]
    },
    callback: function() {
      window.open(pdfUrl, '_blank')
    },
    onClose: function() {}
  })
  handler.openIframe()
}

export default function PublicationsClient({ lang, books, magazines, newsletters }: Props) {
  usePaystack()
  const dict = getDict(lang)
  const t = dict.publicationsClient
  const dl = dateLocales[lang]
  const msgs = { emailPrompt: t.emailPrompt, invalidEmail: t.invalidEmail }

  const eyebrow: React.CSSProperties = { color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }
  const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(26px, 3.4vw, 42px)', fontWeight: 800, color: 'white', marginBottom: 8, lineHeight: 1.1 }
  const rule: React.CSSProperties = { width: 56, height: 2, background: '#F5A623', marginBottom: 'clamp(36px, 5vw, 52px)' }

  const pill: React.CSSProperties = {
    background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#0D0D1A',
    padding: '9px 22px', border: 'none', borderRadius: 30, fontWeight: 800, fontSize: 12.5,
    cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em',
    textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-block',
  }

  // A compact row: small portrait cover thumbnail + details + action.
  function PubRow({ item, kind, isFirst }: { item: Book | Magazine, kind: 'book' | 'mag', isFirst: boolean }) {
    const anyItem = item as any
    return (
      <div className="pub-row" style={{
        display: 'flex', gap: 'clamp(16px, 2.5vw, 28px)', alignItems: 'center',
        padding: '22px 0', borderTop: isFirst ? 'none' : '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* Small cover thumbnail */}
        <div style={{ width: 72, height: 96, flexShrink: 0, borderRadius: 6, overflow: 'hidden', background: 'linear-gradient(135deg, #2A1145, #0D0D1A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.35)' }}>
          {item.cover_image
            ? <img src={item.cover_image} alt={item.title} className="pub-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }} />
            : <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.2)' }}>{kind === 'book' ? '📚' : '📰'}</div>}
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {kind === 'mag' && anyItem.edition && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{anyItem.edition}</p>
          )}
          <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, color: 'white', fontSize: 'clamp(16px, 2vw, 20px)', marginBottom: 4, lineHeight: 1.3 }}>{item.title}</h3>
          {kind === 'book' && anyItem.author && (
            <p style={{ color: '#F5A623', fontSize: 12.5, marginBottom: 6 }}>{t.by} {anyItem.author}</p>
          )}
          {item.description && (
            <p className="pub-row-desc" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
              {item.description.length > 130 ? item.description.slice(0, 130) + '…' : item.description}
            </p>
          )}
        </div>

        {/* Action */}
        <div style={{ flexShrink: 0 }}>
          {item.is_free ? (
            item.pdf_url
              ? <a href={item.pdf_url} target="_blank" rel="noreferrer" style={pill}>{t.freeDownload}</a>
              : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{t.pdfNotAvailable}</span>
          ) : (
            item.pdf_url
              ? <button onClick={() => handlePayment(item, item.pdf_url!, msgs)} style={pill}>{item.currency} {item.price?.toFixed(2)}</button>
              : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{t.comingSoonShort}</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* BOOKS — compact rows */}
      <section id="books" style={{ padding: 'clamp(56px, 7vw, 90px) 24px', background: '#0D0D1A' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={eyebrow}>{dict.nav.publications}</p>
          <h2 style={sectionTitle}>{dict.pub.books}</h2>
          <div style={rule} />
          {books.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>{t.booksComingSoon}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {books.map((book, i) => <PubRow key={book.id} item={book} kind="book" isFirst={i === 0} />)}
            </div>
          )}
        </div>
      </section>

      {/* MAGAZINES — compact rows */}
      <section id="magazines" style={{ padding: 'clamp(56px, 7vw, 90px) 24px', background: '#1A0A2E' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={eyebrow}>{dict.nav.publications}</p>
          <h2 style={sectionTitle}>{dict.pub.magazines}</h2>
          <div style={rule} />
          {magazines.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>{t.magazinesComingSoon}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {magazines.map((mag, i) => <PubRow key={mag.id} item={mag} kind="mag" isFirst={i === 0} />)}
            </div>
          )}
        </div>
      </section>

      {/* NEWSLETTERS — rows */}
      <section id="newsletters" style={{ padding: 'clamp(56px, 7vw, 90px) 24px', background: '#0D0D1A' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={eyebrow}>{dict.nav.publications}</p>
          <h2 style={sectionTitle}>{dict.pub.newsletters}</h2>
          <div style={rule} />
          {newsletters.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>{t.newslettersComingSoon}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {newsletters.map((n, i) => (
                <div key={n.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 12, padding: '20px 0',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, color: 'white', fontSize: '1.05rem' }}>{n.title}</h3>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 5 }}>
                      {n.issue_number ? `${t.issue} ${n.issue_number}` : ''}
                      {n.issue_number && n.date ? ' · ' : ''}
                      {n.date ? new Date(n.date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    </p>
                  </div>
                  {n.pdf_url && (
                    <a href={n.pdf_url} target="_blank" rel="noreferrer" style={{
                      color: '#F5A623', fontWeight: 800, fontSize: 12, textDecoration: 'none',
                      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                      borderBottom: '2px solid #F5A623', paddingBottom: 3,
                    }}>
                      {t.freeDownload} →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .pub-row:hover .pub-img { transform: scale(1.06); }
        @media (max-width: 560px) {
          .pub-row-desc { display: none !important; }
        }
      `}</style>
    </div>
  )
}