import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase';
import { PartnerQuick } from './PartnerQuick';

export const dynamic = 'force-dynamic';

// Pannello unico: metriche del sistema + gestione in un colpo.
// WHY: prima non c'era una vista d'insieme — solo pagine separate da ricordare.
export default async function AdminHome() {
  const sb = getSupabaseServer();

  const [partners, leads, reviews, svcs] = await Promise.all([
    sb.from('partners').select('id,name,is_active,is_verified,credits'),
    sb.from('leads').select('status,created_at'),
    sb.from('reviews').select('id,source,rating'),
    sb.from('services').select('id'),
  ]);

  const ps = (partners.data || []) as { id: string; name: string; is_active: boolean; is_verified: boolean; credits: number }[];
  const ls = (leads.data || []) as { status: string; created_at: string }[];
  const rs = (reviews.data || []) as { source: string; rating: number }[];

  const weekAgo = Date.now() - 7 * 86400000;
  const stats = [
    { k: 'Partner attivi', v: ps.filter((p) => p.is_active).length, sub: `${ps.length} totali` },
    { k: 'Da verificare', v: ps.filter((p) => !p.is_verified).length, sub: 'pronti al contatto' },
    { k: 'Lead', v: ls.length, sub: `${ls.filter((l) => new Date(l.created_at).getTime() > weekAgo).length} questa settimana` },
    { k: 'Recensioni', v: rs.length, sub: `${rs.filter((r) => r.source === 'strobe').length} dai nostri clienti` },
    { k: 'Servizi', v: svcs.data?.length || 0, sub: 'catalogo live' },
    { k: 'Crediti in circolo', v: ps.reduce((a, p) => a + p.credits, 0), sub: 'somma partner' },
  ];

  const links = [
    { href: '/pannello-q7x2/leads', t: 'Lead', d: 'Accettati, scaduti, in attesa' },
    { href: '/pannello-q7x2/partners', t: 'Schede complete', d: 'Tutti i campi, email e contatti' },
    { href: '/pannello-q7x2/verticals', t: 'Catalogo', d: 'Verticali e servizi' },
    { href: '/partner', t: 'Vista pubblica', d: 'Come appare il form ai partner' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 650, margin: 0 }}>Pannello</p>
        <h1 style={{ fontSize: 'clamp(26px,4vw,36px)', fontWeight: 700, letterSpacing: '-0.03em', margin: '6px 0 0' }}>Tutto il sito, una schermata</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
        {stats.map((s) => (
          <div key={s.k} className="card" style={{ padding: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{s.k}</p>
            <p style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: '4px 0 0' }}>{s.v}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="card" style={{ padding: 16, textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <p style={{ fontSize: 15, fontWeight: 620, margin: 0 }}>{l.t}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>{l.d}</p>
          </Link>
        ))}
      </div>

      <PartnerQuick initial={ps.sort((a, b) => Number(b.is_active) - Number(a.is_active) || a.name.localeCompare(b.name))} />
    </div>
  );
}
