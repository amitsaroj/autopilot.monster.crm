import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/health', '/mfa', '/401', '/403'];
const marketingRoutes = [
  '/pricing', '/features', '/contact', '/about', '/services', '/product', 
  '/legal', '/resources', '/company', '/blog', '/careers', '/cookies', 
  '/docs', '/partners', '/privacy', '/security', '/sla', '/terms', '/demo'
];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isMarketingRoute = pathname === '/' || marketingRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || isMarketingRoute || pathname.startsWith('/public/');

  // Protect internal routes
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(loginUrl);
  }

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/mfa');
  // Prevent authenticated users from accessing auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Next.js Edge Runtime JWT decoding for rapid role assessment
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(decodedJson);
      
      const roles: string[] = payload.roles || [];
      const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/superadmin');
      
      if (isAdminRoute && !roles.some(r => ['SUPER_ADMIN', 'ADMIN'].includes(r))) {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    } catch (e) {
      // Allow API 401 block to catch malformed tampered cookies seamlessly
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
