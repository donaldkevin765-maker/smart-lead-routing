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
              <a href="/partner">Per i partner</a>
              <a href="/admin/verticals">Admin</a>
            </div>
          </div>
        </nav>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
