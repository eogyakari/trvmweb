import { supabase } from '@/lib/supabase'
import DonateClient from './DonateClient'

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

export default async function DonatePage() {
  const bankDetails = await getBankDetails()
  return <DonateClient bankDetails={bankDetails} />
}
