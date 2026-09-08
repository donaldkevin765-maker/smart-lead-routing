import type { MatchedPartner } from './types';
import { getSupabaseServer } from './supabase';

// LOGICA SCORING (perché questi pesi):
// - Distanza 40%: il cliente vuole il professionista più vicino (meno attesa).
// - Rating 40%: la qualità storica pesa quanto la distanza (un vicino scarso < un bravo a 5km).
// - Carico 20%: evita di intasare chi è già pieno (max_daily_leads), distribuisce il lavoro.
// - Bonus verificato +5: professionale, senza rompere il live — verificato = più fiducia.
// Formula speculare nella funzione SQL match_smart_partners — modificarle insieme.
export async function matchPartners(
  lat: number,
  lon: number,
  service: string,
  urgency: string,
  excluded: string[] = [],
): Promise<MatchedPartner[]> {
  const sb = getSupabaseServer();
  const { data, error } = await sb.rpc('match_smart_partners', {
    user_lat: lat,
    user_lon: lon,
    required_service: service,
    urgency,
    excluded_partner_ids: excluded,
  });
  if (error) throw new Error(error.message);
  return (data || []) as MatchedPartner[];
}

export const LEAD_TIMEOUT_MINUTES = 15;

export function buildTimeoutDate(from = new Date()): Date {
  return new Date(from.getTime() + LEAD_TIMEOUT_MINUTES * 60 * 1000);
}
