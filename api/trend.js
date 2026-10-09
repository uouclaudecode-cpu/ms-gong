// GET /api/trend?id=kepco → 그 기관의 최근 3년 채용 공고 흐름 (잡알리오, 마감된 공고 포함)
// 연도별 공고 수, 보통 공고가 뜨는 달, 고용형태 비율, 최근 공고 몇 개
import { alioList, cache, fail, hasAlioKey, noKey, resolveCompany, ymd8 } from './_lib/util.js';

const YEARS = 3;
// 하루 호출 한도(개발계정 1,000회)를 아끼려고 큰 쪽으로 받고, 최대 1,500건까지만 봅니다
const PAGE_SIZE = 300;
const MAX_PAGES = 5;

const typeOf = (row) => {
  const s = row.hireTypeNmLst ?? '';
  if (/인턴/.test(s)) return '인턴';
  if (/(^|,)정규직/.test(s)) return '정규직';
  if (/무기계약직/.test(s)) return '무기계약직';
  return '비정규직';
};

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!hasAlioKey()) return noKey(res, 'DATA_GO_KR_KEY');

  try {
    const company = await resolveCompany(req.query.id);
    if (!company) return res.status(400).json({ error: 'bad_company' });
    if (!company.code) {
      cache(res, 86400);
      return res.status(200).json({ available: false });
    }

    const thisYear = new Date(Date.now() + 9 * 3600000).getUTCFullYear();
    const fromYear = thisYear - YEARS;
    const since = `${fromYear}0101`;

    // 최신 공고부터 내려옵니다. 3년보다 오래된 공고가 나오면 멈춥니다.
    // 첫 쪽으로 전체 개수를 보고, 3년치가 더 남았으면 나머지 쪽을 한꺼번에 받습니다
    const page = (n) => alioList({ pblntInstCd: company.code, numOfRows: String(PAGE_SIZE), pageNo: String(n) });
    const first = await page(1);
    const rows = [...first.rows];
    const needed = Math.ceil(first.total / PAGE_SIZE);
    if (first.rows.length && first.rows.at(-1).pbancBgngYmd >= since && needed > 1) {
      const more = await Promise.all(Array.from({ length: Math.min(needed, MAX_PAGES) - 1 }, (_, i) => page(i + 2)));
      rows.push(...more.flatMap((p) => p.rows));
    }
    // 공고가 너무 많아 3년치를 다 못 본 경우
    const partial = needed > MAX_PAGES && rows.at(-1)?.pbancBgngYmd >= since;
    const recent = rows.filter((r) => r.pbancBgngYmd >= since);

    const byYear = {};
    const byMonth = Array(12).fill(0);
    const byType = {};
    for (const r of recent) {
      const y = r.pbancBgngYmd.slice(0, 4);
      byYear[y] = (byYear[y] ?? 0) + 1;
      byMonth[Number(r.pbancBgngYmd.slice(4, 6)) - 1]++;
      byType[typeOf(r)] = (byType[typeOf(r)] ?? 0) + 1;
    }
    // 정규직·인턴 공고만 따로: 취준생에게 의미 있는 '큰 채용' 시기
    const mainByMonth = Array(12).fill(0);
    for (const r of recent) if (['정규직', '인턴'].includes(typeOf(r))) mainByMonth[Number(r.pbancBgngYmd.slice(4, 6)) - 1]++;

    cache(res, 86400); // 하루
    res.status(200).json({
      available: true,
      partial,
      fromYear,
      // 다 못 봤으면 가장 오래된 공고 날짜부터의 기록이라고 알려 줍니다
      coveredFrom: ymd8(recent.at(-1)?.pbancBgngYmd),
      total: recent.length,
      byYear: Array.from({ length: YEARS + 1 }, (_, i) => ({ year: fromYear + i, count: byYear[fromYear + i] ?? 0 })),
      byMonth,
      mainByMonth,
      byType,
      latest: recent
        .filter((r) => ['정규직', '인턴'].includes(typeOf(r)))
        .slice(0, 5)
        .map((r) => ({
          id: String(r.recrutPblntSn),
          title: r.recrutPbancTtl,
          type: typeOf(r),
          career: r.recrutSeNm ?? null,
          startsAt: ymd8(r.pbancBgngYmd),
          deadline: ymd8(r.pbancEndYmd),
          url: `https://job.alio.go.kr/recruitview.do?idx=${r.recrutPblntSn}`,
        })),
    });
  } catch (err) {
    fail(res, err);
  }
}
