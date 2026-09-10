/**
 * STROBE Photo Quality Standard — standard di bellezza/qualità obbligatorio.
 * Ogni foto del sito deve passare questo filtro, altrimenti non va live.
 * WHY: foto brutte = cliente che non si immerge = niente lead. Lo standard è oggettivo e verificabile.
 */
export const PHOTO_STANDARD = {
  minWidth: 1200,
  minHeight: 800,
  aspect: '4:3 o 3:2 — primo piano grande, mai panorami vuoti',
  quality: 80, // q=80 Unsplash/picsum = HQ senza pesare LCP
  formats: ['avif', 'webp', 'jpg'] as const,
  maxSizeKB: 350, // sopra = ricomprimi con scripts/optimize-images.mjs
  faces: 'blur obbligatorio su volti riconoscibili (privacy + estetica STROBE)',
  light: 'luce naturale morbida, no flash duro, no controluce nero',
  subject: 'soggetto in primo piano: tecnico all’opera, sala, dettaglio attrezzo, risultato',
  noGo: ['watermark', 'testo sopra la foto', 'pixelato', 'volto non sfocato', 'irrilevante al servizio'],
} as const;

export interface PhotoMeta {
  width: number;
  height: number;
  sizeKB?: number;
  hasWatermark?: boolean;
  faceBlurred?: boolean;
  relevant?: boolean;
}

/** Filtro oggettivo: true = foto bella e immersiva, pubblicabile */
export function passesPhotoStandard(m: PhotoMeta): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (m.width < PHOTO_STANDARD.minWidth) reasons.push(`larghezza ${m.width} < ${PHOTO_STANDARD.minWidth}`);
  if (m.height < PHOTO_STANDARD.minHeight) reasons.push(`altezza ${m.height} < ${PHOTO_STANDARD.minHeight}`);
  if (m.sizeKB !== undefined && m.sizeKB > PHOTO_STANDARD.maxSizeKB) reasons.push(`peso ${m.sizeKB}KB > ${PHOTO_STANDARD.maxSizeKB}KB — ricomprimi`);
  if (m.hasWatermark) reasons.push('watermark vietato');
  if (m.faceBlurred === false) reasons.push('volto non sfocato — privacy');
  if (m.relevant === false) reasons.push('non pertinente al servizio');
  return { ok: reasons.length === 0, reasons };
}

/** Builder URL HQ standard — tutti i componenti devono usarlo, mai URL a mano */
export function photoUrl(seed: string, w = 900, h = 600, blur = 2): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}?blur=${blur}`;
}

/** Foto lavoratore reale del settore (Unsplash ID verificato 200) — solo settore pertinente */
export function workerUrl(photoId: string, w = 900): string {
  const [base, variant] = photoId.split('|');
  const crop = variant ? `&crop=${variant.split('=')[1] || 'entropy'}` : '';
  return `https://images.unsplash.com/${base}?auto=format&fit=crop&w=${w}&q=80${crop}`;
}

/** srcSet HQ per lavoratori reali — 8K solo se il dispositivo lo consente */
export function workerSrcSet(photoId: string): string {
  return [640, 1024, 1920, 3840, 7680].map((w) => `${workerUrl(photoId, w)} ${w}w`).join(', ');
}

/** Dispatcher: Unsplash ID (photo-...) o seed picsum — mai foto fuori settore */
export function galleryUrl(entry: string, w = 900, h = 600): string {
  if (entry.startsWith('photo-')) return workerUrl(entry, w);
  return photoUrl(entry, w, h, 2);
}

/** Cover per servizio — solo lavoratori del settore, mai generiche */
export const SERVICE_COVER: Record<string, string> = {
  palestra: 'photo-1534438327276-14e5300c3a48',
  'personal-trainer': 'photo-1571019613454-1cb2f99b2d8b',
  piscina: 'photo-1530549387789-4c1017266635',
  idraulica: 'photo-1585704032915-c3400ca199e7',
  caldaia: 'photo-1607472586893-edb57bdc0e39',
  elettricista: 'photo-1621905251189-08b45d6a269e',
  climatizzazione: 'photo-1615874959474-d609969a20ed',
  parrucchiere: 'photo-1560066984-138dadb4c035',
  estetista: 'photo-1540555700478-4be289fbecef',
  massaggi: 'photo-1600334129128-685c5582fd35',
  pulizie: 'photo-1581578731548-c64695cc6952',
  traslochi: 'photo-1600518464441-9154a4dea21b',
  giardinaggio: 'photo-1416879595882-3373a0480b5b',
};

export function coverFor(services: string[]): string {
  for (const s of services) if (SERVICE_COVER[s]) return SERVICE_COVER[s];
  return 'photo-1585704032915-c3400ca199e7';
}

/**
 * ALGORITMO SEO-FOTO: sceglie e ordina le foto in base a cosa cerca l'utente.
 * Query (?q=/prompt, es. "sauna a Monza") → token → match con tag foto → prime le pertinenti.
 * WHY: il cliente rivede subito l'immagine di ciò che ha cercato su Google = riconosce = converte.
 */
export const PHOTO_TAGS: Record<string, string[]> = {
  'photo-1585704032915-c3400ca199e7': ['caldaia', 'idraulica', 'tecnico', 'perdita', 'tubo'],
  'photo-1607472586893-edb57bdc0e39': ['idraulica', 'rubinetto', 'lavello', 'perdita'],
  'photo-1615874959474-d609969a20ed': ['climatizzazione', 'condizionatore', 'tecnico'],
  'photo-1621905251189-08b45d6a269e': ['elettricista', 'tecnico', 'fili', 'quadro'],
  'photo-1504328345606-18bbc8c9d7d1': ['caldaia', 'industriale', 'tecnico'],
  'photo-1518709268805-4e9042af9f23': ['tecnico', 'industriale', 'impianto'],
  'photo-1581092918056-0c4c3acd3789': ['tecnico', 'ingegnere', 'impianto'],
  'photo-1504917595217-d4dc5ebe6122': ['caldaia', 'industriale'],
  'photo-1615873968403-89e068629265': ['climatizzazione', 'impianto'],
  'photo-1621905252507-b35492cc74b4': ['elettricista', 'quadro'],
  'photo-1558618666-fcd25c85cd64': ['elettricista', 'tecnico'],
  'photo-1504148455328-c376907d081c': ['idraulica', 'attrezzi', 'tubo'],
  'photo-1416339306562-f3d12fefd36f': ['idraulica', 'attrezzi', 'lavoro'],
  'photo-1621905251918-48416bd8575a': ['elettricista', 'tecnico'],
  'photo-1581091226825-a6a2a5aee158': ['tecnico', 'ingegnere'],
  'photo-1534438327276-14e5300c3a48': ['palestra', 'sala', 'pesi'],
  'photo-1571019613454-1cb2f99b2d8b': ['palestra', 'funzionale', 'allenamento'],
  'photo-1593079831268-3381b0db4a77': ['palestra', 'allenamento', 'sauna'],
  'photo-1517836357463-d25dfeac3438': ['palestra', 'pesi'],
  'photo-1541534741688-6078c6bfb5c5': ['palestra', 'allenamento'],
  'photo-1540497077202-7c8a3999166f': ['palestra', 'sala'],
  'photo-1550345332-09e3ac987658': ['palestra', 'fisico'],
  'photo-1574680096145-d05b474e2155': ['personal', 'trainer', 'palestra'],
  'photo-1599058917212-d750089bc07e': ['palestra', 'allenamento'],
  'photo-1581009146145-b5ef050c2e1e': ['palestra', 'atleta'],
  'photo-1560066984-138dadb4c035': ['parrucchiere', 'salone'],
  'photo-1521590832167-7bcbfaa6381f': ['parrucchiere', 'salone'],
  'photo-1580618672591-eb180b1a973f': ['parrucchiere', 'taglio'],
  'photo-1522337660859-02fbefca4702': ['parrucchiere', 'colore'],
  'photo-1562322140-8baeececf3df': ['parrucchiere', 'salone'],
  'photo-1522338242992-e1a54906a8da': ['parrucchiere', 'capelli'],
  'photo-1516975080664-ed2fc6a32937': ['barbiere', 'taglio', 'uomo'],
  'photo-1581578731548-c64695cc6952': ['pulizie', 'casa'],
  'photo-1584820927498-cfe5211fd8bf': ['pulizie'],
  'photo-1563453392212-326f5e854473': ['pulizie', 'prodotti'],
  'photo-1528740561666-dc2479dc08ab': ['pulizie', 'spray'],
  'photo-1527515637462-cff94eecc1ac': ['pulizie', 'casa'],
  'photo-1556911220-bff31c812dba': ['pulizie', 'cucina'],
  'photo-1556911220-e15b29be8c8f': ['pulizie', 'cucina'],
  'photo-1600518464441-9154a4dea21b': ['trasloco', 'scatole'],
  'photo-1586864387967-d02ef85d93e8': ['trasloco'],
  'photo-1600585152220-90363fe7e115': ['casa', 'trasloco'],
  'photo-1560518883-ce09059eeffa': ['casa', 'chiavi', 'contratto'],
  'photo-1600585154340-be6161a56a0c': ['casa'],
  'photo-1600607687920-4e2a09cf159d': ['casa', 'interni'],
  'photo-1600047509807-ba8f99d2cdde': ['casa'],
  'photo-1600585154526-990dced4db0d': ['casa'],
  'photo-1600573472592-401b489a3cdc': ['casa'],
  'photo-1600566752355-35792bedcfea': ['casa', 'interni'],
  'photo-1600334129128-685c5582fd35': ['massaggi', 'spa'],
  'photo-1544161515-4ab6ce6db874': ['massaggi', 'spa'],
  'photo-1540555700478-4be289fbecef': ['massaggi', 'benessere'],
  'photo-1515377905703-c4788e51af15': ['massaggi', 'spa'],
  'photo-1570172619644-dfd03ed5d881': ['massaggi', 'benessere'],
  'photo-1416879595882-3373a0480b5b': ['giardinaggio', 'giardino'],
  'photo-1558904541-efa843a96f01': ['giardino'],
  'photo-1466692476868-aef1dfb1e735': ['giardino'],
  'photo-1592150621744-aca64f48394a': ['giardinaggio'],
  'photo-1585320806297-9794b3e4eeae': ['giardino'],
  'photo-1605146769289-440113cc3d00': ['giardino'],
  'photo-1625246333195-78d9c38ad449': ['giardino', 'campo'],
};

export function rankPhotos(ids: string[], query: string): string[] {
  const tokens = query.toLowerCase().split(/[^a-zà-ÿ]+/).filter((t) => t.length > 2);
  if (tokens.length === 0) return ids;
  const scored = ids.map((id, i) => {
    const base = id.split('|')[0];
    const tags = PHOTO_TAGS[base] || [];
    let score = 0;
    for (const tok of tokens) {
      if (tags.some((t) => t.includes(tok) || tok.includes(t))) score += 2;
      else if (base.toLowerCase().includes(tok)) score += 1;
    }
    return { id, score, i };
  });
  return scored.sort((a, b) => b.score - a.score || a.i - b.i).map((s) => s.id);
}

/** Checklist umana per foto partner caricate (prima di Verifica in admin) */
export const PHOTO_CHECKLIST = [
  'Primo piano grande, soggetto chiaro in 1 secondo',
  'Luce naturale, niente buio/flash',
  'Volti sfocati o non riconoscibili',
  'Pertinente al servizio (palestra→sala, non spiaggia)',
  'Niente scritte/watermark sopra',
  'Minimo 1200×800, sotto 350KB',
] as const;
