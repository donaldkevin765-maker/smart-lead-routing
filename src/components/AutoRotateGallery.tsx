'use client';
import { useEffect, useState } from 'react';
import { photoUrl } from '@/lib/photoStandard';

export default function AutoRotateGallery({ seeds, intervalMs = 4000 }: { seeds: string[]; intervalMs?: number }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % seeds.length), intervalMs);
    return () => clearInterval(id);
  }, [seeds.length, intervalMs]);

  return (
    <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', height: 320, background: '#eee' }}>
      {seeds.map((seed, i) => (
        <img
          key={seed}
          src={photoUrl(seed, 900, 600, 2)}
          alt=""
          width={900}
          height={600}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 600ms ease',
          }}
        />
      ))}
      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {seeds.map((_, i) => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'background 300ms' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 10, padding: '4px 8px', borderRadius: 999 }}>auto-rotazione · 4 foto</div>
    </div>
  );
}
