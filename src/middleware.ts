import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🛡️ Middleware checking path:', pathname);
  
  // Allow access to public routes
  if (
    pathname === '/' ||
    pathname === '/signup' ||
    pathname.startsWith('/api/user/login') ||
    pathname.startsWith('/api/user/signup') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    console.log('✅ Public route, allowing access');
    return NextResponse.next();
  }

  console.log('🔐 Protected route, checking authentication');
  
  // For protected routes, check authentication
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  console.log('🍪 Token from cookies:', request.cookies.get('token')?.value ? 'Found' : 'Not found');
  console.log('📋 Token from headers:', request.headers.get('authorization') ? 'Found' : 'Not found');
  console.log('🎯 Final token:', token ? 'Available' : 'Missing');

  if (!token) {
    console.log('❌ No token found, redirecting to login');
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Verify the token
  const decoded = verifyToken(token);
  console.log('🔍 Token verification result:', decoded ? 'Valid' : 'Invalid');
  if (!decoded) {
    console.log('❌ Invalid token, redirecting to login');
    // Redirect to login if invalid token
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Role-based access control
  if (pathname.startsWith('/admin-dashboard')) {
    // Admin routes - would need to fetch user role from database
    // For now, we'll let the component handle role checking
    return NextResponse.next();
  }

  if (pathname.startsWith('/voter-dashboard')) {
    // Voter routes - would need to fetch user role from database
    // For now, we'll let the component handle role checking
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: 'nodejs',
};
