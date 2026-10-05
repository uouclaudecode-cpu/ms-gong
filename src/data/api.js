// 데이터를 가져오는 곳은 이 파일 하나로 모읍니다.
// 서버 함수(/api/*)가 네이버·잡알리오에서 실데이터를 가져오고,
// 키가 아직 없거나 실패하면 예시 데이터(mock.js)로 대신 보여 줍니다. 결과의 `live`로 구분합니다.
import { MOCK_BLOG, MOCK_JOBS, MOCK_NEWS } from './mock.js';

async function getJson(url) {
  const r = await fetch(url);
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(body.message ?? `HTTP ${r.status}`), { code: body.error });
  return body;
}

async function withFallback(url, fallback) {
  try {
    const { items } = await getJson(url);
    return { items, live: true };
  } catch (err) {
    if (err.code !== 'no_key') console.warn(`[api] ${url} 실패, 예시 데이터로 대신합니다:`, err.message);
    return { items: fallback(), live: false, reason: err.code === 'no_key' ? 'no_key' : 'error' };
  }
}

export function fetchJobs() {
  return withFallback('/api/jobs', () => MOCK_JOBS);
}

/** ids: 기업 id 배열. 순서를 정렬해 같은 조합이면 같은 주소 → CDN 캐시를 같이 씁니다 */
export function fetchNews(ids) {
  const key = [...ids].sort().join(',');
  return withFallback(`/api/news?ids=${key}`, () =>
    MOCK_NEWS.filter((n) => ids.includes(n.companyId)).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
  );
}

export function fetchBlog(companyId, kw) {
  return withFallback(`/api/blog?company=${companyId}&kw=${kw}`, () => MOCK_BLOG(companyId, kw));
}
