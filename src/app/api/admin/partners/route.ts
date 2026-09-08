import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

// Admin: ricarica credito o verifica partner — POST { partnerId, creditsDelta, is_verified }
export async function POST(req: Request) {
  try {
    const { partnerId, creditsDelta, is_verified } = (await req.json()) as { partnerId?: string; creditsDelta?: number; is_verified?: boolean };
    if (!partnerId) return NextResponse.json({ success: false, error: 'partnerId richiesto' }, { status: 400 });
    const sb = getSupabaseServer();
    if (typeof creditsDelta === 'number' && creditsDelta !== 0) {
      const { data: p } = await sb.from('partners').select('credits').eq('id', partnerId).single();
      const cur = (p as { credits: number } | null)?.credits ?? 0;
      await sb.from('partners').update({ credits: cur + creditsDelta }).eq('id', partnerId);
      await sb.from('partner_credit_ledger').insert({ partner_id: partnerId, delta: creditsDelta, reason: creditsDelta > 0 ? 'recharge' : 'adjust' });
    }
    if (typeof is_verified === 'boolean') {
      await sb.from('partners').update({ is_verified }).eq('id', partnerId);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Non disponibile' }, { status: 500 });
  }
}
