// lib/translate.ts
// Thin wrapper around Google Cloud Translation (v2 REST).
// Handles Indonesian ('id') and Swahili ('sw'); English is the source.
//
// Env:  GOOGLE_TRANSLATE_API_KEY  (server-side only — never expose to client)

export type Locale = "en" | "id" | "sw";
export const TARGET_LOCALES: Exclude<Locale, "en">[] = ["id", "sw"];

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

/**
 * Translate an ordered array of strings from English into `target`.
 * Returns translations in the SAME order as the input.
 *
 * Inline scripture / proper nouns you don't want touched: wrap them in
 *   <span translate="no">...</span>
 * and pass format:"html" (see below). By default we use plain text because
 * scripture lives in its own reference field, not the body.
 */
export async function translateBatch(
  texts: string[],
  target: Exclude<Locale, "en">,
  format: "text" | "html" = "text",
): Promise<string[]> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) throw new Error("GOOGLE_TRANSLATE_API_KEY is not set");
  if (texts.length === 0) return [];

  const res = await fetch(`${ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: texts,
      source: "en",
      target,
      format,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Translate API ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const out: { translatedText: string }[] =
    data?.data?.translations ?? [];

  if (out.length !== texts.length) {
    throw new Error("Translate API returned a mismatched number of segments");
  }
  return out.map((t) => decodeEntities(t.translatedText));
}

// Google returns HTML entities even in text mode (e.g. &#39;). Undo the common ones.
function decodeEntities(s: string): string {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}