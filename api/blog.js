// GET /api/blog?company=kepco&kw=review → 네이버 블로그 합격 후기·공부법 글 목록
//
// 네이버 블로그 검색은 광고·학원 글, 다른 기관 글, 몇 년 지난 글이 많이 섞여 나와서 여러 번 거릅니다.
//  1) 관련도순 + 최신순으로 넉넉히 받아 합치고
//  2) 제목에 기업명이 있는 글만 (요약에만 스치듯 나온 글은 제외)
//  3) 제목에 탭 주제 낱말이 있는 글만 (예: 면접 탭 → '면접'). 모자라면 요약에 있는 글로 채움
//  4) 학원·출판사·컨설팅·서평 같은 홍보 글, 취업과 상관없는 글(전기 신청 대행, 정책자금 등)은 제외
//  5) 최근 3년 글을 최신순으로 (모자라면 5년까지)
import { BLOG_KEYWORDS } from '../src/lib/links.js';
import { cache, cleanText, fail, mentions, noKey, resolveCompany } from './_lib/util.js';
import { hasNaverKey, naverSearch } from './_lib/naver.js';

// 탭마다 꼭 있어야 하는 낱말
const TOPIC = {
  review: /합격|최종|붙었|붙은|불합격|탈락|후기/,
  written: /필기|NCS|엔씨에스|전공시험|직무능력|PSAT|인적성|시험/i,
  interview: /면접|PT발표|토론|인성검사/,
  essay: /자소서|자기소개서|자기 소개서|서류/,
};

const OTHER_TOPICS = (key) => Object.entries(TOPIC).filter(([k]) => k !== key && k !== 'review').map(([, re]) => re);

// 취업 준비 글이라는 표시
const JOB_WORDS = /채용|합격|후기|필기|면접|자소서|NCS|인턴|신입|취업|취준|공채|직무|전형|서류|시험|입사/i;

// 취업 준비와 상관없는 글 (기관 이름이 들어가도 고객 대상 서비스·지역 소식 등)
const OFF_TOPIC = /대행|업체|시공|요금|신청방법|정책자금|대출|보증서|분양|청약|임대|전세|매매|여행|캠핑|맛집|주차|연봉|성과급|복지 총정리|뉴스|보도|입주|당첨|행복주택|신혼|희망타운|임대주택|소득기준|자산기준|웨딩|연금 계산|수령액/;

// 홍보·판매 글로 보이는 표시 (제목·블로그 이름)
const PROMO = /해커스|에듀윌|위포트|알라딘|교보문고|예스24|yes24|서평|모의고사|문제집|봉투|교재|도서|학원|컨설팅|첨삭|과외|특강|강의|인강|수강|모집|이벤트|할인|무료|협찬|광고|체험단|원데이|클래스|아카데미|에듀|잡다|취업센터|쌤|시켜드|시켜 드|수강생|상담|문의|번째 합격자|개강|취업반|그룹수업|스피치|수업 안내|코칭/i;

const MAX = 10;
const YEAR = 365 * 86400000;
const ymd = (s) => (s ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : null);

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

    const seen = new Set();
    const candidates = batches.flat().flatMap((it) => {
      if (seen.has(it.link)) return [];
      seen.add(it.link);
      const title = cleanText(it.title);
      const description = cleanText(it.description);
      const blogger = it.bloggername ?? '';
      if (!mentions(company, title)) return []; // 2)
      // 제목이 잘려(…) 자회사 이름 일부만 남은 경우까지: 자회사 이름이 보이고 기관 정식 이름은 없으면 제외
      const compact = title.replace(/s/g, '');
      if ((company.excludes ?? []).some((e) => compact.includes(e.replace(/s/g, ''))) && !compact.includes(company.name)) return [];
      const inTitle = TOPIC[kw.key].test(title);
      if (!inTitle && !TOPIC[kw.key].test(description)) return []; // 3)
      // 요약으로만 채우는 글인데 제목이 다른 탭 주제(예: 필기 탭에 '면접 후기')면 제외
      if (!inTitle && OTHER_TOPICS(kw.key).some((re) => re.test(title))) return [];
      // 요약으로만 채우는 글은 제목에도 취업 낱말이 있어야 합니다 (웨딩홀·연금 계산 같은 글 제외)
      if (!inTitle && !JOB_WORDS.test(title)) return [];
      if (PROMO.test(title) || PROMO.test(blogger) || OFF_TOPIC.test(title)) return []; // 4)
      return [{ title, description, url: it.link, blogger, postedAt: ymd(it.postdate), inTitle }];
    });

    // 5) 최근 3년 → 모자라면 5년까지, 최신순
    const within = (years) =>
      candidates.filter((p) => p.postedAt && Date.now() - Date.parse(p.postedAt) <= years * YEAR);
    let pool = within(3);
    if (pool.length < 5) pool = within(5);
    // 제목에 주제 낱말이 있는 글 먼저(최신순), 모자라면 요약에만 있는 글로 채웁니다
    const byDate = (a, b) => b.postedAt.localeCompare(a.postedAt);
    const items = [...pool.filter((p) => p.inTitle).sort(byDate), ...pool.filter((p) => !p.inTitle).sort(byDate)]
      .slice(0, MAX)
      .map(({ inTitle, ...p }) => p);

    cache(res, 6 * 3600); // 블로그 후기는 자주 바뀌지 않으니 6시간
    res.status(200).json({ items, filtered: { candidates: seen.size, kept: items.length } });
  } catch (err) {
    fail(res, err);
  }
}
