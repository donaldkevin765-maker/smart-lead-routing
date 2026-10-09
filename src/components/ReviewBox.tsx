'use client';
import { useEffect, useState } from 'react';

type Review = { id: string; author_name: string; rating: number; comment: string; source: string; created_at: string };

/** Recensioni: copiate dalle loro pagine (google/sito) + i nostri clienti votano qui */
export default function ReviewBox({ partnerId }: { partnerId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [count, setCount] = useState(0);
  const [avg, setAvg] = useState(0);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch(`/api/reviews?partnerId=${partnerId}`);
    const j = await r.json();
    if (j.success) { setReviews(j.reviews); setCount(j.count); setAvg(j.avg); }
  }
  useEffect(() => { load(); }, [partnerId]);

  async function send() {
    setLoading(true); setMsg('');
    try {
      const r = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partnerId, authorName: name, rating, comment }) });
      const j = await r.json();
      if (j.success) { setName(''); setComment(''); setMsg('Grazie! Recensione pubblicata.'); load(); }
      else setMsg(j.error);
    } catch (e) { setMsg((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Recensioni</h2>
        {count > 0 && <span style={{ fontWeight: 700, color: '#eab308' }}>★ {avg.toFixed(1)}</span>}
        <span className="muted" style={{ fontSize: 13 }}>{count} recensioni</span>
      </div>

      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        {reviews.length === 0 && <p className="muted" style={{ fontSize: 14 }}>Nessuna recensione ancora — sii il primo a valutare.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 14 }}>{r.author_name}</strong>
              <span style={{ color: '#eab308', fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5 }}>{r.comment}</p>
            <small className="muted" style={{ fontSize: 11 }}>
              {new Date(r.created_at).toLocaleDateString('it-IT')} · {r.source === 'strobe' ? 'cliente STROBE' : `recensione ${r.source}`}
            </small>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <strong style={{ fontSize: 14 }}>Valuta questo partner</strong>
        <div className="row" style={{ marginTop: 8 }}>
          <input className="input" placeholder="Il tuo nome" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          <select className="select" value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ maxWidth: 120 }}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} {n}</option>)}
          </select>
        </div>
        <textarea className="input" rows={3} placeholder="La tua esperienza (min 10 caratteri)" value={comment} maxLength={600} onChange={(e) => setComment(e.target.value)} style={{ marginTop: 8 }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={send} disabled={loading || !name.trim() || comment.trim().length < 10} style={{ borderRadius: 999 }}>
            {loading ? '...' : 'Pubblica recensione'}
          </button>
          {msg && <span style={{ fontSize: 13 }} className={msg.startsWith('Grazie') ? '' : 'muted'}>{msg}</span>}
        </div>
      </div>
    </section>
  );
}
