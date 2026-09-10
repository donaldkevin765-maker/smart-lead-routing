import { NextResponse } from 'next/server';
import { qualifyLead } from '@/lib/gemini';
import { getSupabaseServer } from '@/lib/supabase';
import { buildBotPrompt } from '@/lib/botRules';

// Chat BOT: capisce cosa vuole l'utente, riassume in breve e risponde SOLO con dati ufficiali.
// WHY fiducia: mai inventare orari/servizi — solo DB verificato + siti ufficiali. Se manca il dato, lo dice.
export async function POST(req: Request) {
  try {
    const { message, partnerId } = (await req.json()) as { message?: string; partnerId?: string };
    if (!message || message.trim().length < 3)
      return NextResponse.json({ success: false, error: 'Scrivi almeno 3 caratteri' }, { status: 400 });

    const sb = getSupabaseServer();
    let official = '';
    if (partnerId) {
      const { data } = await sb.from('partners').select('name,services_offered,rating,is_verified,coverage_radius_km,availability,email,phone').eq('id', partnerId).single();
      const p = data as { name: string; services_offered: string[]; rating: number; is_verified: boolean; coverage_radius_km: number; availability: Record<string, string[]> | null; email: string; phone: string } | null;
      if (p) {
        official = `DATI UFFICIALI (fonte: DB STROBE verificato): ${p.name} — servizi: ${p.services_offered.join(', ')} — rating ${p.rating} — verificato: ${p.is_verified ? 'sì' : 'no'} — raggio ${p.coverage_radius_km}km — orari: ${p.availability ? JSON.stringify(p.availability) : 'da verificare'} — email ${p.email} — tel ${p.phone}.`;
      }
    }

    const q = await qualifyLead(message.trim());

    // Riassunto breve sempre, anche senza AI
    const brief = `${q.service} · ${q.urgency} — ${q.summary}`;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        reply: official ? `${brief}. In base ai dati ufficiali: ${official.slice(0, 220)}` : brief,
        qualification: q,
        grounded: Boolean(official),
      });
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
    // Regole e standard obbligatori da botRules — il bot sa dove mandare, se mandare o fare
    const prompt = buildBotPrompt(message.trim(), official, q.service, q.urgency);
    const result = await model.generateContent(prompt);
    const reply = result.response.text().replace(/```/g, '').trim().slice(0, 600);

    return NextResponse.json({ success: true, reply, qualification: q, grounded: Boolean(official) });
  } catch {
    return NextResponse.json({ success: false, error: 'Non disponibile' }, { status: 500 });
  }
}
