// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BASE_PATH } from '@/lib/config'; // 先ほどの共通設定をインポート

// ミドルウェアの適用対象（_next/static や API 等を除外）
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// 末尾スラッシュを取り除いて比較するヘルパー
function trimTrailingSlash(p: string) {
  return p.replace(/\/+$/, '') || '/';
}

// ミドルウェア本体
export default function middleware(request: NextRequest) {
  // request.nextUrl は読み取り専用の URL オブジェクト
  const { pathname } = request.nextUrl;

  // 共通定義から得た BASE_PATH（'' または '/33zu' の形式）
  const safeBase = BASE_PATH || '';

  // 比較用に正規化したログインパス（例: '/33zu/login' または '/login'）
  const loginPath = `${safeBase}/login`.replace(/\/+/, '/'); // 二重スラッシュ対策
  const normalizedRequestPath = trimTrailingSlash(pathname);
  const normalizedLoginPath = trimTrailingSlash(loginPath);

  // ログ出力（デバッグ用）
  console.log('[middleware] request pathname =', pathname);
  console.log('[middleware] BASE_PATH =', safeBase);
  console.log('[middleware] normalizedRequestPath =', normalizedRequestPath);
  console.log('[middleware] normalizedLoginPath =', normalizedLoginPath);

  // /loginページそのものへのアクセスは通す（ログインページは未認証で見せる）
  if (normalizedRequestPath === normalizedLoginPath) {
    return NextResponse.next();
  }

  // クッキーからトークンを取得
  const token = request.cookies.get('token');

  // トークンが無ければログインページへリダイレクト
  if (!token || !token.value) {
    // URL を作るときは元のリクエストの origin を利用して絶対 URL を作る
    const redirectUrl = new URL(loginPath, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // トークンが存在すればそのまま進める
  return NextResponse.next();
}
