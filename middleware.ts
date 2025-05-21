import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Create the response object
  const res = NextResponse.next();
  
  // Check for NextAuth.js session cookie
  const hasNextAuthSession = req.cookies.has('next-auth.session-token') || 
                           req.cookies.has('__Secure-next-auth.session-token');
  
  // Consider user authenticated if session cookie exists
  const isAuthenticated = !!hasNextAuthSession;
  
  // Get the current URL path
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;
  
  // Special case for deposit/withdraw routes - no redirects needed
  if (pathname === '/dashboard/deposit' || pathname === '/dashboard/withdraw') {
    return NextResponse.next();
  }
  
  // Protect dashboard routes - redirect to login if not authenticated
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    // For admin role verification, we'll rely on the component level
    // This is a simplified approach to avoid middleware complexity
  }
  
  // Prevent authenticated users from accessing login/register pages
  if (isAuthenticated && (
    pathname.startsWith('/login') || 
    pathname.startsWith('/register')
  )) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  return res;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*',
    '/login',
    '/register'
  ],
};
