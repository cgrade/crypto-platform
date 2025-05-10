import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Protect dashboard routes - redirect to login if no token
  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Protect admin routes - require admin role
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  // Prevent authenticated users from accessing login/register pages
  if (token && (
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
