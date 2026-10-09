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

  // — Due porte (sequenza: cliente → aziende, azienda → fondo registrazione) —
  doorUser: { t: 'Cerchi qualcuno?', d: 'Guarda le aziende verificate della Brianza: orari, telefono, recensioni.', cta: 'Vedi le aziende', href: '/clienti' },
  doorPartner: { t: 'Vuoi entrare nella rete?', d: 'Richieste già capite, dalla tua zona. Si paga solo quando porta un cliente.', cta: 'Registrati ora', href: '/partner' },

  // — FAQ SEO (Google + AI): una risposta netta per domanda —
  faq: [
    { q: 'Cosa fa STROBE?', a: 'Tu scrivi il problema. STROBE trova il professionista verificato più adatto vicino a te e gli manda la richiesta. Se il primo non risponde, ci prova un altro in 15 minuti.' },
    { q: 'Quanto costa?', a: 'Per chi cerca è gratis, sempre. Nessuna registrazione per guardare. I professionisti della rete pagano solo quando una richiesta diventa un cliente.' },
    { q: 'Chi sono le aziende in rete?', a: 'Aziende reali di Monza e Brianza con dati ufficiali verificati: orari, telefono e zona coperta presi dal loro canale ufficiale.' },
    { q: 'Devo lasciare i miei contatti?', a: 'No. Puoi solo guardare. I tuoi dati li dai solo se vuoi essere richiamato, e servono a quello e nient’altro.' },
  ],
} as const;
