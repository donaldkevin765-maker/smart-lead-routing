'use client';

import { useState } from 'react';

// Manda i recap a mano, senza aspettare il lunedì del cron.
export function RecapButton() {
  const [state, setState] = useState<'idle' | 'run' | 'ok' | 'err'>('idle');
  const [info, setInfo] = useState('');

  async function go() {
    if (!confirm('Manda ora il riepilogo settimanale a TUTTI i partner attivi?')) return;
    setState('run');
    const r = await fetch('/api/admin/recap', { method: 'POST' });
    const j = await r.json();
    if (j.success) { setState('ok'); setInfo(`${j.sent || 0} recap inviati${j.deactivated ? `, ${j.deactivated} disattivati` : ''}`); }
    else { setState('err'); setInfo(j.error || 'Errore'); }
  }

  return (
    <button className="btn" style={{ borderRadius: 999 }} onClick={go} disabled={state === 'run'}>
      {state === 'run' ? 'Invio in corso…' : '📧 Manda recap ora'}
      {info && <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8, color: state === 'err' ? '#ffb3ad' : '#c8f0c8' }}>{info}</span>}
    </button>
  );
}
