import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getSupabaseServer } from '@/lib/supabase';
import UltraImage from '@/components/UltraImage';
import PartnerContactBox from '@/components/PartnerContactBox';
import ReviewBox from '@/components/ReviewBox';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = getSupabaseServer();
  const { data } = await sb.from('partners').select('name,services_offered,is_active').eq('id', id).single();
  const p = data as { name: string; services_offered: string[]; is_active: boolean } | null;
  if (!p || !p.is_active) return {};
  return { title: `${p.name} — STROBE Monza Brianza`, description: `${p.name} — ${p.services_offered.join(', ')} a Monza Brianza. Pagina standard STROBE.` };
}

export default async function PartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = getSupabaseServer();
  const { data } = await sb.from('partners').select('*').eq('id', id).single();
  const p = data as {
    id: string; name: string; email: string; phone: string | null; services_offered: string[]; rating: number; is_verified: boolean; is_active: boolean; credits: number; coverage_radius_km: number; created_at: string; availability: Record<string, string[]> | null; location: string; logo_url: string | null; brand_color: string | null; description: string | null; photos: string[] | null;
  } | null;
  if (!p) notFound();
  // WHY: 202 schede in coda non sono ancora nostri clienti — non escono a Google né ai visitatori.
  // Si accendono con un click da /admin dopo il contatto reale. L'admin le vede col cookie admin.
  if (!p.is_active) {
    const t = process.env.ADMIN_TOKEN || '';
    const h = await headers();
    const isAdm = !t || h.get('x-admin-token') === t || (h.get('cookie') || '').includes(`admin_token=${t}`);
    if (!isAdm) notFound();
  }
  // Personalizzazione partner: logo, colore, descrizione, foto sue — fallback standard STROBE ordinato
  const brand = p.brand_color || '#0071e3';

  // Recensioni per JSON-LD (Google rich results: aggregateRating + Review)
  const { data: revRows } = await sb.from('reviews').select('author_name,rating,comment,created_at,source').eq('partner_id', p.id).order('created_at', { ascending: false }).limit(10);
  const revs = (revRows || []) as { author_name: string; rating: number; comment: string; created_at: string; source: string }[];
  const avgRating = revs.length ? Math.round((revs.reduce((s, r) => s + r.rating, 0) / revs.length) * 10) / 10 : 0;

  // Simili: stesso servizio, stesso standard
  const { data: similari } = await sb.from('partners').select('id,name,services_offered,rating,is_verified').contains('services_offered', [p.services_offered[0]]).neq('id', p.id).eq('is_active', true).limit(3);
  const simili = (similari || []) as { id: string; name: string; services_offered: string[]; rating: number; is_verified: boolean }[];

  const isGym = p.services_offered.includes('palestra');
  // Ultra-realistiche fino a 8K — foto SUE se caricate, altrimenti standard di settore
  const galleryIds = p.photos && p.photos.length > 0 ? p.photos : isGym
    ? ['photo-1534438327276-14e5300c3a48', 'photo-1571019613454-1cb2f99b2d8b', 'photo-1593079831268-3381b0db4a77']
    : ['photo-1585704032915-c3400ca199e7', 'photo-1607472586893-edb57bdc0e39', 'photo-1621905251189-08b45d6a269e'];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'LocalBusiness', name: p.name, email: p.email, ...(p.phone ? { telephone: p.phone } : {}),
        ...(revs.length ? {
          aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating, reviewCount: revs.length },
          review: revs.map((r) => ({
            '@type': 'Review', author: { '@type': 'Person', name: r.author_name },
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
            reviewBody: r.comment, datePublished: r.created_at.slice(0, 10),
          })),
        } : {}),
      }) }} />
      {/* Breadcrumb */}
      <p className="muted" style={{ fontSize: 12, margin: '8px 0 0' }}>
        <a href="/" style={{ color: 'var(--muted)' }}>Home</a> · <a href="/problemi" style={{ color: 'var(--muted)' }}>Problemi</a> · <span style={{ color: 'var(--text)' }}>{p.name}</span>
      </p>

      {/* Hero chiaro — logo e colore SUOI se impostati, altrimenti standard */}
      <div className="hero" style={{ padding: '16px 0 8px', textAlign: 'left' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {p.logo_url && <img src={p.logo_url} alt={`${p.name} logo`} width={44} height={44} style={{ borderRadius: 10, objectFit: 'cover' }} />}
          <h1 style={{ margin: 0, fontSize: 'clamp(24px,4vw,36px)' }}>{p.name}</h1>
          {p.is_verified && <span style={{ fontSize: 13, background: 'var(--accent-soft)', color: brand, padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}>✓ Verificato STROBE</span>}
          <span style={{ fontSize: 13, background: 'var(--success-bg)', color: 'var(--success)', padding: '4px 10px', borderRadius: 999 }}>{p.rating}★</span>
          <span style={{ fontSize: 12, background: '#f5f5f7', padding: '4px 10px', borderRadius: 999 }}>Disponibilità Verificata STROBE · {p.credits} crediti</span>
        </div>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>
          {p.services_offered.map((s) => <span key={s} className="chip on" style={{ marginRight: 6, borderColor: brand, color: brand }}>{s}</span>)} · Raggio {p.coverage_radius_km}km · Monza Brianza
        </p>
        {p.description && <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.5 }}>{p.description}</p>}
        {/* Contatti sotto logo — telefono cliccabile (se pubblicato) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, fontSize: 13, background: '#fff', border: '1px solid var(--card-border)', borderRadius: 12, padding: '10px 14px' }}>
          {p.phone && <a href={`tel:${p.phone.replace(/\s/g, '')}`} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>📞 {p.phone}</a>}
          <span>✉️ {p.email}</span>
          <span>📍 Monza Brianza · {p.coverage_radius_km}km</span>
          <span>🕒 Verificato STROBE</span>
        </div>
      </div>

      {/* Galleria grande — desktop griglia 3, mobile swipe */}
      <style>{`@media(min-width:768px){.strobe-gallery{grid-template-columns:repeat(3,1fr)!important;overflow:visible!important}}`}</style>
      <div className="strobe-gallery" style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', gridColumn: '1/-1', paddingBottom: 4 }}>
          {galleryIds.map((uid, i) => (
            <div key={uid} style={{ flex: '0 0 88%', scrollSnapAlign: 'start', borderRadius: 18, overflow: 'hidden', height: 380 }}>
              <UltraImage id={uid} alt={`${p.name} — foto ${i + 1}`} width={1920} height={1280} aboveFold={i === 0} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
      <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>Ultra-realistiche fino a 8K — qualità massima se il dispositivo lo consente, senza intaccare</p>

      {/* Struttura completa a 2 colonne — 1 colonna su mobile */}
      <style>{`@media(max-width:767px){.strobe-cols{grid-template-columns:1fr!important}.strobe-dati{grid-template-columns:1fr!important}}`}</style>
      <div className="strobe-cols" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ marginTop: 0 }}>
          <h2 style={{ marginTop: 0 }}>Dati fondamentali</h2>
          <div className="strobe-dati" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
            <div><span className="muted">Servizi</span><br /><strong>{p.services_offered.join(', ')}</strong></div>
            <div><span className="muted">Telefono</span><br />{p.phone ? <a href={`tel:${p.phone.replace(/\s/g, '')}`} style={{ color: 'var(--text)', fontWeight: 600, textDecoration: 'none' }}>{p.phone}</a> : <span className="muted">Via richiesta STROBE</span>}</div>
            <div><span className="muted">Email</span><br /><strong style={{ wordBreak: 'break-all' }}>{p.email}</strong></div>
            <div><span className="muted">Disponibilità</span><br /><strong>Verificata STROBE · {p.credits} crediti</strong></div>
          </div>
          <div style={{ marginTop: 16 }}>
            <a href={`/?prompt=${encodeURIComponent(p.services_offered[0] + ' a Monza')}&partner=${p.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#111', color: '#fff', padding: '12px 20px', borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.01em' }}>
              Contatta tramite STROBE <span style={{ opacity: 0.6 }}>→</span>
            </a>
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Redirect immediato via STROBE — se occupato, al migliore vicino.</p>
          </div>
        </div>

        <div className="card" style={{ marginTop: 0 }}>
          <h3 style={{ marginTop: 0 }}>Orari & Zona — da canale ufficiale</h3>
          {p.availability ? (
            <div style={{ fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {Object.entries(p.availability).map(([g, slots]) => (
                <div key={g} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', padding: '4px 0' }}>
                  <span className="muted" style={{ textTransform: 'capitalize' }}>{g}</span>
                  <strong>{(slots as string[]).join(', ')}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>Copre {p.coverage_radius_km}km da Monza · Orari da verificare</p>
          )}
          <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>Fonte: sito ufficiale / reception — verificato STROBE</p>
          {/* MAPS gratuita — OpenStreetMap, clicchi e apri mappa grande — Edge-safe senza Buffer */}
          {(() => {
            let lat = 45.584, lon = 9.274;
            try {
              const hex = p.location as unknown as string;
              if (hex && hex.startsWith('0101')) {
                const bytes = new Uint8Array(hex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
                const view = new DataView(bytes.buffer);
                lon = view.getFloat64(9, true);
                lat = view.getFloat64(17, true);
              }
            } catch {}
            const bbox = `${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}`;
            return (
              <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`} target="_blank" rel="noopener" style={{ display: 'block', marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                <iframe title="Mappa" width="100%" height="160" style={{ border: 0, display: 'block' }} loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`} />
                <div style={{ background: '#f5f5f7', padding: '6px 10px', fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>Clicca per aprire MAPS a schermo intero — totalmente gratuito</div>
              </a>
            );
          })()}
          <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>Verificato il {new Date(p.created_at).toLocaleDateString('it-IT')}</p>
        </div>
      </div>

      {/* Spazio comunicazione — scrivi cosa ti serve, AI/bot categorizza in base a cosa gli serve */}
      <PartnerContactBox partnerId={p.id} service={p.services_offered[0]} />

      {/* Recensioni: copiate dalle loro pagine + i nostri clienti votano qui */}
      <ReviewBox partnerId={p.id} />

      {/* Info nostre — in fondo alla pagina standard */}
      <div className="card" style={{ background: '#fbfbfd', borderStyle: 'dashed' }}>
        <h3 style={{ marginTop: 0, fontSize: 14, letterSpacing: '0.04em' }}>STROBE — Monza Brianza</h3>
        <p className="muted" style={{ fontSize: 12, margin: '4px 0 0' }}>Piattaforma di routing geolocalizzato · Servizio clienti: <a href="mailto:infostrobe5@gmail.com" style={{ color: 'var(--text)' }}>infostrobe5@gmail.com</a> · <a href="https://shop-brianza.com" target="_blank" rel="noopener" style={{ color: 'var(--text)' }}>shop-brianza.com</a></p>
        <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>© STROBE — Tutti i diritti riservati · Privacy · Termini · Contatti</p>
      </div>

      {/* Altri simili a quello che cerchi — stessa struttura, stesso standard */}
      {simili.length > 0 && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Altri simili a quello che cerchi a Monza</h2>
          <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>Stesso servizio, stesso standard STROBE — scorri e scegli</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12, marginTop: 12 }}>
            {simili.map((s) => (
              <a key={s.id} href={`/p/${s.id}`} style={{ textDecoration: 'none', color: 'var(--text)', background: '#fff', border: '1px solid var(--card-border)', borderRadius: 14, padding: 14, display: 'block' }}>
                <strong>{s.name}</strong> {s.is_verified && <span style={{ fontSize: 11, background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 999 }}>✓</span>}
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{s.services_offered.join(', ')} · {s.rating}★</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
