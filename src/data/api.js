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
    const body = await getJson(url);
    return { ...body, live: true };
  } catch (err) {
    if (err.code !== 'no_key') console.warn(`[api] ${url} 실패, 예시 데이터로 대신합니다:`, err.message);
    return { items: fallback(), live: false, reason: err.code === 'no_key' ? 'no_key' : 'error' };
  }
}

/** 같은 방문 중에 여러 화면이 같은 데이터를 다시 받지 않도록 잠깐 기억합니다 */
function memo(fn, ms) {
  const store = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    const hit = store.get(key);
    if (hit && Date.now() - hit.at < ms) return hit.promise;
    const promise = fn(...args);
    store.set(key, { at: Date.now(), promise });
    promise.then((r) => r.live === false && store.delete(key)); // 실패한 건 다음에 다시 시도
    return promise;
  };
}

/** 진행 중 공고 전체. institutions: 우리 목록 밖 기관 [{ id, code, name }] */
export const fetchJobs = memo(() => withFallback('/api/jobs', () => MOCK_JOBS), 5 * 60000);

/** 우리 목록 밖, 최근 공고를 낸 공공기관 목록 */
export const fetchInstitutions = memo(() => withFallback('/api/institutions', () => []), 30 * 60000);

/**
 * ids: 기업 id 배열. 기업마다 따로 불러 합칩니다(기업별 주소라 CDN 캐시를 모든 방문자가 같이 씀).
 * 한 기업이라도 실데이터면 live, 같은 기사가 여러 기업에 걸리면 하나만 남깁니다.
 */
export async function fetchNews(ids) {
  const results = await Promise.all(
    ids.map((id) => withFallback(`/api/news?id=${id}`, () => MOCK_NEWS.filter((n) => n.companyId === id))),
  );
  const live = results.find((r) => r.live);
  const seen = new Set();
  const items = results
    .filter((r) => r.live === Boolean(live)) // 실데이터와 예시를 섞지 않습니다
    .flatMap((r) => r.items)
    .filter((n) => (seen.has(n.url) ? false : seen.add(n.url)))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return { items, live: Boolean(live), reason: live ? undefined : results[0]?.reason };
}

export function fetchBlog(companyId, kw) {
  return withFallback(`/api/blog?company=${companyId}&kw=${kw}`, () => MOCK_BLOG(companyId, kw));
}

/** 최근 3년 채용 흐름. 키가 없으면 { live: false } */
export async function fetchTrend(companyId) {
  try {
    return { ...(await getJson(`/api/trend?id=${companyId}`)), live: true };
  } catch (err) {
    return { live: false, available: false, reason: err.code === 'no_key' ? 'no_key' : 'error' };
  }
}

/** 기관별 신입 초임·평균보수·직원 수 (ALIO 공시, 사이트에 들어 있는 파일) */
export const fetchCompanyInfo = memo(async () => {
  try {
    return { ...(await getJson('/data/company-info.json')), live: true };
  } catch {
    return { items: {}, live: false };
  }
}, 60 * 60000);
