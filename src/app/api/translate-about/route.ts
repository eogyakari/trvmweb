import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { translateBatch } from "@/lib/translate"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function admin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

// Which about_* settings keys hold translatable prose.
const ABOUT_PROSE_KEYS = [
  "about_missions_banner",
  "about_story_title",
  "about_story_p1", "about_story_p2", "about_story_p3",
  "about_mission_text", "about_vision_text", "about_values_text",
]

export async function POST() {
  try {
    const db = admin()

    // ---- 1) site_settings prose ----
    const { data: settingsRows } = await db.from("site_settings").select("key, value")
    const s: Record<string, string> = {}
    for (const r of settingsRows || []) s[r.key] = r.value

    // Gather English source values that exist and are non-empty.
    const keys = ABOUT_PROSE_KEYS.filter(k => (s[k] || "").trim())
    const sources = keys.map(k => s[k])

    const upserts: { key: string; value: string }[] = []
    if (sources.length) {
      const idT = await translateBatch(sources, "id", "text")
      const swT = await translateBatch(sources, "sw", "text")
      keys.forEach((k, i) => {
        if (idT[i]) upserts.push({ key: `${k}_id`, value: idT[i] })
        if (swT[i]) upserts.push({ key: `${k}_sw`, value: swT[i] })
      })
    }
    if (upserts.length) {
      // upsert on key (site_settings.key should be unique/PK)
      await db.from("site_settings").upsert(upserts, { onConflict: "key" })
    }

    // ---- 2) team bios ----
    const { data: team } = await db.from("team_members").select("id, bio")
    const withBios = (team || []).filter((m: any) => (m.bio || "").trim())
    let biosTranslated = 0
    if (withBios.length) {
      const bios = withBios.map((m: any) => m.bio)
      const idB = await translateBatch(bios, "id", "text")
      const swB = await translateBatch(bios, "sw", "text")
      for (let i = 0; i < withBios.length; i++) {
        await db.from("team_members").update({
          bio_id: idB[i] || null, bio_sw: swB[i] || null,
        }).eq("id", withBios[i].id)
        biosTranslated++
      }
    }

    return NextResponse.json({
      ok: true,
      settingsTranslated: upserts.length / 2,
      biosTranslated,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}