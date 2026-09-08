import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export async function GET() {
  try {
    const sb = getSupabaseServer();
    const { data: leads, error } = await sb.from('leads').select('id,user_name,extracted_service,urgency_level,status,assigned_partner_id,created_at').order('created_at', { ascending: false }).limit(50);
    if (error) throw new Error(error.message);
    const ids = (leads || []).map((l) => (l as { id: string }).id);
    let attemptsByLead: Record<string, unknown[]> = {};
    if (ids.length) {
      const { data: atts } = await sb.from('lead_dispatch_attempts').select('*').in('lead_id', ids).order('sent_at', { ascending: true });
      for (const a of (atts || []) as { lead_id: string }[]) {
        if (!attemptsByLead[a.lead_id]) attemptsByLead[a.lead_id] = [];
        attemptsByLead[a.lead_id].push(a);
      }
    }
    return NextResponse.json({ success: true, leads, attemptsByLead });
  } catch {
    return NextResponse.json({ success: false, error: 'Non disponibile' }, { status: 500 });
  }
}
