import type { MatchedPartner } from './types';
import { getSupabaseServer } from './supabase';

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
