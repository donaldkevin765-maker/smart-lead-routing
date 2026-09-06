import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;
let browserClient: SupabaseClient | null = null;

function supabaseUrl(): string {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!url) throw new Error('SUPABASE_URL mancante');
  return url;
}

export function getSupabaseServer(): SupabaseClient {
  if (serverClient) return serverClient;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  serverClient = createClient(supabaseUrl(), serviceKey || anonKey, {
    auth: { persistSession: false },
  });
  return serverClient;
}

export function getSupabaseBrowser(): SupabaseClient {
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !anonKey) throw new Error('Chiavi Supabase pubbliche mancanti');
  browserClient = createClient(url, anonKey);
  return browserClient;
}
