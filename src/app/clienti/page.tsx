'use client';
import { useEffect, useState } from 'react';

interface P { id: string; name: string; services_offered: string[]; rating: number; is_verified: boolean; credits: number; }

export default function ClientiPage() {
  const [partners, setPartners] = useState<P[]>([]);
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState('tutti');

  useEffect(() => {
    fetch('/api/partners').then((r) => r.json()).then((j) => { if (j.success) setPartners(j.partners); });
  }, []);

  const verticali = ['tutti', ...Array.from(new Set(partners.flatMap((p) => p.services_offered))).sort()];
  const filtrati = partners.filter((p) => {
    const s = q.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(s) || p.services_offered.join(' ').toLowerCase().includes(s);
    const matchF = filtro === 'tutti' || p.services_offered.includes(filtro);
    return matchQ && matchF;
  });

  return (
    <div>
      <div className="hero" style={{ padding: '24px 0 8px' }}>
        <span className="hero-eyebrow">STROBE · Rete verificata Monza Brianza</span>
        <h1>I nostri clienti</h1>
        <p className="muted">7 partner, stesso standard premium — foto reali, orari ufficiali, MAPS gratuita. Clicca per vedere la pagina completa.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca palestra, idraulico, studio..." style={{ flex: 1, minWidth: 200 }} />
          <select className="select" value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ width: 180 }}>
            {verticali.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{filtrati.length} su {partners.length} — filtro: {filtro}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16, marginTop: 16 }}>
        {filtrati.map((p) => (
          <a key={p.id} href={`/p/${p.id}`} style={{ textDecoration: 'none', color: 'var(--text)', background: '#fff', border: '1px solid var(--card-border)', borderRadius: 18, overflow: 'hidden', display: 'block', transition: 'transform 0.15s' }}>
            <div style={{ height: 160, background: '#f5f5f7' }}>
              <img src={`https://picsum.photos/seed/${p.id.slice(0, 6)}/600/340?blur=2`} alt="" width={600} height={340} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 15 }}>{p.name}</strong>
                {p.is_verified && <span style={{ fontSize: 11, background: 'var(--accent-soft)', color: 'var(--accent)', padding: '3px 8px', borderRadius: 999, fontWeight: 600 }}>✓ Verificato</span>}
                <span style={{ fontSize: 11, background: 'var(--success-bg)', color: 'var(--success)', padding: '3px 8px', borderRadius: 999 }}>{p.rating}★</span>
              </div>
              <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>{p.services_offered.join(' · ')}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{p.credits} crediti · Monza Brianza · <span style={{ color: 'var(--accent)' }}>vedi pagina →</span></div>
            </div>
          </a>
        ))}
      </div>
      {filtrati.length === 0 && <div className="card"><p className="muted">Nessun risultato per "{q}"</p></div>}
    </div>
  );
}
