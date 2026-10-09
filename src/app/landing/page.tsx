import type { Metadata } from 'next';
import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'STROBE — Chi siamo | Trova chi ti risolve il problema, a Monza Brianza',
  description: 'STROBE collega chi ha un problema a chi sa risolverlo, nella zona giusta e al momento giusto. Nessuna ricerca, nessuna telefonata a caso.',
  alternates: { canonical: 'https://smart-lead-routing.vercel.app/landing' },
};

/** Landing: chi siamo + perché fidarsi, in modo implicito (nessuna pressione di vendita) */
export default async function LandingPage() {
  const sb = getSupabaseServer();
  let partnerN = 0, reviewN = 0, avg = 0, comuniN = 0;
  try {
    const [{ count: pn }, rev] = await Promise.all([
      sb.from('partners').select('id', { count: 'exact', head: true }).eq('is_active', true),
      sb.from('reviews').select('rating'),
    ]);
    partnerN = pn || 0;
    const rows = (rev.data || []) as { rating: number }[];
    reviewN = rows.length;
    avg = rows.length ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / rows.length) * 10) / 10 : 0;
    comuniN = 16;
  } catch {}

  const steps = [
    { n: '01', t: 'Racconti il problema', d: 'Una frase basta. "Perde acqua il lavandino", "cerco palestra con sauna". Niente moduli lunghi, niente registrazione.' },
    { n: '02', t: 'Noi capiamo e smistiamo', d: 'Il sistema capisce cosa ti serve, quanto è urgente e manda la richiesta al professionista giusto della tua zona.' },
    { n: '03', t: 'Ti arriva la risposta', d: 'Chi è adatto risponde. Se il primo non c’è, in 15 minuti ci prova un altro. Tu non chiami nessuno.' },
  ];

  const triggers = [
    { t: 'Zero ricerca', d: 'Non apri 10 tab, non leggi 40 recensioni contrastanti. Scrivi una volta, ricevi chi fa per te.' },
    { t: 'Solo verificati', d: 'Ogni professionista ha dati ufficiali: orari, telefono, zona coperta. Nessun numero inventato.' },
    { t: 'Nessun impegno', d: 'Vuoi solo guardare? Guardi. Vuoi contattare? Contatti. Nessuno ti chiama se non lo chiedi.' },
    { t: 'Una richiesta, uno', d: 'Non finisci in una lista ricchiamata da 6 aziende. Vaia a chi è davvero adatto, prima lui.' },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'AboutPage', name: 'STROBE — chi siamo',
        description: 'STROBE collega chi ha un problema a chi sa risolverlo a Monza Brianza.',
        mainEntity: { '@type': 'Organization', name: 'STROBE', email: 'infostrobe5@gmail.com', areaServed: 'Monza e Brianza, Italia' },
      }) }} />

      {/* HERO — domanda che risuona, nessuna vendita */}
      <section className="hero" style={{ textAlign: 'left', padding: '28px 0 8px' }}>
        <p style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 650, margin: 0 }}>Chi siamo</p>
        <h1 style={{ fontSize: 'clamp(30px,5.5vw,54px)', lineHeight: 1.08, margin: '10px 0 0', letterSpacing: '-0.02em', fontWeight: 700 }}>
          Quante ore hai perso<br />a cercare qualcuno<br />che ti risolvesse un problema?
        </h1>
        <p style={{ fontSize: 'clamp(16px,2vw,19px)', lineHeight: 1.55, color: 'var(--muted)', maxWidth: 640, margin: '16px 0 0' }}>
          Noi facciamo l&rsquo;opposto: tu scrivi cosa ti serve, e il professionista giusto arriva da te.
          Zona giusta, momento giusto, dati verificati.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
          <Link href="/" className="btn" style={{ borderRadius: 999 }}>Prova ora — è gratis</Link>
          <Link href="/partner" className="btn btn-secondary" style={{ borderRadius: 999 }}>Lavoro con STROBE</Link>
        </div>
        {/* Prova sociale silenziosa, non invasiva */}
        <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>
          {partnerN > 0 ? `${partnerN} professionisti attivi` : 'Professionisti in attivazione'} · {comuniN} comuni della Brianza
          {reviewN > 0 && avg > 0 ? ` · ★ ${avg} su ${reviewN} recensioni` : ''} · Nessun costo per chi cerca
        </p>
      </section>

      {/* MECCANISMO — 3 passi, il cervello capisce subito */}
      <section style={{ margin: '36px 0' }}>
        <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', margin: '0 0 18px', letterSpacing: '-0.01em' }}>Come funziona — 3 passi</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
          {steps.map((s) => (
            <div key={s.n} className="card" style={{ padding: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{s.n}</span>
              <h3 style={{ fontSize: 17, margin: '8px 0 6px' }}>{s.t}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* IDENTITÀ — chi siamo in 3 righe vere */}
      <section className="card" style={{ padding: 24, margin: '10px 0 24px' }}>
        <h2 style={{ fontSize: 22, margin: '0 0 10px' }}>STROBE in 3 righe</h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, margin: '0 0 10px' }}>
          Siamo nati a <strong>Monza</strong>, da un problema stupidissimo: cercare un professionista affidabile
          in Brianza significa telefonare a caso, aspettare, e sperare. Abbiamo costruito il sistema che avremmo
          voluto avere noi — <strong>uno solo, diretto, che risponde</strong>.
        </p>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Non siamo un&rsquo;agenzia e non vendiamo niente a te: lavoriamo con i professionisti verificati della zona,
          che pagano solo quando portano valore. Il tuo contatto resta tuo — lo dai solo se vuoi.
        </p>
      </section>

      {/* PERCHÉ FUNZIONA — benefizi senza pressione */}
      <section style={{ margin: '10px 0 30px' }}>
        <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', margin: '0 0 16px' }}>Perché chi lo prova torna</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          {triggers.map((x) => (
            <div key={x.t} style={{ borderTop: '2px solid var(--accent)', paddingTop: 12 }}>
              <h3 style={{ fontSize: 16, margin: '0 0 6px' }}>{x.t}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CHI USA STROBE — due porte, nessuna pressione */}
      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', marginBottom: 34 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Hai un problema da risolvere</h3>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 14px' }}>
            Scrivi una frase. Sei tu che decidi se lasciare i tuoi contatti. Nessun costo, nessun impegno,
            nessuna lista aziende che ti scrivono.
          </p>
          <Link href="/" className="btn" style={{ borderRadius: 999 }}>Racconta cosa ti serve</Link>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Sei un professionista</h3>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 14px' }}>
            Ti arrivano richieste già capite e filtrate dalla tua zona. Le accetti, le rifiuti, le ignori.
            Si paga solo quando una ti porta un cliente.
          </p>
          <Link href="/partner" className="btn btn-secondary" style={{ borderRadius: 999 }}>Entra nella rete</Link>
        </div>
      </section>

      {/* CHIUSA — invito morbido, zero urgenza finti */}
      <section style={{ textAlign: 'center', padding: '26px 0 40px', borderTop: '1px solid var(--card-border)' }}>
        <p style={{ fontSize: 'clamp(18px,2.6vw,24px)', fontWeight: 650, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          Il prossimo problema lo risolvi in una frase.
        </p>
        <p className="muted" style={{ fontSize: 14, margin: '0 0 18px' }}>
          Ci vuole 30 secondi. Se non fa per te, hai solo scritto una frase.
        </p>
        <Link href="/" className="btn" style={{ borderRadius: 999, padding: '13px 30px', fontSize: 15 }}>Inizia</Link>
        <p className="muted" style={{ fontSize: 12, marginTop: 16 }}>
          Domande: <a href="mailto:infostrobe5@gmail.com" style={{ color: 'var(--text)' }}>infostrobe5@gmail.com</a>
        </p>
      </section>
    </div>
  );
}
