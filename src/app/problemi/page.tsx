import { getEsche } from '@/lib/esche';

export default function ProblemiIndex() {
  const esche = getEsche();
  const byCity: Record<string, typeof esche> = {};
  for (const e of esche) {
    if (!byCity[e.city]) byCity[e.city] = [];
    byCity[e.city].push(e);
  }
  return (
    <div>
      <div className="hero" style={{ padding: '24px 0 8px' }}>
        <span className="hero-eyebrow">10 pagine-esca dense</span>
        <h1>Problemi reali, soluzioni vicine.</h1>
        <p>Ogni pagina è un problema vero a Monza/Brianza — ti porta alla chat con richiesta già pronta.</p>
      </div>
      {Object.entries(byCity).map(([city, list]) => (
        <div key={city} className="card">
          <h2 style={{ marginTop: 0 }}>{city}</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {list.map((e) => (
              <a key={e.slug} href={`/problemi/${e.slug}`} style={{ textDecoration: 'none', color: 'var(--text)', display: 'block', padding: '10px 12px', background: '#fff', borderRadius: 12, border: '1px solid var(--card-border)' }}>
                <strong>{e.h1}</strong>
                <span className="muted" style={{ display: 'block', fontSize: 13 }}>{e.intro.slice(0, 90)}…</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
