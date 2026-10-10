import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/pannello-q7x2/', '/api/'] }],
    sitemap: 'https://smart-lead-routing.vercel.app/sitemap.xml',
  };
}
