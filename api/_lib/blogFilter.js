// 네이버 블로그 검색 결과에서 '진짜 합격 후기·공부법' 글만 골라내는 규칙.
// 네트워크 없이 테스트할 수 있게 서버 함수(api/blog.js)와 나눠 둡니다. tests/blogFilter.test.js 참고.
//
//  1) 제목에 기업명이 있는 글만 (요약에만 스치듯 나온 글은 제외), 자회사 글 제외
//  2) 제목에 탭 주제 낱말이 있는 글 먼저. 모자라면 요약에 있는 글로 채움
//  3) 학원·출판사·컨설팅·서평 같은 홍보 글, 취업과 상관없는 글(전기 신청 대행, 정책자금 등)은 제외
//  4) 최근 3년 글을 최신순으로 (모자라면 5년까지)
import { cleanText, mentions } from './util.js';

// 탭마다 꼭 있어야 하는 낱말
export const TOPIC = {
  review: /합격|최종|붙었|붙은|불합격|탈락|후기/,
  written: /필기|NCS|엔씨에스|전공시험|직무능력|PSAT|인적성|시험/i,
  interview: /면접|PT발표|토론|인성검사/,
  essay: /자소서|자기소개서|자기 소개서|서류/,
};
const OTHER_TOPICS = (key) => Object.entries(TOPIC).filter(([k]) => k !== key && k !== 'review').map(([, re]) => re);

// 취업 준비 글이라는 표시
const JOB_WORDS = /채용|합격|후기|필기|면접|자소서|NCS|인턴|신입|취업|취준|공채|직무|전형|서류|시험|입사/i;

// 취업 준비와 상관없는 글 (기관 이름이 들어가도 고객 대상 서비스·지역 소식 등)
export const OFF_TOPIC =
  /대행|업체|시공|요금|신청방법|정책자금|대출|보증서|분양|청약|임대|전세|매매|여행|캠핑|맛집|주차|연봉|성과급|복지 총정리|뉴스|보도|입주|당첨|행복주택|신혼|희망타운|임대주택|소득기준|자산기준|웨딩|연금 계산|수령액/;

// 홍보·판매 글로 보이는 표시 (제목·블로그 이름)
export const PROMO =
  /해커스|에듀윌|위포트|알라딘|교보문고|예스24|yes24|서평|모의고사|문제집|봉투|교재|도서|학원|컨설팅|첨삭|과외|특강|강의|인강|수강|모집|이벤트|할인|무료|협찬|광고|체험단|원데이|클래스|아카데미|에듀|잡다|취업센터|쌤|시켜드|시켜 드|수강생|상담|문의|번째 합격자|개강|취업반|그룹수업|스피치|수업 안내|코칭/i;

const MAX = 10;
const YEAR = 365 * 86400000;
const ymd = (s) => (s && /^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : null);
const compact = (s) => s.replace(/\s/g, '');

/** 글 하나가 이 기업·탭에 맞는지. 맞으면 { inTitle }, 아니면 null */
export function judgePost(company, topicKey, { title, description = '', blogger = '' }) {
  if (!mentions(company, title)) return null;
  // 제목이 잘려(…) 자회사 이름 일부만 남은 경우까지: 자회사 이름이 보이고 기관 정식 이름은 없으면 제외
  if ((company.excludes ?? []).some((e) => compact(title).includes(compact(e))) && !compact(title).includes(company.name)) {
    return null;
  }
  const topic = TOPIC[topicKey];
  const inTitle = topic.test(title);
  if (!inTitle) {
    if (!topic.test(description)) return null;
    // 요약으로만 채우는 글: 제목이 다른 탭 주제(필기 탭에 '면접 후기')거나, 제목에 취업 낱말이 없으면 제외
    if (OTHER_TOPICS(topicKey).some((re) => re.test(title))) return null;
    if (!JOB_WORDS.test(title)) return null;
  }
  if (PROMO.test(title) || PROMO.test(blogger) || OFF_TOPIC.test(title)) return null;
  return { inTitle };
}

/** 네이버 검색 결과(여러 묶음)를 걸러 최대 10개. now는 테스트용 */
export function filterBlogPosts(company, topicKey, rawItems, now = Date.now()) {
  const seen = new Set();
  const candidates = [];
  for (const it of rawItems) {
    if (seen.has(it.link)) continue;
    seen.add(it.link);
    const post = {
      title: cleanText(it.title),
      description: cleanText(it.description),
      url: it.link,
      blogger: it.bloggername ?? '',
      postedAt: ymd(it.postdate),
    };
    const verdict = judgePost(company, topicKey, post);
    if (verdict) candidates.push({ ...post, inTitle: verdict.inTitle });
  }

  const within = (years) => candidates.filter((p) => p.postedAt && now - Date.parse(p.postedAt) <= years * YEAR);
  let pool = within(3);
  if (pool.length < 5) pool = within(5);
  const byDate = (a, b) => b.postedAt.localeCompare(a.postedAt);
  const items = [...pool.filter((p) => p.inTitle).sort(byDate), ...pool.filter((p) => !p.inTitle).sort(byDate)]
    .slice(0, MAX)
    .map(({ inTitle, ...p }) => p);
  return { items, filtered: { candidates: seen.size, kept: items.length } };
}
