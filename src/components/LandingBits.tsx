'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Reveal allo scroll — supporta prefers-reduced-motion */
export function Reveal({ children, delay = 0, as: Tag = 'div' }: { children: ReactNode; delay?: number; as?: 'div' | 'section' | 'h1' | 'p' }) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as never} style={{
      opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(18px)',
      transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
    }}>{children}</Tag>
  );
}

/** Contatore stile Apple — conta al primo reveal */
export function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now(), dur = 1100;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/** Demo live: la richiesta viene smistata in tempo reale (proof, non promessa) */
export function RouteDemo() {
  const scenario = [
    { text: 'Perde acqua sotto il lavandino', who: 'Idraulico', dist: '2.1 km', eta: '35 min' },
    { text: 'Chiedo tolettatura per il mio cane', who: 'Toelettatura', dist: '1.4 km', eta: 'su appuntamento' },
    { text: 'Freni che stridono, serve meccanico', who: 'Meccanico', dist: '3.8 km', eta: 'oggi pomeriggio' },
  ];
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<'typing' | 'routing' | 'done'>('typing');

  useEffect(() => {
    const s = scenario[i].text;
    let c = 0, timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (c <= s.length) { setTyped(s.slice(0, c)); c++; timer = setTimeout(step, 38); }
      else { setPhase('routing'); timer = setTimeout(() => { setPhase('done'); timer = setTimeout(reset, 3400); }, 850); }
    };
    const reset = () => { setPhase('typing'); setTyped(''); setI((v) => (v + 1) % scenario.length); };
    setTyped(''); setPhase('typing');
    timer = setTimeout(step, 500);
    return () => clearTimeout(timer);
  }, [i]);

  const s = scenario[i];
  return (
    <div style={{ border: '1px solid var(--card-border)', borderRadius: 22, padding: 20, background: '#fbfbfd', boxShadow: '0 12px 40px rgba(0,0,0,.05)' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <span style={{ width: 10, height: 10, borderRadius: 99, background: '#ff5f57' }} />
        <span style={{ width: 10, height: 10, borderRadius: 99, background: '#febc2e' }} />
        <span style={{ width: 10, height: 10, borderRadius: 99, background: '#28c840' }} />
      </div>
      <div style={{ minHeight: 54, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
        {typed}<span style={{ opacity: phase === 'typing' ? 1 : 0, borderRight: '2px solid var(--accent)', marginLeft: 1 }} />
      </div>
      <div style={{ marginTop: 12, opacity: phase === 'routing' ? 0.4 : 1, transform: phase === 'routing' ? 'scale(.98)' : 'none', transition: '.35s' }}>
        {phase !== 'typing' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: '#fff', border: '1px solid var(--card-border)', borderRadius: 14, padding: '12px 14px' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 650 }}>{s.who} verificato</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.dist} da te · {s.eta}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 650, color: '#34c759', background: 'rgba(52,199,89,.12)', padding: '5px 12px', borderRadius: 99 }}>
              {phase === 'done' ? '✓ Inviato' : 'Smistamento…'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
