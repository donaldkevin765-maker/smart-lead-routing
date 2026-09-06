'use client';

import { useState } from 'react';

export default function ValutaPage({ params }: { params: { id: string } }) {
  const [rating, setRating] = useState(5);
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('Invio…');
    const res = await fetch('/api/leads/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: params.id, rating }),
    });
    const data = await res.json();
    setMsg(data.success ? 'Grazie! Valutazione registrata.' : `Errore: ${data.error}`);
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Valuta il servizio</h2>
      <p className="muted">Lead {params.id}</p>
      <form onSubmit={submit}>
        <label className="label">Stelle (1-5)</label>
        <select className="select" value={rating} onChange={(e) => setRating(parseInt(e.target.value, 10))}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} stelle</option>
          ))}
        </select>
        <div style={{ marginTop: 12 }}>
          <button className="btn" type="submit">Invia valutazione</button>
        </div>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
