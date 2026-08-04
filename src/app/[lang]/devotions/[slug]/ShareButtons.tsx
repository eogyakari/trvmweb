'use client'

type Props = {
  title: string
  slug: string
}

export default function ShareButtons({ title, slug }: Props) {
  const url = `https://trvmissions.com/devotions/${slug}`

  async function handleShare(platform: string) {
    // Use native share sheet on mobile
    if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: title,
          text: `Read this devotion: ${title}`,
          url: url,
        })
        return
      } catch (err) {
        // User cancelled or error — fall through to platform links
      }
    }

    // Desktop fallbacks
    const links: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    }
    window.open(links[platform], '_blank')
  }

  return (
    <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid #ede8de', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 14, color: '#888', fontWeight: 600 }}>Share:</span>
      <button onClick={() => handleShare('whatsapp')} style={{
        background: '#25D366', color: 'white', padding: '8px 18px',
        borderRadius: 4, fontSize: 13, fontWeight: 700,
        border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif'
      }}>WhatsApp</button>
      <button onClick={() => handleShare('telegram')} style={{
        background: '#229ED9', color: 'white', padding: '8px 18px',
        borderRadius: 4, fontSize: 13, fontWeight: 700,
        border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif'
      }}>Telegram</button>
      <button onClick={() => handleShare('facebook')} style={{
        background: '#1877F2', color: 'white', padding: '8px 18px',
        borderRadius: 4, fontSize: 13, fontWeight: 700,
        border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif'
      }}>Facebook</button>
    </div>
  )
}