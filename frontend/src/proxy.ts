// src/middleware/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export default function middleware(request: NextRequest) {
  const { pathname, basePath, origin } = request.nextUrl
  const isProd = process.env.NODE_ENV === 'production'

  // 本番は /33zu/login、開発は /login
  const loginPath = isProd ? '/33zu/login' : '/login'
  const loginUrl = new URL(loginPath, origin)

  console.log(`[Proxy] pathname: ${pathname}, basePath: ${basePath}`)
  console.log(`[Proxy] loginPath: ${loginPath}, loginUrl: ${loginUrl}`)

  // login ページ自体はスキップ
  if (pathname === '/login' || pathname === '/login/') {
    console.log('[Proxy] loginページなので認証スキップ')
    return NextResponse.next()
  }

  // basePath 直下 /33zu またはサブパス /33zu/... を認証対象に
  const isUnderBasePath =
    pathname === '/' || pathname.startsWith('/')

  if (isUnderBasePath) {
    const token = request.cookies.get('token')
    if (!token || !token.value) {
      console.log(`[Proxy] トークンなし → ${loginUrl} にリダイレクト`)
      return NextResponse.redirect(loginUrl)
    }
  }

  console.log('[Proxy] 認証OK or basePath外 → 通過')
  return NextResponse.next()
}
