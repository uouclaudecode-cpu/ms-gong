// 잡알리오에서 데이터를 만들어 내는 함수들.
// 서버 함수(/api/*)와 미리 불러 두기 작업(scripts/snapshot.mjs, GitHub Actions)이 같이 씁니다.
import { dynamicCompany } from '../../src/data/institutions.js';
import { alioList, COMPANIES, ymd8 } from './util.js';

// 잡알리오 기관명과 우리 목록 이름이 조금 다를 수 있어((주) 등) 정리해서 비교합니다.
const norm = (s = '') => s.replace(/\(주\)|㈜|주식회사|\s/g, '');
const BY_NAME = new Map(COMPANIES.flatMap((c) => [c.name, ...(c.aliases ?? [])].map((n) => [norm(n), c.id])));
const BY_CODE = new Map(COMPANIES.filter((c) => c.code).map((c) => [c.code, c.id]));

// 잡알리오 고용형태(hireTypeNmLst, 쉼표로 여러 개): 정규직·무기계약직·비정규직·청년인턴(체험형/채용형)
// 여러 개면 취준생에게 가장 의미 있는 것 하나를 대표로 씁니다.
const HIRE_PRIORITY = ['정규직', '인턴', '무기계약직', '비정규직'];
export function hireTypeOf(row) {
  const types = new Set((row.hireTypeNmLst ?? '').split(',').map((s) => (s.includes('인턴') ? '인턴' : s.trim())));
  return HIRE_PRIORITY.find((t) => types.has(t)) ?? '비정규직';
}

const viewUrl = (sn) => `https://job.alio.go.kr/recruitview.do?idx=${sn}`;

// 공고 데이터 모양이 바뀌면 올립니다. 미리 불러 둔 파일이 예전 모양이면 쓰지 않습니다(api/_lib/snapshot.js).
export const JOBS_VERSION = 2;

const list = (s) => (s ?? '').split(',').map((v) => v.trim()).filter(Boolean);

// 우대 조건·지원 자격 글에서 찾는 표시 (키는 src/lib/profile.js의 PREFS와 같음)
const PREF_RULES = [
  ['local', /지역인재|이전지역|지역 인재/],
  ['veteran', /취업지원대상자|보훈/],
  ['disabled', /장애/],
  ['lowincome', /저소득|기초생활|차상위/],
  ['defector', /북한이탈|새터민/],
  ['multicultural', /다문화/],
  ['selfreliant', /자립준비|보호종료/],
  ['history', /한국사/],
];
export function prefsOf(row) {
  const text = `${row.prefCondCn ?? ''} ${row.aplyQlfcCn ?? ''}`;
  return PREF_RULES.filter(([, re]) => re.test(text)).map(([key]) => key);
}

/** 진행 중 공고 전부 (최대 1,000건) */
async function ongoingRows() {
  const first = await alioList({ ongoingYn: 'Y', numOfRows: '100', pageNo: '1' });
  const pages = Math.min(10, Math.ceil(first.total / 100));
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) => alioList({ ongoingYn: 'Y', numOfRows: '100', pageNo: String(i + 2) })),
  );
  return [first, ...rest].flatMap((p) => p.rows);
}

/**
 * 진행 중 공고 전체. 우리 목록 기업은 그 id, 나머지 기관은 'x-기관코드'.
 * institutions: 목록 밖 기관 이름, codes: 우리 목록 기업의 기관코드(companies.js에 없는 것 채우기용)
 */
export async function buildJobs() {
  const rows = await ongoingRows();
  const institutions = new Map();
  const codes = {};
  const items = rows.map((row) => {
    let companyId = BY_CODE.get(row.pblntInstCd) ?? BY_NAME.get(norm(row.instNm));
    if (companyId) {
      codes[companyId] = row.pblntInstCd;
    } else {
      const c = dynamicCompany(row.pblntInstCd, row.instNm);
      const prev = institutions.get(c.id);
      institutions.set(c.id, { id: c.id, code: c.code, name: c.name, open: (prev?.open ?? 0) + 1 });
      companyId = c.id;
    }
    return {
      id: String(row.recrutPblntSn),
      companyId,
      title: row.recrutPbancTtl,
      type: hireTypeOf(row), // '정규직' | '인턴' | '무기계약직' | '비정규직'
      career: row.recrutSeNm ?? null, // '신입' | '경력' | '신입+경력'
      headcount: row.recrutNope ? `${row.recrutNope}명` : null,
      fields: row.ncsCdNmLst ?? null,
      region: row.workRgnNmLst ?? null,
      startsAt: ymd8(row.pbancBgngYmd),
      deadline: ymd8(row.pbancEndYmd),
      url: viewUrl(row.recrutPblntSn),
      // 개인 맞춤용: NCS 직무 분야·근무 지역·학력 조건·대체인력·우대 조건
      ncs: list(row.ncsCdNmLst),
      regions: list(row.workRgnNmLst),
      edu: list(row.acbgCondNmLst),
      replacement: row.replmprYn === 'Y',
      prefs: prefsOf(row),
    };
  });
  return { version: JOBS_VERSION, items, institutions: [...institutions.values()], codes };
}

/** 최근 공고를 낸 목록 밖 공공기관 (진행 중 + 최근 마감 1,500건) */
export async function buildInstitutions() {
  const [ongoing, ...closed] = await Promise.all([
    ongoingRows(),
    ...[1, 2, 3].map((p) => alioList({ ongoingYn: 'N', numOfRows: '500', pageNo: String(p) })),
  ]);
  const open = new Map();
  for (const r of ongoing) open.set(r.pblntInstCd, (open.get(r.pblntInstCd) ?? 0) + 1);

  const curatedCodes = new Set(COMPANIES.map((c) => c.code).filter(Boolean));
  const curatedNames = new Set(COMPANIES.map((c) => norm(c.name)));
  const list = new Map();
  for (const r of [...ongoing, ...closed.flatMap((b) => b.rows)]) {
    if (!r.pblntInstCd || curatedCodes.has(r.pblntInstCd) || curatedNames.has(norm(r.instNm))) continue;
    if (!list.has(r.pblntInstCd)) {
      const c = dynamicCompany(r.pblntInstCd, r.instNm);
      list.set(r.pblntInstCd, { id: c.id, code: c.code, name: c.name, open: open.get(r.pblntInstCd) ?? 0 });
    }
  }
  return { items: [...list.values()].sort((a, b) => a.name.localeCompare(b.name, 'ko')) };
}

// 채용 트렌드: 하루 호출 한도(개발계정 1,000회)를 아끼려고 큰 쪽으로 받고, 최대 1,500건까지만 봅니다
const YEARS = 3;
const TREND_PAGE = 300;
const TREND_PAGES = 5;
const isMain = (r) => ['정규직', '인턴'].includes(hireTypeOf(r));

/** 기관코드로 최근 3년 채용 흐름: 연도별 공고 수, 달별(정규직·인턴), 고용형태 비율, 최근 공고 */
export async function buildTrend(code) {
  const thisYear = new Date(Date.now() + 9 * 3600000).getUTCFullYear();
  const fromYear = thisYear - YEARS;
  const since = `${fromYear}0101`;

  // 최신 공고부터 내려옵니다. 첫 쪽으로 전체 개수를 보고, 3년치가 더 남았으면 나머지 쪽을 한꺼번에 받습니다
  const page = (n) => alioList({ pblntInstCd: code, numOfRows: String(TREND_PAGE), pageNo: String(n) });
  const first = await page(1);
  const rows = [...first.rows];
  const needed = Math.ceil(first.total / TREND_PAGE);
  if (first.rows.length && first.rows.at(-1).pbancBgngYmd >= since && needed > 1) {
    const more = await Promise.all(Array.from({ length: Math.min(needed, TREND_PAGES) - 1 }, (_, i) => page(i + 2)));
    rows.push(...more.flatMap((p) => p.rows));
  }
  const partial = needed > TREND_PAGES && rows.at(-1)?.pbancBgngYmd >= since; // 공고가 너무 많아 3년치를 다 못 본 경우
  const recent = rows.filter((r) => r.pbancBgngYmd >= since);

  const byYear = {};
  const byMonth = Array(12).fill(0);
  const mainByMonth = Array(12).fill(0); // 정규직·인턴만: 취준생에게 의미 있는 '큰 채용' 시기
  const byType = {};
  for (const r of recent) {
    const m = Number(r.pbancBgngYmd.slice(4, 6)) - 1;
    byYear[r.pbancBgngYmd.slice(0, 4)] = (byYear[r.pbancBgngYmd.slice(0, 4)] ?? 0) + 1;
    byMonth[m]++;
    if (isMain(r)) mainByMonth[m]++;
    byType[hireTypeOf(r)] = (byType[hireTypeOf(r)] ?? 0) + 1;
  }

  return {
    available: true,
    partial,
    fromYear,
    coveredFrom: ymd8(recent.at(-1)?.pbancBgngYmd), // 다 못 봤으면 이 날짜부터의 기록
    total: recent.length,
    byYear: Array.from({ length: YEARS + 1 }, (_, i) => ({ year: fromYear + i, count: byYear[fromYear + i] ?? 0 })),
    byMonth,
    mainByMonth,
    byType,
    latest: recent
      .filter(isMain)
      .slice(0, 5)
      .map((r) => ({
        id: String(r.recrutPblntSn),
        title: r.recrutPbancTtl,
        type: hireTypeOf(r),
        career: r.recrutSeNm ?? null,
        startsAt: ymd8(r.pbancBgngYmd),
        deadline: ymd8(r.pbancEndYmd),
        url: viewUrl(r.recrutPblntSn),
      })),
  };
}
