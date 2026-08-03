// app/api/content/[kind]/[id]/publish/route.ts
// POST → publishes the content row and fills machine translations.
// Protect this route with your existing admin auth (middleware / session check).

import { NextRequest, NextResponse } from "next/server";
import { publishContent } from "@/lib/publishContent";

// Never statically analyze/pre-render this route at build time.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED = ["devotion", "quote", "event", "gallery"];

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const { kind, id } = await params;

  if (!ALLOWED.includes(kind)) {
    return NextResponse.json({ error: "Invalid content kind" }, { status: 400 });
  }

  try {
    const result = await publishContent(kind, id);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}