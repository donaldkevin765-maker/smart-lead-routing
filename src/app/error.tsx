'use client';

/** Error boundary globale — mai schermata bianca per l'utente */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 8px' }}>Qualcosa è andato storto</h1>
      <p style={{ color: 'var(--muted)', fontSize: 16, margin: '0 0 24px' }}>Niente panico — riprova, di solito funziona alla seconda.</p>
      <button className="btn" style={{ borderRadius: 999 }} onClick={reset}>Riprova</button>
    </div>
  );
}
