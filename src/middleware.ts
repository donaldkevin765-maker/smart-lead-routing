import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// WHY buco fisico: /admin/* senza auth = chiunque pausa/ricarica crediti
// Logica: se ADMIN_TOKEN è settato, serve header x-admin-token o ?token= o cookie admin_token
// In dev (ADMIN_TOKEN vuoto) lascia passare per non bloccare te
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const token = process.env.ADMIN_TOKEN || '';
  if (!token) return NextResponse.next();

  const got = req.headers.get('x-admin-token') || req.cookies.get('admin_token')?.value || searchParams.get('token') || req.headers.get('authorization')?.replace('Bearer ', '');
  if (got === token) return NextResponse.next();

  // Per UX admin: se manca token, chiedi con 401 Basic Auth
  return new NextResponse('Admin riservato — token mancante', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="STROBE Admin"' },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
