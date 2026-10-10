'use client';

import { useEffect, useState } from 'react';

type Rev = {
  id: string; partner_id: string; rating: number; author_name: string; comment: string;
  source: string; source_url: string | null; created_at: string; partners?: { name: string };
};
type P = { id: string; name: string };

// Poteri CEO sulle recensioni: incolla quelle VERE (google/sito + URL fonte) e cancella lo spam.
export default function RecensioniPage() {
  const [revs, setRevs] = useState<Rev[]>([]);
  const [partners, setPartners] = useState<P[]>([]);
  const [msg, setMsg] = useState('');
  const [f, setF] = useState({ partnerId: '', authorName: '', rating: 5, comment: '', source: 'google', sourceUrl: '' });

  async function load() {
    const [r, p] = await Promise.all([fetch('/api/admin/reviews').then((x) => x.json()), fetch('/api/partners').then((x) => x.json())]);
    if (r.success) setRevs(r.reviews);
    if (p.success) setPartners(p.partners.map((x: { id: string; name: string }) => ({ id: x.id, name: x.name })));
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch('/api/admin/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const j = await r.json();
    setMsg(j.success ? 'Recensione aggiunta ✓' : j.error || 'Errore');
    if (j.success) { setF({ ...f, authorName: '', comment: '', sourceUrl: '' }); load(); }
  }

  async function del(id: string) {
    if (!confirm('Cancellare questa recensione?')) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
    load();
  }

  const input = { padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 14, width: '100%' } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 650, margin: 0 }}>Pannello · Recensioni</p>
        <h1 style={{ fontSize: 'clamp(24px,4vw,32px)', fontWeight: 700, letterSpacing: '-0.03em', margin: '6px 0 0' }}>Moderazione recensioni</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Incolla quelle vere da Google/sito (con URL fonte) · cancella spam</p>
      </div>

      <form onSubmit={add} className="card" style={{ padding: 20, display: 'grid', gap: 10 }}>
        <strong style={{ fontSize: 15 }}>Incolla recensione vera</strong>
        <select value={f.partnerId} onChange={(e) => setF({ ...f, partnerId: e.target.value })} style={input} required>
          <option value="">— Scegli il partner —</option>
          {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input placeholder="Nome di chi ha recensito" value={f.authorName} onChange={(e) => setF({ ...f, authorName: e.target.value })} style={input} required />
        <textarea placeholder="Testo della recensione (copia-lo per intero)" value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} style={{ ...input, minHeight: 80, resize: 'vertical' }} required />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 130px' }}>
            <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} style={input}>
              <option value="google">Google</option>
              <option value="sito">Sito ufficiale</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <select value={f.rating} onChange={(e) => setF({ ...f, rating: Number(e.target.value) })} style={input}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
            </select>
          </div>
        </div>
        <input placeholder="URL dove l'hai letta (obbligatorio)" value={f.sourceUrl} onChange={(e) => setF({ ...f, sourceUrl: e.target.value })} style={input} required />
        <button className="btn" style={{ borderRadius: 999, justifySelf: 'start' }} type="submit">Aggiungi</button>
        {msg && <span style={{ fontSize: 13, color: msg.includes('✓') ? 'var(--success)' : 'var(--danger)' }}>{msg}</span>}
      </form>

      <section className="card" style={{ padding: 20 }}>
        <strong style={{ fontSize: 15 }}>{revs.length} recensioni nel sistema</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, maxHeight: 520, overflowY: 'auto' }}>
          {revs.map((r) => (
            <div key={r.id} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 14 }}>{r.partners?.name || '?'}</strong>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{'★'.repeat(r.rating)} · {r.source} · {new Date(r.created_at).toLocaleDateString('it-IT')}</span>
              </div>
              <p style={{ fontSize: 13, margin: '6px 0 4px', color: 'var(--text-2)' }}>{r.author_name}: {r.comment}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {r.source_url && <a href={r.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--accent)' }}>fonte ↗</a>}
                <button onClick={() => del(r.id)} style={{ background: 'none', border: 0, color: 'var(--danger)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Cancella</button>
              </div>
            </div>
          ))}
          {revs.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>Nessuna recensione ancora.</p>}
        </div>
      </section>
    </div>
  );
}
