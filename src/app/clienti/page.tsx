import { getSupabaseServer } from '@/lib/supabase';

export const metadata = { title: 'I nostri clienti — STROBE' };

export default async function ClientiPage() {
  const sb = getSupabaseServer();
  const { data } = await sb.from('partners').select('id,name,services_offered,rating,is_verified,credits').order('rating', { ascending: false });
  const partners = (data || []) as { id: string; name: string; services_offered: string[]; rating: number; is_verified: boolean; credits: number }[];

  return (
    <div>
      <div className="hero" style={{ padding: '24px 0 8px', textAlign: 'left' }}>
        <span className="hero-eyebrow">STROBE · Monza Brianza</span>
        <h1>I nostri clienti</h1>
        <p className="muted">Partner verificati, stesso standard — clicca per vedere la pagina completa con foto reali e orari ufficiali.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, marginTop: 16 }}>
        {partners.map((p) => (
          <a key={p.id} href={`/p/${p.id}`} style={{ textDecoration: 'none', color: 'var(--text)', background: '#fff', border: '1px solid var(--card-border)', borderRadius: 16, overflow: 'hidden', display: 'block' }}>
            <div style={{ height: 140, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={`https://picsum.photos/seed/${p.id.slice(0, 6)}/600/340?blur=2`} alt="" width={600} height={340} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <strong>{p.name}</strong>
                {p.is_verified && <span style={{ fontSize: 11, background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 999 }}>✓ Verificato</span>}
                <span style={{ fontSize: 12, background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: 999 }}>{p.rating}★</span>
              </div>
              <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>{p.services_offered.join(' · ')}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{p.credits} crediti · Monza Brianza</div>
            </div>
          </a>
        ))}
      </div>

      {partners.length === 0 && <div className="card"><p className="muted">Nessun cliente ancora — aggiungi il primo da /partner</p></div>}

      <div className="card">
        <p className="muted" style={{ fontSize: 13, margin: 0 }}>7 partner live — Fit Express, FitActive ×2, FitHouse, Domus Candura, Biemme, ML Termoidraulica. Ognuno con pagina standard `/p/[id]` + foto HQ + orari ufficiali + MAPS gratuita.</p>
      </div>
    </div>
  );
}
