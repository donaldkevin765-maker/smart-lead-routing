import Link from 'next/link';

/** 404 pulita stile Apple — mai pagina bianca */
export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 650, margin: 0 }}>404</p>
      <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 700, letterSpacing: '-0.03em', margin: '10px 0 8px' }}>Pagina non trovata</h1>
      <p style={{ color: 'var(--muted)', fontSize: 17, margin: '0 0 26px' }}>Il link è scaduto o non esiste. Ma il problema lo risolviamo lo stesso.</p>
      <Link href="/" className="btn" style={{ borderRadius: 999 }}>Torna alla home</Link>
    </div>
  );
}
