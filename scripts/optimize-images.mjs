#!/usr/bin/env node
/**
 * STROBE — Automazione Sharp 8K → breakpoint matrix + AVIF/WebP/JPG
 * Hard constraints: 640w, 1024w, 1920w, 3840w (4K), 7680w (8K) × 3 formati = 15 file
 * Performance: AVIF effort 6, WebP/JPG quality ottimizzata per LCP <1.2s + CLS 0
 * Licenze: input deve essere CC0 (Unsplash/Pexels API) o AI generata (Flux) — vedi ResponsiveImage.tsx
 * Uso: node scripts/optimize-images.mjs source-8k.jpg hero-caldaia
 * Output: public/hero-caldaia-{640,1024,1920,3840,7680}.{avif,webp,jpg}
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';

const BREAKPOINTS = [640, 1024, 1920, 3840, 7680];
const FORMATS = [
  { ext: 'avif', opts: { quality: 45, effort: 6, chromaSubsampling: '4:2:0' } },
  { ext: 'webp', opts: { quality: 75, effort: 6 } },
  { ext: 'jpg', opts: { quality: 82, mozjpeg: true } },
];

const [input, baseName] = process.argv.slice(2);
if (!input || !baseName) {
  console.error('Uso: node scripts/optimize-images.mjs <input-8k.jpg> <baseName>');
  console.error('Es:  node scripts/optimize-images.mjs ./source-8k.jpg hero-caldaia');
  process.exit(1);
}

const outDir = path.join(process.cwd(), 'public');
await mkdir(outDir, { recursive: true });

const meta = await sharp(input).metadata();
console.log(`Sorgente: ${input} — ${meta.width}x${meta.height} ${meta.format} — licenza: verifica CC0/Royalty-Free prima di procedere`);

for (const w of BREAKPOINTS) {
  // Non upscalare oltre il sorgente
  const targetW = Math.min(w, meta.width || 7680);
  for (const { ext, opts } of FORMATS) {
    const out = path.join(outDir, `${baseName}-${w}.${ext}`);
    const pipeline = sharp(input).resize({ width: targetW, withoutEnlargement: true });
    if (ext === 'avif') await pipeline.avif(opts).toFile(out);
    else if (ext === 'webp') await pipeline.webp(opts).toFile(out);
    else await pipeline.jpeg(opts).toFile(out);
    console.log(`✓ ${path.basename(out)} — ${targetW}w`);
  }
}

console.log(`\nFatto. Preload per hero (incolla in <head>):`);
console.log(`<link rel="preload" as="image" href="/${baseName}-1920.avif" imagesrcset="/${baseName}-640.avif 640w, /${baseName}-1024.avif 1024w, /${baseName}-1920.avif 1920w" imagesizes="100vw" type="image/avif" fetchpriority="high" />`);
console.log(`\nUso JSX:\n<ResponsiveImage baseName="${baseName}" alt="Descrizione pertinente" width={1920} height={1080} aboveFold />`);
