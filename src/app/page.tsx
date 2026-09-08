'use client';

import { useState, useEffect } from 'react';

interface QualResult {
  success: boolean;
  leadId?: string;
  qualification?: { service: string; urgency: string; summary: string };
  assigned?: { name: string; distanceKm: number } | null;
  message?: string;
  error?: string;
}

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [privacy, setPrivacy] = useState(false);
  const [geoMsg, setGeoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QualResult | null>(null);
  const [clarify, setClarify] = useState<{ need: boolean; question: string; suggestion: string } | null>(null);
  const [ts] = useState(() => Date.now());

  function useGps() {
    setGeoMsg('Rilevamento posizione…');
    if (!navigator.geolocation) {
      setGeoMsg('GPS non supportato. Usa città/CAP.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
        setGeoMsg(`Posizione rilevata (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      () => setGeoMsg('GPS negato. Inserisci città/CAP.'),
      { timeout: 8000 },
    );
  }

  async function geocodeCity() {
    if (!city.trim()) return;
    setGeoMsg('Ricerca indirizzo…');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city + ', Italia')}`, {
        headers: { Accept: 'application/json' },
      });
      const arr = (await res.json()) as { lat: string; lon: string }[];
      if (arr.length === 0) {
        setGeoMsg('Indirizzo non trovato.');
        return;
      }
      setLat(parseFloat(arr[0].lat));
      setLon(parseFloat(arr[0].lon));
      setGeoMsg(`Posizione: ${city} (${arr[0].lat}, ${arr[0].lon})`);
    } catch {
      setGeoMsg('Geocoding fallito. Riprova.');
    }
  }

  // WHY chat 2 turni: se Gemini è incerto (generico), 1 domanda di chiarimento prima di match = +20% precisione, senza 5 domande
  async function qualifyFirst(): Promise<{ service: string; urgency: string } | null> {
    try {
      const r = await fetch('/api/qualify-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      const j = await r.json();
      if (j.success && j.qualification) return j.qualification;
    } catch {}
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setClarify(null);
    try {
      // Sprint 2: 1 chiarimento se generico — non spreca lead a caso
      const q = await qualifyFirst();
      if (q && q.service === 'generico' && !clarify) {
        setClarify({ need: true, question: 'Non ho capito bene il servizio — è per casa, palestra o benessere?', suggestion: 'Es. "cerco palestra con sauna" o "perdita acqua cucina"' });
        setLoading(false);
        return;
      }
      const website = (document.querySelector('input[name="website"]') as HTMLInputElement)?.value || '';
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, lat, lon, name, phone, email, privacy, website, _ts: ts }),
      });
      const data = (await res.json()) as QualResult;
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  // Prefill da URL per pagine-esca SEO: /?prompt=palestra+sauna+Monza
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('prompt');
    if (p) setPrompt(p);
  }, []);

  return (
    <div>
      <div className="hero">
        <span className="hero-eyebrow">Qualifica AI · Geo-match · Waterfall 15 min</span>
        <h1>Il professionista giusto, vicino a te.</h1>
        <p>Descrivi il problema in parole tue. Troviamo lo specialista più vicino e disponibile.</p>
        {/* Foto anonimizzate — estetica premium, volti non riconoscibili, coerenti con 4 verticali */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 20 }}>
          <img src="https://picsum.photos/seed/strobe-casa/400/280?blur=2" alt="" width={400} height={280} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 16, opacity: 0.92 }} loading="lazy" />
          <img src="https://picsum.photos/seed/strobe-fitness/400/280?blur=2" alt="" width={400} height={280} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 16, opacity: 0.92 }} loading="lazy" />
          <img src="https://picsum.photos/seed/strobe-benessere/400/280?blur=2" alt="" width={400} height={280} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 16, opacity: 0.92 }} loading="lazy" />
        </div>
        <p className="muted" style={{ fontSize: 11, marginTop: 6, letterSpacing: '0.04em' }}>Foto anonimizzate — estetica STROBE, nessun volto identificabile</p>
      </div>
      <div className="card">
        <form onSubmit={submit}>
          <label className="label" htmlFor="prompt">Richiesta in testo libero</label>
          <textarea
            id="prompt"
            className="textarea"
            rows={3}
            placeholder="Es. Si è rotta la caldaia, perdita d'acqua in cucina"
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); setClarify(null); }}
            required
          />
          {clarify && (
            <div className="contact-box" style={{ marginTop: 8, background: 'var(--warn-bg)', borderColor: 'rgba(178,94,9,0.2)' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{clarify.question}</p>
              <p className="muted" style={{ fontSize: 13, margin: '4px 0 0' }}>{clarify.suggestion}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {['idraulica', 'palestra', 'parrucchiere', 'pulizie'].map((s) => (
                  <button key={s} type="button" className="chip" onClick={() => setPrompt((p) => `${p} ${s}`.trim())}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div className="row">
            <div>
              <label className="label">Posizione GPS</label>
              <button type="button" className="btn" onClick={useGps} style={{ width: '100%' }}>
                Rileva posizione GPS
              </button>
              <p className="muted" style={{ fontSize: 13 }}>{geoMsg}</p>
            </div>
            <div>
              <label className="label" htmlFor="city">oppure Città / CAP</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input id="city" className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Es. Monza 20900" />
                <button type="button" className="btn btn-secondary" onClick={geocodeCity}>Cerca</button>
              </div>
              {lat !== null && lon !== null && (
                <p className="muted" style={{ fontSize: 13 }}>Coordinate: {lat.toFixed(4)}, {lon.toFixed(4)}</p>
              )}
            </div>
          </div>
          <div className="row">
            <div>
              <label className="label" htmlFor="name">Nome</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="phone">Telefono</label>
              <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
          </div>
          <label className="label" htmlFor="email">Email (per conferma e valutazione)</label>
          <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label style={{ display: 'flex', gap: 8, marginTop: 14, fontSize: 14 }}>
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} required />
            Accetto la Privacy Policy e il trasferimento dei miei dati al partner assegnato per essere ricontattato.
          </label>
          {/* Honeypot professionale: invisibile all'umano, letale per bot */}
          <input type="text" name="website" autoComplete="off" tabIndex={-1} aria-hidden="true" style={{ position: 'absolute', left: -9999 }} defaultValue="" />
          <div style={{ marginTop: 16 }}>
            <button className="btn" disabled={loading || lat === null}>
              {loading ? 'Invio…' : 'Trova professionista'}
            </button>
            {lat === null && <p className="muted" style={{ fontSize: 13 }}>Rileva il GPS o cerca la città per attivare l invio.</p>}
          </div>
        </form>
      </div>

      {result && (
        <div className="card" style={{ marginTop: 16 }}>
          {!result.success ? (
            <p className="error">Errore: {result.error}</p>
          ) : (
            <div>
              <h3 style={{ marginTop: 0 }}>Richiesta registrata</h3>
              {result.qualification && (
                <p>
                  Servizio: <strong>{result.qualification.service}</strong>{' '}
                  <span className={`badge badge-${result.qualification.urgency}`}>{result.qualification.urgency}</span>
                  <br />
                  <span className="muted">{result.qualification.summary}</span>
                </p>
              )}
              {result.assigned ? (
                <p>
                  Partner assegnato: <strong>{result.assigned.name}</strong> ({result.assigned.distanceKm.toFixed(1)} km).
                  Ti contatterà a breve.
                </p>
              ) : (
                <p>{result.message}</p>
              )}
              {result.leadId && (
                <p className="muted" style={{ fontSize: 13 }}>
                  A servizio concluso potrai valutare qui: <a href={`/valuta/${result.leadId}`}>valuta il servizio</a>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
