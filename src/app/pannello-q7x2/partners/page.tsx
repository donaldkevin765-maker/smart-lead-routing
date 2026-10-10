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
  is_verified: boolean;
  credits: number;
  created_at: string;
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [q, setQ] = useState('');
  const [filterService, setFilterService] = useState('');
  const [msg, setMsg] = useState('');
  const [creditsDelta, setCreditsDelta] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<PartnerRow | null>(null);
  const [ef, setEf] = useState({ name: '', phone: '', services: '', description: '', radius: 15 });

  async function load() {
    const r = await fetch('/api/partners');
    const j = await r.json();
    if (j.success) setPartners(j.partners);
  }
  useEffect(() => { load(); }, []);

  async function toggle(p: PartnerRow) {
    await fetch('/api/partners', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, is_active: !p.is_active }) });
    load();
  }
  async function verify(p: PartnerRow) {
    await fetch('/api/admin/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partnerId: p.id, is_verified: !p.is_verified }) });
    load();
  }
  async function recharge(p: PartnerRow) {
    const delta = parseInt(creditsDelta[p.id] || '0', 10);
    if (!delta) return;
    await fetch('/api/admin/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partnerId: p.id, creditsDelta: delta }) });
    setCreditsDelta({ ...creditsDelta, [p.id]: '' });
    load();
  }
  function startEdit(p: PartnerRow) {
    setEditing(p);
    setEf({ name: p.name, phone: p.phone || '', services: p.services_offered.join(', '), description: '', radius: p.coverage_radius_km });
  }
  async function saveEdit() {
    if (!editing) return;
    await fetch('/api/admin/partners', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerId: editing.id, name: ef.name, phone: ef.phone || null,
        services_offered: ef.services.split(',').map((s) => s.trim()).filter(Boolean),
        coverage_radius_km: ef.radius,
      }),
    });
    setEditing(null);
    setMsg('Scheda aggiornata ✓');
    load();
  }
  async function remove(p: PartnerRow) {
    if (!confirm(`Eliminare DEFINITIVAMENTE "${p.name}" e tutte le sue recensioni?`)) return;
    await fetch(`/api/admin/partners?partnerId=${p.id}`, { method: 'DELETE' });
    setMsg('Partner eliminato');
    load();
  }
  async function invite(p: PartnerRow) {
    if (!confirm(`Manda l'invito personalizzato a "${p.name}"?\n\nSolo dopo che lo hai contattato di persona — l'email chiude il cerchio, non lo apre.`)) return;
    setMsg('Invio invito…');
    const r = await fetch('/api/admin/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partnerId: p.id }) });
    const j = await r.json();
    setMsg(j.success ? `Invito inviato a ${p.email} ✓` : `Invito non partito: ${j.error}`);
  }

  const filtered = partners.filter((p) => {
    const hay = `${p.name} ${p.email} ${p.phone} ${p.services_offered.join(' ')}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (filterService && !p.services_offered.includes(filterService)) return false;
    return true;
  });

  const services = [...new Set(partners.flatMap((p) => p.services_offered))].sort();

  return (
    <div>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span className="muted"><a href="/pannello-q7x2/partners">Partner</a> · <a href="/pannello-q7x2/verticals">Verticali</a> · <a href="/pannello-q7x2/leads">Audit trail</a> · <a href="/pannello-q7x2/recensioni">Recensioni</a></span>
        <span className="muted" style={{ fontSize: 12 }}>Admin — solo per te</span>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Sala controllo partner — per te</h2>
        <p className="muted">Qui vedi tutto su ogni partner per indirizzarlo al meglio. Chi è nuovo entra da <a href="/partner">/partner</a>, qui tu gestisci. Credito scala solo su Accetta — pay-per-lead professionale.</p>
        <div className="row">
          <div>
            <label className="label">Cerca (nome, email, servizio)</label>
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="es. idraulica o Mario" />
          </div>
          <div>
            <label className="label">Filtra per servizio</label>
            <select className="select" value={filterService} onChange={(e) => setFilterService(e.target.value)}>
              <option value="">Tutti i servizi</option>
              {services.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 13 }}>{filtered.length} partner su {partners.length} — {filtered.filter((p)=>p.is_active).length} attivi</p>
      </div>

      {/* Modifica scheda — panello compatto sotto la tabella */}
      {editing && (
        <div className="card" style={{ border: '2px solid var(--accent)' }}>
          <h3 style={{ marginTop: 0 }}>Modifica: {editing.name}</h3>
          <div className="row">
            <div><label className="label">Nome</label><input className="input" value={ef.name} onChange={(e) => setEf({ ...ef, name: e.target.value })} /></div>
            <div><label className="label">Telefono (vuoto = nessun numero)</label><input className="input" value={ef.phone} onChange={(e) => setEf({ ...ef, phone: e.target.value })} placeholder="+39 039..." /></div>
          </div>
          <div className="row">
            <div><label className="label">Servizi (separati da virgola)</label><input className="input" value={ef.services} onChange={(e) => setEf({ ...ef, services: e.target.value })} placeholder="idraulica, fabbro" /></div>
            <div><label className="label">Raggio (km)</label><input className="input" type="number" min={1} max={100} value={ef.radius} onChange={(e) => setEf({ ...ef, radius: Number(e.target.value) })} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn" style={{ borderRadius: 999 }} onClick={saveEdit}>Salva</button>
            <button className="btn btn-secondary" style={{ borderRadius: 999 }} onClick={() => setEditing(null)}>Annulla</button>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="partners">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Contatti</th>
                <th>Servizi</th>
                <th>Zona / Raggio</th>
                <th>Rating</th>
                <th>Crediti</th>
                <th>Stato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong><br />
                    <span className="muted" style={{ fontSize: 12 }}>{p.id.slice(0, 8)} · {new Date(p.created_at).toLocaleDateString('it-IT')}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {p.email}<br />{p.phone || '—'}<br />
                    <span className="muted">{p.telegram_chat_id ? `TG: ${p.telegram_chat_id}` : 'TG: —'}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>{p.services_offered.join(', ')}</td>
                  <td>{p.coverage_radius_km} km</td>
                  <td>
                    <span className="badge" style={{ background: p.rating >= 4.5 ? 'var(--success-bg)' : 'var(--warn-bg)', color: p.rating >= 4.5 ? 'var(--success)' : 'var(--warn)' }}>{p.rating}★</span>
                    {p.is_verified && <span className="badge" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', marginLeft: 4 }}>✓ Verificato</span>}
                  </td>
                  <td>
                    <strong>{p.credits}</strong>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                      <input className="input" style={{ width: 60, padding: '4px 6px', fontSize: 12 }} value={creditsDelta[p.id] || ''} onChange={(e) => setCreditsDelta({ ...creditsDelta, [p.id]: e.target.value })} placeholder="+5" />
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => recharge(p)}>Ricarica</button>
                    </div>
                  </td>
                  <td><span className={p.is_active ? 'status on' : 'status off'}>{p.is_active ? 'attivo' : 'pausa'}</span></td>
                  <td style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button className="btn btn-secondary" onClick={() => toggle(p)} style={{ padding: '6px 14px', fontSize: 12 }}>{p.is_active ? 'Pausa' : 'Riattiva'}</button>
                    <button className="btn btn-secondary" onClick={() => verify(p)} style={{ padding: '6px 14px', fontSize: 12 }}>{p.is_verified ? 'Togli verifica' : 'Verifica'}</button>
                    <button className="btn btn-secondary" onClick={() => startEdit(p)} style={{ padding: '6px 14px', fontSize: 12 }}>Modifica</button>
                    {!p.is_active && <button className="btn btn-secondary" onClick={() => invite(p)} style={{ padding: '6px 14px', fontSize: 12 }}>📧 Invita</button>}
                    <button onClick={() => remove(p)} style={{ padding: '6px 8px', fontSize: 12, background: 'none', border: 0, color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}>Elimina</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="muted">Nessun partner con questi filtri.</p>}
        {msg && <p className="muted">{msg}</p>}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Come la usi tu (logica)</h3>
        <ul className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
          <li><strong>Nuovo vuole entrare:</strong> lo mandi su <code>/partner</code> → si registra da solo → appare qui.</li>
          <li><strong>Vuoi indirizzare meglio:</strong> filtri per servizio → vedi chi è vicino, con rating alto e carico basso → sai a chi dare priorità a voce.</li>
          <li><strong>Partner non risponde:</strong> lo metti in pausa qui → il waterfall lo salta automatico.</li>
          <li><strong>Info complete:</strong> email/telefono/TG/servizi/raggio/rating/carico — tutto ciò che ti serve per parlare con lui informato.</li>
        </ul>
      </div>
    </div>
  );
}
