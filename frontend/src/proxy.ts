// src/middleware/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getBasePath } from '@/lib/config'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export default function middleware(request: NextRequest) {
 // const basePath = getBasePath()
//  const { pathname } = request.nextUrl

  const basePath = request.nextUrl.basePath; // next.config.ts の basePath が入る
  const pathname = request.nextUrl.pathname; // basePath は除かれた状態


  console.log(`[Proxy] pathname: ${pathname}, basePath: ${basePath}`)

  //const loginPath = `${basePath}/login`
  const loginPath = `/login`
  const loginUrl = new URL(loginPath, request.url)
  console.log(`[Proxy] loginPath: ${loginPath}`)

  if (pathname === loginPath || pathname === `${loginPath}/`) {
    console.log('[Proxy] loginページなので認証スキップ')
    return NextResponse.next()
  }

 // const isUnderBasePath =
//    pathname === basePath ||
 //   pathname === `${basePath}/` ||
  //  pathname.startsWith(`${basePath}/`)

  console.log(`[Proxy] loginPath: ${loginPath}`)

  const isUnderBasePath = pathname === '/' || pathname.startsWith('/');

  if (isUnderBasePath) {
    const token = request.cookies.get('token')
    console.log('[Proxy] proxy func')
    if (!token || !token.value) {
      console.log(`[Proxy] トークンなし → ${loginUrl} にリダイレクト`)
      return NextResponse.redirect(loginUrl)
    }
  }

  console.log('[Proxy] 認証OK or basePath外 → 通過')
  return NextResponse.next()
}

