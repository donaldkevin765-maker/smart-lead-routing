// LOGICA PROFESSIONALE: ogni richiesta passa da qui prima di toccare DB o Gemini.
// WHY Zod: validazione dichiarativa = leggibile, testabile, anti-injection. Un typo non buca il sistema.
// WHY rate limit in-memory: Vercel è serverless, ma un Map per istanza basta per 0€ e blocca flood basico.
//         Per scala si passa a Upstash Redis senza cambiare interfaccia (stessa funzione isRateLimited).
// WHY honeypot + timing: blocca bot senza CAPTCHA (friction 0 per umano, 100% per script).
import { z } from 'zod';

export const leadSchema = z.object({
  prompt: z.string().min(10, 'Descrivi meglio il problema').max(500, 'Troppo lungo').trim(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  name: z.string().min(2).max(80).trim(),
  phone: z.string().min(7).max(20).trim().regex(/^\+?[0-9\s\-()]+$/, 'Telefono non valido'),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  privacy: z.literal(true),
  // Honeypot: deve restare vuoto, se pieno è un bot
  website: z.string().max(0, 'Bot rilevato').optional().or(z.literal('')),
  // Timing: submit troppo veloce = bot
  _ts: z.number().optional(),
});

export function isHoneypot(data: { website?: string; _ts?: number }): string | null {
  if (data.website && data.website.length > 0) return 'Honeypot';
  if (data._ts && Date.now() - data._ts < 2000) return 'Troppo veloce';
  return null;
}

// Rate limit semplice in-memory — key = ip o phone, window 1h
const buckets = new Map<string, number[]>();
export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return true;
  arr.push(now);
  buckets.set(key, arr);
  // Pulizia periodica per non crescere all'infinito
  if (buckets.size > 5000) bulletsCleanup();
  return false;
}
function bulletsCleanup() {
  const now = Date.now();
  for (const [k, v] of buckets) {
    const f = v.filter((t) => now - t < 3600000);
    if (f.length === 0) buckets.delete(k);
    else buckets.set(k, f);
  }
}
