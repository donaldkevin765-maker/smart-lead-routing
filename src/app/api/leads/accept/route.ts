import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

// Accetta lead: POST { leadId, partnerId } -> sblocca contatti utente
export async function POST(req: Request) {
  try {
    const { leadId, partnerId } = (await req.json()) as { leadId?: string; partnerId?: string };
    if (!leadId || !partnerId) return NextResponse.json({ success: false, error: 'leadId/partnerId richiesti' }, { status: 400 });
    const sb = getSupabaseServer();
    const { data: lead } = await sb.from('leads').select('id,assigned_partner_id,status').eq('id', leadId).single();
    const row = lead as { assigned_partner_id: string | null; status: string } | null;
    if (!row) return NextResponse.json({ success: false, error: 'Lead non trovato' }, { status: 404 });
    if (row.assigned_partner_id !== partnerId)
      return NextResponse.json({ success: false, error: 'Lead non assegnato a te (scaduto o riassegnato)' }, { status: 409 });
    if (row.status !== 'assigned')
      return NextResponse.json({ success: false, error: `Lead in stato ${row.status}` }, { status: 409 });

    await sb.from('leads').update({ status: 'accepted' }).eq('id', leadId);
    await sb.from('lead_dispatch_attempts').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('lead_id', leadId).eq('partner_id', partnerId).eq('status', 'assigned');

    const { data: full } = await sb.from('leads').select('user_name,user_phone,user_email,raw_prompt,summary,extracted_service,urgency_level').eq('id', leadId).single();
    return NextResponse.json({ success: true, contact: full });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
