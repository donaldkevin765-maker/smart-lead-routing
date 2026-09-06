import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Lead Routing — Trova il professionista più vicino',
  description: 'Richieste geolocalizzate, qualifica AI gratuita, routing intelligente al partner più vicino. Costo zero.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="container">
          <header className="header">
            <strong>Smart Lead Routing</strong>
            <nav>
              <a href="/">Richiedi</a>
              <a href="/partner">Partner</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
