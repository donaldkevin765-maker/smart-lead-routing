import { NextResponse } from 'next/server';
import { qualifyLead } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body as { prompt?: string };
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'prompt non valido' }, { status: 400 });
    }
    const qualification = await qualifyLead(prompt.trim());
    return NextResponse.json({
      success: true,
      qualification,
      userData: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        lat: body.lat,
        lon: body.lon,
        prompt,
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
