// app/api/content/backfill/route.ts
// ONE-TIME tool: translate all existing devotions that are missing their
// Indonesian ('id') / Swahili ('sw') rows. Safe to run repeatedly — it only
// processes devotions still missing a translation, so it never re-translates
// or wastes API quota. Delete this file once the backfill is complete.
//
// How to run: after deploying, open this URL in your browser and refresh
// until the response says "done": true —
//   https://trvmissions.com/api/content/backfill
//
// Optional protection: set BACKFILL_SECRET in Vercel, then call
//   https://trvmissions.com/api/content/backfill?token=YOUR_SECRET

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { publishContent } from "@/lib/publishContent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const BATCH = 8; // devotions per request — keeps each call well under the timeout

export async function GET(req: NextRequest) {
  // Optional secret gate.
  const secret = process.env.BACKFILL_SECRET;
  if (secret && req.nextUrl.searchParams.get("token") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    );
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  // 1. All devotion ids.
  const { data: devos, error: dErr } = await db.from("devotions").select("id");
  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 });
  const allIds: string[] = (devos ?? []).map((d: any) => d.id);

  // 2. Which already have BOTH id and sw translations?
  const { data: trs, error: tErr } = await db
    .from("devotion_translations")
    .select("devotion_id, locale")
    .in("locale", ["id", "sw"]);
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

  const have: Record<string, Set<string>> = {};
  for (const r of trs ?? []) {
    const row = r as { devotion_id: string; locale: string };
    (have[row.devotion_id] ??= new Set()).add(row.locale);
  }
  const isDone = (id: string) => have[id]?.has("id") && have[id]?.has("sw");

  // 3. Devotions still missing a translation.
  const missing = allIds.filter((id) => !isDone(id));
  const batch = missing.slice(0, BATCH);

  // 4. Translate this batch (publishContent is idempotent + skips edited rows).
  const processed: string[] = [];
  const failed: { id: string; error: string }[] = [];
  for (const id of batch) {
    try {
      await publishContent("devotion", id);
      processed.push(id);
    } catch (e: any) {
      failed.push({ id, error: e.message });
    }
  }

  const remaining = missing.length - processed.length;
  return NextResponse.json({
    totalDevotions: allIds.length,
    alreadyDone: allIds.length - missing.length,
    processedNow: processed.length,
    processedIds: processed,
    failed,
    remaining,
    done: remaining === 0,
    hint: remaining > 0 ? "Refresh this page again to continue." : "Backfill complete — you can delete this route file.",
  });
}