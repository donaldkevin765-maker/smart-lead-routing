import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

// Admin: poteri CEO sul partner — ricarica crediti, verifica, modifica scheda, elimina.
// POST { partnerId, creditsDelta?, is_verified?, name?, phone?, services_offered?, description?, coverage_radius_km? }
export async function POST(req: Request) {
  try {
    const b = (await req.json()) as {
      partnerId?: string; creditsDelta?: number; is_verified?: boolean;
      name?: string; phone?: string | null; services_offered?: string[]; description?: string | null; coverage_radius_km?: number;
    };
    const { partnerId, creditsDelta, is_verified } = b;
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
    // Modifica scheda (nome/telefono/servizi/descrizione)
    const edit: Record<string, unknown> = {};
    if (b.name !== undefined) edit.name = String(b.name).trim().slice(0, 120);
    if (b.phone !== undefined) edit.phone = b.phone ? String(b.phone).trim().slice(0, 30) : null;
    if (Array.isArray(b.services_offered) && b.services_offered.length > 0) edit.services_offered = b.services_offered.slice(0, 6);
    if (b.description !== undefined) edit.description = b.description ? String(b.description).trim().slice(0, 300) : null;
    if (typeof b.coverage_radius_km === 'number' && b.coverage_radius_km >= 1 && b.coverage_radius_km <= 100) edit.coverage_radius_km = b.coverage_radius_km;
    if (Object.keys(edit).length > 0) await sb.from('partners').update(edit).eq('id', partnerId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Non disponibile' }, { status: 500 });
  }
}

// DELETE ?partnerId=xx — eliminazione definitiva (via pannello, con conferma in UI)
export async function DELETE(req: Request) {
  try {
    const partnerId = new URL(req.url).searchParams.get('partnerId');
    if (!partnerId) return NextResponse.json({ success: false, error: 'partnerId richiesto' }, { status: 400 });
    const sb = getSupabaseServer();
    // Prima le recensioni (FK), poi il partner
    await sb.from('reviews').delete().eq('partner_id', partnerId);
    const { error } = await sb.from('partners').delete().eq('id', partnerId);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
