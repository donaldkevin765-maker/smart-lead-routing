import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'STROBE — Il professionista giusto, vicino a te',
  description: 'Descrivi il problema, troviamo il professionista più vicino. Routing geolocalizzato.',
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
        <footer style={{ borderTop: '1px solid var(--card-border)', marginTop: 64, padding: '32px 0', background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 24, maxWidth: 980, margin: '0 auto', padding: '0 22px' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 8px' }}>Assistenza</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13, lineHeight: 2 }}>
                <li><a href="/problemi" style={{ color: 'var(--muted)', textDecoration: 'none' }}>FAQ</a></li>
                <li><a href="/admin/leads?token=pubblico" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Tracking</a></li>
                <li><a href="mailto:infostrobe5@gmail.com" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contattaci</a></li>
                <li><a href="/valuta/1" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Resi</a></li>
              </ul>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 8px' }}>Azienda</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13, lineHeight: 2 }}>
                <li><a href="/clienti" style={{ color: 'var(--muted)', textDecoration: 'none' }}>I nostri clienti</a></li>
                <li><a href="/partner" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Diventa partner</a></li>
                <li><a href="https://shop-brianza.com" target="_blank" rel="noopener" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Shop Brianza</a></li>
              </ul>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 8px' }}>Legale</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13, lineHeight: 2 }}>
                <li><a href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy Policy</a></li>
                <li><a href="/termini" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Termini e Condizioni</a></li>
              </ul>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 8px' }}>Newsletter</p>
              <form action="mailto:infostrobe5@gmail.com" method="post" encType="text/plain" style={{ display: 'flex', gap: 6 }}>
                <input className="input" type="email" name="email" placeholder="La tua email" style={{ fontSize: 13 }} />
                <button className="btn" type="submit" style={{ padding: '8px 14px', fontSize: 13 }}>Iscriviti</button>
              </form>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src="/shop-brianza.svg" alt="" width={28} height={18} style={{ opacity: 0.85 }} />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>infostrobe5@gmail.com</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
