'use client';

import { useState } from 'react';

// Pannello rapido partner: attiva/disattiva/verifica/crediti in un click.
// WHY: il curl manuale lento — qui gestisci 211 aziende da telefono.
type P = { id: string; name: string; is_active: boolean; is_verified: boolean; credits: number };

export function PartnerQuick({ initial }: { initial: P[] }) {
  const [list, setList] = useState<P[]>(initial);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const shown = list
    .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 40);

  async function patch(id: string, fields: Record<string, unknown>) {
    setBusy(id);
    const r = await fetch('/api/partners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...fields }),
    });
    if (r.ok) setList((cur) => cur.map((p) => (p.id === id ? { ...p, ...(fields as Partial<P>) } : p)));
    setBusy(null);
  }

  const btn = {
    fontSize: 12, padding: '5px 10px', borderRadius: 999, border: '1px solid var(--line)',
    background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' as const,
  };

  return (
    <section className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 650, margin: 0 }}>Gestione partner</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca nome…"
          style={{ padding: '7px 14px', borderRadius: 999, border: '1px solid var(--line)', fontSize: 14, width: 200 }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
        {shown.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, border: '1px solid var(--line)', background: '#fff', flexWrap: 'wrap' }}>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 560, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.credits} cr</span>
            <button style={{ ...btn, color: p.is_verified ? '#34c759' : '#86868b' }} disabled={busy === p.id} onClick={() => patch(p.id, { is_verified: !p.is_verified })}>
              {p.is_verified ? '✓ verificato' : 'verifica'}
            </button>
            <button style={{ ...btn, color: p.is_active ? '#34c759' : '#ff3b30' }} disabled={busy === p.id} onClick={() => patch(p.id, { is_active: !p.is_active })}>
              {p.is_active ? 'attivo' : 'attiva'}
            </button>
            <button style={btn} disabled={busy === p.id} onClick={() => patch(p.id, { credits: p.credits + 5 })}>+5 cr</button>
          </div>
        ))}
        {shown.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>Nessun risultato.</p>}
      </div>
    </section>
  );
}
