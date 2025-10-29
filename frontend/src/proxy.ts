// src/proxy.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export const config = {
  matcher: [
    /*
     * 下記にマッチするパス以外、すべてのパスでミドルウェアを実行する
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// 2. Goサーバーと共通のJWT秘密鍵（合言葉）を環境変数から取得
const JWT_SECRET = process.env.JWT_SECRET;

// 3. 門番の実際の仕事（async が重要！）
export default async function(request: NextRequest) {
  const { pathname, basePath } = request.nextUrl;
  
  // リダイレクト先のログインURLを動的に作成
  const safeBasePath = basePath || '';
  const loginPath = `${safeBasePath}/login`;
  const loginUrl = new URL(loginPath, request.url);
  console.log(`[Proxy] loginUrl: ${loginUrl},basePath: ${basePath},pathname: ${pathname}`);
  console.log(`[Proxy] loginPath: ${loginPath}`);

  //if (pathname === loginPath) {
  if (pathname === '/login' || pathname === '/login/') {
    console.log('[Proxy] ログインページへのアクセスなので許可します。');
    return NextResponse.next();
  }

  // 4. まず、秘密鍵が設定されているかチェック
  if (!JWT_SECRET) {
    console.error("[Proxy] 致命的エラー: JWT_SECRET が設定されていません！");
    // 秘密鍵がないと何も検証できないので、安全のためにログインに戻す
    return NextResponse.redirect(loginUrl);
  }

  // 5. 訪問者のIDカード（トークンクッキー）を確認
  const token = request.cookies.get('token')?.value;

  // 6. トークンが「ない」場合は、問答無用で/loginに追い返す
  if (!token) {
    console.log(`[Proxy] トークンなし。 ${pathname} から /login へリダイレクトします。`);
    return NextResponse.redirect(loginUrl);
  }

  // 7. トークンが「ある」場合は、それが本物か鑑定士に依頼する
  try {
    // 秘密鍵を鑑定士が読める形式（Uint8Array）に変換
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    // 鑑定を実行！
    // もしトークンが偽物、期限切れ、または署名が違えば、ここでエラー（catch）に飛ぶ！
    await jwtVerify(token, secret);
    
    // 8. 鑑定成功！
    console.log(`[Proxy] トークンは有効です。 ${pathname} へのアクセスを許可します。`);
    return NextResponse.next(); // 目的のページへどうぞ
    
  } catch (error: any) {
    // 9. 鑑定失敗！(偽物か、期限切れ)
    console.warn(`[Proxy] トークンの検証に失敗しました: ${error.message}`);
    return NextResponse.redirect(loginUrl); // ログインページに追い返す
  }
}
