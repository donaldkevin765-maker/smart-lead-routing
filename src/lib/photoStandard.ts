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

/** Checklist umana per foto partner caricate (prima di Verifica in admin) */
export const PHOTO_CHECKLIST = [
  'Primo piano grande, soggetto chiaro in 1 secondo',
  'Luce naturale, niente buio/flash',
  'Volti sfocati o non riconoscibili',
  'Pertinente al servizio (palestra→sala, non spiaggia)',
  'Niente scritte/watermark sopra',
  'Minimo 1200×800, sotto 350KB',
] as const;
