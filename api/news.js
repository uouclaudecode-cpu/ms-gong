// GET /api/news?ids=kepco,iiac → 기업별 최신 뉴스(네이버 뉴스 검색)를 합쳐 최신순으로
import { cache, cleanText, COMPANY_BY_ID, fail, noKey, parseIds } from './_lib/util.js';
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

export default async function handler(req, res) {
  const ids = parseIds(req.query.ids).slice(0, 20);
  if (ids.length === 0) return res.status(400).json({ error: 'no_ids' });
  if (!hasNaverKey()) return noKey(res, 'NAVER_CLIENT_ID/NAVER_CLIENT_SECRET');

  try {
    const perCompany = await Promise.all(
      ids.map(async (id) => {
        const c = COMPANY_BY_ID[id];
        // 큰따옴표로 묶어 정확히 기업명이 들어간 기사만
        const items = await naverSearch('news', `"${c.name}"`, { display: 8, sort: 'date' });
        return items.map((it) => {
          const title = cleanText(it.title);
          const description = cleanText(it.description);
          return {
            id: it.link,
            companyId: id,
            title,
            description,
            topic: topicOf(`${title} ${description}`),
            url: it.originallink || it.link,
            press: host(it.originallink || it.link),
            publishedAt: new Date(it.pubDate).toISOString(),
          };
        });
      }),
    );

    // 같은 기사가 여러 기업에 걸리면 하나만
    const seen = new Set();
    const items = perCompany
      .flat()
      .filter((n) => (seen.has(n.url) ? false : seen.add(n.url)))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    cache(res, 1800); // 30분
    res.status(200).json({ items });
  } catch (err) {
    fail(res, err);
  }
}
