'use client';

import { useState } from 'react';
import { getEsche } from '@/lib/esche';
import { photoUrl } from '@/lib/photoStandard';

export default function ProblemiIndex() {
  const esche = getEsche();
  const [q, setQ] = useState('');
  const filtered = esche.filter((e) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return e.h1.toLowerCase().includes(s) || e.service.toLowerCase().includes(s) || e.city.toLowerCase().includes(s) || e.title.toLowerCase().includes(s);
  });
  const byCity: Record<string, typeof esche> = {};
  for (const e of filtered) {
    if (!byCity[e.city]) byCity[e.city] = [];
    byCity[e.city].push(e);
  }
  return (
    <div>
      <div className="hero" style={{ padding: '24px 0 8px' }}>
        <span className="hero-eyebrow">10 pagine-esca dense</span>
        <h1>Problemi reali, soluzioni vicine.</h1>
        <p>Ogni pagina è un problema vero a Monza/Brianza — ti porta alla chat con richiesta già pronta.</p>
        <div style={{ marginTop: 16 }}>
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca su iPad: es. palestra, idraulico, sauna..."
            style={{ fontSize: 16, padding: '14px 16px', borderRadius: 14 }}
            autoComplete="off"
          />
          <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>Su iPad tocca e scrivi — compaiono solo le foto relative a ciò che cerchi.</p>
        </div>
      </div>
      {Object.entries(byCity).map(([city, list]) => (
        <div key={city} className="card">
          <h2 style={{ marginTop: 0 }}>{city} {q && <span className="muted" style={{ fontSize: 14 }}>· {list.length} risultati</span>}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {list.map((e) => (
              <a key={e.slug} href={`/problemi/${e.slug}`} style={{ textDecoration: 'none', color: 'var(--text)', display: 'block', background: '#fff', borderRadius: 16, border: '1px solid var(--card-border)', overflow: 'hidden' }}>
                <img src={photoUrl(e.gallery[0], 600, 340, 2)} alt="" width={600} height={340} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} loading="lazy" />
                <div style={{ padding: '10px 12px' }}>
                  <strong style={{ display: 'block', fontSize: 15, lineHeight: 1.3 }}>{e.h1}</strong>
                  <span className="muted" style={{ display: 'block', fontSize: 13, marginTop: 4 }}>{e.intro.slice(0, 90)}…</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div className="card"><p className="muted">Nessun risultato per "{q}" — prova palestra, caldaia, pulizie...</p></div>}
    </div>
  );
}
