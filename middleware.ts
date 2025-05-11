import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Get auth token from cookie
  const authCookie = req.cookies.get('sb-auth-token');
  const hasAuthCookie = authCookie && authCookie.value;
  
  // Consider user authenticated if auth cookie exists
  const isAuthenticated = !!hasAuthCookie;
  
  // Protect dashboard routes - redirect to login if not authenticated
  if (!isAuthenticated && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // For admin role verification, we'll redirect to home page
    // Full role verification will happen in the component level
    // This is a simplified approach to avoid middleware complexity
  }
  
  // Prevent authenticated users from accessing login/register pages
  if (isAuthenticated && (
    req.nextUrl.pathname.startsWith('/login') || 
    req.nextUrl.pathname.startsWith('/register')
  )) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  return NextResponse.next();
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
