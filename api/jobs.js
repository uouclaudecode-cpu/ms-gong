// GET /api/jobs → 잡알리오의 진행 중 채용 공고 전체 (모든 공공기관)
// 공공데이터포털 '재정경제부_공공기관 채용정보 조회서비스' (data.go.kr/data/15125273)
// 우리 목록에 있는 기업은 그 id로, 없는 기관은 'x-기관코드' id로 돌려줍니다.
import { dynamicCompany } from '../src/data/institutions.js';
import { alioList, cache, COMPANIES, fail, hasAlioKey, noKey, ymd8 } from './_lib/util.js';

const PAGE_SIZE = 100;
const MAX_PAGES = 10;

// 잡알리오 기관명과 우리 목록 이름이 조금 다를 수 있어((주) 등) 정리해서 비교합니다.
const norm = (s = '') => s.replace(/\(주\)|㈜|주식회사|\s/g, '');
const BY_NAME = new Map(COMPANIES.flatMap((c) => [c.name, ...(c.aliases ?? [])].map((n) => [norm(n), c.id])));
const BY_CODE = new Map(COMPANIES.filter((c) => c.code).map((c) => [c.code, c.id]));

// 잡알리오 고용형태(hireTypeNmLst, 쉼표로 여러 개): 정규직·무기계약직·비정규직·청년인턴(체험형/채용형)
// 여러 개면 취준생에게 가장 의미 있는 것 하나를 대표로 씁니다.
const HIRE_PRIORITY = ['정규직', '인턴', '무기계약직', '비정규직'];
const hireTypesOf = (row) =>
  [...new Set((row.hireTypeNmLst ?? '').split(',').map((s) => (s.includes('인턴') ? '인턴' : s.trim())))].filter(Boolean);
const typeOf = (types) => HIRE_PRIORITY.find((t) => types.includes(t)) ?? '비정규직';

// 외부 API를 여러 번 부르므로 넉넉히 (Vercel 기본 제한보다 길게)
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!hasAlioKey()) return noKey(res, 'DATA_GO_KR_KEY');

  try {
    const first = await alioList({ ongoingYn: 'Y', numOfRows: String(PAGE_SIZE), pageNo: '1' });
    const pages = Math.min(MAX_PAGES, Math.ceil(first.total / PAGE_SIZE));
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
        alioList({ ongoingYn: 'Y', numOfRows: String(PAGE_SIZE), pageNo: String(i + 2) }),
      ),
    );
    const rows = [first, ...rest].flatMap((p) => p.rows);

    const institutions = new Map(); // 목록 밖 기관: 화면이 이름을 알 수 있게 같이 보냅니다
    const items = rows.map((row) => {
      let companyId = BY_CODE.get(row.pblntInstCd) ?? BY_NAME.get(norm(row.instNm));
      if (!companyId) {
        const c = dynamicCompany(row.pblntInstCd, row.instNm);
        const prev = institutions.get(c.id);
        institutions.set(c.id, { id: c.id, code: c.code, name: c.name, open: (prev?.open ?? 0) + 1 });
        companyId = c.id;
      }
      return {
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
      };
    });

    cache(res, 3600); // 1시간
    res.status(200).json({ items, institutions: [...institutions.values()] });
  } catch (err) {
    fail(res, err);
  }
}
