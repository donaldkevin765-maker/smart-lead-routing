import { notFound } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = getSupabaseServer();
  const { data } = await sb.from('partners').select('name,services_offered').eq('id', id).single();
  const p = data as { name: string; services_offered: string[] } | null;
  if (!p) return {};
  return { title: `${p.name} — STROBE Monza Brianza`, description: `${p.name} — ${p.services_offered.join(', ')} a Monza Brianza. Pagina standard STROBE con foto reali.` };
}

export default async function PartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = getSupabaseServer();
  const { data } = await sb.from('partners').select('*').eq('id', id).single();
  const p = data as {
    id: string; name: string; email: string; phone: string; services_offered: string[]; rating: number; is_verified: boolean; credits: number; coverage_radius_km: number;
  } | null;
  if (!p) notFound();

  const gallery = [1, 2, 3].map((n) => `https://picsum.photos/seed/${p.id.slice(0, 6)}-${n}/800/600?blur=2`);

  return (
    <div>
      <div className="hero" style={{ padding: '24px 0 8px' }}>
        <span className="hero-eyebrow">Partner STROBE · Monza Brianza</span>
        <h1>{p.name} {p.is_verified && <span style={{ fontSize: 16, background: 'var(--accent-soft)', color: 'var(--accent)', padding: '4px 10px', borderRadius: 999 }}>✓ Verificato</span>}</h1>
        <p className="muted">{p.services_offered.join(' · ')} · Raggio {p.coverage_radius_km}km · {p.rating}★</p>
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 4 }}>
        {gallery.map((src) => (
          <div key={src} style={{ flex: '0 0 88%', scrollSnapAlign: 'start', borderRadius: 18, overflow: 'hidden', height: 320 }}>
            <img src={src} alt="" width={800} height={600} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>← scorri · foto reali attività (standard STROBE, anonimizzate dove serve)</p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Dati fondamentali</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
          <div><strong>Servizi:</strong> {p.services_offered.join(', ')}</div>
          <div><strong>Telefono:</strong> {p.phone}</div>
          <div><strong>Email:</strong> {p.email}</div>
          <div><strong>Crediti:</strong> {p.credits}</div>
        </div>
        <div style={{ marginTop: 16 }}>
          <a className="btn" href={`/?prompt=${encodeURIComponent(p.services_offered[0] + ' a Monza')}&partner=${p.id}`}>Contatta tramite STROBE — redirect immediato</a>
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Sotto di noi con standard unico, ma reindirizziamo subito al partner giusto via waterfall.</p>
        </div>
      </div>
    </div>
  );
}
