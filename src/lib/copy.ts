/**
 * COPY — unica fonte dei testi magnetici (home + landing).
 * REGOLE DI STILE: frasi brevi, ritmo, zero gergo tecnico, beneficio prima di tutto.
 * Chi modifica il tono, modifica QUI (mai testi sparsi nei componenti).
 */
export const COPY = {
  // — Home —
  homeEyebrow: 'Gratis · Nessuna registrazione · Zero telefonate a caso',
  homeH1: 'Il problema giusto, alla persona giusta.',
  homeSub: 'Una frase basta. A trovarlo chi sa farlo, pensiamo noi.',

  // — Landing —
  landingEyebrow: 'Chi siamo',
  landingH1: 'Il problema giusto,\nalla persona giusta.',
  landingLead: 'Tu scrivi cosa ti serve. Noi trovi chi è adatto — vicino, verificato, libero. Tu non chiami nessuno.',
  landingDemoNote: 'Il flusso reale. Nessun campo, nessuna registrazione.',
  landingSteps: 'Tre passi. Tutto qui.',
  landingIdentityTitle: 'Nati a Monza,\nda un problema stupido.',
  landingIdentity1: 'Cercare un professionista in Brianza significava telefonare a caso, aspettare, sperare. Abbiamo costruito il sistema che avremmo voluto avere noi: uno, diretto, che risponde.',
  landingIdentity2: 'Non vendiamo niente a chi cerca. Lavoriamo con i professionisti della zona, che pagano solo quando portano valore.',
  landingCloseTitle: 'Il prossimo problema\nlo risolvi in una frase.',
  landingCloseSub: '30 secondi. Se non fa per te, hai solo scritto una frase.',

  // — CTA —
  ctaTry: 'Prova — gratis',
  ctaPartner: 'Lavoro con STROBE',
  ctaStart: 'Inizia',

  // — Due porte —
  doorUser: { t: 'Hai un problema', d: 'Una frase, 30 secondi. Guardare è libero, contattare è tua scelta.', cta: 'Racconta cosa ti serve' },
  doorPartner: { t: 'Sei un professionista', d: 'Richieste già capite, dalla tua zona. Si paga solo quando porta un cliente.', cta: 'Entra nella rete' },
} as const;
