'use client';
import { useEffect, useState } from 'react';

export default function PartnerPage() {
  const [grouped, setGrouped] = useState<Record<string, Record<string, { slug: string; label: string }[]>>>({});
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', telegram_chat_id: '', services: [] as string[], lat: '', lon: '', coverage_radius_km: '20', max_daily_leads: '10' });
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    fetch('/api/services').then((r) => r.json()).then((j) => { if (j.success) setGrouped(j.grouped); });
  }, []);

  function toggleService(s: string) {
    setForm((f) => ({ ...f, services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s] }));
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg('Salvataggio…');
    let avail: Record<string, string[]> | null = null;
    if (availability.trim()) { try { avail = JSON.parse(availability); } catch { avail = { note: [availability] } as unknown as Record<string, string[]>; } }
    const res = await fetch('/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, telegram_chat_id: form.telegram_chat_id, services_offered: form.services, lat: parseFloat(form.lat), lon: parseFloat(form.lon), coverage_radius_km: parseInt(form.coverage_radius_km, 10), max_daily_leads: parseInt(form.max_daily_leads, 10), availability: avail }),
    });
    const data = await res.json();
    setMsg(data.success ? `Benvenuto! Ti abbiamo aggiunto — ID ${data.id.slice(0, 8)}` : `Errore: ${data.error}`);
  }

  return (
    <div>
      <div className="hero" style={{ padding: '32px 0 8px' }}>
        <span className="hero-eyebrow">Per aziende — solo nuovi ingressi</span>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)' }}>Diventa partner STROBE.</h1>
        <p className="muted" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          Ricevi solo clienti vicini, filtrati e pronti. Paghi solo se accetti. Nessun abbonamento.
        </p>
        <p className="muted" style={{ textAlign: 'center', fontSize: 12, marginTop: 8 }}><a href="/clienti">Vedi i nostri clienti già dentro →</a></p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Come funziona</h3>
        <div className="row" style={{ fontSize: 14 }}>
          <div>1. <strong>Ti registri</strong> in 2 minuti.</div>
          <div>2. <strong>Ricevi</strong> richiesta vicina su Telegram/Email.</div>
          <div>3. <strong>Accetti in 1 click</strong> e chiami — paghi solo qui.</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Registrati come nuovo partner</h2>
        <form onSubmit={create}>
          <div className="row">
            <div><label className="label">Nome azienda</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="label">Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          </div>
          <div className="row">
            <div><label className="label">Telefono</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
            <div><label className="label">Telegram Chat ID</label><input className="input" value={form.telegram_chat_id} onChange={(e) => setForm({ ...form, telegram_chat_id: e.target.value })} placeholder="Da @userinfobot" /></div>
          </div>
          <label className="label">Servizi offerti (da catalogo multi-settore)</label>
          {Object.keys(grouped).length === 0 ? <p className="muted">Caricamento catalogo…</p> : Object.entries(grouped).map(([vertical, cats]) => (
            <div key={vertical} style={{ marginBottom: 10 }}>
              <p className="muted" style={{ textTransform: 'capitalize', fontWeight: 600, margin: '10px 0 6px' }}>{vertical}</p>
              {Object.entries(cats).map(([cat, list]) => (
                <div key={cat} style={{ marginBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>{cat}: </span>
                  <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6 }}>
                    {list.map((s) => (
                      <label key={s.slug} className={form.services.includes(s.slug) ? 'chip on' : 'chip'}>
                        <input type="checkbox" checked={form.services.includes(s.slug)} onChange={() => toggleService(s.slug)} style={{ marginRight: 6 }} />{s.label}
                      </label>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ))}
          <div className="row">
            <div><label className="label">Latitudine sede</label><input className="input" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="45.5845" required /></div>
            <div><label className="label">Longitudine sede</label><input className="input" value={form.lon} onChange={(e) => setForm({ ...form, lon: e.target.value })} placeholder="9.2572" required /></div>
          </div>
          <div className="row">
            <div><label className="label">Raggio copertura (km)</label><input className="input" value={form.coverage_radius_km} onChange={(e) => setForm({ ...form, coverage_radius_km: e.target.value })} /></div>
            <div><label className="label">Max lead/giorno</label><input className="input" value={form.max_daily_leads} onChange={(e) => setForm({ ...form, max_daily_leads: e.target.value })} /></div>
          </div>
          <div style={{ marginTop: 12 }}><label className="label">Disponibilità (fitness/benessere, opzionale)</label><input className="input" value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder='{"lun":["09:00-21:00"]}' /></div>
          <div style={{ marginTop: 12 }}><button className="btn" type="submit">Entra in STROBE</button></div>
        </form>
        {msg && <p className="muted" style={{ marginTop: 8 }}>{msg}</p>}
      </div>
    </div>
  );
}
