import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

// LOGICA: il catalogo è DB-driven (punto 4 multi-settore). Aggiungere un settore = INSERT in services, zero codice.
export async function GET() {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb.from('services').select('vertical,category,slug,label,keywords,is_active').eq('is_active', true).order('vertical').order('category').order('label');
    if (error) throw new Error(error.message);
    const grouped: Record<string, Record<string, { slug: string; label: string }[]>> = {};
    for (const r of (data || []) as { vertical: string; category: string; slug: string; label: string }[]) {
      if (!grouped[r.vertical]) grouped[r.vertical] = {};
      if (!grouped[r.vertical][r.category]) grouped[r.vertical][r.category] = [];
      grouped[r.vertical][r.category].push({ slug: r.slug, label: r.label });
    }
    return NextResponse.json({ success: true, services: data, grouped });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const { vertical, category, slug, label, keywords } = b as { vertical?: string; category?: string; slug?: string; label?: string; keywords?: string };
    if (!vertical || !category || !slug || !label) return NextResponse.json({ success: false, error: 'vertical/category/slug/label richiesti' }, { status: 400 });
    const sb = getSupabaseServer();
    const { error } = await sb.from('services').insert({ vertical: vertical.trim().toLowerCase(), category: category.trim().toLowerCase(), slug: slug.trim().toLowerCase(), label: label.trim(), keywords: keywords?.trim() || '' });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({ success: false, error: 'slug richiesto' }, { status: 400 });
    const sb = getSupabaseServer();
    const { error } = await sb.from('services').delete().eq('slug', slug);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
