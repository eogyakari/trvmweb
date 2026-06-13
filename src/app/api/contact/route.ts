import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: dbError } = await supabase.from('contact_messages').insert({
      name, email, phone: phone || null, subject, message
    })

    if (dbError) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    // Send email notification via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TRVM Website <noreply@trvmissions.com>',
        to: ['info@trvmissions.com'],
        reply_to: email,
        subject: `New Message: ${subject}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f5f0e8;">
            <div style="background: #0f2419; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: #c9a84c; margin: 0; font-size: 1.4rem;">New Contact Message</h1>
              <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 13px;">The Righteous Vine Missions</p>
            </div>
            <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; color: #888; font-size: 13px; width: 100px;">Name</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; font-weight: 600; color: #0f2419;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; color: #888; font-size: 13px;">Email</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; color: #0f2419;"><a href="mailto:${email}" style="color: #1a3a2a;">${email}</a></td>
                </tr>
                ${phone ? `<tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; color: #888; font-size: 13px;">Phone</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; color: #0f2419;">${phone}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; color: #888; font-size: 13px;">Subject</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; font-weight: 600; color: #c9a84c;">${subject}</td>
                </tr>
              </table>
              <div style="margin-top: 24px;">
                <p style="color: #888; font-size: 13px; margin-bottom: 10px;">Message:</p>
                <div style="background: #f5f0e8; padding: 20px; border-radius: 8px; color: #333; line-height: 1.8; font-size: 15px; white-space: pre-wrap;">${message}</div>
              </div>
              <div style="margin-top: 28px; text-align: center;">
                <a href="https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}&su=${encodeURIComponent('Re: ' + subject)}" 
                   style="background: #c9a84c; color: #0f2419; padding: 12px 28px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 14px; display: inline-block;">
                  Reply via Gmail
                </a>
                <p style="margin-top: 16px; font-size: 12px; color: #aaa;">
                  You can also view this message at <a href="https://trvmissions.com/admin/messages" style="color: #c9a84c;">admin/messages</a>
                </p>
              </div>
            </div>
          </div>
        `
      })
    })

    if (!resendRes.ok) {
      // Message was saved but email failed — still return success
      console.error('Resend error:', await resendRes.text())
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
