// src/lib/config.ts
export function getBasePath() {
  return process.env.NODE_ENV === 'production' ? '/33zu' : '';
}
