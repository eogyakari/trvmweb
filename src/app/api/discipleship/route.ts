import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export const runtime = "nodejs"

function admin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const { full_name, email, phone, location, track, availability, why_interested, message } = b
    if (!full_name || !email || !phone || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!String(email).includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const { error } = await admin().from("discipleship_enrollments").insert({
      full_name, email, phone, location,
      track: track || null, availability: availability || null,
      why_interested: why_interested || null, message: message || null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const FROM = process.env.RESEND_FROM || "TRVM <noreply@trvmissions.com>"
      const MINISTRY = process.env.MINISTRY_EMAIL || "info@trvmissions.com"
      await resend.emails.send({
        from: FROM, to: email,
        subject: "Discipleship Enrollment Received — TRVM",
        text: `Dear ${full_name},\n\nThank you for enrolling in discipleship with The Righteous Vine Missions. We've received your details and will be in touch about next steps.\n\nBlessings,\nThe Righteous Vine Missions`,
      })
      await resend.emails.send({
        from: FROM, to: MINISTRY,
        subject: `New Discipleship Enrollment: ${full_name}`,
        text: [
          `New discipleship enrollment:`, ``,
          `Name: ${full_name}`, `Email: ${email}`, `Phone: ${phone}`, `Location: ${location}`,
          track ? `Track: ${track}` : ``,
          availability ? `Availability: ${availability}` : ``,
          why_interested ? `Why interested: ${why_interested}` : ``,
          message ? `Message: ${message}` : ``,
        ].filter(Boolean).join("\n"),
      })
    } catch (e) { console.error("Discipleship email failed:", e) }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}