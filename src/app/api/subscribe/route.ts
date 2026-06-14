import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.from('subscribers').insert({ email, name: name || null })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'already_subscribed' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }

    // Send welcome email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'The Righteous Vine Missions <info@trvmissions.com>',
        to: [email],
        subject: 'Welcome to TRVM Updates!',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f5f0e8;">
            <div style="background: #0f2419; padding: 32px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: #c9a84c; margin: 0; font-size: 1.6rem;">Welcome to TRVM!</h1>
              <p style="color: rgba(255,255,255,0.7); margin: 10px 0 0; font-style: italic;">The Righteous Vine Missions</p>
            </div>
            <div style="background: white; padding: 36px; border-radius: 0 0 8px 8px;">
              <p style="color: #333; line-height: 1.9; font-size: 15px;">Dear ${name || 'Friend'},</p>
              <p style="color: #333; line-height: 1.9; font-size: 15px;">
                Thank you for subscribing to The Righteous Vine Missions updates. You will now receive:
              </p>
              <ul style="color: #333; line-height: 2; font-size: 15px;">
                <li>Daily devotions</li>
                <li>Newsletter updates</li>
                <li>Ministry news and prayer requests</li>
              </ul>
              <p style="color: #333; line-height: 1.9; font-size: 15px;">
                &ldquo;I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit.&rdquo; — John 15:5
              </p>
              <p style="color: #333; line-height: 1.9; font-size: 15px;">God bless you,<br/><strong>The Righteous Vine Missions Team</strong></p>
              <hr style="border: none; border-top: 1px solid #f0ebe0; margin: 24px 0;" />
              <p style="color: #aaa; font-size: 12px; text-align: center;">
                You can unsubscribe at any time by contacting us at <a href="mailto:info@trvmissions.com" style="color: #c9a84c;">info@trvmissions.com</a>
              </p>
            </div>
          </div>
        `
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
