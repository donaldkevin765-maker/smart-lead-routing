import { NextResponse } from 'next/server';
import { qualifyLead } from '@/lib/gemini';
import { matchPartners, buildTimeoutDate } from '@/lib/matching';
import { getSupabaseServer } from '@/lib/supabase';
import { sendLeadNotification, telegramConfigured } from '@/lib/telegram';
import { sendEmail, resendConfigured, leadConfirmationHtml, partnerNotificationHtml } from '@/lib/resend';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, lat, lon, name, phone, email, privacy } = body as {
      prompt?: string;
      lat?: number;
      lon?: number;
      name?: string;
      phone?: string;
      email?: string;
      privacy?: boolean;
    };
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3)
      return NextResponse.json({ success: false, error: 'Descrivi la richiesta' }, { status: 400 });
    if (typeof lat !== 'number' || typeof lon !== 'number')
      return NextResponse.json({ success: false, error: 'Posizione mancante' }, { status: 400 });
    if (!name || !phone)
      return NextResponse.json({ success: false, error: 'Nome e telefono richiesti' }, { status: 400 });
    if (!privacy)
      return NextResponse.json({ success: false, error: 'Devi accettare la privacy' }, { status: 400 });

    const q = await qualifyLead(prompt.trim());
    const sb = getSupabaseServer();

    const { data: lead, error: leadErr } = await sb
      .from('leads')
      .insert({
        user_name: name.trim(),
        user_phone: phone.trim(),
        user_email: email?.trim() || null,
        raw_prompt: prompt.trim(),
        extracted_service: q.service,
        urgency_level: q.urgency,
        summary: q.summary,
        user_location: `SRID=4326;POINT(${lon} ${lat})`,
        status: 'pending',
      })
      .select('id')
      .single();
    if (leadErr || !lead) throw new Error(leadErr?.message || 'Creazione lead fallita');
    const leadId = (lead as { id: string }).id;

    const partners = await matchPartners(lat, lon, q.service, q.urgency, []);
    if (partners.length === 0) {
      return NextResponse.json({
        success: true,
        leadId,
        qualification: q,
        assigned: null,
        message: 'Nessun partner disponibile ora. Ti ricontatteremo.',
      });
    }
    const best = partners[0];
    const timeoutAt = buildTimeoutDate();

    await sb.from('leads').update({ status: 'assigned', assigned_partner_id: best.partner_id }).eq('id', leadId);
    await sb.from('lead_dispatch_attempts').insert({
      lead_id: leadId,
      partner_id: best.partner_id,
      status: 'assigned',
      timeout_at: timeoutAt.toISOString(),
    });
    try {
      await sb.rpc('increment_leads_today', { pid: best.partner_id });
    } catch {
      await sb.from('partners').update({ leads_today: 99 }).eq('id', best.partner_id);
    }

    const acceptUrl = `${SITE}/partner?lead=${leadId}`;
    if (best.partner_telegram_chat_id && telegramConfigured()) {
      await sendLeadNotification(best.partner_telegram_chat_id, {
        leadId,
        service: q.service,
        urgency: q.urgency,
        summary: q.summary,
        distanceKm: best.distance_km,
        acceptUrl,
      });
    }
    if (resendConfigured()) {
      await sendEmail({
        to: best.partner_email,
        subject: `Nuovo lead ${q.urgency}: ${q.service}`,
        html: partnerNotificationHtml(q.service, q.urgency, q.summary, best.distance_km),
      });
    }
    if (email && resendConfigured()) {
      await sendEmail({ to: email, subject: 'Richiesta ricevuta', html: leadConfirmationHtml(name, q.service, q.summary) });
    }

    return NextResponse.json({
      success: true,
      leadId,
      qualification: q,
      assigned: { name: best.partner_name, distanceKm: best.distance_km },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id richiesto' }, { status: 400 });
    const sb = getSupabaseServer();
    const { data, error } = await sb.from('leads').select('id,status,extracted_service,urgency_level,summary,created_at').eq('id', id).single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, lead: data });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
