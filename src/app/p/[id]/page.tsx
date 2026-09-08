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

  // Foto reali alta qualità — 3 scatti attività (CC0, primo piano grande)
  const isGym = p.services_offered.includes('palestra');
  const gallery = isGym
    ? [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1200&q=80',
      ]
    : [
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
      ];

  return (
    <div>
      <div className="hero" style={{ padding: '24px 0 8px' }}>
        <span className="hero-eyebrow">Partner STROBE · Monza Brianza</span>
        <h1>{p.name} {p.is_verified && <span style={{ fontSize: 16, background: 'var(--accent-soft)', color: 'var(--accent)', padding: '4px 10px', borderRadius: 999 }}>✓ Verificato</span>}</h1>
        <p className="muted">{p.services_offered.join(' · ')} · Raggio {p.coverage_radius_km}km · {p.rating}★</p>
      </div>

      {/* Responsive: desktop griglia 3, mobile swipe — foto reali alta qualità */}
      <style>{`@media(min-width:768px){.strobe-gallery{grid-template-columns:1fr 1fr 1fr !important; overflow:visible !important;}}`}</style>
      <div className="strobe-gallery" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', gridColumn: '1/-1' }}>
          {gallery.map((src) => (
            <div key={src} style={{ flex: '0 0 88%', scrollSnapAlign: 'start', borderRadius: 18, overflow: 'hidden', height: 380 }}>
              <img
                src={src}
                srcSet={`${src}&w=640 640w, ${src}&w=1024 1024w, ${src}&w=1920 1920w`}
                sizes="(max-width: 768px) 88vw, 400px"
                alt=""
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </div>
      <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>Foto reali attività in alta qualità · swipe su mobile, griglia su desktop — primo piano grande</p>

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
