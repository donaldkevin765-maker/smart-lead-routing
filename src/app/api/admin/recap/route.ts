import { NextResponse } from 'next/server';

// CEO: manda i recap a mano dal pannello, senza aspettare il cron del lunedì.
// WHY fetch interno: la logica sta nel cron (una sola fonte di verità) — qui gli passiamo solo il via.
export async function POST() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || '';
    const secret = process.env.CRON_SECRET || '';
    const r = await fetch(`${base}/api/cron/recap`, {
      headers: secret ? { Authorization: `Bearer ${secret}` } : {},
      cache: 'no-store',
    });
    const j = (await r.json()) as { success?: boolean; sent?: number; deactivated?: number; checked?: number; error?: string };
    if (!j.success) return NextResponse.json({ success: false, error: j.error || 'Recap non partiti' }, { status: 500 });
    return NextResponse.json({ success: true, sent: j.sent, deactivated: j.deactivated, checked: j.checked });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
