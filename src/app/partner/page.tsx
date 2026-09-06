'use client';

import { useEffect, useState } from 'react';

interface PartnerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  telegram_chat_id: string | null;
  services_offered: string[];
  coverage_radius_km: number;
  rating: number;
  max_daily_leads: number;
  leads_today: number;
  is_active: boolean;
}

export default function PartnerPage() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Record<string, { slug: string; label: string }[]>>>({});
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    telegram_chat_id: '',
    services: [] as string[],
    lat: '',
    lon: '',
    coverage_radius_km: '20',
    max_daily_leads: '10',
  });
  const [leadId, setLeadId] = useState('');
  const [myId, setMyId] = useState('');
  const [contact, setContact] = useState<Record<string, string> | null>(null);

  async function load() {
    const res = await fetch('/api/partners');
    const data = await res.json();
    if (data.success) setPartners(data.partners);
  }
  async function loadServices() {
    const r = await fetch('/api/services');
    const j = await r.json();
    if (j.success) setGrouped(j.grouped);
  }

  useEffect(() => {
    load();
    loadServices();
    const params = new URLSearchParams(window.location.search);
    const l = params.get('lead');
    if (l) setLeadId(l);
  }, []);

  function toggleService(s: string) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg('Salvataggio…');
    const res = await fetch('/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        telegram_chat_id: form.telegram_chat_id,
        services_offered: form.services,
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lon),
        coverage_radius_km: parseInt(form.coverage_radius_km, 10),
        max_daily_leads: parseInt(form.max_daily_leads, 10),
      }),
    });
    const data = await res.json();
    setMsg(data.success ? `Partner creato: ${data.id}` : `Errore: ${data.error}`);
    if (data.success) load();
  }

  async function toggleActive(p: PartnerRow) {
    await fetch('/api/partners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
    });
    load();
  }

  async function accept() {
    setContact(null);
    setMsg('Accettazione…');
    const res = await fetch('/api/leads/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, partnerId: myId }),
    });
    const data = await res.json();
    if (data.success) {
      setContact(data.contact);
      setMsg('Lead accettato. Contatti sbloccati.');
      load();
    } else {
      setMsg(`Errore: ${data.error}`);
    }
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Accetta lead assegnato</h2>
        <div className="row">
          <div>
            <label className="label">Lead ID</label>
            <input className="input" value={leadId} onChange={(e) => setLeadId(e.target.value)} placeholder="UUID lead" />
          </div>
          <div>
            <label className="label">Il tuo Partner ID</label>
            <input className="input" value={myId} onChange={(e) => setMyId(e.target.value)} placeholder="UUID partner" />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={accept}>Accetta lead</button>
        </div>
        {contact && (
          <div className="contact-box">
            <p><strong>{contact.user_name}</strong> — {contact.user_phone} {contact.user_email ? `— ${contact.user_email}` : ''}</p>
            <p className="muted">{contact.extracted_service} [{contact.urgency_level}] — {contact.summary}</p>
            <p style={{ fontSize: 14 }}>{contact.raw_prompt}</p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Registra / configura azienda</h2>
        <form onSubmit={create}>
          <div className="row">
            <div>
              <label className="label">Nome azienda</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="row">
            <div>
              <label className="label">Telefono</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label className="label">Telegram Chat ID</label>
              <input className="input" value={form.telegram_chat_id} onChange={(e) => setForm({ ...form, telegram_chat_id: e.target.value })} placeholder="Da @userinfobot" />
            </div>
          </div>
          <label className="label">Servizi offerti (da catalogo multi-settore)</label>
          {Object.keys(grouped).length === 0 ? (
            <p className="muted">Caricamento catalogo…</p>
          ) : (
            Object.entries(grouped).map(([vertical, cats]) => (
              <div key={vertical} style={{ marginBottom: 10 }}>
                <p className="muted" style={{ textTransform: 'capitalize', fontWeight: 600, margin: '10px 0 6px' }}>{vertical}</p>
                {Object.entries(cats).map(([cat, list]) => (
                  <div key={cat} style={{ marginBottom: 6 }}>
                    <span className="muted" style={{ fontSize: 12 }}>{cat}: </span>
                    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6 }}>
                      {list.map((s) => (
                        <label key={s.slug} className={form.services.includes(s.slug) ? 'chip on' : 'chip'}>
                          <input type="checkbox" checked={form.services.includes(s.slug)} onChange={() => toggleService(s.slug)} style={{ marginRight: 6 }} />
                          {s.label}
                        </label>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}

          <div className="row">
            <div>
              <label className="label">Latitudine sede</label>
              <input className="input" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="45.5845" required />
            </div>
            <div>
              <label className="label">Longitudine sede</label>
              <input className="input" value={form.lon} onChange={(e) => setForm({ ...form, lon: e.target.value })} placeholder="9.2572" required />
            </div>
          </div>
          <div className="row">
            <div>
              <label className="label">Raggio copertura (km)</label>
              <input className="input" value={form.coverage_radius_km} onChange={(e) => setForm({ ...form, coverage_radius_km: e.target.value })} />
            </div>
            <div>
              <label className="label">Max lead/giorno</label>
              <input className="input" value={form.max_daily_leads} onChange={(e) => setForm({ ...form, max_daily_leads: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit">Salva partner</button>
          </div>
        </form>
        {msg && <p className="muted">{msg}</p>}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Partner registrati ({partners.length})</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="partners">
            <thead>
              <tr><th>Nome</th><th>Servizi</th><th>Raggio</th><th>Rating</th><th>Carico</th><th>Stato</th><th></th></tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}<br /><span className="muted" style={{ fontSize: 12 }}>{p.id.slice(0, 8)}</span></td>
                  <td>{p.services_offered.join(', ')}</td>
                  <td>{p.coverage_radius_km} km</td>
                  <td>{p.rating}</td>
                  <td>{p.leads_today}/{p.max_daily_leads}</td>
                  <td><span className={p.is_active ? 'status on' : 'status off'}>{p.is_active ? 'attivo' : 'inattivo'}</span></td>
                  <td><button className="btn btn-secondary" onClick={() => toggleActive(p)}>{p.is_active ? 'Disattiva' : 'Attiva'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
