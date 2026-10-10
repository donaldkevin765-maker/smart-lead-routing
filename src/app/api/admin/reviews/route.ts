import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

// WHY: il pannello serve poteri completi sulle recensioni — incollare quelle vere
// (google/sito) e cancellare spam. Prima era impossibile senza toccare il DB a mano.
export async function GET() {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('reviews')
      .select('id,partner_id,rating,author_name,comment,source,source_url,created_at,partners(name)')
      .order('created_at', { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, reviews: data });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

// POST — incolla recensione VERA (source='google'|'sito', con URL fonte obbligatorio)
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const { partnerId, authorName, rating, comment, source, sourceUrl } = b as {
      partnerId?: string; authorName?: string; rating?: number; comment?: string; source?: string; sourceUrl?: string;
    };
    if (!partnerId || !authorName?.trim() || !comment?.trim())
      return NextResponse.json({ success: false, error: 'partner, nome e testo richiesti' }, { status: 400 });
    if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5)
      return NextResponse.json({ success: false, error: 'Voto da 1 a 5' }, { status: 400 });
    if (!['google', 'sito'].includes(source || ''))
      return NextResponse.json({ success: false, error: 'Fonte: google o sito' }, { status: 400 });
    // WHY: recensione "copiata" senza URL fonte = non verificabile, non la inseriamo
    if (!sourceUrl?.startsWith('http'))
      return NextResponse.json({ success: false, error: 'URL fonte obbligatorio (da dove è copiata)' }, { status: 400 });
    const sb = getSupabaseServer();
    const { error } = await sb.from('reviews').insert({
      partner_id: partnerId, author_name: authorName.trim().slice(0, 60),
      rating: rating as number, comment: comment.trim().slice(0, 600),
      source: source as string, source_url: sourceUrl.trim().slice(0, 300),
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

// DELETE ?id=xx — rimuovi recensione (spam/falsa)
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id richiesto' }, { status: 400 });
    const sb = getSupabaseServer();
    const { error } = await sb.from('reviews').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
