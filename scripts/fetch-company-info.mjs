// 공공기관 경영정보(신입 초임·평균보수·직원 수)를 ALIO 통계에서 받아 public/data/company-info.json으로 저장합니다.
// 값은 1년에 한 번 정도 바뀌므로, 사이트가 매번 부르지 않고 이 파일을 커밋해서 씁니다.
//   npm run company-info   (ALIO 공시가 새로 나오면 한 번 실행하고 커밋)
//
// 출처: ALIO(공공기관 경영정보 공개시스템) 통계 > 단일항목 검색. 공식 Open API가 없어 사이트의 공개 통계 주소를 씁니다.
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = 'https://alio.go.kr/statisticsSearch/findSingleItemSearchList.json';
const ITEMS = {
  starting: { reportFormNo: '20601', itemNo: 'GI0208' }, // 신입사원 초임 합계 (천원)
  avgPay: { reportFormNo: '20601', itemNo: 'GI0101' }, // 직원 1인당 평균보수액, 일반정규직 (천원)
  staff: { reportFormNo: '20202', itemNo: 'GI02010201' }, // 일반정규직 현원 (명)
};

async function fetchItem({ reportFormNo, itemNo }) {
  const rows = [];
  for (let page = 1; page <= 10; page++) {
    const qs = new URLSearchParams({ pageNo: String(page), countPerPage: '100', reportFormNo, itemNo });
    const r = await fetch(`${BASE}?${qs}`, { headers: { 'User-Agent': 'MS-PICK data script (ms-pick.vercel.app)' } });
    if (!r.ok) throw new Error(`ALIO ${itemNo} ${r.status}`);
    const { data } = await r.json();
    rows.push(...data.result);
    if (page >= data.page.totalPage) break;
    await new Promise((ok) => setTimeout(ok, 300)); // 사이트에 부담 주지 않게 천천히
  }
  return rows;
}

const num = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

const info = {};
for (const [key, item] of Object.entries(ITEMS)) {
  const rows = await fetchItem(item);
  for (const row of rows) {
    const c = (info[row.apbaId] ??= { name: row.apbaNa, type: row.apbaTypeNm, ministry: row.jidtDptmNa });
    // yy0 = 올해 공시, yy1 = 작년 공시
    c[key] = [num(row.yy0), num(row.yy1)];
  }
  console.log(`✓ ${key}: ${rows.length}곳`);
}

const year = new Date(Date.now() + 9 * 3600000).getUTCFullYear();
const out = { source: 'ALIO 공공기관 경영정보 공개시스템', years: [year, year - 1], updatedAt: new Date().toISOString().slice(0, 10), items: info };
await mkdir(new URL('../public/data/', import.meta.url), { recursive: true });
await writeFile(new URL('../public/data/company-info.json', import.meta.url), JSON.stringify(out));
console.log(`저장: public/data/company-info.json (${Object.keys(info).length}곳)`);
