import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { isRateLimited } from '@/lib/rateLimit';
import { sendEmail, welcomePartnerHtml } from '@/lib/resend';

// WHY: il GET è pubblico (usa /clienti) ma NON può esporre email/telefoni/telegram
// di 211 aziende — altrimenti chiunque scarica l'anagrafica. I contatti li vede solo
// l'admin (cookie admin_token) o il lead assegnato.
const PUBLIC_FIELDS = 'id,name,services_offered,coverage_radius_km,is_active,is_verified,credits,rating,rating_count,max_daily_leads,leads_today,availability,logo_url,brand_color,description,photos,created_at';

function isAdmin(req: Request): boolean {
  const t = process.env.ADMIN_TOKEN || '';
  if (!t) return true; // dev
  const r = req as Request & { cookies?: { get: (n: string) => { value?: string } | undefined } };
  const cookie = r.cookies?.get('admin_token')?.value;
  return req.headers.get('x-admin-token') === t || cookie === t;
}

function point(lat: number, lon: number): string {
  return `SRID=4326;POINT(${lon} ${lat})`;
}

export async function GET(req: Request) {
  try {
    const sb = getSupabaseServer();
    const fields = isAdmin(req) ? '*' : PUBLIC_FIELDS;
    const { data, error } = await sb.from('partners').select(fields).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, partners: data });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

const AVAIL_SLOT_RE = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
function isValidAvailability(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v !== 'object' || Array.isArray(v)) return false;
  const allowed = new Set(['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']);
  for (const [k, arr] of Object.entries(v as Record<string, unknown>)) {
    if (!allowed.has(k)) return false;
    if (!Array.isArray(arr)) return false;
    for (const s of arr as unknown[]) if (typeof s !== 'string' || !AVAIL_SLOT_RE.test(s)) return false;
  }
  return true;
}

export async function POST(req: Request) {
  try {
    // WHY anti-spam: registrazione partner aperta → max 5 nuovi partner/ora per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (await isRateLimited(`reg:${ip}`, 5, 60 * 60 * 1000))
      return NextResponse.json({ success: false, error: 'Troppe registrazioni, riprova più tardi' }, { status: 429 });
    const b = await req.json();
    const { name, email, phone, telegram_chat_id, services_offered, lat, lon, coverage_radius_km, max_daily_leads, availability } = b as {
      name?: string;
      email?: string;
      phone?: string;
      telegram_chat_id?: string;
      services_offered?: string[];
      lat?: number;
      lon?: number;
      coverage_radius_km?: number;
      max_daily_leads?: number;
      availability?: Record<string, unknown> | null;
    };
    if (availability !== undefined && !isValidAvailability(availability))
      return NextResponse.json({ success: false, error: 'Disponibilità formato errato: usa {"lun":["09:00-17:00"]}' }, { status: 400 });
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
        availability: availability || null,
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
    // WHY: benvenuto automatico — il partner capisce subito come funziona, senza attese.
    // Best-effort: se l'email fallisce la registrazione resta valida lo stesso.
    void sendEmail({ to: email.trim(), subject: 'Benvenuto in STROBE — come funziona', html: welcomePartnerHtml(name.trim()) });
    return NextResponse.json({ success: true, id: (data as { id: string }).id });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    // WHY critico: PATCH può cambiare credits/is_active/is_verified → solo admin.
    // Prima chiunque con un curl pompareva i crediti di un partner.
    if (!isAdmin(req))
      return NextResponse.json({ success: false, error: 'Operazione riservata' }, { status: 403 });
    const b = await req.json();
    const { id, ...fields } = b as { id?: string; [k: string]: unknown };
    if (!id) return NextResponse.json({ success: false, error: 'id richiesto' }, { status: 400 });
    if (b.availability !== undefined && !isValidAvailability(b.availability))
      return NextResponse.json({ success: false, error: 'Disponibilità formato errato' }, { status: 400 });
    const sb = getSupabaseServer();
    const update: Record<string, unknown> = {};
    for (const k of ['name', 'email', 'phone', 'telegram_chat_id', 'services_offered', 'coverage_radius_km', 'rating', 'max_daily_leads', 'leads_today', 'is_active', 'is_verified', 'credits', 'availability', 'logo_url', 'brand_color', 'description', 'photos'] as const) {
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
