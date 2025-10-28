// lib/config.ts
export const isProd = process.env.NODE_ENV === 'production';

// 環境変数 NEXT_PUBLIC_BASE_PATH があればそれを優先、なければ NODE_ENV によるデフォルト
const rawBase = process.env.NEXT_PUBLIC_BASE_PATH ?? (isProd ? '/33zu' : '');

// 正規化: '' または '/something' の形にする（末尾のスラッシュは取り除く）
function normalizeBasePath(p: string) {
  if (!p) return '';
  // 先頭にスラッシュが無ければ付ける、末尾のスラッシュは削る
  const withLeading = p.startsWith('/') ? p : `/${p}`;
  return withLeading.replace(/\/+$/, '');
}

export const BASE_PATH = normalizeBasePath(rawBase);
