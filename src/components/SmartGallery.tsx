'use client';
import { useEffect, useState } from 'react';

type Seed = string;

function score(views: number, clicks: number): number {
  if (views === 0) return Math.random(); // novità: esplora
  return clicks / views + Math.random() * 0.05; // exploitation + piccola esplorazione
}

export default function SmartGallery({ seeds, intervalMs = 3800 }: { seeds: Seed[]; intervalMs?: number }) {
  const [ordered, setOrdered] = useState<Seed[]>(seeds);
  const [idx, setIdx] = useState(0);

  // All'accesso: ordina per performance (Smart Photos)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('strobe-photo-stats');
      const stats: Record<string, { v: number; c: number }> = raw ? JSON.parse(raw) : {};
      const sorted = [...seeds].sort((a, b) => score(stats[b]?.v || 0, stats[b]?.c || 0) - score(stats[a]?.v || 0, stats[a]?.c || 0));
      setOrdered(sorted);
      // impression per la prima vista
      for (const s of sorted) {
        if (!stats[s]) stats[s] = { v: 0, c: 0 };
        stats[s].v += 1;
      }
      localStorage.setItem('strobe-photo-stats', JSON.stringify(stats));
      // invio anche a server per aggregazione globale (best-effort)
      fetch('/api/photo-stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seeds: sorted, type: 'view' }) }).catch(() => {});
    } catch {}
  }, [seeds.join(',')]);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % ordered.length), intervalMs);
    return () => clearInterval(id);
  }, [ordered.length, intervalMs]);

  function onInteract(seed: string) {
    try {
      const raw = localStorage.getItem('strobe-photo-stats');
      const stats: Record<string, { v: number; c: number }> = raw ? JSON.parse(raw) : {};
      if (!stats[seed]) stats[seed] = { v: 1, c: 0 };
      stats[seed].c += 1;
      localStorage.setItem('strobe-photo-stats', JSON.stringify(stats));
      fetch('/api/photo-stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seed, type: 'click' }) }).catch(() => {});
    } catch {}
  }

  return (
    <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', height: 320, background: '#eee' }} onClick={() => onInteract(ordered[idx])}>
      {ordered.map((seed, i) => (
        <img
          key={seed}
          src={`https://picsum.photos/seed/${seed}/900/600?blur=2`}
          alt=""
          width={900}
          height={600}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
          onClick={() => onInteract(seed)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 600ms ease',
            cursor: 'pointer',
          }}
        />
      ))}
      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {ordered.map((_, i) => (
          <button key={i} onClick={() => { setIdx(i); onInteract(ordered[i]); }} aria-label={`foto ${i + 1}`} style={{ width: 6, height: 6, borderRadius: 999, border: 0, padding: 0, background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 10, padding: '4px 8px', borderRadius: 999 }}>smart — all&apos;accesso la migliore prima</div>
    </div>
  );
}
