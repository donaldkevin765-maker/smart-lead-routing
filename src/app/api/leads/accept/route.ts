import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

// Accetta lead: POST { leadId, partnerId } -> sblocca contatti
// WHY anti-replay: verifica timeout_at > NOW() sul dispatch, non solo status. Senza, un partner può accettare un lead già scaduto e riassegnato rubandolo al successivo.
// WHY idempotenza: update con eq(status,'assigned') — doppio click non scala 2 volte. Messaggio d'errore volutamente generico (non rivela se lead esiste).
export async function POST(req: Request) {
  try {
    const { leadId, partnerId } = (await req.json()) as { leadId?: string; partnerId?: string };
    if (!leadId || !partnerId) return NextResponse.json({ success: false, error: 'Dati mancanti' }, { status: 400 });
    const sb = getSupabaseServer();

    // Verifica atomica: lead assegnato a te + ancora in finestra
    const { data: att } = await sb
      .from('lead_dispatch_attempts')
      .select('timeout_at,status')
      .eq('lead_id', leadId)
      .eq('partner_id', partnerId)
      .eq('status', 'assigned')
      .single();
    const a = att as { timeout_at: string; status: string } | null;
    if (!a) return NextResponse.json({ success: false, error: 'Lead non disponibile' }, { status: 409 });
    if (new Date(a.timeout_at).getTime() < Date.now())
      return NextResponse.json({ success: false, error: 'Finestra di accettazione scaduta' }, { status: 409 });

    const { data: lead } = await sb.from('leads').select('id,assigned_partner_id,status').eq('id', leadId).single();
    const row = lead as { assigned_partner_id: string | null; status: string } | null;
    if (!row || row.assigned_partner_id !== partnerId || row.status !== 'assigned')
      return NextResponse.json({ success: false, error: 'Lead non disponibile' }, { status: 409 });

    await sb.from('leads').update({ status: 'accepted' }).eq('id', leadId).eq('status', 'assigned');
    await sb.from('lead_dispatch_attempts').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('lead_id', leadId).eq('partner_id', partnerId).eq('status', 'assigned');

    const { data: full } = await sb.from('leads').select('user_name,user_phone,user_email,raw_prompt,summary,extracted_service,urgency_level').eq('id', leadId).single();
    return NextResponse.json({ success: true, contact: full });
  } catch {
    // WHY generico: non rivelare dettagli interni a chi attacca
    return NextResponse.json({ success: false, error: 'Operazione non disponibile' }, { status: 500 });
  }
}
