// src/middleware/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export default function middleware(request: NextRequest) {
  const { pathname, basePath, origin } = request.nextUrl
  const isProd = process.env.NODE_ENV === 'production'

  // basePath を使って loginPath を動的生成
  const loginPath = `${basePath}/login`
  const loginUrl = new URL(loginPath, origin)
  console.log(`[Proxy] loginPath: ${loginPath}, loginUrl: ${loginUrl}`)

  // login ページは認証スキップ
  if (pathname === loginPath || pathname === `${loginPath}/`) {
    return NextResponse.next()
  }

  // basePath 以下のパスは token がなければ login にリダイレクト
  if (pathname.startsWith(basePath)) {
    const token = request.cookies.get('token')
    if (!token || !token.value) {
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}
