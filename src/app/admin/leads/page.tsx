'use client';

import { useEffect, useState } from 'react';

interface LeadRow { id: string; user_name: string; extracted_service: string | null; urgency_level: string | null; status: string; assigned_partner_id: string | null; created_at: string; }
interface Attempt { id: string; lead_id: string; partner_id: string; status: string; sent_at: string; timeout_at: string; responded_at: string | null; }

export default function AdminLeads() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [attempts, setAttempts] = useState<Record<string, Attempt[]>>({});
  const [partners, setPartners] = useState<Record<string, string>>({});

  async function load() {
    const sb = await fetch('/api/partners').then((r) => r.json());
    if (sb.success) {
      const map: Record<string, string> = {};
      for (const p of sb.partners as { id: string; name: string }[]) map[p.id] = p.name;
      setPartners(map);
    }
    // Leads diretti da Supabase via API leads? Usiamo fetch diretto con service via /api/admin/leads
    const r = await fetch('/api/admin/leads');
    const j = await r.json();
    if (j.success) {
      setLeads(j.leads);
      setAttempts(j.attemptsByLead);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="muted"><a href="/admin/partners">← Partner</a> · <a href="/admin/verticals">Verticali</a> · <strong>Audit trail lead</strong></span>
        <button className="btn btn-secondary" onClick={load} style={{ padding: '6px 14px', fontSize: 13 }}>Aggiorna</button>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Audit trail — timeline professionale per ogni lead</h2>
        <p className="muted">Prova che il sistema ha lavorato: chi ha ricevuto, quando, perché riassegnato. Se un partner dice "non ho ricevuto", qui hai la verità.</p>
      </div>

      {leads.length === 0 ? (
        <div className="card"><p className="muted">Nessun lead ancora.</p></div>
      ) : (
        leads.map((l) => (
          <div key={l.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <strong>{l.extracted_service || 'generico'} <span className={`badge badge-${l.urgency_level || 'low'}`}>{l.urgency_level || '—'}</span></strong>
              <span className="muted" style={{ fontSize: 13 }}>{new Date(l.created_at).toLocaleString('it-IT')} · {l.status} · {l.id.slice(0, 8)}</span>
            </div>
            <p className="muted" style={{ fontSize: 14, margin: '6px 0 0' }}>Cliente: {l.user_name} · Assegnato: {l.assigned_partner_id ? partners[l.assigned_partner_id] || l.assigned_partner_id.slice(0, 8) : '—'}</p>
            <div style={{ marginTop: 10, borderTop: '1px solid var(--card-border)', paddingTop: 10 }}>
              {(attempts[l.id] || []).map((a) => (
                <div key={a.id} style={{ fontSize: 13, display: 'flex', gap: 12, padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span className="muted">{new Date(a.sent_at).toLocaleTimeString('it-IT')}</span>
                  <span><strong>{partners[a.partner_id] || a.partner_id.slice(0, 8)}</strong></span>
                  <span className={a.status === 'accepted' ? 'status on' : a.status === 'expired' ? 'status off' : 'muted'}>{a.status}</span>
                  <span className="muted">scade {new Date(a.timeout_at).toLocaleTimeString('it-IT')}</span>
                  {a.responded_at && <span className="muted">risposto {new Date(a.responded_at).toLocaleTimeString('it-IT')}</span>}
                </div>
              ))}
              {(attempts[l.id] || []).length === 0 && <span className="muted" style={{ fontSize: 13 }}>Nessun tentativo — in attesa di match</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
