import type { MetadataRoute } from 'next';
import { getEsche } from '@/lib/esche';

const BASE = 'https://smart-lead-routing.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/problemi', '/clienti', '/partner', '/privacy', '/termini'].map((r) => ({
    url: `${BASE}${r || '/'}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: r === '' ? 1 : 0.8,
  }));
  const esche = getEsche().map((e) => ({
    url: `${BASE}/problemi/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));
  let partners: { url: string; lastModified: Date; changeFrequency: 'monthly' as const; priority: number }[] = [];
  try {
    const { getSupabaseServer } = await import('@/lib/supabase');
    const { data } = await getSupabaseServer().from('partners').select('id').eq('is_active', true);
    partners = ((data || []) as { id: string }[]).map((p) => ({
      url: `${BASE}/p/${p.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {}
  return [...staticRoutes, ...esche, ...partners];
}
