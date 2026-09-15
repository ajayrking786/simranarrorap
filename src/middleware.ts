import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Protect Admin Pages
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const role = request.cookies.get('simran_session_role')?.value
    if (role !== 'ADMIN') {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2. Protect Admin APIs
  if (pathname.startsWith('/api/admin')) {
    const role = request.cookies.get('simran_session_role')?.value
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }
  }

  // 3. Protect Customer Account Pages
  if (pathname.startsWith('/account')) {
    const role = request.cookies.get('simran_session_role')?.value
    if (!role) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/account/:path*'],
}
