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
      from: 'Smart Lead Routing <noreply@shop-brianza.com>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return !r.error;
  } catch {
    return false;
  }
}

export function leadConfirmationHtml(name: string, service: string, summary: string): string {
  return `<p>Ciao ${name},</p><p>abbiamo ricevuto la tua richiesta (<b>${service}</b>: ${summary}).</p><p>Un partner specializzato ti contattera a breve.</p>`;
}

export function partnerNotificationHtml(service: string, urgency: string, summary: string, distanceKm: number): string {
  return `<p>Nuovo lead <b>${urgency}</b> per <b>${service}</b> a ${distanceKm.toFixed(1)} km.</p><p>${summary}</p><p>Accedi alla dashboard per accettare entro 15 minuti.</p>`;
}
