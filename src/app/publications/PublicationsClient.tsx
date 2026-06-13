'use client'
import { useEffect, useRef } from 'react'
import type { Book, Magazine, Newsletter } from '@/lib/types'

declare global {
  interface Window { PaystackPop: any }
}

type Props = {
  books: Book[]
  magazines: Magazine[]
  newsletters: Newsletter[]
}

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

function handlePayment(item: Book | Magazine, pdfUrl: string) {
  const email = prompt('Enter your email address to receive your download:')
  if (!email || !email.includes('@')) { alert('Please enter a valid email address.'); return }

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

export default function PublicationsClient({ books, magazines, newsletters }: Props) {
  usePaystack()

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1A0A2E, #16213E)',
    border: '1px solid rgba(123,47,190,0.3)',
    borderRadius: 16, overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800,
    color: 'white', marginBottom: 8
  }

  return (
    <div>
      {/* BOOKS */}
      <section id="books" style={{ padding: '72px 24px', background: '#0D0D1A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Publications</p>
          <h2 style={sectionTitleStyle}>Books</h2>
          <div style={{ width: 50, height: 3, background: '#F5A623', marginBottom: 48 }} />

          {books.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>Books coming soon.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 28 }}>
              {books.map(book => (
                <div key={book.id} style={cardStyle}>
                  {/* Cover */}
                  <div style={{ height: 300, background: 'linear-gradient(135deg, #7B2FBE33, #0D0D1A)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {book.cover_image ? (
                      <img src={book.cover_image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                        <div style={{ fontSize: 56 }}>📚</div>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontWeight: 800, color: 'white', fontSize: '1rem', marginBottom: 6 }}>{book.title}</h3>
                    <p style={{ color: '#F5A623', fontSize: 13, marginBottom: 10 }}>by {book.author}</p>
                    {book.description && (
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7, marginBottom: 16, flex: 1 }}>
                        {book.description}
                      </p>
                    )}

                    {/* Price / Download */}
                    <div style={{ marginTop: 'auto' }}>
                      {book.is_free ? (
                        book.pdf_url ? (
                          <a href={book.pdf_url} target="_blank" rel="noreferrer" style={{
                            display: 'block', textAlign: 'center',
                            background: 'linear-gradient(135deg, #F5A623, #E8860A)',
                            color: '#0D0D1A', padding: '10px 0',
                            borderRadius: 6, fontWeight: 700, fontSize: 13,
                            textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em'
                          }}>
                            Free Download
                          </a>
                        ) : (
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' }}>PDF not available yet</p>
                        )
                      ) : (
                        book.pdf_url ? (
                          <button onClick={() => handlePayment(book, book.pdf_url!)} style={{
                            width: '100%', background: 'linear-gradient(135deg, #F5A623, #E8860A)',
                            color: '#0D0D1A', padding: '10px 0', border: 'none',
                            borderRadius: 6, fontWeight: 700, fontSize: 13,
                            cursor: 'pointer', fontFamily: 'Georgia, serif',
                            textTransform: 'uppercase', letterSpacing: '0.05em'
                          }}>
                            Buy — {book.currency} {book.price?.toFixed(2)}
                          </button>
                        ) : (
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' }}>Coming soon</p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MAGAZINES */}
      <section id="magazines" style={{ padding: '72px 24px', background: '#1A0A2E' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Publications</p>
          <h2 style={sectionTitleStyle}>Magazines</h2>
          <div style={{ width: 50, height: 3, background: '#F5A623', marginBottom: 48 }} />

          {magazines.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>Magazines coming soon.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 28 }}>
              {magazines.map(mag => (
                <div key={mag.id} style={cardStyle}>
                  <div style={{ height: 340, background: 'linear-gradient(135deg, #7B2FBE33, #0D0D1A)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {mag.cover_image ? (
                      <img src={mag.cover_image} alt={mag.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                        <div style={{ fontSize: 56 }}>📰</div>
                      </div>
                    )}
                    {mag.is_free && (
                      <div style={{ position: 'absolute', top: 12, right: 12, background: '#F5A623', color: '#0D0D1A', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>FREE</div>
                    )}
                  </div>

                  <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{mag.edition}</p>
                    <h3 style={{ fontWeight: 800, color: 'white', fontSize: '1rem', marginBottom: 10 }}>{mag.title}</h3>
                    {mag.description && (
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{mag.description}</p>
                    )}

                    <div style={{ marginTop: 'auto' }}>
                      {mag.is_free ? (
                        mag.pdf_url ? (
                          <a href={mag.pdf_url} target="_blank" rel="noreferrer" style={{
                            display: 'block', textAlign: 'center',
                            background: 'linear-gradient(135deg, #F5A623, #E8860A)',
                            color: '#0D0D1A', padding: '10px 0',
                            borderRadius: 6, fontWeight: 700, fontSize: 13,
                            textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em'
                          }}>
                            Free Download
                          </a>
                        ) : (
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' }}>PDF not available yet</p>
                        )
                      ) : (
                        mag.pdf_url ? (
                          <button onClick={() => handlePayment(mag, mag.pdf_url!)} style={{
                            width: '100%', background: 'linear-gradient(135deg, #F5A623, #E8860A)',
                            color: '#0D0D1A', padding: '10px 0', border: 'none',
                            borderRadius: 6, fontWeight: 700, fontSize: 13,
                            cursor: 'pointer', fontFamily: 'Georgia, serif',
                            textTransform: 'uppercase', letterSpacing: '0.05em'
                          }}>
                            Buy — {mag.currency} {mag.price?.toFixed(2)}
                          </button>
                        ) : (
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' }}>Coming soon</p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEWSLETTERS */}
      <section id="newsletters" style={{ padding: '72px 24px', background: '#0D0D1A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Publications</p>
          <h2 style={sectionTitleStyle}>Newsletters</h2>
          <div style={{ width: 50, height: 3, background: '#F5A623', marginBottom: 48 }} />

          {newsletters.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>Newsletters coming soon.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {newsletters.map(n => (
                <div key={n.id} style={{
                  background: 'linear-gradient(135deg, #1A0A2E, #16213E)',
                  border: '1px solid rgba(123,47,190,0.3)',
                  borderRadius: 10, padding: '18px 24px',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', flexWrap: 'wrap', gap: 12
                }}>
                  <div>
                    <h3 style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{n.title}</h3>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                      {n.issue_number ? `Issue ${n.issue_number}` : ''}
                      {n.issue_number && n.date ? ' · ' : ''}
                      {n.date ? new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    </p>
                  </div>
                  {n.pdf_url && (
                    <a href={n.pdf_url} target="_blank" rel="noreferrer" style={{
                      background: 'linear-gradient(135deg, #F5A623, #E8860A)',
                      color: '#0D0D1A', padding: '8px 20px',
                      borderRadius: 6, fontWeight: 700, fontSize: 12,
                      textDecoration: 'none', textTransform: 'uppercase',
                      letterSpacing: '0.05em', whiteSpace: 'nowrap'
                    }}>
                      Free Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
