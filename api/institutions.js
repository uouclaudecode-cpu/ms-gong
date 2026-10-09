// GET /api/institutions → 잡알리오에 최근 공고를 낸 공공기관 목록 (우리 목록 밖의 기관만)
// "전체 공공기관에서 찾기"에 씁니다. 기관 목록 API가 따로 없어서 최근 공고들에서 기관을 모읍니다.
import { dynamicCompany } from '../src/data/institutions.js';
import { alioList, cache, COMPANIES, fail, hasAlioKey, noKey } from './_lib/util.js';

const CURATED_CODES = new Set(COMPANIES.map((c) => c.code).filter(Boolean));
const norm = (s = '') => s.replace(/\(주\)|㈜|주식회사|\s/g, '');
const CURATED_NAMES = new Set(COMPANIES.map((c) => norm(c.name)));

// 외부 API를 여러 번 부르므로 넉넉히 (Vercel 기본 제한보다 길게)
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!hasAlioKey()) return noKey(res, 'DATA_GO_KR_KEY');

  try {
    // 진행 중 공고 전부 + 최근 마감 공고 1,500건(대략 최근 1~2달)
    const ongoing = await alioList({ ongoingYn: 'Y', numOfRows: '100', pageNo: '1' });
    const pages = Math.min(10, Math.ceil(ongoing.total / 100));
    const batches = await Promise.all([
      ...Array.from({ length: pages - 1 }, (_, i) => alioList({ ongoingYn: 'Y', numOfRows: '100', pageNo: String(i + 2) })),
      ...[1, 2, 3].map((p) => alioList({ ongoingYn: 'N', numOfRows: '500', pageNo: String(p) })),
    ]);

    const open = new Map();
    for (const r of ongoing.rows.concat(...batches.slice(0, pages - 1).map((b) => b.rows))) {
      open.set(r.pblntInstCd, (open.get(r.pblntInstCd) ?? 0) + 1);
    }

    const list = new Map();
    for (const r of [ongoing, ...batches].flatMap((b) => b.rows)) {
      if (!r.pblntInstCd || CURATED_CODES.has(r.pblntInstCd) || CURATED_NAMES.has(norm(r.instNm))) continue;
      if (!list.has(r.pblntInstCd)) {
        const c = dynamicCompany(r.pblntInstCd, r.instNm);
        list.set(r.pblntInstCd, { id: c.id, code: c.code, name: c.name, open: open.get(r.pblntInstCd) ?? 0 });
      }
    }

    cache(res, 86400); // 하루
    res.status(200).json({ items: [...list.values()].sort((a, b) => a.name.localeCompare(b.name, 'ko')) });
  } catch (err) {
    fail(res, err);
  }
}
