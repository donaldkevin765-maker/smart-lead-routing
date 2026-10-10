import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { sendEmail, invitePartnerHtml } from '@/lib/resend';

// CEO: manda l'invito personalizzato a un'azienda della coda quando la contatti.
// WHY manuale: il contatto umano (telefono/visita) viene PRIMA — questa email arriva
// dopo che gli hai parlato, e parla del suo settore reale.
export async function POST(req: Request) {
  try {
    const { partnerId } = (await req.json()) as { partnerId?: string };
    if (!partnerId) return NextResponse.json({ success: false, error: 'partnerId richiesto' }, { status: 400 });
    const sb = getSupabaseServer();
    const { data } = await sb.from('partners').select('name,email,services_offered,is_active').eq('id', partnerId).single();
    const p = data as { name: string; email: string; services_offered: string[]; is_active: boolean } | null;
    if (!p) return NextResponse.json({ success: false, error: 'Partner non trovato' }, { status: 404 });
    if (p.is_active) return NextResponse.json({ success: false, error: 'Già attivo — invito inutile' }, { status: 400 });

    const ok = await sendEmail({
      to: p.email,
      subject: `${p.name}, le richieste giuste possono arrivare da sole`,
      html: invitePartnerHtml(p.name, p.services_offered),
    });
    if (!ok) return NextResponse.json({ success: false, error: 'Invio fallito — email non configurata' }, { status: 502 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
