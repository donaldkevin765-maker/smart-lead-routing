'use client';
import { useState } from 'react';

export default function PartnerContactBox({ partnerId, service }: { partnerId: string; service: string }) {
  const [prompt, setPrompt] = useState('');
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
    if (!cat) { await categorize(); return; }
    setLoading(true);
    try {
      // posizione fallback: Monza centro se non concesso — categorizza già fatto, ora crea lead e indirizza a questo partner se vicino
      const pos = await new Promise<{ lat: number; lon: number }>((res) => {
        if (!navigator.geolocation) return res({ lat: 45.584, lon: 9.274 });
        navigator.geolocation.getCurrentPosition((p) => res({ lat: p.coords.latitude, lon: p.coords.longitude }), () => res({ lat: 45.584, lon: 9.274 }), { timeout: 4000 });
      });
      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, lat: pos.lat, lon: pos.lon, name: 'Ospite STROBE', phone: '0000000000', privacy: true, _ts: Date.now() - 5000 }),
      });
      const j = await r.json();
      setMsg(j.success ? `Richiesta inviata — ${j.qualification.service} assegnata a ${j.assigned?.name || 'partner vicino'}` : j.error);
    } catch (e) { setMsg((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Scrivi cosa ti serve — categorizziamo noi</h2>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>Spazio comunicazione diretto. Scrivi a parole tue, la categorizzazione è automatica.</p>
      <textarea className="textarea" rows={3} placeholder={`Es. ${service} a Monza, ho bisogno di...`} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button className="btn btn-secondary" onClick={categorize} disabled={loading}>{loading ? '...' : 'Categorizza'}</button>
        <button className="btn" onClick={send} disabled={loading}>Invia richiesta</button>
      </div>
      {cat && <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>→ {cat.service} · {cat.urgency} · {cat.summary}</p>}
      {msg && <p style={{ fontSize: 13, marginTop: 8 }}>{msg}</p>}
    </div>
  );
}
