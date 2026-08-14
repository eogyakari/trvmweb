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
    const body = await req.json()
    const { full_name, email, phone, location, home_church, how_heard, interests, message } = body

    // Basic validation
    if (!full_name || !email || !phone || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!String(email).includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    // Store
    const { error } = await admin().from("memberships").insert({
      full_name, email, phone, location,
      home_church: home_church || null,
      how_heard: how_heard || null,
      interests: interests || null,
      message: message || null,
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Emails (best-effort — don't fail the enrollment if email hiccups)
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const FROM = process.env.RESEND_FROM || "TRVM <noreply@trvmissions.com>"
      const MINISTRY = process.env.MINISTRY_EMAIL || "info@trvmissions.com"

      // Confirmation to the member
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: "Welcome to The Righteous Vine Missions",
        text: `Dear ${full_name},\n\nThank you for joining The Righteous Vine Missions. We have received your membership enrollment and will be in touch soon.\n\nBlessings,\nThe Righteous Vine Missions`,
      })

      // Notification to the ministry
      await resend.emails.send({
        from: FROM,
        to: MINISTRY,
        subject: `New Membership: ${full_name}`,
        text: [
          `New membership enrollment:`,
          ``,
          `Name: ${full_name}`,
          `Email: ${email}`,
          `Phone: ${phone}`,
          `Location: ${location}`,
          home_church ? `Home church: ${home_church}` : ``,
          how_heard ? `How heard: ${how_heard}` : ``,
          interests ? `Interests: ${interests}` : ``,
          message ? `Message: ${message}` : ``,
        ].filter(Boolean).join("\n"),
      })
    } catch (e) {
      // Log but don't fail — the enrollment is already stored.
      console.error("Membership email failed:", e)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}