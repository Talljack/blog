import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hasAdminAccess } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/bookmarks')) {
    if (
      pathname === '/bookmarks/public' ||
      pathname.startsWith('/bookmarks/public/') ||
      pathname === '/bookmarks/save' ||
      pathname.startsWith('/bookmarks/save')
    ) {
      return NextResponse.next()
    }

    if (!hasAdminAccess(request)) {
      const url = new URL('/bookmarks/public', request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/bookmarks/:path*'],
}
