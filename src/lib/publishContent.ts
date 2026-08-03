// lib/publishContent.ts
// Publish a devotion and auto-fill Indonesian + Swahili translations.
//
// English is the source of truth in the base `devotions` row (title/content/
// excerpt). On publish this:
//   1. mirrors the base row's English into the 'en' translation row,
//   2. machine-translates into 'id' and 'sw' — but never overwrites a locale
//      you've hand-edited ('edited') or authored ('original'),
//   3. sets devotions.is_published = true.
// Idempotent: safe to re-run.
//
// Runs server-side with the service_role key (bypasses RLS).

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { translateBatch, TARGET_LOCALES, type Locale } from "./translate";

// Create the admin client lazily (at request time), NOT at module load.
// Building at import time would throw during `next build` if the server env
// vars aren't present, breaking the whole build.
let _admin: SupabaseClient | null = null;
function getAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase server env vars (need SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY)",
    );
  }
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

interface ContentSpec {
  parentTable: string;
  trTable: string;
  fkColumn: string;
  /** translation field  ->  base-table column holding the English source */
  fieldMap: Record<string, string>;
  /** how to flag the parent as published */
  publishUpdate: Record<string, unknown>;
}

const SPECS: Record<string, ContentSpec> = {
  devotion: {
    parentTable: "devotions",
    trTable: "devotion_translations",
    fkColumn: "devotion_id",
    fieldMap: { title: "title", body: "content", excerpt: "excerpt" },
    publishUpdate: { is_published: true },
  },
  quote: {
    parentTable: "quotes",
    trTable: "quote_translations",
    fkColumn: "quote_id",
    fieldMap: { text: "text" },              // author is a name — not translated
    publishUpdate: { is_published: true },
  },
  event: {
    parentTable: "events",
    trTable: "event_translations",
    fkColumn: "event_id",
    fieldMap: { title: "title", description: "description" },
    publishUpdate: { is_published: true },
  },
  gallery: {
    parentTable: "gallery_items",
    trTable: "gallery_translations",
    fkColumn: "gallery_id",
    fieldMap: { caption: "caption" },
    publishUpdate: { is_published: true },
  },
};

export async function publishContent(
  kind: string,
  id: string,
): Promise<{ translated: Locale[]; skipped: Locale[] }> {
  const spec = SPECS[kind];
  if (!spec) throw new Error(`Unknown content kind: ${kind}`);

  const admin = getAdmin();

  const trFields = Object.keys(spec.fieldMap);       // e.g. ['title','body','excerpt']
  const baseCols = Object.values(spec.fieldMap);     // e.g. ['title','content','excerpt']

  // 1. Read the English source from the base row.
  const { data: base, error: baseErr } = await admin
    .from(spec.parentTable)
    .select(["id", ...baseCols].join(","))
    .eq("id", id)
    .single();
  if (baseErr || !base) throw new Error(`${kind} ${id} not found`);

  // English source object keyed by translation field name.
  const enText: Record<string, string> = {};
  for (const f of trFields) enText[f] = ((base as any)[spec.fieldMap[f]] ?? "") as string;

  // 2. Mirror English into the 'en' translation row (source of truth = base row).
  await admin.from(spec.trTable).upsert(
    { [spec.fkColumn]: id, locale: "en", translation_status: "original", ...enText },
    { onConflict: `${spec.fkColumn},locale` },
  );

  // 3. Which target locales are protected (hand-edited/authored)? Leave them be.
  const { data: existing } = await admin
    .from(spec.trTable)
    .select("locale, translation_status")
    .eq(spec.fkColumn, id);
  const protectedLocales = new Set(
    (existing ?? [])
      .filter((r: any) => r.translation_status === "edited" || r.translation_status === "original")
      .map((r: any) => r.locale as Locale),
  );

  const translated: Locale[] = [];
  const skipped: Locale[] = [];

  // 4. Machine-translate into each unprotected target.
  for (const target of TARGET_LOCALES) {
    if (protectedLocales.has(target)) { skipped.push(target); continue; }

    // Translate only non-empty fields; keep empties as empty (avoids odd API output).
    const nonEmpty = trFields.filter((f) => enText[f]?.trim());
    const results = await translateBatch(nonEmpty.map((f) => enText[f]), target);
    const byField: Record<string, string> = {};
    nonEmpty.forEach((f, i) => { byField[f] = results[i]; });

    const row: Record<string, unknown> = {
      [spec.fkColumn]: id,
      locale: target,
      translation_status: "machine",
    };
    for (const f of trFields) row[f] = byField[f] ?? (enText[f] ? enText[f] : null);

    const { error: upErr } = await admin
      .from(spec.trTable)
      .upsert(row, { onConflict: `${spec.fkColumn},locale` });
    if (upErr) throw new Error(`Upsert failed for ${target}: ${upErr.message}`);
    translated.push(target);
  }

  // 5. Publish the parent.
  const { error: pubErr } = await admin
    .from(spec.parentTable)
    .update(spec.publishUpdate)
    .eq("id", id);
  if (pubErr) throw new Error(`Publish failed: ${pubErr.message}`);

  return { translated, skipped };
}