// lib/getContent.ts
// Read helpers for the app / site. Return content in the reader's language,
// falling back to English when a translation is absent.
// Uses the anon client — RLS guarantees only published rows come back.
//
// NOTE: the Supabase client here is untyped, so we declare the expected row
// shapes below and cast query results to them. (If you later run
// `supabase gen types typescript`, you can pass createClient<Database> and
// drop the casts.)

import { createClient } from "@supabase/supabase-js";
import type { Locale } from "./translate";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/** Pick the row matching `locale`, else the English row. */
function pick<T extends { locale: string }>(rows: T[], locale: Locale): T | undefined {
  return rows.find((r) => r.locale === locale) ?? rows.find((r) => r.locale === "en");
}

// ---------- row shapes -----------------------------------------------------

interface DevotionTr { locale: string; title: string; body: string; excerpt: string | null; }
interface DevotionRow {
  id: string;
  published_date: string;
  cover_image: string | null;
  scripture_reference: string | null;
  devotion_translations: DevotionTr[];
}

interface DevotionListTr { locale: string; title: string; excerpt: string | null; }
interface DevotionListRow {
  id: string;
  published_date: string;
  cover_image: string | null;
  devotion_translations: DevotionListTr[];
}

interface QuoteTr { locale: string; text: string; }
interface QuoteRow {
  id: string;
  author: string | null;
  published_date: string;
  quote_translations: QuoteTr[];
}

interface EventTr { locale: string; title: string; description: string | null; }
interface EventRow {
  id: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  cover_image: string | null;
  event_translations: EventTr[];
}

interface GalleryTr { locale: string; caption: string | null; }
interface GalleryRow {
  id: string;
  image_url: string;
  taken_at: string | null;
  location: string | null;
  sort_order: number;
  gallery_translations: GalleryTr[];
}

// ---------- devotions ------------------------------------------------------

/** Most recent published devotion on/before `today` ('YYYY-MM-DD'). */
export async function getDailyDevotion(locale: Locale, today: string) {
  const { data, error } = await db
    .from("devotions")
    .select(
      "id, published_date, cover_image, scripture_reference, " +
      "devotion_translations(locale, title, body, excerpt)",
    )
    .eq("is_published", true)
    .lte("published_date", today)
    .order("published_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  const row = data as unknown as DevotionRow | null;
  if (!row) return null;

  const tr = pick(row.devotion_translations ?? [], locale);
  return {
    id: row.id,
    date: row.published_date,
    scriptureReference: row.scripture_reference, // render verse from offline Bible DB in `locale`
    coverImage: row.cover_image,
    title: tr?.title ?? "",
    body: tr?.body ?? "",
    excerpt: tr?.excerpt ?? "",
  };
}

/** All published devotions (for the app's devotion list), newest first. */
export async function listDevotions(locale: Locale, limit = 30) {
  const { data, error } = await db
    .from("devotions")
    .select(
      "id, published_date, cover_image, " +
      "devotion_translations(locale, title, excerpt)",
    )
    .eq("is_published", true)
    .order("published_date", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const rows = (data ?? []) as unknown as DevotionListRow[];
  return rows.map((d) => {
    const tr = pick(d.devotion_translations ?? [], locale);
    return {
      id: d.id,
      date: d.published_date,
      coverImage: d.cover_image,
      title: tr?.title ?? "",
      excerpt: tr?.excerpt ?? "",
    };
  });
}

// ---------- quotes ---------------------------------------------------------

/** Most recent published quote on/before `today`. */
export async function getDailyQuote(locale: Locale, today: string) {
  const { data, error } = await db
    .from("quotes")
    .select("id, author, published_date, quote_translations(locale, text)")
    .eq("is_published", true)
    .lte("published_date", today)
    .order("published_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  const row = data as unknown as QuoteRow | null;
  if (!row) return null;

  const tr = pick(row.quote_translations ?? [], locale);
  return { id: row.id, author: row.author, text: tr?.text ?? "" };
}

// ---------- events ---------------------------------------------------------

/** Published events, newest start date first. */
export async function getEvents(locale: Locale) {
  const { data, error } = await db
    .from("events")
    .select(
      "id, start_date, end_date, location, cover_image, " +
      "event_translations(locale, title, description)",
    )
    .eq("is_published", true)
    .order("start_date", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as unknown as EventRow[];
  return rows.map((e) => {
    const tr = pick(e.event_translations ?? [], locale);
    return {
      id: e.id,
      startDate: e.start_date,
      endDate: e.end_date,
      location: e.location,
      coverImage: e.cover_image,
      title: tr?.title ?? "",
      description: tr?.description ?? "",
    };
  });
}

// ---------- gallery --------------------------------------------------------

/** Published mission gallery, by sort order then most recent. */
export async function getGallery(locale: Locale) {
  const { data, error } = await db
    .from("gallery_items")
    .select(
      "id, image_url, taken_at, location, sort_order, " +
      "gallery_translations(locale, caption)",
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("taken_at", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as unknown as GalleryRow[];
  return rows.map((g) => {
    const tr = pick(g.gallery_translations ?? [], locale);
    return {
      id: g.id,
      imageUrl: g.image_url,
      takenAt: g.taken_at,
      location: g.location,
      caption: tr?.caption ?? "",
    };
  });
}