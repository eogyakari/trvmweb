'use client'
import { useState, useEffect, useRef } from 'react'
import { getDict } from '@/i18n/client'
import type { Locale } from '@/i18n/config'

declare global {
  interface Window { PaystackPop: any }
}

const SUGGESTED_AMOUNTS = [50, 100, 200, 500, 1000]
const CURRENCY_CODES = ['GHS', 'USD', 'GBP', 'EUR']

type Props = {
    lang: Locale
    bankDetails: Record<string, string>
    inModal?: boolean
  }
 
  export default function DonateClient({ lang, bankDetails, inModal = false }: Props) {
  const dict = getDict(lang)
  const d = dict.donateClient
  const cur = (code: string) => (d.currencies as Record<string, string>)[code] || code

  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('GHS')
  const [customAmount, setCustomAmount] = useState(false)
  const [donating, setDonating] = useState(false)
  const [success, setSuccess] = useState(false)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)
    scriptLoaded.current = true
  }, [])

  function handleDonate() {
    if (!amount || parseFloat(amount) <= 0) { alert(d.invalidAmount); return }
    const email = prompt(d.emailPrompt)
    if (!email || !email.includes('@')) { alert(d.invalidEmail); return }

    setDonating(true)
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: parseFloat(amount) * 100,
      currency,
      ref: `TRVM_DONATION_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Donation Type', variable_name: 'type', value: 'Ministry Donation' }
        ]
      },
      callback: function() {
        setDonating(false)
        setSuccess(true)
        setAmount('')
      },
      onClose: function() {
        setDonating(false)
      }
    })
    handler.openIframe()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', border: '1px solid rgba(123,47,190,0.3)',
    borderRadius: 8, fontSize: 16, fontFamily: 'Georgia, serif',
    background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none',
    boxSizing: 'border-box'
  }

  const bank1HasDetails = bankDetails.bank1_name && bankDetails.bank1_account_number
  const bank2HasDetails = bankDetails.bank2_name && bankDetails.bank2_account_number
  const momoHasDetails = bankDetails.momo_number

  return (
    <div>
      {/* Hero */}
      {!inModal && (
      <div style={{
        background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)',
        padding: '72px 24px', textAlign: 'center'
      }}>
        <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>✝ {d.eyebrow}</p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>{d.title}</h1>
        <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.8 }}>
          &ldquo;{d.scripture}&rdquo; — {d.scriptureRef}
        </p>
      </div>
      )}

      <div style={{ background: '#0D0D1A', padding: inModal ? '32px 24px' : '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: inModal ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: inModal ? 32 : 48 }}>

          {/* Online Donation */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>{d.giveOnline}</h2>
            <div style={{ width: 40, height: 3, background: '#F5A623', marginBottom: 32 }} />

            {success ? (
              <div style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 12, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🙏</div>
                <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', marginBottom: 10 }}>{d.successTitle}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                  {d.successText}
                </p>
                <button onClick={() => setSuccess(false)} style={{ marginTop: 20, background: '#F5A623', color: '#0D0D1A', padding: '10px 24px', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                  {d.giveAgain}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Currency selector */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 8 }}>{d.currency}</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    style={{ ...inputStyle, fontSize: 14 }}>
                    {CURRENCY_CODES.map(code => (
                      <option key={code} value={code} style={{ background: '#1A0A2E', color: 'white' }}>{cur(code)}</option>
                    ))}
                  </select>
                </div>

                {/* Suggested amounts */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 10 }}>{d.selectAmount} ({currency})</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                    {SUGGESTED_AMOUNTS.map(a => (
                      <button key={a} onClick={() => { setAmount(a.toString()); setCustomAmount(false) }}
                        style={{
                          padding: '12px 8px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'Georgia, serif',
                          background: amount === a.toString() && !customAmount ? '#F5A623' : 'rgba(255,255,255,0.06)',
                          color: amount === a.toString() && !customAmount ? '#0D0D1A' : 'rgba(255,255,255,0.8)',
                          border: amount === a.toString() && !customAmount ? 'none' : '1px solid rgba(123,47,190,0.3)',
                          transition: 'all 0.15s'
                        }}>
                        {currency} {a}
                      </button>
                    ))}
                    <button onClick={() => { setCustomAmount(true); setAmount('') }}
                      style={{
                        padding: '12px 8px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'Georgia, serif',
                        background: customAmount ? '#F5A623' : 'rgba(255,255,255,0.06)',
                        color: customAmount ? '#0D0D1A' : 'rgba(255,255,255,0.8)',
                        border: customAmount ? 'none' : '1px solid rgba(123,47,190,0.3)',
                        transition: 'all 0.15s'
                      }}>
                      {d.custom}
                    </button>
                  </div>

                  {customAmount && (
                    <input
                      type="number" min="1" step="0.01"
                      style={inputStyle}
                      placeholder={`${d.enterAmount} ${currency}`}
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      autoFocus
                    />
                  )}
                </div>

                {/* Donate button */}
                <button onClick={handleDonate} disabled={donating || !amount}
                  style={{
                    background: amount ? 'linear-gradient(135deg, #F5A623, #E8860A)' : 'rgba(255,255,255,0.1)',
                    color: amount ? '#0D0D1A' : 'rgba(255,255,255,0.3)',
                    padding: '16px', border: 'none', borderRadius: 8,
                    fontWeight: 800, fontSize: 15, cursor: amount ? 'pointer' : 'not-allowed',
                    fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em',
                    transition: 'all 0.2s'
                  }}>
                  {donating ? d.processing : amount ? `${dict.nav.donate} ${currency} ${parseFloat(amount || '0').toFixed(2)}` : d.selectAnAmount}
                </button>

                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center' }}>
                  🔒 {d.securePayment}
                </p>
              </div>
            )}
          </div>

          {/* Bank Transfer + MoMo */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>{d.bankTransfer}</h2>
            <div style={{ width: 40, height: 3, background: '#F5A623', marginBottom: 32 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Bank 1 */}
              {bank1HasDetails && (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,190,0.3)', borderRadius: 12, padding: 24 }}>
                  <p style={{ color: '#F5A623', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                    {bankDetails.bank1_name}
                  </p>
                  {[
                    { label: d.accountName, value: bankDetails.bank1_account_name },
                    { label: d.accountNumber, value: bankDetails.bank1_account_number },
                    { label: d.branch, value: bankDetails.bank1_branch },
                  ].filter(item => item.value).map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{item.label}</span>
                      <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bank 2 */}
              {bank2HasDetails && (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,190,0.3)', borderRadius: 12, padding: 24 }}>
                  <p style={{ color: '#F5A623', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                    {bankDetails.bank2_name}
                  </p>
                  {[
                    { label: d.accountName, value: bankDetails.bank2_account_name },
                    { label: d.accountNumber, value: bankDetails.bank2_account_number },
                    { label: d.branch, value: bankDetails.bank2_branch },
                  ].filter(item => item.value).map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{item.label}</span>
                      <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile Money */}
              {momoHasDetails && (
                <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 12, padding: 24 }}>
                  <p style={{ color: '#F5A623', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                    📱 {d.mobileMoney} ({bankDetails.momo_network})
                  </p>
                  {[
                    { label: d.name, value: bankDetails.momo_name },
                    { label: d.number, value: bankDetails.momo_number },
                    { label: d.network, value: bankDetails.momo_network },
                  ].filter(item => item.value).map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{item.label}</span>
                      <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {!bank1HasDetails && !bank2HasDetails && !momoHasDetails && (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontSize: 14 }}>
                  {d.bankComingSoon}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

       {!inModal && (
        <div style={{ background: '#1A0A2E', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
            {d.ctaBefore}{' '}
            <a href={`/${lang}/contact`} style={{ color: '#F5A623', fontWeight: 700 }}>{d.ctaLink}</a>{' '}
            {d.ctaAfter}
          </p>
        </div>
      )}
    </div>
  )
}