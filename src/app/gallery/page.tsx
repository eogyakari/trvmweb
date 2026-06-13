import { supabase } from '@/lib/supabase'
import GalleryClient from './GalleryClient'

export const revalidate = 60

type Photo = {
  id: string
  image_url: string
  caption: string | null
  category: string
  created_at: string
}

async function getPhotos(): Promise<Photo[]> {
  const { data } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function GalleryPage() {
  const photos = await getPhotos()

  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)',
        padding: '72px 24px', textAlign: 'center'
      }}>
        <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          ✝ Moments in Ministry
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
          Gallery
        </h1>
        <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto', fontStyle: 'italic', lineHeight: 1.8 }}>
          Glimpses of God&apos;s work through The Righteous Vine Missions
        </p>
      </div>

      <GalleryClient photos={photos} />
    </>
  )
}
