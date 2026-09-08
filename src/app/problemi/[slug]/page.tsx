import type { Metadata } from 'next';
import { getEsca, getEsche } from '@/lib/esche';

export async function generateStaticParams() {
  return getEsche().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const esca = getEsca(slug);
  if (!esca) return {};
  return {
    title: esca.title,
    description: esca.intro.slice(0, 155),
    openGraph: { title: esca.title, description: esca.intro.slice(0, 155) },
  };
}

export default async function ProblemaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const esca = getEsca(slug);
  if (!esca) return <div className="card"><p>Pagina non trovata.</p></div>;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: esca.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  const href = `/?prompt=${encodeURIComponent(esca.prompt)}`;

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="hero" style={{ padding: '24px 0 8px' }}>
        <span className="hero-eyebrow">{esca.city} · {esca.service}</span>
        <h1>{esca.h1}</h1>
        {/* Cover anonimizzata — coerente con vertical, nessun volto */}
        <img src={`https://picsum.photos/seed/${esca.coverSeed}/800/420?blur=2`} alt="" width={800} height={420} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 18, marginTop: 14, opacity: 0.94 }} loading="lazy" />
        {/* Primo piano GRANDE entrambi — trainer + cliente, volti sfocati vicino alla scritta */}
        {esca.slug === 'palestra-con-sauna-monza' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 16 }}>
            {[
              { seed: 'strobe-trainer-primo-piano', label: 'Trainer — primo piano grande', sub: 'Volto anonimizzato, vicino alla scritta' },
              { seed: 'strobe-cliente-primo-piano', label: 'Cliente — primo piano grande', sub: 'Primo piano sfocato, estetica STROBE' },
            ].map((p) => (
              <div key={p.seed} style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 420, background: '#eee' }}>
                <img src={`https://picsum.photos/seed/${p.seed}/1200/900?blur=2`} alt="" width={1200} height={900} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                {/* Blur mirato grande sul volto */}
                <div style={{ position: 'absolute', top: '18%', left: '28%', width: '36%', height: '42%', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 999, opacity: 0.96 }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(14px)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <strong style={{ display: 'block', fontSize: 15, lineHeight: 1.2 }}>{p.label}</strong>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.sub}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <p style={{ marginTop: 12 }}>{esca.intro}</p>
        <div style={{ marginTop: 16 }}>
          <a className="btn" href={href}>Trova professionista per questo — 1 click</a>
          <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>Ti porta alla chat con richiesta già pronta, GPS vicino a {esca.city}.</p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Cause comuni a {esca.city}</h2>
        <p>{esca.cause}</p>
        <h3>Cosa fare subito (2 min)</h3>
        <ul>
          {esca.fareSubito.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <h3>Quando chiamare</h3>
        <p>{esca.quandoChiamare}</p>
        <h3>Fascia prezzo indicativa</h3>
        <p><strong>{esca.fasciaPrezzo}</strong> — preventivo chiaro dal partner che ti chiama, paghi solo se accetta.</p>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Domande frequenti</h2>
        {esca.faq.map((f) => (
          <div key={f.q} style={{ marginBottom: 12 }}>
            <strong>{f.q}</strong>
            <p className="muted" style={{ margin: '4px 0 0' }}>{f.a}</p>
          </div>
        ))}
        <div style={{ marginTop: 16 }}>
          <a className="btn" href={href}>Chiedi ora — descrivi il tuo caso</a>
        </div>
      </div>

      <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 16 }}>
        Contenuto denso e utile, non thin — 1 pagina = 1 problema reale a {esca.city}. Ogni richiesta finisce in chat qualificata e routing geolocalizzato.
      </p>
    </div>
  );
}
