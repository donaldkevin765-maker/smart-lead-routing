'use client';
import { useEffect, useMemo, useState } from 'react';

type Review = { id: string; author_name: string; rating: number; comment: string; source: string; created_at: string };

const initials = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
const when = (d: string) => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days <= 0) return 'oggi';
  if (days === 1) return 'ieri';
  if (days < 30) return `${days} giorni fa`;
  if (days < 365) return `${Math.floor(days / 30)} mesi fa`;
  return `${Math.floor(days / 365)} anni fa`;
};

/** Recensioni standard Google: media grande, distribuzione stelle, ordinamento, schede pulite */
export default function ReviewBox({ partnerId }: { partnerId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [count, setCount] = useState(0);
  const [avg, setAvg] = useState(0);
  const [sort, setSort] = useState<'recent' | 'highest' | 'oldest'>('recent');
  const [writing, setWriting] = useState(false);
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
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [partnerId]);

  const dist = useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    for (const r of reviews) d[5 - r.rating]++;
    return d;
  }, [reviews]);

  const sorted = useMemo(() => {
    const c = [...reviews];
    if (sort === 'recent') c.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    if (sort === 'oldest') c.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    if (sort === 'highest') c.sort((a, b) => b.rating - a.rating || +new Date(b.created_at) - +new Date(a.created_at));
    return c;
  }, [reviews, sort]);

  async function send() {
    setLoading(true); setMsg('');
    try {
      const r = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partnerId, authorName: name, rating, comment }) });
      const j = await r.json();
      if (j.success) { setName(''); setComment(''); setRating(5); setWriting(false); setMsg('Recensione pubblicata.'); load(); }
      else setMsg(j.error);
    } catch (e) { setMsg((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <section style={{ marginTop: 32, borderTop: '1px solid var(--card-border)', paddingTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 650 }}>Recensioni</h2>
        <button className="btn btn-secondary" onClick={() => setWriting((w) => !w)} style={{ borderRadius: 999, padding: '9px 18px', fontSize: 13 }}>
          {writing ? 'Chiudi' : 'Scrivi una recensione'}
        </button>
      </div>

      {/* Riepilogo grande stile Google */}
      {count > 0 && (
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', margin: '16px 0 4px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1 }}>{avg.toFixed(1)}</div>
            <div style={{ color: '#eab308', fontSize: 15, marginTop: 4 }}>{'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{count} recensioni</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {[5, 4, 3, 2, 1].map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span className="muted" style={{ width: 10, textAlign: 'right' }}>{s}</span>
                <span style={{ color: '#eab308' }}>★</span>
                <div style={{ flex: 1, height: 8, background: 'var(--card-border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${count ? (dist[5 - s] / count) * 100 : 0}%`, height: '100%', background: '#eab308', borderRadius: 99 }} />
                </div>
                <span className="muted" style={{ width: 24, textAlign: 'right' }}>{dist[5 - s]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Google-like compatto */}
      {writing && (
        <div style={{ border: '1px solid var(--card-border)', borderRadius: 16, padding: 16, margin: '14px 0', background: '#fbfbfd' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="input" placeholder="Nome" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} style={{ maxWidth: 220 }} />
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stelle`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: n <= rating ? '#eab308' : 'var(--muted)', padding: 0, lineHeight: 1 }}>
                  {n <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
          <textarea className="input" rows={3} placeholder="Come è andata la tua esperienza?" value={comment} maxLength={600} onChange={(e) => setComment(e.target.value)} style={{ marginTop: 10 }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
            <button className="btn btn-secondary" onClick={send} disabled={loading || !name.trim() || comment.trim().length < 10} style={{ borderRadius: 999 }}>
              {loading ? '...' : 'Pubblica'}
            </button>
            {msg && <span style={{ fontSize: 13 }} className="muted">{msg}</span>}
          </div>
        </div>
      )}

      {/* Ordinamento */}
      {count > 0 && (
        <div style={{ display: 'flex', gap: 6, margin: '14px 0 10px' }}>
          {([['recent', 'Più recenti'], ['highest', 'Voto più alto'], ['oldest', 'Più vecchie']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setSort(k)} style={{
              border: '1px solid ' + (sort === k ? 'var(--accent)' : 'var(--card-border)'), background: sort === k ? 'var(--accent-soft)' : 'transparent',
              color: sort === k ? 'var(--accent)' : 'var(--text)', borderRadius: 999, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
            }}>{l}</button>
          ))}
        </div>
      )}

      {/* Elenco schede pulite */}
      <div>
        {count === 0 && <p className="muted" style={{ fontSize: 14 }}>Nessuna recensione. Sei il primo: valuta questo partner.</p>}
        {sorted.map((r) => (
          <div key={r.id} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid var(--card-border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 650, fontSize: 14, flexShrink: 0 }}>
              {initials(r.author_name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 14 }}>{r.author_name}</strong>
                <span className="muted" style={{ fontSize: 12 }}>{when(r.created_at)}</span>
              </div>
              <div style={{ color: '#eab308', fontSize: 13, margin: '2px 0 4px' }}>
                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                <span className="muted" style={{ fontSize: 11, marginLeft: 8 }}>
                  {r.source === 'strobe' ? 'recensione verificata STROBE' : `origine: ${r.source}`}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{r.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
