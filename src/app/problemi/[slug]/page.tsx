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
        {/* Galleria swipe — scorri a destra/sinistra, mostra solo foto relative al settore cercato (SEO keywords → gallery filtrata) */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', marginTop: 14, paddingBottom: 4 }}>
          {esca.gallery.map((seed) => (
            <div key={seed} style={{ position: 'relative', flex: '0 0 88%', scrollSnapAlign: 'start', borderRadius: 18, overflow: 'hidden', height: 320, background: '#eee' }}>
              <img src={`https://picsum.photos/seed/${seed}/900/600?blur=2`} alt="" width={900} height={600} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              {/* Blur volto + label settore vicino alla scritta */}
              <div style={{ position: 'absolute', top: '16%', left: '30%', width: '32%', height: '40%', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderRadius: 999, opacity: 0.96 }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(12px)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <strong style={{ fontSize: 13 }}>{esca.service} — {esca.city}</strong>
                <span className="muted" style={{ fontSize: 11, marginLeft: 6 }}>primo piano, volto sfocato</span>
              </div>
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>← scorri a destra/sinistra · foto relative a <strong>{esca.service}</strong> cercato</p>
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
