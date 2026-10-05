// 서버 함수(/api/*) 공용 도구. 파일 이름이 _로 시작하면 Vercel이 주소로 공개하지 않습니다.
import { COMPANIES, COMPANY_BY_ID } from '../../src/data/companies.js';

export { COMPANIES, COMPANY_BY_ID };

/** 네이버 검색 결과의 <b>태그·HTML 엔티티 정리 */
export function cleanText(s = '') {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

/** 'YYYYMMDD' → 'YYYY-MM-DD' */
export function ymd8(s) {
  return s && /^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : null;
}

/** CDN에 결과를 캐시해서 API 호출 횟수를 아낍니다 */
export function cache(res, seconds) {
  res.setHeader('Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 6}`);
}

/** 키가 없을 때: 화면은 예시 데이터로 대신 보여 줍니다 */
export function noKey(res, name) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(503).json({ error: 'no_key', message: `${name} 환경변수가 설정되지 않았어요` });
}

export function fail(res, err) {
  console.error(err);
  res.setHeader('Cache-Control', 'no-store');
  res.status(502).json({ error: 'upstream', message: String(err?.message ?? err) });
}

export function parseIds(raw) {
  return [...new Set(String(raw ?? '').split(','))].filter((id) => COMPANY_BY_ID[id]);
}
