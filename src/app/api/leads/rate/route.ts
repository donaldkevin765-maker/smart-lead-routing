import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { leadId, rating } = (await req.json()) as { leadId?: string; rating?: number };
    if (!leadId || typeof rating !== 'number' || rating < 1 || rating > 5)
      return NextResponse.json({ success: false, error: 'leadId e rating 1-5 richiesti' }, { status: 400 });
    const sb = getSupabaseServer();
    const { data: lead } = await sb.from('leads').select('assigned_partner_id').eq('id', leadId).single();
    const pid = (lead as { assigned_partner_id: string | null } | null)?.assigned_partner_id;
    if (!pid) return NextResponse.json({ success: false, error: 'Nessun partner assegnato' }, { status: 404 });
    const { data: partner } = await sb.from('partners').select('rating').eq('id', pid).single();
    const current = Number((partner as { rating: number } | null)?.rating || 5);
    const updated = Math.round(((current + rating) / 2) * 10) / 10;
    await sb.from('partners').update({ rating: updated }).eq('id', pid);
    return NextResponse.json({ success: true, rating: updated });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
