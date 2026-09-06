import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { matchPartners, buildTimeoutDate } from '@/lib/matching';
import { sendLeadNotification, telegramConfigured } from '@/lib/telegram';
import { sendEmail, resendConfigured, partnerNotificationHtml } from '@/lib/resend';

export const dynamic = 'force-dynamic';

function parseEwkbPoint(hex: string): [number, number] | null {
  try {
    const buf = Buffer.from(hex, 'hex');
    if (buf.length < 25 || buf[0] !== 0x01) return null;
    const lon = buf.readDoubleLE(9);
    const lat = buf.readDoubleLE(17);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
    return [lon, lat];
  } catch {
    return null;
  }
}

async function reassignLead(sb: ReturnType<typeof getSupabaseServer>, leadId: string): Promise<string> {
  const { data: lead, error } = await sb
    .from('leads')
    .select('id,user_location,extracted_service,urgency_level,summary')
    .eq('id', leadId)
    .single();
  if (error || !lead) throw new Error('Lead non trovato');
  const row = lead as { user_location: unknown; extracted_service: string; urgency_level: string };
  let lat: number | null = null;
  let lon: number | null = null;
  const loc = row.user_location;
  if (typeof loc === 'string') {
    const m = /POINT\(([-\d.]+) ([-\d.]+)\)/.exec(loc);
    if (m) {
      lon = parseFloat(m[1]);
      lat = parseFloat(m[2]);
    } else {
      const ewkb = parseEwkbPoint(loc);
      if (ewkb) {
        lon = ewkb[0];
        lat = ewkb[1];
      }
    }
  } else if (loc && typeof loc === 'object') {
    const g = loc as { coordinates?: [number, number] };
    if (Array.isArray(g.coordinates)) {
      lon = g.coordinates[0];
      lat = g.coordinates[1];
    }
  }
  if (lat === null || lon === null) throw new Error('Posizione lead illeggibile');

  const { data: attempts } = await sb.from('lead_dispatch_attempts').select('partner_id').eq('lead_id', leadId);
  const excluded = (attempts || []).map((a) => (a as { partner_id: string }).partner_id);

  const partners = await matchPartners(lat, lon, row.extracted_service, row.urgency_level, excluded);
  if (partners.length === 0) {
    await sb.from('leads').update({ status: 'expired', assigned_partner_id: null }).eq('id', leadId);
    return 'expired';
  }
  const next = partners[0];
  const timeoutAt = buildTimeoutDate();
  await sb.from('leads').update({ status: 'assigned', assigned_partner_id: next.partner_id }).eq('id', leadId);
  await sb.from('lead_dispatch_attempts').insert({
    lead_id: leadId,
    partner_id: next.partner_id,
    status: 'assigned',
    timeout_at: timeoutAt.toISOString(),
  });
  if (next.partner_telegram_chat_id && telegramConfigured()) {
    await sendLeadNotification(next.partner_telegram_chat_id, {
      leadId,
      service: row.extracted_service,
      urgency: row.urgency_level,
      summary: (lead as { summary?: string }).summary || '',
      distanceKm: next.distance_km,
      acceptUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/partner?lead=${leadId}`,
    });
  }
  if (resendConfigured()) {
    await sendEmail({
      to: next.partner_email,
      subject: `Lead riassegnato: ${row.extracted_service}`,
      html: partnerNotificationHtml(row.extracted_service, row.urgency_level, '', next.distance_km),
    });
  }
  return next.partner_name;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cronSecret = searchParams.get('secret') || req.headers.get('x-cron-secret');
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      const auth = req.headers.get('authorization');
      if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
      }
    }
    const sb = getSupabaseServer();
    const now = new Date().toISOString();
    const { data: expired, error } = await sb
      .from('lead_dispatch_attempts')
      .select('id,lead_id,partner_id')
      .eq('status', 'assigned')
      .lt('timeout_at', now)
      .limit(20);
    if (error) throw new Error(error.message);
    const results: { leadId: string; outcome: string }[] = [];
    for (const att of expired || []) {
      const a = att as { id: string; lead_id: string; partner_id: string };
      await sb.from('lead_dispatch_attempts').update({ status: 'expired', responded_at: new Date().toISOString() }).eq('id', a.id);
      try {
        const outcome = await reassignLead(sb, a.lead_id);
        results.push({ leadId: a.lead_id, outcome });
      } catch (e) {
        results.push({ leadId: a.lead_id, outcome: `error: ${(e as Error).message}` });
      }
    }
    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
