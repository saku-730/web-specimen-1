// proxy.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// このconfigで、チェックするパスを指定するのだ
export const config = {
  matcher: [
    /*
     * 下記にマッチするパス以外、すべてのパスでミドルウェアを実行する
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// Next.js 16からは、'export default function' を使うのだ！
export default function(request: NextRequest) {
  // request.nextUrl から、現在のパス名と basePath (next.config.jsで設定した値) を取得するのだ
  const { pathname, basePath } = request.nextUrl;

  console.log(`[Proxy] チェック中: ${pathname}`);
  console.log(`[Proxy] basePath: ${basePath}`);

  const safeBasePath = basePath || '';

  // 1. ログインページのパスを「安全な」basePathを使って動的に作成する
  const loginPath = `${safeBasePath}/login`;
  const loginUrl = new URL(loginPath, request.url);
  // 1. ログインページのパスを動的に作成する

  // 2. /loginページ自体へのアクセスは、そのまま通すのだ
  if (pathname === loginPath) {
    console.log('[Proxy] ログインページへのアクセスなので許可します。');
    return NextResponse.next();
  }

  // 3. リクエストからトークンクッキーを取得する
  const token = request.cookies.get('token');

  // 4. トークンがなければ、動的に作成したログインURLに追い返す（リダイレクト）！
  if (!token || !token.value) {
    console.log(`[Proxy] トークンなし！ ${pathname} から ${loginPath} へリダイレクトします。`);
    return NextResponse.redirect(loginUrl);
  }

  // 5. トークンがあれば、何もしないでそのまま通すのだ
  console.log('[Proxy] トークン確認！アクセスを許可します。');
  return NextResponse.next();
}
