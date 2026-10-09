import { getSupabaseServer } from './supabase';

/**
 * Rate limit ATOMICO su DB (tabella rate_limits + funzione rate_limit_check).
 * WHY non in-memory: su Vercel ogni richiesta può finire su un'istanza diversa —
 * la Map in-memory non vede gli altri. Il DB è l'unica verità condivisa.
 * Uso: if (await isRateLimited('chat:1.2.3.4', 12, 3600_000)) ...
 */
export async function isRateLimited(key: string, max: number, windowMs: number): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseServer().rpc('rate_limit_check', {
      p_key: key.slice(0, 80),
      p_max: max,
      p_window_ms: windowMs,
    });
    if (error) {
      // Fail-open: se il DB è giù non blocchiamo gli utenti, ma mai fail-silent
      console.error('rate_limit_check', error.message);
      return false;
    }
    return data === true;
  } catch {
    return false;
  }
}
