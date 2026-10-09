import { NextResponse } from 'next/server';
import { matchPartners } from '@/lib/matching';
import { isRateLimited } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(`match:${ip}`, 30, 60 * 60 * 1000))
      return NextResponse.json({ success: false, error: 'Troppe richieste' }, { status: 429 });
    const body = await req.json();
    const { lat, lon, service, urgency, excluded } = body as {
      lat?: number;
      lon?: number;
      service?: string;
      urgency?: string;
      excluded?: string[];
    };
    if (typeof lat !== 'number' || typeof lon !== 'number' || !service) {
      return NextResponse.json({ success: false, error: 'lat/lon/service richiesti' }, { status: 400 });
    }
    const partners = await matchPartners(lat, lon, service, urgency || 'medium', excluded || []);
    // WHY privacy: niente email/telefoni nel riscontro pubblico — i contatti escono solo dal lead accettato
    const safe = partners.map(({ partner_email: _e, partner_phone: _p, partner_telegram_chat_id: _t, ...rest }) => { void _e; void _p; void _t; return rest; });
    return NextResponse.json({ success: true, partners: safe });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
