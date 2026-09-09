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
    const { data: partner } = await sb.from('partners').select('rating,rating_count').eq('id', pid).single();
    const cur = partner as { rating: number; rating_count: number | null } | null;
    const current = Number(cur?.rating || 5);
    const count = Number(cur?.rating_count || 1);
    const updated = Math.round(((current * count + rating) / (count + 1)) * 10) / 10;
    await sb.from('partners').update({ rating: updated, rating_count: count + 1 }).eq('id', pid);
    return NextResponse.json({ success: true, rating: updated });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
