import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Lead Routing — Il professionista giusto, vicino a te',
  description: 'Descrivi il problema, troviamo il professionista più vicino. Qualifica AI e routing geolocalizzato.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <a className="brand" href="/">
              <span className="brand-dot" />
              Smart Lead Routing
            </a>
            <div className="nav-links">
              <a href="/">Richiedi</a>
              <a href="/problemi">Problemi</a>
              <a href="/partner">Sei un professionista?</a>
            </div>
          </div>
        </nav>
        <div className="container">{children}</div>
        {/* Footer tecnologico stile tarafab.ai — infrastruttura, senza fronzoli, solo mark */}
        <footer style={{ borderTop: '1px solid var(--card-border)', marginTop: 64, padding: '32px 0', textAlign: 'center' }}>
          <a href="https://shop-brianza.com" target="_blank" rel="noopener" aria-label="Shop Brianza" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/shop-brianza.svg" alt="" width={36} height={22} style={{ opacity: 0.85, filter: 'contrast(1.1)' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--muted)', fontWeight: 600 }}>SHOP BRIANZA</span>
          </a>
        </footer>
      </body>
    </html>
  );
}
