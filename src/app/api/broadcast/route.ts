import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { subject, message, from_name } = await req.json()

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message required' }, { status: 400 })
    }

    // Use service role to read subscribers
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('email, name')
      .eq('active', true)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No active subscribers' }, { status: 400 })
    }

    // Send in batches of 50 (Resend limit per request)
    const batchSize = 50
    let sent = 0
    let failed = 0

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      const emails = batch.map(s => s.email)

      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          batch.map(s => ({
            from: `${from_name || 'The Righteous Vine Missions'} <info@trvmissions.com>`,
            to: [s.email],
            subject,
            html: `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f5f0e8;">
                <div style="background: #0f2419; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h1 style="color: #c9a84c; margin: 0; font-size: 1.4rem;">${subject}</h1>
                  <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 13px;">The Righteous Vine Missions</p>
                </div>
                <div style="background: white; padding: 36px; border-radius: 0 0 8px 8px;">
                  ${s.name ? `<p style="color: #333; font-size: 15px;">Dear ${s.name},</p>` : ''}
                  <div style="color: #333; line-height: 1.9; font-size: 15px; white-space: pre-wrap;">${message}</div>
                  <hr style="border: none; border-top: 1px solid #f0ebe0; margin: 28px 0;" />
                  <div style="text-align: center; margin-top: 16px;">
                    <a href="https://trvmissions.com" style="color: #c9a84c; font-size: 13px;">Visit our website</a>
                  </div>
                  <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 16px;">
                    To unsubscribe, contact <a href="mailto:info@trvmissions.com" style="color: #c9a84c;">info@trvmissions.com</a>
                  </p>
                </div>
              </div>
            `
          }))
        )
      })

      if (res.ok) {
        sent += batch.length
      } else {
        failed += batch.length
        console.error('Batch error:', await res.text())
      }
    }

    return NextResponse.json({ success: true, sent, failed, total: subscribers.length })
  } catch (error) {
    console.error('Broadcast error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
