import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { title, summary, slug, imageUrl } = await req.json()

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug required' }, { status: 400 })
    }

    const pageId = process.env.FACEBOOK_PAGE_ID
    const pageToken = process.env.FACEBOOK_PAGE_TOKEN

    if (!pageId || !pageToken) {
      return NextResponse.json({ error: 'Facebook credentials not configured' }, { status: 500 })
    }

    const devotionUrl = `https://trvmissions.com/devotions/${slug}`
    const message = `📖 ${title}\n\n${summary || ''}\n\nRead the full devotion here 👇\n${devotionUrl}\n\n#TRVM #Devotion #Gospel #Faith`

    let response

    if (imageUrl) {
      // Post with photo
      const formData = new URLSearchParams()
      formData.append('url', imageUrl)
      formData.append('caption', message)
      formData.append('access_token', pageToken)

      response = await fetch(`https://graph.facebook.com/v25.0/${pageId}/photos`, {
        method: 'POST',
        body: formData,
      })
    } else {
      // Post text + link only
      const formData = new URLSearchParams()
      formData.append('message', message)
      formData.append('link', devotionUrl)
      formData.append('access_token', pageToken)

      response = await fetch(`https://graph.facebook.com/v25.0/${pageId}/feed`, {
        method: 'POST',
        body: formData,
      })
    }

    const data = await response.json()

    if (!response.ok || data.error) {
      console.error('Facebook API error:', data)
      return NextResponse.json({ error: data.error?.message || 'Facebook post failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, postId: data.id || data.post_id })

  } catch (error) {
    console.error('Facebook post error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
