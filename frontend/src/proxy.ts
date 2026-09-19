import { decodeToken } from './lib/auth';
import { roleHome, canAccessRoleRoute } from './lib/role-access';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readChunkedCookie } from './lib/cookie-chunks';

const publicRoutes = [
  '/auth/callback',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/health',
  '/mfa',
  '/401',
  '/403',
  '/openapi.json',
  '/.well-known/',
];
const marketingRoutes = [
  '/pricing',
  '/features',
  '/contact',
  '/about',
  '/services',
  '/product',
  '/legal',
  '/resources',
  '/company',
  '/blog',
  '/careers',
  '/cookies',
  '/docs',
  '/partners',
  '/privacy',
  '/security',
  '/sla',
  '/terms',
  '/demo',
];

export function proxy(request: NextRequest) {
  const rawToken = readChunkedCookie((name) => request.cookies.get(name), 'access_token');
  const { pathname } = request.nextUrl;
  const payload = rawToken ? decodeToken(rawToken) : null;
  const token = payload && Array.isArray(payload.roles) ? rawToken : null;

  const isMarketingRoute =
    pathname === '/' || marketingRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute =
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    isMarketingRoute ||
    pathname.startsWith('/public/');

  // Protect internal routes
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(loginUrl);
  }

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/mfa');
  // Prevent authenticated users from accessing auth pages
  if (isAuthRoute && token && typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()) {
    return NextResponse.redirect(new URL(roleHome(payload.roles), request.url));
  }

  if (token && !canAccessRoleRoute(pathname, payload.roles)) {
    return NextResponse.redirect(new URL('/403', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
