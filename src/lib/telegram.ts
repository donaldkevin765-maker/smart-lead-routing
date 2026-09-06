const TELEGRAM_API = 'https://api.telegram.org';

function botToken(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN || '';
  if (!t) throw new Error('TELEGRAM_BOT_TOKEN mancante');
  return t;
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${botToken()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendLeadNotification(
  chatId: string,
  opts: { leadId: string; service: string; urgency: string; summary: string; distanceKm: number; acceptUrl: string },
): Promise<boolean> {
  const text =
    `<b>Nuovo lead ${opts.urgency === 'high' ? 'URGENTE' : ''}</b>\n` +
    `Servizio: ${opts.service}\n` +
    `Dettaglio: ${opts.summary}\n` +
    `Distanza: ${opts.distanceKm.toFixed(1)} km\n` +
    `Hai 15 minuti per accettare.`;
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${botToken()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: 'Accetta lead', callback_data: `accept:${opts.leadId}` }]],
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function telegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}
