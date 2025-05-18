import { NextResponse } from 'next/server';

export function middleware(request) {
  // No special redirects needed for deposit/withdraw
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/deposit', '/dashboard/withdraw'],
}
