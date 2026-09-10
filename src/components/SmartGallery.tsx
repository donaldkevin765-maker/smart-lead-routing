'use client';
import { useEffect, useState } from 'react';
import { photoUrl } from '@/lib/photoStandard';

type Seed = string;

export default function SmartGallery({ seeds }: { seeds: Seed[] }) {
  const [ordered, setOrdered] = useState<Seed[]>(seeds);
  const [idx, setIdx] = useState(0);

  // All'accesso: mostra prima la foto relativa a cosa ha cercato su SEO (query → seed)
  useEffect(() => {
    try {
      const q = (new URLSearchParams(window.location.search).get('q') || new URLSearchParams(window.location.search).get('prompt') || '').toLowerCase();
      let sorted = [...seeds];
      if (q) {
        // keyword → seed: se la query contiene parola, porta quel seed in prima posizione
        const hit = seeds.find((s) => q.includes(s.split('-')[1]) || q.includes(s.split('-').pop() || ''));
        if (hit) sorted = [hit, ...seeds.filter((s) => s !== hit)];
      }
      setOrdered(sorted);
      setIdx(0);
    } catch {}
  }, [seeds.join(',')]);

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
          src={photoUrl(seed, 900, 600, 2)}
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
