import { NextResponse, type NextRequest } from 'next/server';
import { SITE_AUTH_COOKIE, isSiteAuthEnabled, isValidAccessToken } from '@/lib/auth/siteAuth';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout'];

export async function proxy(request: NextRequest) {
  if (!isSiteAuthEnabled()) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return withNoIndex(NextResponse.next());

  if (await isValidAccessToken(request.cookies.get(SITE_AUTH_COOKIE)?.value)) {
    return withNoIndex(NextResponse.next());
  }

  // Data requests (API routes and server actions) get a 401 rather than an HTML redirect.
  if (pathname.startsWith('/api/') || request.headers.has('next-action')) {
    return withNoIndex(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return withNoIndex(NextResponse.redirect(loginUrl));
}

function withNoIndex(response: NextResponse) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  // Static assets and the logo/images used on the login page stay public.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
