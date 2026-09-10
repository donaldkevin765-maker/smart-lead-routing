import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'STROBE — Il professionista giusto, vicino a te',
  description: 'Descrivi il problema, troviamo il professionista più vicino. Routing geolocalizzato.',
};

const linkStyle = { color: '#86868b', textDecoration: 'none', transition: 'color 0.2s' } as const;

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

        {/* Footer STROBE premium — progettato sul contesto: routing vicino, fiducia, Monza Brianza */}
        <footer style={{ borderTop: '1px solid var(--card-border)', marginTop: 64, background: '#fff' }}>
          <div style={{ maxWidth: 980, margin: '0 auto', padding: '40px 22px 20px', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.4fr', gap: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span className="brand-dot" />
                <strong style={{ fontSize: 15, letterSpacing: '-0.01em' }}>STROBE</strong>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
                Il professionista giusto, vicino a te. Routing geolocalizzato Monza Brianza — paghi solo se accetti.
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>📍 Monza Brianza · ✉️ <a href="mailto:infostrobe5@gmail.com" style={linkStyle}>infostrobe5@gmail.com</a></p>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px', color: 'var(--text)' }}>Assistenza</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13.5, lineHeight: 2.1 }}>
                <li><a href="/problemi" style={linkStyle}>FAQ — problemi comuni</a></li>
                <li><a href="/clienti" style={linkStyle}>Tracking richiesta</a></li>
                <li><a href="mailto:infostrobe5@gmail.com" style={linkStyle}>Contattaci</a></li>
                <li><a href="/termini" style={{ ...linkStyle }}>Garanzia — paghi solo se accetti</a></li>
              </ul>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px', color: 'var(--text)' }}>STROBE</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13.5, lineHeight: 2.1 }}>
                <li><a href="/clienti" style={linkStyle}>I nostri clienti</a></li>
                <li><a href="/partner" style={linkStyle}>Diventa partner</a></li>
                <li><a href="/privacy" style={linkStyle}>Privacy Policy</a></li>
                <li><a href="/termini" style={linkStyle}>Termini e Condizioni</a></li>
              </ul>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px', color: 'var(--text)' }}>Resta aggiornato</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 10px' }}>Nuovi servizi e partner vicino a te.</p>
              <form action="mailto:infostrobe5@gmail.com" method="post" encType="text/plain" style={{ display: 'flex', gap: 6 }}>
                <input className="input" type="email" name="email" placeholder="La tua email" style={{ fontSize: 13, borderRadius: 999 }} />
                <button className="btn" type="submit" style={{ padding: '10px 18px', fontSize: 13, borderRadius: 999, background: '#111' }}>Iscriviti</button>
              </form>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/shop-brianza.svg" alt="" width={32} height={20} style={{ opacity: 0.8 }} />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>© STROBE Monza Brianza</span>
              </div>
            </div>
          </div>
          <div style={{ maxWidth: 980, margin: '0 auto', padding: '16px 22px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 11, color: 'var(--muted)' }}>
            <span>© 2026 STROBE — Routing geolocalizzato vicino a te</span>
            <span>Monza Brianza · <a href="mailto:infostrobe5@gmail.com" style={linkStyle}>infostrobe5@gmail.com</a></span>
          </div>
        </footer>
      </body>
    </html>
  );
}
