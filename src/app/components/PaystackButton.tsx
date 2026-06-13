'use client'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    PaystackPop: any
  }
}

type Props = {
  email?: string
  amount: number // in pesewas (GHS * 100)
  currency: string
  itemName: string
  pdfUrl: string
  onSuccess: () => void
}

export default function PaystackButton({ amount, currency, itemName, pdfUrl, onSuccess }: Props) {
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)
    scriptLoaded.current = true
  }, [])

  function handlePay() {
    // Ask for email first
    const email = prompt('Please enter your email address to receive your download link:')
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.')
      return
    }

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // convert to pesewas
      currency,
      ref: `TRVM_${Date.now()}`,
      metadata: {
        custom_fields: [{ display_name: 'Item', variable_name: 'item', value: itemName }]
      },
      callback: function() {
        // Payment successful — open PDF
        window.open(pdfUrl, '_blank')
        onSuccess()
      },
      onClose: function() {
        // User closed payment modal
      }
    })
    handler.openIframe()
  }

  return (
    <button onClick={handlePay} style={{
      background: 'linear-gradient(135deg, #F5A623, #E8860A)',
      color: '#0D0D1A', padding: '10px 24px',
      border: 'none', borderRadius: 6,
      fontWeight: 700, fontSize: 13,
      cursor: 'pointer', fontFamily: 'Georgia, serif',
      textTransform: 'uppercase', letterSpacing: '0.05em',
      width: '100%', marginTop: 12
    }}>
      Buy — {currency} {amount.toFixed(2)}
    </button>
  )
}
