// GET /api/jobs → 우리 목록의 공기업들이 낸 진행 중 채용 공고 (잡알리오)
// 공공데이터포털 '재정경제부_공공기관 채용정보 조회서비스' (data.go.kr/data/15125273)
// 기관명 검색 파라미터가 없어서 진행 중 공고를 전부 받아 기관명으로 거릅니다.
import { cache, COMPANIES, fail, noKey, ymd8 } from './_lib/util.js';

const ENDPOINT = 'https://apis.data.go.kr/1051000/recruitment/list';
const PAGE_SIZE = 100;
const MAX_PAGES = 10;

// 잡알리오의 기관명과 우리 목록 이름이 조금 다를 수 있어 공백을 빼고 비교합니다.
const norm = (s = '') => s.replace(/[\s()㈜주식회사]/g, '');
const BY_NAME = new Map(COMPANIES.map((c) => [norm(c.name), c.id]));

async function fetchPage(pageNo) {
  const key = process.env.DATA_GO_KR_KEY;
  // 포털이 주는 키가 이미 인코딩돼 있는 경우(%2B 등)도 있어 한 번 풀었다가 다시 인코딩합니다.
  const serviceKey = encodeURIComponent(key.includes('%') ? decodeURIComponent(key) : key);
  const url = `${ENDPOINT}?serviceKey=${serviceKey}&resultType=json&ongoingYn=Y&numOfRows=${PAGE_SIZE}&pageNo=${pageNo}`;
  const r = await fetch(url);
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

// 잡알리오 고용형태(hireTypeNmLst, 쉼표로 여러 개): 정규직·무기계약직·비정규직·청년인턴(체험형/채용형)
// 여러 개면 취준생에게 가장 의미 있는 것 하나를 대표로 씁니다.
const HIRE_PRIORITY = ['정규직', '인턴', '무기계약직', '비정규직'];
const hireTypesOf = (row) =>
  [...new Set((row.hireTypeNmLst ?? '').split(',').map((s) => (s.includes('인턴') ? '인턴' : s.trim())))].filter(Boolean);
const typeOf = (types) => HIRE_PRIORITY.find((t) => types.includes(t)) ?? '비정규직';

export default async function handler(req, res) {
  if (!process.env.DATA_GO_KR_KEY) return noKey(res, 'DATA_GO_KR_KEY');

  try {
    const first = await fetchPage(1);
    const pages = Math.min(MAX_PAGES, Math.ceil(first.total / PAGE_SIZE));
    const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, i) => fetchPage(i + 2)));
    const rows = [first, ...rest].flatMap((p) => p.rows);

    const items = rows
      .map((row) => ({ row, companyId: BY_NAME.get(norm(row.instNm)) }))
      .filter((x) => x.companyId)
      .map(({ row, companyId }) => ({
        id: String(row.recrutPblntSn),
        companyId,
        title: row.recrutPbancTtl,
        type: typeOf(hireTypesOf(row)), // '정규직' | '인턴' | '무기계약직' | '비정규직'
        career: row.recrutSeNm ?? null, // '신입' | '경력' | '신입+경력'
        headcount: row.recrutNope ? `${row.recrutNope}명` : null,
        fields: row.ncsCdNmLst ?? null,
        region: row.workRgnNmLst ?? null,
        startsAt: ymd8(row.pbancBgngYmd),
        deadline: ymd8(row.pbancEndYmd),
        url: `https://job.alio.go.kr/recruitview.do?idx=${row.recrutPblntSn}`,
      }));

    cache(res, 3600); // 1시간
    res.status(200).json({ items, scanned: rows.length });
  } catch (err) {
    fail(res, err);
  }
}
