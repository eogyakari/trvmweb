import { supabase } from '@/lib/supabase'
import DonateClient from './DonateClient'
import { isLocale, type Locale } from '@/i18n/config'

// Goes at: src/app/[lang]/donate/page.tsx
export const revalidate = 60

async function getBankDetails() {
  const { data } = await supabase.from('site_settings').select('key, value')
    .in('key', ['bank1_name', 'bank1_account_name', 'bank1_account_number', 'bank1_branch',
                 'bank2_name', 'bank2_account_name', 'bank2_account_number', 'bank2_branch',
                 'momo_name', 'momo_number', 'momo_network'])
  const s: Record<string, string> = {}
  for (const row of data || []) s[row.key] = row.value
  return s
}

export default async function DonatePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const bankDetails = await getBankDetails()
  return <DonateClient lang={lang} bankDetails={bankDetails} />
}