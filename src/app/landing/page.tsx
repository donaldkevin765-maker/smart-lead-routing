import type { Metadata } from 'next';
import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase';
import { Reveal, Counter, RouteDemo } from '@/components/LandingBits';
import { COPY } from '@/lib/copy';

export const metadata: Metadata = {
  title: 'STROBE — Chi siamo | Il problema giusto, alla persona giusta',
  description: 'Scrivi cosa ti serve. STROBE trova il professionista verificato più vicino e te lo manda. Monza Brianza.',
  alternates: { canonical: 'https://smart-lead-routing.vercel.app/landing' },
};

/** Landing minimal Apple-style: whitespace, tipografia grande, una cosa per sezione, demo live */
export default async function LandingPage() {
  const sb = getSupabaseServer();
  let partnerN = 0, reviewN = 0, avg = 0;
  try {
    const [{ count: pn }, rev] = await Promise.all([
      sb.from('partners').select('id', { count: 'exact', head: true }).eq('is_active', true),
      sb.from('reviews').select('rating'),
    ]);
    partnerN = pn || 0;
    const rows = (rev.data || []) as { rating: number }[];
    reviewN = rows.length;
    avg = rows.length ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / rows.length) * 10) / 10 : 0;
  } catch {}

  const s = { fontSize: 'clamp(38px,8vw,88px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.02, margin: 0, whiteSpace: 'pre-line' } as const;
  const h2 = { fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0, whiteSpace: 'pre-line' } as const;
  const lead = { fontSize: 'clamp(16px,2vw,21px)', color: 'var(--muted)', lineHeight: 1.5, fontWeight: 400 } as const;

  const steps = [
    { n: '01', t: 'Scrivi', d: 'Una frase. Come un messaggio a un amico.' },
    { n: '02', t: 'Smistiamo', d: 'Capito il problema, troviamo chi è adatto — vicino, verificato, libero.' },
    { n: '03', t: 'Risponde', d: 'Arriva da te. Se il primo non c’è, ci prova un altro in 15 minuti.' },
  ];

  const pillars = [
    { t: 'Solo chi esiste', d: 'Ogni scheda ha orari e telefono presi dal canale ufficiale. Niente fantasia.' },
    { t: 'Una richiesta, una persona', d: 'Non finisci in cinque liste. Vai a chi fa per te, e basta.' },
    { t: 'Tu decidi i contatti', d: 'Guardare è libero. I tuoi dati li dai solo quando vuoi essere richiamato.' },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'AboutPage', name: 'STROBE — chi siamo',
        description: 'STROBE collega chi ha un problema a chi sa risolverlo a Monza Brianza.',
        mainEntity: { '@type': 'Organization', name: 'STROBE', email: 'infostrobe5@gmail.com', areaServed: 'Monza e Brianza, Italia' },
      }) }} />

      {/* 1 — HERO: una sola frase enorme */}
      <section style={{ padding: '56px 0 40px', maxWidth: 900 }}>
        <Reveal as="p" delay={0}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <img src="/strobe-mark.svg" alt="" width={18} height={18} />
            <span style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 650 }}>{COPY.landingEyebrow}</span>
          </span>
        </Reveal>
        <Reveal as="h1" delay={60}><span style={s}>{COPY.landingH1}</span></Reveal>
        <Reveal as="p" delay={160}>
          <span style={{ ...lead, display: 'block', maxWidth: 560, marginTop: 20 }}>
            {COPY.landingLead}
          </span>
        </Reveal>
        <Reveal delay={260}>
          <div style={{ display: 'flex', gap: 10, marginTop: 30, flexWrap: 'wrap' }}>
            <Link href="/" className="btn" style={{ borderRadius: 999, padding: '13px 30px', fontSize: 15 }}>{COPY.ctaTry}</Link>
            <Link href="/partner" className="btn btn-secondary" style={{ borderRadius: 999, padding: '13px 30px', fontSize: 15 }}>{COPY.ctaPartner}</Link>
          </div>
        </Reveal>
      </section>

      {/* 2 — DEMO LIVE: l'unico "feature" che serve */}
      <section style={{ padding: '20px 0 56px', maxWidth: 640 }}>
        <Reveal delay={0}><RouteDemo /></Reveal>
        <Reveal delay={120}>
          <p style={{ ...lead, fontSize: 14, marginTop: 14 }}>{COPY.landingDemoNote}</p>
        </Reveal>
      </section>

      {/* 3 — NUMERI: prova, non promessa */}
      <section style={{ borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)', padding: '44px 0', display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
        {[
          { n: <Counter to={partnerN} />, l: 'professionisti verificati' },
          { n: <Counter to={16} />, l: 'comuni della Brianza' },
          { n: reviewN > 0 ? <><Counter to={reviewN} /></> : '—', l: reviewN > 0 ? `recensioni · ★ ${avg}` : 'recensioni in arrivo' },
        ].map((x, i) => (
          <Reveal key={i} delay={i * 90}>
            <div>
              <div style={{ fontSize: 'clamp(34px,5vw,56px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{x.n}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>{x.l}</div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* 4 — TRE PASSI: una parola per titolo */}
      <section style={{ padding: '64px 0' }}>
        <Reveal as="h2" delay={0}><span style={h2}>{COPY.landingSteps}</span></Reveal>
        <div style={{ display: 'grid', gap: 40, marginTop: 36, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {steps.map((x, i) => (
            <Reveal key={x.n} delay={i * 110}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{x.n}</div>
                <h3 style={{ fontSize: 24, fontWeight: 650, letterSpacing: '-0.02em', margin: '10px 0 8px' }}>{x.t}</h3>
                <p style={{ ...lead, fontSize: 15 }}>{x.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5 — IDENTITÀ: poche parole, grandi */}
      <section style={{ background: '#fbfbfd', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)', padding: '72px 0' }}>
        <div style={{ maxWidth: 780 }}>
          <Reveal as="h2" delay={0}>
            <span style={{ ...h2, display: 'block' }}>{COPY.landingIdentityTitle}</span>
          </Reveal>
          <Reveal delay={100}>
            <p style={{ ...lead, marginTop: 24 }}>
              {COPY.landingIdentity1}
            </p>
          </Reveal>
          <Reveal delay={180}>
            <p style={{ ...lead, marginTop: 14 }}>
              {COPY.landingIdentity2}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 6 — TRE PILASTRI: niente card, solo linee */}
      <section style={{ padding: '64px 0' }}>
        <div style={{ display: 'grid', gap: 34, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          {pillars.map((x, i) => (
            <Reveal key={x.t} delay={i * 100}>
              <div style={{ borderTop: '1px solid var(--text)', paddingTop: 16 }}>
                <h3 style={{ fontSize: 17, fontWeight: 650, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{x.t}</h3>
                <p style={{ ...lead, fontSize: 14 }}>{x.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 7 — DUE PORTE */}
      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', paddingBottom: 64 }}>
        {[
          { ...COPY.doorUser, href: '/', primary: true },
          { ...COPY.doorPartner, href: '/partner', primary: false },
        ].map((x, i) => (
          <Reveal key={x.t} delay={i * 120}>
            <div className="card" style={{ padding: 28, height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ fontSize: 21, fontWeight: 650, letterSpacing: '-0.02em', margin: 0 }}>{x.t}</h3>
              <p style={{ ...lead, fontSize: 14, flex: 1 }}>{x.d}</p>
              <div>
                <Link href={x.href} className={x.primary ? 'btn' : 'btn btn-secondary'} style={{ borderRadius: 999, padding: '11px 24px', fontSize: 14 }}>{x.cta}</Link>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* 8 — CHIUSA */}
      <section style={{ textAlign: 'center', padding: '56px 0 72px', borderTop: '1px solid var(--card-border)' }}>
        <Reveal as="h2" delay={0}><span style={{ ...h2, display: 'block' }}>{COPY.landingCloseTitle}</span></Reveal>
        <Reveal delay={120}>
          <div style={{ marginTop: 28 }}>
            <Link href="/" className="btn" style={{ borderRadius: 999, padding: '15px 42px', fontSize: 16 }}>{COPY.ctaStart}</Link>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 18 }}>
            {COPY.landingCloseSub} · <a href="mailto:infostrobe5@gmail.com" style={{ color: 'var(--text)' }}>infostrobe5@gmail.com</a>
          </p>
        </Reveal>
      </section>
    </div>
  );
}
