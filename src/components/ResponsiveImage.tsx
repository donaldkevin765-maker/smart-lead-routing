/**
 * ResponsiveImage — STROBE asset pipeline (Principal Web Performance)
 * Hard constraints: CC0/Royalty-Free, breakpoint matrix 640/1024/1920/3840/7680, <picture> AVIF>WebP>JPG,
 * fetchpriority/decoding, width/height + aspect-ratio => CLS 0, preload per LCP <1.2s
 * Licenze legali: Unsplash API (CC0-like) / Pexels API (Royalty-Free) / AI Flux prompt
 */
type Breakpoint = 640 | 1024 | 1920 | 3840 | 7680;
const BREAKPOINTS: Breakpoint[] = [640, 1024, 1920, 3840, 7680];

type Props = {
  baseName: string; // senza estensione, es. "hero-caldaia" => hero-caldaia-640.avif ecc.
  alt: string;
  width: number;
  height: number;
  aboveFold?: boolean; // true = Hero (preload, eager, high priority)
  className?: string;
  style?: React.CSSProperties;
};

function srcSet(baseName: string, ext: 'avif' | 'webp' | 'jpg'): string {
  return BREAKPOINTS.map((w) => `/${baseName}-${w}.${ext} ${w}w`).join(', ');
}

export function ResponsiveImage({ baseName, alt, width, height, aboveFold = false, className, style }: Props) {
  const aspectRatio = `${width} / ${height}`;
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(baseName, 'avif')} sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, (max-width: 1920px) 1920px, 100vw" />
      <source type="image/webp" srcSet={srcSet(baseName, 'webp')} sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, (max-width: 1920px) 1920px, 100vw" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/${baseName}-1920.jpg`}
        srcSet={srcSet(baseName, 'jpg')}
        sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, (max-width: 1920px) 1920px, 100vw"
        alt={alt}
        width={width}
        height={height}
        loading={aboveFold ? 'eager' : 'lazy'}
        decoding="async"
        // @ts-ignore — fetchPriority è standard ma non ancora nel type di React 19
        fetchPriority={aboveFold ? 'high' : 'auto'}
        style={{ aspectRatio, ...style }}
        className={className}
      />
    </picture>
  );
}

/**
 * Preload tag per <head> — da usare solo per hero above-the-fold per LCP <1.2s
 * Esempio in layout.tsx <head>:
 * <link rel="preload" as="image" href="/hero-caldaia-1920.avif" imagesrcset="/hero-caldaia-640.avif 640w, /hero-caldaia-1024.avif 1024w, /hero-caldaia-1920.avif 1920w" imagesizes="100vw" type="image/avif" fetchpriority="high" />
 */
export function preloadLink(baseName: string): string {
  const srcset = BREAKPOINTS.slice(0, 3).map((w) => `/${baseName}-${w}.avif ${w}w`).join(', ');
  return `<link rel="preload" as="image" href="/${baseName}-1920.avif" imagesrcset="${srcset}" imagesizes="100vw" type="image/avif" fetchpriority="high" />`;
}

/**
 * Fonti legali automatiche (suggerite, 0 tolleranza senza licenza)
 * 1) Unsplash API (CC0-like, attribuzione consigliata): GET https://api.unsplash.com/search/photos?query=plumber&per_page=1&orientation=landscape con UNSPLASH_ACCESS_KEY
 * 2) Pexels API (Royalty-Free Commercial): GET https://api.pexels.com/v1/search?query=gym con PEXELS_API_KEY
 * 3) AI generation (100% tua, Royalty-Free): prompt Flux/Midjourney —
 *    "minimalist infrastructure hero, plumber fixing boiler in modern apartment, soft natural light, 8K, anonymized faces blurred, Apple premium aesthetic --ar 16:9 --style raw"
 * Salva il file sorgente come source-8k.jpg poi lancia lo script Sharp sotto.
 */
