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
        <footer style={{ borderTop: '1px solid var(--card-border)', marginTop: 48, padding: '20px 0', textAlign: 'center' }}>
          <a href="https://shop-brianza.com" target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--muted)', fontSize: 13 }}>
            <img src="/shop-brianza.svg" alt="Shop Brianza" width={22} height={22} style={{ borderRadius: 6 }} />
            Un progetto <strong style={{ color: 'var(--text-2)', fontWeight: 600 }}>Shop Brianza</strong> — azienda madre
          </a>
        </footer>
      </body>
    </html>
  );
}
