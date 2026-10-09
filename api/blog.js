// GET /api/blog?company=kepco&kw=review → 네이버 블로그 합격 후기·공부법 글 목록
// 관련도순 + 최신순, 약칭(한전·코레일)까지 넉넉히 모은 뒤 api/_lib/blogFilter.js 규칙으로 거릅니다.
import { BLOG_KEYWORDS } from '../src/lib/links.js';
import { filterBlogPosts } from './_lib/blogFilter.js';
import { hasNaverKey, naverSearch } from './_lib/naver.js';
import { cache, fail, noKey, resolveCompany } from './_lib/util.js';

export default async function handler(req, res) {
  const kw = BLOG_KEYWORDS.find((k) => k.key === req.query.kw) ?? BLOG_KEYWORDS[0];
  if (!hasNaverKey()) return noKey(res, 'NAVER_CLIENT_ID/NAVER_CLIENT_SECRET');

  try {
    const company = await resolveCompany(req.query.company);
    if (!company) return res.status(400).json({ error: 'bad_company' });

    // 기관명 + 탭 검색어마다 관련도순·최신순, 약칭을 많이 쓰는 기관(한전, 코레일 등)은 약칭으로도
    const short = company.short && company.short !== company.name && company.short.length >= 2 && !company.short.endsWith('…');
    const batches = await Promise.all([
      ...kw.searches.flatMap((s) => [
        naverSearch('blog', `${company.name} ${s}`, { display: 100, sort: 'sim' }),
        naverSearch('blog', `${company.name} ${s}`, { display: 50, sort: 'date' }),
      ]),
      ...(short ? kw.searches.map((s) => naverSearch('blog', `${company.short} ${s}`, { display: 100, sort: 'sim' })) : []),
    ]);

    cache(res, 6 * 3600); // 블로그 후기는 자주 바뀌지 않으니 6시간
    res.status(200).json(filterBlogPosts(company, kw.key, batches.flat()));
  } catch (err) {
    fail(res, err);
  }
}
