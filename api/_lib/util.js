// 서버 함수(/api/*) 공용 도구. 파일 이름이 _로 시작하면 Vercel이 주소로 공개하지 않습니다.
import { COMPANIES, COMPANY_BY_ID } from '../../src/data/companies.js';
import { dynamicCompany, parseDynamicId } from '../../src/data/institutions.js';

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

// ── 기업명 언급 판별 ─────────────────────────────────────────────

const HANGUL = /[가-힣]/;
const LATIN = /[A-Za-z]/;

/**
 * 네이버 검색은 비슷한 기관이나 엉뚱한 글도 섞어 주므로, 제목·요약에 기업이 실제로 언급된 것만 남깁니다.
 * - 자회사(한전KPS, 코레일유통 등)는 `excludes`로 걸러냅니다
 * - 이름 바로 뒤에 영문이 붙으면 다른 회사로 봅니다 (KIC → KICT, 한전 → 한전KDN)
 * - 약칭은 앞에 한글이 붙으면 다른 낱말로 봅니다 (공항공사 → 인천국제공항공사, 예보 → 일기예보)
 */
export function mentions(company, text) {
  // 띄어쓰기는 남겨 둡니다: '~와 한전'에서 '한전' 앞 글자가 '와'가 아니라 공백이어야 하니까요
  const t = text.replace(/\s+/g, ' ');
  const excludes = (company.excludes ?? []).map((e) => e.replace(/\s/g, ''));
  const names = [
    { n: company.name, strict: false },
    ...(company.aliases ?? []).map((n) => ({ n, strict: false })),
    ...(company.short && company.short.length >= 2 && company.short !== company.name ? [{ n: company.short, strict: true }] : []),
  ];

  return names.some(({ n, strict }) => {
    const name = n.replace(/\s/g, '');
    for (let i = t.indexOf(name); i !== -1; i = t.indexOf(name, i + 1)) {
      const before = t[i - 1] ?? '';
      const after = t[i + name.length] ?? '';
      // 이 자리가 자회사 이름의 일부인지: 자회사 이름 안에서 기업명이 놓인 위치만큼 앞에서 맞춰 봅니다
      if (excludes.some((e) => e.includes(name) && t.startsWith(e, i - e.indexOf(name)))) continue;
      if (LATIN.test(after)) continue; // 한전KPS, KICT
      if (strict && HANGUL.test(before)) continue; // 인천국제'공항공사'
      return true;
    }
    return false;
  });
}

// ── 잡알리오(공공데이터포털) ──────────────────────────────────────

const ALIO = 'https://apis.data.go.kr/1051000/recruitment/list';

export function hasAlioKey() {
  return Boolean(process.env.DATA_GO_KR_KEY);
}

/** 잡알리오 채용 목록 한 쪽. params 예: { ongoingYn: 'Y', pblntInstCd: 'C0247', numOfRows: 100, pageNo: 1 } */
export async function alioList(params) {
  const key = process.env.DATA_GO_KR_KEY;
  // 포털이 주는 키가 이미 인코딩돼 있는 경우(%2B 등)도 있어 한 번 풀었다가 다시 인코딩합니다.
  const serviceKey = encodeURIComponent(key.includes('%') ? decodeURIComponent(key) : key);
  const qs = new URLSearchParams({ resultType: 'json', numOfRows: '100', pageNo: '1', ...params });
  const url = `${ALIO}?serviceKey=${serviceKey}&${qs}`;

  // 공공데이터포털은 가끔 연결이 늦거나 끊겨서, 네트워크 오류·5xx는 두 번 더 시도합니다
  let r;
  for (let attempt = 1; ; attempt++) {
    try {
      r = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (r.status < 500 || attempt === 3) break;
    } catch (err) {
      if (attempt === 3) throw new Error(`잡알리오 연결 실패: ${err.cause?.code ?? err.message}`);
    }
    await new Promise((ok) => setTimeout(ok, 500 * attempt));
  }
  const text = await r.text();
  if (!r.ok) throw new Error(`잡알리오 ${r.status}: ${r.headers.get('returnAuthMsg') ?? text.slice(0, 200)}`);
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`잡알리오 응답이 JSON이 아니에요: ${text.slice(0, 200)}`);
  }
  if (data.resultCode && Number(data.resultCode) !== 200) throw new Error(`잡알리오 ${data.resultCode}: ${data.resultMsg}`);
  return { rows: data.result ?? [], total: Number(data.totalCount ?? 0) };
}

// ── 기업 찾기 (우리 목록 + 그 밖의 공공기관) ─────────────────────────

const nameCache = new Map(); // 기관코드 → 기관명 (함수가 살아 있는 동안)

/**
 * id로 기업 정보. 우리 목록에 없는 공공기관('x-C0008')은 잡알리오에서 기관명을 확인해
 * 아무 검색어나 대신 검색해 주는 통로가 되지 않게 합니다.
 */
export async function resolveCompany(id) {
  if (COMPANY_BY_ID[id]) return COMPANY_BY_ID[id];
  const code = parseDynamicId(id);
  if (!code || !hasAlioKey()) return null;
  if (!nameCache.has(code)) {
    const { rows } = await alioList({ pblntInstCd: code, numOfRows: '1' });
    nameCache.set(code, rows[0]?.pblntInstCd === code ? rows[0].instNm : null);
  }
  const name = nameCache.get(code);
  return name ? dynamicCompany(code, name) : null;
}
