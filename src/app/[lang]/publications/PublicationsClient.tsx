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
  const rule: React.CSSProperties = { width: 56, height: 2, background: '#F5A623', marginBottom: 'clamp(40px, 6vw, 64px)' }
  const buyBtn: React.CSSProperties = {
    width: '100%', background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#0D0D1A',
    padding: '11px 0', border: 'none', borderRadius: 30, fontWeight: 800, fontSize: 13,
    cursor: 'pointer', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em',
  }
  const dlLink: React.CSSProperties = { ...buyBtn, display: 'block', textAlign: 'center', textDecoration: 'none', padding: '11px 0' }

  return (
    <div>
      {/* BOOKS — cover-forward, de-boxed */}
      <section id="books" style={{ padding: 'clamp(64px, 8vw, 100px) 24px', background: '#0D0D1A' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <p style={eyebrow}>{dict.nav.publications}</p>
          <h2 style={sectionTitle}>{dict.pub.books}</h2>
          <div style={rule} />

          {books.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>{t.booksComingSoon}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 'clamp(28px, 3.5vw, 44px)' }}>
              {books.map(book => (
                <div key={book.id} className="pub-item" style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Cover — portrait, like a bookshelf */}
                  <div style={{ aspectRatio: '3/4', borderRadius: 10, overflow: 'hidden', marginBottom: 18, background: 'linear-gradient(135deg, #2A1145, #0D0D1A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}>
                    {book.cover_image
                      ? <img src={book.cover_image} alt={book.title} className="pub-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }} />
                      : <div style={{ fontSize: 56, color: 'rgba(255,255,255,0.2)' }}>📚</div>}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, color: 'white', fontSize: '1.05rem', marginBottom: 5, lineHeight: 1.3 }}>{book.title}</h3>
                  <p style={{ color: '#F5A623', fontSize: 13, marginBottom: 10 }}>{t.by} {book.author}</p>
                  {book.description && (
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{book.description}</p>
                  )}
                  <div style={{ marginTop: 'auto' }}>
                    {book.is_free ? (
                      book.pdf_url
                        ? <a href={book.pdf_url} target="_blank" rel="noreferrer" style={dlLink}>{t.freeDownload}</a>
                        : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' }}>{t.pdfNotAvailable}</p>
                    ) : (
                      book.pdf_url
                        ? <button onClick={() => handlePayment(book, book.pdf_url!, msgs)} style={buyBtn}>{t.buy} — {book.currency} {book.price?.toFixed(2)}</button>
                        : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' }}>{t.comingSoonShort}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MAGAZINES — cover-forward, de-boxed */}
      <section id="magazines" style={{ padding: 'clamp(64px, 8vw, 100px) 24px', background: '#1A0A2E' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <p style={eyebrow}>{dict.nav.publications}</p>
          <h2 style={sectionTitle}>{dict.pub.magazines}</h2>
          <div style={rule} />

          {magazines.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>{t.magazinesComingSoon}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 'clamp(28px, 3.5vw, 44px)' }}>
              {magazines.map(mag => (
                <div key={mag.id} className="pub-item" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 10, overflow: 'hidden', marginBottom: 18, background: 'linear-gradient(135deg, #2A1145, #0D0D1A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}>
                    {mag.cover_image
                      ? <img src={mag.cover_image} alt={mag.title} className="pub-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }} />
                      : <div style={{ fontSize: 56, color: 'rgba(255,255,255,0.2)' }}>📰</div>}
                    {mag.is_free && (
                      <div style={{ position: 'absolute', top: 12, right: 12, background: '#F5A623', color: '#0D0D1A', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>{t.free}</div>
                    )}
                  </div>
                  {mag.edition && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{mag.edition}</p>}
                  <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, color: 'white', fontSize: '1.05rem', marginBottom: 10, lineHeight: 1.3 }}>{mag.title}</h3>
                  {mag.description && (
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{mag.description}</p>
                  )}
                  <div style={{ marginTop: 'auto' }}>
                    {mag.is_free ? (
                      mag.pdf_url
                        ? <a href={mag.pdf_url} target="_blank" rel="noreferrer" style={dlLink}>{t.freeDownload}</a>
                        : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' }}>{t.pdfNotAvailable}</p>
                    ) : (
                      mag.pdf_url
                        ? <button onClick={() => handlePayment(mag, mag.pdf_url!, msgs)} style={buyBtn}>{t.buy} — {mag.currency} {mag.price?.toFixed(2)}</button>
                        : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' }}>{t.comingSoonShort}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEWSLETTERS — editorial rows with dividers */}
      <section id="newsletters" style={{ padding: 'clamp(64px, 8vw, 100px) 24px', background: '#0D0D1A' }}>
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
                  flexWrap: 'wrap', gap: 12, padding: '22px 0',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>{n.title}</h3>
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
        .pub-item:hover .pub-img { transform: scale(1.05); }
      `}</style>
    </div>
  )
}