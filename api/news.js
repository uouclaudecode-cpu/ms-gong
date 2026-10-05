// GET /api/news?id=kepco → 그 기업의 최근 6개월 뉴스(네이버 뉴스 검색), 최신순
// 화면은 기업마다 따로 불러서 합칩니다. 주소가 기업별로 같아서 CDN 캐시를 모든 방문자가 같이 씁니다.
import { cache, cleanText, COMPANY_BY_ID, fail, mentions, noKey } from './_lib/util.js';
import { hasNaverKey, naverSearch } from './_lib/naver.js';

// 제목·요약에 들어간 단어로 주제를 대략 나눕니다. 위에 있는 규칙이 우선.
const TOPIC_RULES = [
  ['채용', /채용|신입|인턴|공채|NCS|필기|면접|합격/],
  ['경영평가', /경영평가|평가 결과|등급|ESG|청렴|부채|적자|흑자|실적|재무/],
  ['정책', /정부|정책|법안|개정|국회|장관|기재부|공공기관 지정|요금|계획 발표/],
];
const topicOf = (text) => TOPIC_RULES.find(([, re]) => re.test(text))?.[0] ?? '이슈';

const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const DAYS = 183; // 6개월
const MONTHS = 7; // 오늘이 10월 6일이면 4월(6일 이후)~10월
const PER_MONTH = 12; // 달마다 최대 개수 → 한 달에 기사가 몰려도 6개월이 고르게 보이게
const monthKey = (time) => new Date(time + 9 * 3600000).toISOString().slice(0, 7); // KST 'YYYY-MM'

/** 지금 달부터 거꾸로 n달: [{ y, m, key }] */
function recentMonths(n) {
  const now = new Date(Date.now() + 9 * 3600000);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, key: d.toISOString().slice(0, 7) };
  });
}

async function newsFor(id) {
  const c = COMPANY_BY_ID[id];
  const months = recentMonths(MONTHS);
  const since = Date.now() - DAYS * 86400000;

  // 네이버 뉴스 API는 기간 지정이 없어서, 최신순 + '기업명 2026년 7월' 같은 달별 검색으로 과거를 채웁니다
  const batches = await Promise.all([
    naverSearch('news', c.name, { display: 100, sort: 'date' }),
    naverSearch('news', `${c.name} 채용`, { display: 100, sort: 'sim' }),
    ...months.slice(1).map(({ y, m }) => naverSearch('news', `${c.name} ${y}년 ${m}월`, { display: 100, sort: 'sim' })),
  ]);

  const seen = new Set();
  const all = [];
  for (const it of batches.flat()) {
    const url = it.originallink || it.link;
    const time = Date.parse(it.pubDate);
    if (seen.has(url) || !(time >= since)) continue;
    seen.add(url);
    const title = cleanText(it.title);
    const description = cleanText(it.description);
    if (!mentions(c, `${title} ${description}`)) continue;
    all.push({
      id: url,
      companyId: id,
      title,
      description,
      topic: topicOf(`${title} ${description}`),
      url,
      press: host(url),
      publishedAt: new Date(time).toISOString(),
      inTitle: mentions(c, title),
    });
  }

  // 달마다: 제목에 기업명이 있는 기사 먼저, 최신순으로 PER_MONTH개
  const byMonth = {};
  for (const n of all) (byMonth[monthKey(Date.parse(n.publishedAt))] ??= []).push(n);
  return months.flatMap(({ key }) =>
    (byMonth[key] ?? [])
      .sort((a, b) => b.inTitle - a.inTitle || b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, PER_MONTH)
      .map(({ inTitle, ...n }) => n),
  );
}

export default async function handler(req, res) {
  const company = COMPANY_BY_ID[req.query.id];
  if (!company) return res.status(400).json({ error: 'bad_company' });
  if (!hasNaverKey()) return noKey(res, 'NAVER_CLIENT_ID/NAVER_CLIENT_SECRET');

  try {
    const items = (await newsFor(company.id)).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    cache(res, 3600); // 1시간 (기업당 네이버 호출 8번)
    res.status(200).json({ items });
  } catch (err) {
    fail(res, err);
  }
}
