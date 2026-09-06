import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

// Webhook Telegram: gestisce callback "Accetta lead" (accept:<leadId>)
export async function POST(req: Request) {
  try {
    const update = await req.json();
    const cb = update?.callback_query;
    if (!cb?.data) return NextResponse.json({ ok: true });
    const data: string = cb.data;
    if (!data.startsWith('accept:')) return NextResponse.json({ ok: true });
    const leadId = data.slice('accept:'.length);
    const telegramId = String(cb.from?.id || '');
    const sb = getSupabaseServer();
    const { data: partner } = await sb.from('partners').select('id').eq('telegram_chat_id', telegramId).single();
    if (!partner) return NextResponse.json({ ok: true });
    const pid = (partner as { id: string }).id;
    const base = process.env.NEXT_PUBLIC_SITE_URL || '';
    await fetch(`${base}/api/leads/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, partnerId: pid }),
    }).catch(() => null);
    const token = process.env.TELEGRAM_BOT_TOKEN || '';
    if (token) {
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: cb.id, text: 'Richiesta registrata. Apri la dashboard per i contatti.' }),
      }).catch(() => null);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
