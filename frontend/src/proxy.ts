import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const path = request.nextUrl.pathname;

  // Define explicitly protected application root directories
  const protectedPaths = [
    '/dashboard', '/admin', '/crm', '/ai', '/workflow', 
    '/billing', '/settings', '/voice', '/whatsapp', 
    '/analytics', '/plugins', '/marketplace', '/superadmin', 
    '/inbox', '/storage', '/search'
  ];

  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));
  
  if (isProtectedPath && !token) {
    // Unauthenticated user attempting to access a secured zone
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Define authentication pages
  const authPaths = ['/login', '/register', '/forgot-password'];
  
  if (authPaths.some((p) => path.startsWith(p)) && token) {
    // Authenticated user attempting to access public auth pages
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercept every route strictly except static assets and standard bypasses
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
