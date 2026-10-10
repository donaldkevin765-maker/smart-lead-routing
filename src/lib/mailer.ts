import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// INVIO EMAIL GRATUITO via Gmail SMTP — zero costi, zero verifica dominio.
// WHY: Resend free serve dominio verificato (+ record DNS) e l'utente non ha budget.
// Gmail dà 500 email/giorno gratis con una "password per app" (serve la verifica in 2 passi).
// Quando in futuro si passa a un provider a pagamento, basta NON settare le GMAIL_* e
// cade automaticamente su Resend (codice invariato).

let transporter: Transporter | null = null;

export function gmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER || '',
        pass: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s/g, ''),
      },
    });
  }
  return transporter;
}

export async function sendViaGmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  if (!gmailConfigured()) return false;
  try {
    await getTransporter().sendMail({
      from: `STROBE <${process.env.GMAIL_USER}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (e) {
    // Fail-soft: mai far saltare il flusso per un'email — ma il log c'è sempre
    console.error('gmail_send_failed:', (e as Error).message);
    return false;
  }
}
