import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

function point(lat: number, lon: number): string {
  return `SRID=4326;POINT(${lon} ${lat})`;
}

export async function GET() {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb.from('partners').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, partners: data });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const { name, email, phone, telegram_chat_id, services_offered, lat, lon, coverage_radius_km, max_daily_leads } = b as {
      name?: string;
      email?: string;
      phone?: string;
      telegram_chat_id?: string;
      services_offered?: string[];
      lat?: number;
      lon?: number;
      coverage_radius_km?: number;
      max_daily_leads?: number;
    };
    if (!name || !email || !phone) return NextResponse.json({ success: false, error: 'name/email/phone richiesti' }, { status: 400 });
    if (typeof lat !== 'number' || typeof lon !== 'number')
      return NextResponse.json({ success: false, error: 'lat/lon richiesti' }, { status: 400 });
    if (!services_offered || services_offered.length === 0)
      return NextResponse.json({ success: false, error: 'Almeno un servizio' }, { status: 400 });
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('partners')
      .insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        telegram_chat_id: telegram_chat_id?.trim() || null,
        services_offered,
        location: point(lat, lon),
        coverage_radius_km: coverage_radius_km || 20,
        max_daily_leads: max_daily_leads || 10,
      })
      .select('id')
      .single();
    if (error) {
      // WHY professionale: email duplicata = messaggio chiaro, non stack trace per hacker
      if (error.message.includes('idx_partners_email_unique') || error.message.includes('duplicate'))
        return NextResponse.json({ success: false, error: 'Email già registrata' }, { status: 409 });
      throw new Error('Creazione non disponibile');
    }
    if (!data) return NextResponse.json({ success: false, error: 'Creazione non disponibile' }, { status: 500 });
    return NextResponse.json({ success: true, id: (data as { id: string }).id });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const b = await req.json();
    const { id, ...fields } = b as { id?: string; [k: string]: unknown };
    if (!id) return NextResponse.json({ success: false, error: 'id richiesto' }, { status: 400 });
    const sb = getSupabaseServer();
    const update: Record<string, unknown> = {};
    for (const k of ['name', 'email', 'phone', 'telegram_chat_id', 'services_offered', 'coverage_radius_km', 'rating', 'max_daily_leads', 'leads_today', 'is_active'] as const) {
      if (b[k] !== undefined) update[k] = b[k];
    }
    if (typeof b.lat === 'number' && typeof b.lon === 'number') update.location = point(b.lat as number, b.lon as number);
    void fields;
    const { error } = await sb.from('partners').update(update).eq('id', id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
