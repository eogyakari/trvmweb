export const dynamic = 'force-static'

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '70vh', background: '#0D0D1A',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <img src="/icon-192.png" alt="TRVM" width={72} height={72}
          style={{ borderRadius: 16, margin: '0 auto 24px', display: 'block' }} />
        <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, fontFamily: 'Georgia, serif' }}>
          You&rsquo;re offline
        </h1>
        <div style={{ width: 44, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontFamily: 'Georgia, serif' }}>
          Devotions you&rsquo;ve already opened are still available to read.
          Reconnect to load new content and browse the full site.
        </p>
      </div>
    </div>
  )
}