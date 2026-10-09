import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { isRateLimited } from '@/lib/rateLimit';

// GET /api/reviews?partnerId=xx — recensioni (copiate 'google'/'sito' + nostre 'strobe')
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');
    if (!partnerId) return NextResponse.json({ success: false, error: 'partnerId richiesto' }, { status: 400 });
    const sb = getSupabaseServer();
    const { data, error } = await sb.from('reviews').select('id,author_name,rating,comment,source,source_url,created_at').eq('partner_id', partnerId).order('created_at', { ascending: false }).limit(50);
    if (error) throw new Error(error.message);
    const rows = (data || []) as { rating: number }[];
    const avg = rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0;
    return NextResponse.json({ success: true, reviews: data, count: rows.length, avg: Math.round(avg * 10) / 10 });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

// POST — il NOSTRO cliente recensisce (source='strobe')
export async function POST(req: Request) {
  try {
    // WHY anti-spam: 5 recensioni/ora per IP — mai più, altrimenti gonfia il rating
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (await isRateLimited(`rev:${ip}`, 5, 60 * 60 * 1000))
      return NextResponse.json({ success: false, error: 'Troppe recensioni, riprova più tardi' }, { status: 429 });
    const b = await req.json();
    const { partnerId, authorName, rating, comment } = b as { partnerId?: string; authorName?: string; rating?: number; comment?: string };
    if (!partnerId || !authorName?.trim() || !comment?.trim())
      return NextResponse.json({ success: false, error: 'nome e commento richiesti' }, { status: 400 });
    if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5)
      return NextResponse.json({ success: false, error: 'Voto da 1 a 5' }, { status: 400 });
    // Anti-spam: commento min 10 char, max 600
    if (comment.trim().length < 10 || comment.length > 600)
      return NextResponse.json({ success: false, error: 'Commento tra 10 e 600 caratteri' }, { status: 400 });
    const sb = getSupabaseServer();
    const { error } = await sb.from('reviews').insert({
      partner_id: partnerId, author_name: authorName.trim().slice(0, 60),
      rating: rating as number, comment: comment.trim(), source: 'strobe',
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
