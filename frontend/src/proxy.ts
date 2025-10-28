// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBasePath } from '@/lib/config';

// middlewareで適用する範囲
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

// ミドルウェア本体
export default function middleware(request: NextRequest) {
  const basePath = getBasePath();
  const { pathname } = request.nextUrl;

  console.log(`[Proxy] pathname: ${pathname}, basePath: ${basePath}`);

  // ログインページの絶対パスを生成
  const loginPath = `${basePath}/login`;
  const loginUrl = new URL(loginPath, request.url);

  // /33zu/login or /login の両方に対応
  const isLoginPage =
    pathname === loginPath || pathname === '/login' || pathname === '/33zu/login';

  if (isLoginPage) {
    console.log('[Proxy] ログインページなので許可。');
    return NextResponse.next();
  }

  // トークン確認
  const token = request.cookies.get('token');
  if (!token || !token.value) {
    console.log(`[Proxy] トークンなし → ${loginUrl} にリダイレクト`);
    return NextResponse.redirect(loginUrl);
  }

  console.log('[Proxy] 認証OK。ページ表示許可。');
  return NextResponse.next();
}
