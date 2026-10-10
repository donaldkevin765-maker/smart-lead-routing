import { Resend } from 'resend';

let client: Resend | null = null;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY || '';
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  const c = getClient();
  if (!c) return false;
  try {
    const r = await c.emails.send({
      from: 'STROBE <noreply@shop-brianza.com>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return !r.error;
  } catch {
    return false;
  }
}

const wrap = (title: string, body: string, cta?: { href: string; label: string }) => `
<div style="font-family:-apple-system,'SF Pro',Helvetica,sans-serif;max-width:520px;margin:auto;padding:28px 24px;color:#1d1d1f">
  <p style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#0071e3;font-weight:650;margin:0">STROBE · Monza Brianza</p>
  <h2 style="font-size:23px;letter-spacing:-.02em;margin:10px 0 14px;font-weight:700">${title}</h2>
  ${body}
  ${cta ? `<a href="${cta.href}" style="display:inline-block;background:#0071e3;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;margin-top:8px">${cta.label}</a>` : ''}
  <p style="color:#86868b;font-size:12px;margin-top:26px">STROBE — le richieste giuste arrivano da sole.<br/>Monza Brianza · infostrobe5@gmail.com</p>
</div>`;

export function leadConfirmationHtml(name: string, service: string, summary: string): string {
  return wrap('Richiesta ricevuta', `
    <p style="font-size:16px;line-height:1.5">Ciao ${name},</p>
    <p style="font-size:16px;line-height:1.5">abbiamo preso in carico la tua richiesta di <b>${service}</b>:</p>
    <p style="background:#f5f5f7;padding:14px 16px;border-radius:12px;font-size:15px;color:#515154">${summary}</p>
    <p style="font-size:16px;line-height:1.5">Un professionista verificato vicino a te ti contatta a breve. Se è urgente, ti conviene anche tu di darci un'occhiata — rispondi appena ti arriva.</p>`);
}

export function partnerNotificationHtml(service: string, urgency: string, summary: string, distanceKm: number): string {
  const u = urgency === 'high' ? '🔴 URGENTE' : urgency === 'medium' ? '🟡 Medio' : '🟢 Bassa';
  return wrap('Nuova richiesta vicino a te', `
    <p style="font-size:16px;line-height:1.5"><b>${u}</b> · ${service} · a ${distanceKm.toFixed(1)} km</p>
    <p style="background:#f5f5f7;padding:14px 16px;border-radius:12px;font-size:15px;color:#515154">${summary || '(descrizione in arrivo)'}</p>
    <p style="font-size:16px;line-height:1.5">Accetta entro <b>15 minuti</b>, poi la richiesta passa al professionista successivo.</p>`,
    { href: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/partner`, label: 'Apri e rispondi →' });
}

// — Email automatiche ai partner —

export function welcomePartnerHtml(name: string): string {
  return wrap(`Ciao ${name}, benvenuto in STROBE`, `
    <p style="font-size:16px;line-height:1.5">la tua scheda è attiva: da ora ricevi richieste reali di clienti vicino a te, senza che tu debba cercarli.</p>
    <p style="font-size:16px;line-height:1.5"><b>Come funziona:</b> quando un cliente descrive il problema, lo smistiamo al professionista più adatto e più vicino. Se accetti entro 15 minuti, è tuo. Se scade, passa al successivo — niente perdite di tempo.</p>
    <p style="font-size:16px;line-height:1.5">Ogni lunedì ricevi il riepilogo: quante richieste, quante accettate, crediti rimasti.</p>`,
    { href: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/partner`, label: 'Vedi la tua scheda →' });
}

// Invito personalizzato a un'azienda della coda — usata quando la contatti tu
export function invitePartnerHtml(name: string, services: string[]): string {
  return wrap(`${name}, le richieste giuste possono arrivare da sole`, `
    <p style="font-size:16px;line-height:1.5">ti abbiamo trovato tra i migliori di Monza Brianza per <b>${services.slice(0, 3).join(', ')}</b> e vorremmo proporti qualcosa di semplice:</p>
    <p style="font-size:16px;line-height:1.5">chi ha un problema te lo descrive in una frase e <b>lo mandiamo direttamente a te</b> — solo se sei vicino e adatto. Niente classifiche a pagamento, niente telefonate a caso: una richiesta alla volta, quelle giuste.</p>
    <p style="font-size:16px;line-height:1.5"><b>La registrazione prende 2 minuti</b> e l'iscrizione è gratuita. I primi lead li regaliamo.</p>`,
    { href: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/partner`, label: 'Attiva la tua scheda (gratis) →' });
}
