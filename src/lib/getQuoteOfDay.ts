import { supabase } from '@/lib/supabase'
import type { Locale } from '@/i18n/config'

// Goes at: src/lib/getQuoteOfDay.ts  (or fold into your existing getContent.ts)
export type QuoteOfDay = { text: string; author: string } | null

// Picks the quote for "today":
//  1) a published quote whose published_date is today, else
//  2) a deterministic rotation through all published quotes by day-of-year,
//     so everyone sees the same quote on a given day and it changes daily.
// Returns the translation for `lang` (English base row as fallback).
export async function getQuoteOfDay(lang: Locale): Promise<QuoteOfDay> {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  // 1) Exact match for today's date.
  let { data: rows } = await supabase
    .from('quotes')
    .select('id, text, author, published_date')
    .eq('is_published', true)
    .eq('published_date', today)
    .limit(1)

  // 2) Fallback: rotate through all published quotes by day number.
  if (!rows || rows.length === 0) {
    const { data: all } = await supabase
      .from('quotes')
      .select('id, text, author')
      .eq('is_published', true)
      .order('created_at', { ascending: true })
    if (!all || all.length === 0) return null
    const dayNum = Math.floor(Date.now() / 86400000) // days since epoch
    const pick = all[dayNum % all.length]
    rows = [pick as any]
  }

  const q = rows[0] as { id: string; text: string; author: string }

  // Translation for non-English locales (base row is English).
  let text = q.text
  if (lang !== 'en') {
    const { data: tr } = await supabase
      .from('quote_translations')
      .select('text')
      .eq('quote_id', q.id)
      .eq('locale', lang)
      .maybeSingle()
    if (tr?.text) text = tr.text as string
  }

  return { text, author: q.author || '' }
}