import { NextResponse } from 'next/server';
import { matchPartners } from '@/lib/matching';

export async function POST(req: Request) {
  try {
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
    return NextResponse.json({ success: true, partners });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
