import { NextResponse } from 'next/server';

// Aggregazione globale best-effort — per ora solo log, domani Supabase photo_stats
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // body: { seed, type: 'click' } o { seeds, type: 'view' }
    // TODO: INSERT INTO photo_stats (seed, views, clicks) ON CONFLICT...
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
