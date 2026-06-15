'use client'

type Props = {
  title: string
  slug: string
}

export default function ShareButtons({ title, slug }: Props) {
  const url = `https://trvmissions.com/devotions/${slug}`

  function shareToFacebook() {
    const fbAppUrl = `fb://share?u=${encodeURIComponent(url)}`
    const fbWebUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    
    // Try app first, fall back to web
    window.location.href = fbAppUrl
    setTimeout(() => {
      window.location.href = fbWebUrl
    }, 1500)
  }

  return (
    <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid #ede8de', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 14, color: '#888', fontWeight: 600 }}>Share:</span>
      <a href={`https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`}
        target="_blank" rel="noreferrer"
        style={{ background: '#25D366', color: 'white', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
        WhatsApp
      </a>
      <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank" rel="noreferrer"
        style={{ background: '#229ED9', color: 'white', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
        Telegram
      </a>
      <button onClick={shareToFacebook} style={{
        background: '#1877F2', color: 'white', padding: '8px 18px',
        borderRadius: 4, fontSize: 13, fontWeight: 700,
        border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif'
      }}>
        Facebook
      </button>
    </div>
  )
}