'use client';
import { useState } from 'react';

export default function PartnerContactBox({ partnerId, service }: { partnerId: string; service: string }) {
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [cat, setCat] = useState<{ service: string; urgency: string; summary: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function categorize() {
    if (prompt.trim().length < 10) { setMsg('Scrivi almeno 10 caratteri'); return; }
    setLoading(true); setMsg('');
    try {
      const r = await fetch('/api/qualify-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      const j = await r.json();
      if (j.success) { setCat(j.qualification); setMsg(`Categorizzato: ${j.qualification.service} · ${j.qualification.urgency}`); }
      else setMsg(j.error);
    } catch (e) { setMsg((e as Error).message); }
    finally { setLoading(false); }
  }

  async function send() {
    if (!name.trim() || !phone.trim()) { setMsg('Nome e telefono per farti ricontattare — altrimenti puoi solo curiosare'); return; }
    if (!privacy) { setMsg('Accetta la privacy per essere ricontattato'); return; }
    if (!cat) { await categorize(); if (!cat) return; }
    setLoading(true);
    try {
      const pos = await new Promise<{ lat: number; lon: number }>((res) => {
        if (!navigator.geolocation) return res({ lat: 45.584, lon: 9.274 });
        navigator.geolocation.getCurrentPosition((p) => res({ lat: p.coords.latitude, lon: p.coords.longitude }), () => res({ lat: 45.584, lon: 9.274 }), { timeout: 4000 });
      });
      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, lat: pos.lat, lon: pos.lon, name, phone, privacy, _ts: Date.now() - 5000 }),
      });
      const j = await r.json();
      setMsg(j.success ? `Richiesta inviata — ${j.qualification.service} assegnata a ${j.assigned?.name || 'partner vicino'}` : j.error);
    } catch (e) { setMsg((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <div className="card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', fontSize: 14 }}>✦</span>
        <h2 style={{ margin: 0, fontSize: 22, letterSpacing: '-0.02em' }}>Di cosa hai bisogno?</h2>
      </div>
      <p className="muted" style={{ fontSize: 13.5, margin: '4px 0 14px', lineHeight: 1.4 }}>Descrivila come vuoi. Ti diciamo subito chi può aiutarti — <strong style={{ color: 'var(--text)', fontWeight: 600 }}>senza dare il numero</strong>.</p>
      <textarea className="textarea" rows={3} placeholder={`Es. ${service} a Monza, perde acqua in cucina da stamattina...`} value={prompt} onChange={(e) => { setPrompt(e.target.value); if (cat) setCat(null); }} style={{ fontSize: 16, borderRadius: 14 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={categorize} disabled={loading || prompt.trim().length < 10} style={{ borderRadius: 999, padding: '11px 20px', fontSize: 14, fontWeight: 600 }}>{loading ? '...' : 'Vedi chi può aiutarmi'}</button>
        {cat && <span style={{ fontSize: 13, background: 'var(--success-bg)', color: 'var(--success)', padding: '6px 12px', borderRadius: 999, fontWeight: 600 }}>→ {cat.service} · {cat.urgency}</span>}
      </div>

      {cat && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--card-border)', animation: 'rise 0.3s var(--spring)' }}>
          <p style={{ fontSize: 13, margin: '0 0 10px', fontWeight: 600 }}>Vuoi essere ricontattato per <strong>{cat.service}</strong>?</p>
          <p className="muted" style={{ fontSize: 12, margin: '0 0 10px' }}>Lascia nome e telefono solo se vuoi — altrimenti hai già visto la categoria.</p>
          <div className="row">
            <div><label className="label" style={{ marginTop: 0 }}>Nome</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mario" /></div>
            <div><label className="label" style={{ marginTop: 0 }}>Telefono</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="3XX XXX XXXX" /></div>
          </div>
          <label style={{ display: 'flex', gap: 8, marginTop: 10, fontSize: 12, color: 'var(--muted)' }}><input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} /> Accetto privacy per essere ricontattato su questo servizio</label>
          <button className="btn" onClick={send} disabled={loading} style={{ marginTop: 12, background: '#111', borderRadius: 999, padding: '12px 22px' }}>Invia richiesta — redirect immediato →</button>
        </div>
      )}
      {!cat && <p className="muted" style={{ fontSize: 11, marginTop: 10 }}>Nessun dato richiesto per vedere la categoria. Decidi dopo se lasciare il numero.</p>}
      {cat && <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>→ {cat.service} · {cat.urgency} · {cat.summary}</p>}
      {msg && <p style={{ fontSize: 13, marginTop: 8 }}>{msg}</p>}
    </div>
  );
}
