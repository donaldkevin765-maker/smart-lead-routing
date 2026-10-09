import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { sendEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

// RECAP SETTIMANALE ai partner:
// 1) ogni partner attivo riceve il riepilogo (lead ricevuti/accettati/scaduti, crediti, media recensioni)
// 2) crediti finiti → warning con scadenza 14gg per ricaricare
// 3) scadenza superata → disattivazione dal sistema (chi non paga esce)
// WHY: il cliente sa sempre come è andata senza chiedere; chi non ricarica non resta a peso morto.
async function auth(req: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET || '';
  if (!secret) return true;
  if (req.headers.get('authorization') === `Bearer ${secret}`) return true;
  return new URL(req.url).searchParams.get('secret') === secret;
}

function recapHtml(name: string, stats: { ricevuti: number; accettati: number; scaduti: number }, crediti: number, rating: number | null, deadlineDays: number | null): string {
  const r = rating ? `★ ${rating.toFixed(1)}` : '—';
  let footer: string;
  if (crediti <= 0) {
    footer = deadlineDays !== null
      ? `<p style="color:#b3261e"><b>Crediti terminati.</b> Se non ricarichi entro ${deadlineDays} giorni la tua scheda viene temporaneamente disattivata (resti nel sistema, basta ricaricare per riattivarti).</p>`
      : `<p style="color:#b3261e"><b>Crediti terminati.</b> Ricarica per continuare a ricevere richieste.</p>`;
  } else {
    footer = `<p>Crediti rimasti: <b>${crediti}</b>.</p>`;
  }
  return `
  <div style="font-family:-apple-system,SF Pro,Helvetica,sans-serif;max-width:520px;margin:auto;padding:24px">
    <p style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#0071e3;font-weight:650;margin:0">STROBE · Riepilogo settimanale</p>
    <h2 style="font-size:24px;letter-spacing:-.02em;margin:8px 0 16px">Ciao ${name}, come è andata</h2>
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      <tr><td style="padding:10px 0;border-bottom:1px solid #eee">Richieste ricevute</td><td style="text-align:right;font-weight:650;border-bottom:1px solid #eee">${stats.ricevuti}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #eee">Accettate</td><td style="text-align:right;font-weight:650;border-bottom:1px solid #eee">${stats.accettati}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #eee">Scadute senza risposta</td><td style="text-align:right;font-weight:650;border-bottom:1px solid #eee">${stats.scaduti}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #eee">Media recensioni</td><td style="text-align:right;font-weight:650;border-bottom:1px solid #eee">${r}</td></tr>
    </table>
    ${footer}
    <p style="color:#86868b;font-size:13px;margin-top:24px">STROBE — le richieste giuste arrivano da sole.</p>
  </div>`;
}

export async function GET(req: Request) {
  if (!(await auth(req))) return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 });

  const sb = getSupabaseServer();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

  const { data: partners } = await sb
    .from('partners')
    .select('id,name,email,is_active,credits,rating,deactivate_after,last_recap_at')
    .eq('is_active', true);

  let sent = 0, deactivated = 0;

  for (const p of (partners || []) as { id: string; name: string; email: string; is_active: boolean; credits: number; rating: number | null; deactivate_after: string | null; last_recap_at: string | null }[]) {
    // Anti-doppio invio se il cron parte due volte nella stessa settimana
    if (p.last_recap_at && new Date(p.last_recap_at) > new Date(now.getTime() - 6 * 86400000)) continue;

    const { data: attempts } = await sb
      .from('lead_dispatch_attempts')
      .select('status,responded_at,created_at')
      .eq('partner_id', p.id)
      .gte('sent_at', weekAgo);

    const list = (attempts || []) as { status: string; responded_at: string | null }[];
    const stats = {
      ricevuti: list.length,
      accettati: list.filter((a) => a.responded_at || a.status === 'accepted').length,
      scaduti: list.filter((a) => a.status === 'expired' || a.status === 'timeout').length,
    };

    const crediti = Number(p.credits || 0);
    let deadlineDays: number | null = null;

    if (crediti <= 0) {
      if (!p.deactivate_after) {
        // Primo warning: 14 giorni di grazia
        const dl = new Date(now.getTime() + 14 * 86400000).toISOString();
        await sb.from('partners').update({ deactivate_after: dl }).eq('id', p.id);
        deadlineDays = 14;
      } else if (new Date(p.deactivate_after) < now) {
        // Scadenza superata → fuori dal sistema (riattivabile basta ricaricare)
        await sb.from('partners').update({ is_active: false }).eq('id', p.id);
        deactivated++;
        continue;
      } else {
        deadlineDays = Math.max(1, Math.ceil((new Date(p.deactivate_after).getTime() - now.getTime()) / 86400000));
      }
    } else if (p.deactivate_after) {
      // Ha ricaricato → azzera la scadenza
      await sb.from('partners').update({ deactivate_after: null }).eq('id', p.id);
    }

    if (p.email && (await sendEmail({
      to: p.email,
      subject: `Il tuo riepilogo STROBE — ${stats.ricevuti} richieste questa settimana`,
      html: recapHtml(p.name, stats, crediti, p.rating, deadlineDays),
    }))) sent++;

    await sb.from('partners').update({ last_recap_at: now.toISOString() }).eq('id', p.id);
  }

  return NextResponse.json({ success: true, sent, deactivated, checked: (partners || []).length });
}
