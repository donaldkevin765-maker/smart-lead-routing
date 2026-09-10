/**
 * UltraImage — foto ultra-realistiche immersive, fino a 8K se il dispositivo lo consente.
 * Qualità massima senza intaccare: il browser sceglie da solo la larghezza giusta
 * (srcSet 640→7680 + sizes) — 8K solo su schermi che lo reggono, mobile prende 640.
 * AVIF > WebP > JPG via imgix (Unsplash), aspect-ratio fissa => CLS 0.
 */
const WIDTHS = [640, 1024, 1920, 3840, 7680];

type Props = {
  id: string; // photo id Unsplash, es. "photo-1534438327276-14e5300c3a48"
  alt: string;
  width?: number;
  height?: number;
  aboveFold?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function u(id: string, w: number, fm: 'avif' | 'webp' | 'jpg'): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80&fm=${fm}`;
}

function srcSet(id: string, fm: 'avif' | 'webp' | 'jpg'): string {
  return WIDTHS.map((w) => `${u(id, w, fm)} ${w}w`).join(', ');
}

const SIZES = '(max-width: 640px) 640px, (max-width: 1024px) 1024px, (max-width: 1920px) 1920px, (max-width: 3840px) 3840px, 7680px';

export default function UltraImage({ id, alt, width = 1920, height = 1280, aboveFold = false, className, style }: Props) {
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(id, 'avif')} sizes={SIZES} />
      <source type="image/webp" srcSet={srcSet(id, 'webp')} sizes={SIZES} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={u(id, 1920, 'jpg')}
        srcSet={srcSet(id, 'jpg')}
        sizes={SIZES}
        alt={alt}
        width={width}
        height={height}
        loading={aboveFold ? 'eager' : 'lazy'}
        decoding="async"
        // @ts-ignore — fetchPriority standard, non ancora nel type React 19
        fetchPriority={aboveFold ? 'high' : 'auto'}
        style={{ aspectRatio: `${width} / ${height}`, ...style }}
        className={className}
      />
    </picture>
  );
}
