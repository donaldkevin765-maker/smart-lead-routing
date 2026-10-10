import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// WHY buco fisico: /admin/* senza auth = chiunque pausa/ricarica crediti
// Logica: se ADMIN_TOKEN è settato, serve header x-admin-token o ?token= o cookie admin_token
// In dev (ADMIN_TOKEN vuoto) lascia passare per non bloccare te
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // WHY: /api/services POST/DELETE = chiunque riscrive il catalogo. Solo GET è pubblico.
  if (pathname === '/api/services' && req.method !== 'GET') {
    const t = process.env.ADMIN_TOKEN || '';
    if (!t) return NextResponse.next();
    const got = req.headers.get('x-admin-token') || req.cookies.get('admin_token')?.value || searchParams.get('token');
    if (got === t) return NextResponse.next();
    return new NextResponse('Operazione riservata', { status: 403, headers: { 'X-Robots-Tag': 'noindex' } });
  }

  // WHY nascosto: /admin non esiste più (404 silenzioso) — il pannello è su un path
  // non pubblicizzabile. Chi indovina il path serve comunque il token doppio.
  if (pathname.startsWith('/admin')) {
    return new NextResponse(null, { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
  }

  if (!pathname.startsWith('/pannello-')) return NextResponse.next();

  const token = process.env.ADMIN_TOKEN || '';
  if (!token) return NextResponse.next();

  const got = req.headers.get('x-admin-token') || req.cookies.get('admin_token')?.value || searchParams.get('token') || req.headers.get('authorization')?.replace('Bearer ', '');
  if (got === token) {
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    // WHY: setta il cookie così le fetch del pannello (/api/partners PATCH) lo passano da sole
    res.cookies.set('admin_token', token, { httpOnly: true, sameSite: 'lax', path: '/' });
    return res;
  }

  // Stesso identico trattamento del vecchio 404: niente indizi su cosa sia questa pagina
  return new NextResponse(null, { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
}

export const config = {
  matcher: ['/admin/:path*', '/pannello-q7x2/:path*', '/pannello-q7x2', '/api/admin/:path*', '/api/services'],
};
