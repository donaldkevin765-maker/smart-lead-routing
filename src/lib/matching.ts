import type { MatchedPartner } from './types';
import { getSupabaseServer } from './supabase';

// LOGICA SCORING (perché questi pesi):
// - Distanza 40%: il cliente vuole il professionista più vicino (meno attesa).
// - Rating 40%: la qualità storica pesa quanto la distanza (un vicino scarso < un bravo a 5km).
// - Carico 20%: evita di intasare chi è già pieno (max_daily_leads), distribuisce il lavoro.
// - Bonus verificato +5: professionale, senza rompere il live — verificato = più fiducia.
// Formula speculare nella funzione SQL match_smart_partners — modificarle insieme.
const FITNESS_BENESSERE = new Set(['palestra', 'personal-trainer', 'piscina', 'parrucchiere', 'estetista', 'massaggi']);

function isAvailableNow(availability: unknown): boolean {
  if (!availability || typeof availability !== 'object') return true;
  const av = availability as Record<string, string[]>;
  if (av.note) return true;
  const now = new Date();
  const dayMap: Record<number, string> = { 0: 'dom', 1: 'lun', 2: 'mar', 3: 'mer', 4: 'gio', 5: 'ven', 6: 'sab' };
  const day = dayMap[now.getDay()];
  const slots = av[day];
  if (!slots || slots.length === 0) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  for (const s of slots) {
    const m = s.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
    if (!m) continue;
    const a = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    const b = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
    if (mins >= a && mins <= b) return true;
  }
  return false;
}

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
  let partners = (data || []) as (MatchedPartner & { availability?: unknown })[];
  // WHY slot: solo per fitness/benessere filtra per orario, idraulico sempre disponibile — 0 attrito per urgenze
  if (FITNESS_BENESSERE.has(service)) {
    // recupera availability per filtrare (1 query extra solo quando serve)
    const ids = partners.map((p) => p.partner_id);
    if (ids.length) {
      const { data: rows } = await sb.from('partners').select('id,availability').in('id', ids);
      const byId: Record<string, unknown> = {};
      for (const r of (rows || []) as { id: string; availability: unknown }[]) byId[r.id] = r.availability;
      partners = partners.filter((p) => isAvailableNow(byId[p.partner_id]));
    }
  }
  return partners;
}

export const LEAD_TIMEOUT_MINUTES = 15;

export function buildTimeoutDate(from = new Date()): Date {
  return new Date(from.getTime() + LEAD_TIMEOUT_MINUTES * 60 * 1000);
}
