'use client';

import { useEffect, useState } from 'react';

interface ServiceRow { slug: string; label: string; vertical: string; category: string; }

export default function AdminVerticals() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [form, setForm] = useState({ vertical: 'casa', category: '', slug: '', label: '', keywords: '' });
  const [msg, setMsg] = useState('');

  async function load() {
    const r = await fetch('/api/services');
    const j = await r.json();
    if (j.success) setServices(j.services);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg('Salvataggio…');
    const r = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const j = await r.json();
    setMsg(j.success ? 'Aggiunto' : `Errore: ${j.error}`);
    if (j.success) { setForm({ ...form, slug: '', label: '', category: form.category }); load(); }
  }
  async function del(slug: string) {
    if (!confirm(`Elimina ${slug}?`)) return;
    await fetch(`/api/services?slug=${slug}`, { method: 'DELETE' });
    load();
  }

  const grouped: Record<string, ServiceRow[]> = {};
  for (const s of services) {
    if (!grouped[s.vertical]) grouped[s.vertical] = [];
    grouped[s.vertical].push(s);
  }

  return (
    <div>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="muted"><a href="/admin/partners">→ Vai a Sala controllo partner</a> · <a href="/admin/verticals">Verticali</a></span>
        <span className="muted" style={{ fontSize: 12 }}>Admin — solo per te</span>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Verticali & Servizi (punto 4 — multi-settore)</h2>
        <p className="muted">Aggiungere un settore = 1 riga qui. Gemini, match e chip partner si aggiornano da soli — zero codice.</p>
        <form onSubmit={add}>
          <div className="row">
            <div>
              <label className="label">Vertical</label>
              <select className="select" value={form.vertical} onChange={(e) => setForm({ ...form, vertical: e.target.value })}>
                <option value="casa">casa</option>
                <option value="fitness">fitness</option>
                <option value="benessere">benessere</option>
                <option value="servizi">servizi</option>
                <option value="altro">altro (scrivi sotto)</option>
              </select>
              <input className="input" style={{ marginTop: 8 }} placeholder="o nuovo vertical" value={form.vertical} onChange={(e) => setForm({ ...form, vertical: e.target.value.toLowerCase() })} />
            </div>
            <div>
              <label className="label">Categoria</label>
              <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="es. palestre" required />
            </div>
          </div>
          <div className="row">
            <div>
              <label className="label">Slug (unico, minuscolo)</label>
              <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="es. sauna" required />
            </div>
            <div>
              <label className="label">Label</label>
              <input className="input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="es. Sauna" required />
            </div>
          </div>
          <label className="label">Keywords per Gemini</label>
          <input className="input" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="sauna bagno turco wellness" />
          <div style={{ marginTop: 12 }}><button className="btn" type="submit">Aggiungi servizio</button> <span className="muted">{msg}</span></div>
        </form>
      </div>

      {Object.entries(grouped).map(([vertical, list]) => (
        <div key={vertical} className="card">
          <h3 style={{ marginTop: 0, textTransform: 'capitalize' }}>{vertical} ({list.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {list.map((s) => (
              <span key={s.slug} className="chip on">
                {s.label} <span className="muted" style={{ fontSize: 12 }}>({s.slug})</span>{' '}
                <button onClick={() => del(s.slug)} style={{ background: 'none', border: 0, color: 'var(--danger)', cursor: 'pointer', fontWeight: 700 }}>×</button>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
