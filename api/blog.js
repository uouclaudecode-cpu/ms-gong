// GET /api/blog?company=kepco&kw=review → 네이버 블로그 글 목록
import { BLOG_KEYWORDS } from '../src/lib/links.js';
import { cache, cleanText, fail, mentions, noKey, resolveCompany } from './_lib/util.js';
import { hasNaverKey, naverSearch } from './_lib/naver.js';

export default async function handler(req, res) {
  const kw = BLOG_KEYWORDS.find((k) => k.key === req.query.kw) ?? BLOG_KEYWORDS[0];
  if (!hasNaverKey()) return noKey(res, 'NAVER_CLIENT_ID/NAVER_CLIENT_SECRET');

  try {
    const company = await resolveCompany(req.query.company);
    if (!company) return res.status(400).json({ error: 'bad_company' });
    // 넉넉히 받아서 기업명이 들어간 글만 10개 남깁니다
    const items = (await naverSearch('blog', `${company.name} ${kw.query}`, { display: 50, sort: 'sim' }))
      .filter((it) => mentions(company, cleanText(`${it.title} ${it.description}`)))
      .slice(0, 10);
    cache(res, 6 * 3600); // 블로그 후기는 자주 바뀌지 않으니 6시간
    res.status(200).json({
      items: items.map((it) => ({
        title: cleanText(it.title),
        description: cleanText(it.description),
        url: it.link,
        blogger: it.bloggername,
        postedAt: it.postdate ? `${it.postdate.slice(0, 4)}-${it.postdate.slice(4, 6)}-${it.postdate.slice(6, 8)}` : null,
      })),
    });
  } catch (err) {
    fail(res, err);
  }
}
