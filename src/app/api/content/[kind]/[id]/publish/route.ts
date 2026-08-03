// app/api/content/[kind]/[id]/publish/route.ts
// POST → publishes the content row and fills machine translations.
// Protect this route with your existing admin auth (middleware / session check).

import { NextRequest, NextResponse } from "next/server";
import { publishContent } from "@/lib/publishContent";

const ALLOWED = ["devotion", "quote", "event", "gallery"] as const;

export async function POST(
  _req: NextRequest,
  { params }: { params: { kind: string; id: string } },
) {
  const { kind, id } = params;

  if (!ALLOWED.includes(kind as any)) {
    return NextResponse.json({ error: "Invalid content kind" }, { status: 400 });
  }

  try {
    const result = await publishContent(kind as any, id);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}