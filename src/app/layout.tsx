import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'STROBE — Il professionista giusto, vicino a te',
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
              STROBE
            </a>
            <div className="nav-links">
              <a href="/">Richiedi</a>
              <a href="/problemi">Problemi</a>
              <a href="/partner">Sei un professionista?</a>
            </div>
          </div>
        </nav>
        <div className="container">{children}</div>
        {/* Footer minimale — solo mark, come da richiesta */}
        <footer style={{ borderTop: '1px solid var(--card-border)', marginTop: 64, padding: '28px 0', textAlign: 'center' }}>
          <a href="https://shop-brianza.com" target="_blank" rel="noopener" aria-label="Shop Brianza" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <img src="/shop-brianza.svg" alt="" width={36} height={22} style={{ opacity: 0.85 }} />
          </a>
        </footer>
      </body>
    </html>
  );
}
